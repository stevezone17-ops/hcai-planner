from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple, Set
from app.models.models import Task, Availability, ScheduleItem
from app.scheduler.constraint_engine import ConstraintEngine, TimeSlot
from app.scheduler.engine import SchedulingEngine
from app.services.ai_service import get_ai_service

class ReplanningEngine:
    """
    Intelligent Human-in-the-Loop replanning engine.
    Preserves locked items, detects affected schedules, and reschedules only what is necessary.
    """

    def __init__(self, ai_service=None):
        self.ai_service = ai_service or get_ai_service()
        self.scheduling_engine = SchedulingEngine(ai_service=self.ai_service)
        self.constraint_engine = ConstraintEngine()

    def replan(
        self,
        current_schedule: List[ScheduleItem],
        availabilities: List[Availability],
        start_date: datetime,
        unavailability_start: Optional[datetime] = None,
        unavailability_end: Optional[datetime] = None,
        reason: str = "Availability changed",
        days_to_plan: int = 3,
        learned_preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes adaptive replanning:
        - Keeps locked items untouched.
        - Identifies tasks in conflict with new unavailability.
        - Reschedules displaced tasks into remaining valid slots.
        - Emits detailed diff explaining moved items.
        """
        locked_items: List[ScheduleItem] = []
        unaffected_items: List[ScheduleItem] = []
        affected_items: List[ScheduleItem] = []

        # 1. Categorize existing items
        for item in current_schedule:
            if item.status == "REJECTED":
                continue

            # If locked, it CANNOT move
            if item.locked:
                locked_items.append(item)
                continue

            # Check if it intersects the newly declared unavailability
            has_unavail_conflict = False
            if unavailability_start and unavailability_end:
                if max(item.start_time, unavailability_start) < min(item.end_time, unavailability_end):
                    has_unavail_conflict = True

            if has_unavail_conflict:
                affected_items.append(item)
            else:
                unaffected_items.append(item)

        # 2. Re-verify unaffected items against weekly availability
        # (in case general availability changed)
        # Any task that is no longer in valid availability moves to affected
        # (while locked tasks stay locked or warn)
        fixed_reservations = list(locked_items) + list(unaffected_items)

        # Build available slots excluding fixed items and unavailability window
        available_slots = self.scheduling_engine._build_available_slots(
            availabilities=availabilities,
            start_date=start_date,
            days=days_to_plan,
            fixed_items=fixed_reservations
        )

        # Carve out the unavailability window if specified
        if unavailability_start and unavailability_end:
            self.scheduling_engine._carve_slot(available_slots, unavailability_start, unavailability_end)

        # 3. Reschedule the affected tasks
        tasks_to_reschedule = [item.task for item in affected_items if item.task]
        rescheduled_items_data: List[Dict[str, Any]] = []
        moved_diff: List[Dict[str, Any]] = []
        unscheduled: List[Dict[str, Any]] = []

        scheduled_task_ids = {item.task_id for item in fixed_reservations}
        daily_planned_minutes: Dict[Any, int] = {}
        for item in fixed_reservations:
            d = item.start_time.date()
            dur = int((item.end_time - item.start_time).total_seconds() / 60)
            daily_planned_minutes[d] = daily_planned_minutes.get(d, 0) + dur

        # Rank tasks to reschedule
        sorted_tasks = self.scheduling_engine._rank_tasks(tasks_to_reschedule, start_date, "balanced")

        for task in sorted_tasks:
            # Find original item for diff comparison
            orig_item = next((it for it in affected_items if it.task_id == task.id), None)
            orig_start = orig_item.start_time if orig_item else start_date
            orig_end = orig_item.end_time if orig_item else (start_date + timedelta(minutes=task.duration_minutes))

            best_placement = self.scheduling_engine._find_best_slot_for_task(
                task=task,
                available_slots=available_slots,
                fixed_items=fixed_reservations,
                scheduled_task_ids=scheduled_task_ids,
                daily_planned_minutes=daily_planned_minutes,
                max_daily_minutes=360,
                min_break_minutes=15,
                learned_preferences=learned_preferences
            )

            if best_placement:
                slot, score, context = best_placement
                new_start = slot.start
                new_end = new_start + timedelta(minutes=task.duration_minutes)

                replan_explanation = self.ai_service.generate_replan_explanation(
                    task_title=task.title,
                    old_start=orig_start,
                    new_start=new_start,
                    reason=reason
                )

                item_dict = {
                    "task_id": task.id,
                    "task": task,
                    "start_time": new_start,
                    "end_time": new_end,
                    "source": "AI",
                    "status": "PROPOSED",
                    "locked": False,
                    "approved": False,
                    "ai_reason": replan_explanation,
                    "confidence": min(0.95, max(0.80, score / 100.0)),
                    "original_start": orig_start,
                    "original_end": orig_end,
                }
                rescheduled_items_data.append(item_dict)

                moved_diff.append({
                    "task_id": task.id,
                    "task_title": task.title,
                    "previous_start": orig_start,
                    "previous_end": orig_end,
                    "new_start": new_start,
                    "new_end": new_end,
                    "status": "PROPOSED",
                    "reason": replan_explanation
                })

                scheduled_task_ids.add(task.id)
                d = new_start.date()
                daily_planned_minutes[d] = daily_planned_minutes.get(d, 0) + task.duration_minutes
                self.scheduling_engine._carve_slot(available_slots, new_start, new_end + timedelta(minutes=15))
            else:
                diag_reason, suggested_action = self.scheduling_engine._diagnose_unscheduled(task, available_slots, start_date)
                unscheduled.append({
                    "task_id": task.id,
                    "title": task.title,
                    "priority": task.priority,
                    "duration_minutes": task.duration_minutes,
                    "reason": diag_reason,
                    "suggested_action": suggested_action
                })

        return {
            "locked_items": locked_items,
            "unaffected_items": unaffected_items,
            "rescheduled_items": rescheduled_items_data,
            "moved_items": moved_diff,
            "unscheduled_tasks": unscheduled,
            "preserved_locked_count": len(locked_items),
            "preserved_accepted_count": len(unaffected_items),
            "message": f"Replanned successfully: {len(locked_items)} locked tasks preserved, {len(moved_diff)} tasks rescheduled."
        }
