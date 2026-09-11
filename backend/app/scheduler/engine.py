from datetime import datetime, timedelta, date, time
from typing import List, Dict, Any, Optional, Tuple, Set
from app.models.models import Task, Availability, ScheduleItem
from app.scheduler.constraint_engine import ConstraintEngine, TimeSlot
from app.services.ai_service import get_ai_service

class SchedulingEngine:
    """
    Deterministic constraint-based scheduling engine with explainable AI placement.
    """

    def __init__(self, ai_service=None):
        self.ai_service = ai_service or get_ai_service()
        self.constraint_engine = ConstraintEngine()

    def generate_schedule(
        self,
        tasks: List[Task],
        availabilities: List[Availability],
        existing_items: List[ScheduleItem],
        start_date: datetime,
        days_to_plan: int = 3,
        strategy: str = "balanced",
        max_work_hours_per_day: float = 6.0,
        focus_session_minutes: int = 60,
        min_break_minutes: int = 15,
        learned_preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes the scheduling pipeline and returns proposed items and diagnostics.
        """
        generation_steps = [
            "Analyzing tasks and deadlines...",
            "Checking user weekly availability windows...",
            "Reserving locked and approved schedule items...",
            "Evaluating constraint feasibility and soft scores...",
            "Optimizing timetable layout and preparing AI reasoning..."
        ]

        # Filter active tasks
        active_tasks = [t for t in tasks if t.status in ["PENDING", "SCHEDULED"]]

        # 1. Identify locked / fixed items that must be permanently reserved
        fixed_items = [
            item for item in existing_items
            if item.locked or item.status in ["ACCEPTED", "LOCKED"]
        ]

        scheduled_task_ids: Set[int] = {item.task_id for item in fixed_items}

        # 2. Build available working slots for each day
        available_slots = self._build_available_slots(
            availabilities=availabilities,
            start_date=start_date,
            days=days_to_plan,
            fixed_items=fixed_items
        )

        # 3. Sort pending tasks by urgency and priority
        pending_tasks = [t for t in active_tasks if t.id not in scheduled_task_ids]
        sorted_tasks = self._rank_tasks(pending_tasks, start_date, strategy)

        proposed_items: List[Dict[str, Any]] = []
        unscheduled_tasks: List[Dict[str, Any]] = []
        daily_planned_minutes: Dict[date, int] = {}

        # Initialize daily planned minutes from fixed items
        for item in fixed_items:
            item_date = item.start_time.date()
            dur = int((item.end_time - item.start_time).total_seconds() / 60)
            daily_planned_minutes[item_date] = daily_planned_minutes.get(item_date, 0) + dur

        max_daily_minutes = int(max_work_hours_per_day * 60)

        # 4. Schedule each task into the best scoring feasible slot
        for task in sorted_tasks:
            best_placement = self._find_best_slot_for_task(
                task=task,
                available_slots=available_slots,
                fixed_items=fixed_items,
                scheduled_task_ids=scheduled_task_ids,
                daily_planned_minutes=daily_planned_minutes,
                max_daily_minutes=max_daily_minutes,
                min_break_minutes=min_break_minutes,
                learned_preferences=learned_preferences
            )

            if best_placement:
                slot, score, context = best_placement
                cand_start = slot.start
                cand_end = cand_start + timedelta(minutes=task.duration_minutes)

                # Generate AI explanation
                explanation = self.ai_service.generate_explanation(
                    task_title=task.title,
                    priority=task.priority,
                    category=task.category,
                    start_time=cand_start,
                    end_time=cand_end,
                    context=context
                )

                proposed_items.append({
                    "task_id": task.id,
                    "task": task,
                    "start_time": cand_start,
                    "end_time": cand_end,
                    "source": "AI",
                    "status": "PROPOSED",
                    "locked": False,
                    "approved": False,
                    "ai_reason": explanation,
                    "confidence": min(0.98, max(0.82, score / 100.0)),
                    "original_start": cand_start,
                    "original_end": cand_end,
                })

                # Mark task as scheduled
                scheduled_task_ids.add(task.id)
                t_date = cand_start.date()
                daily_planned_minutes[t_date] = daily_planned_minutes.get(t_date, 0) + task.duration_minutes

                # Carve the slot: consume the used time + break buffer
                buffer_end = cand_end + timedelta(minutes=min_break_minutes)
                self._carve_slot(available_slots, cand_start, buffer_end)
            else:
                # Diagnose failure reason
                reason, suggested_action = self._diagnose_unscheduled(task, available_slots, start_date)
                unscheduled_tasks.append({
                    "task_id": task.id,
                    "title": task.title,
                    "priority": task.priority,
                    "duration_minutes": task.duration_minutes,
                    "reason": reason,
                    "suggested_action": suggested_action
                })

        total_scheduled_minutes = sum(t.duration_minutes for item in proposed_items if (t := item.get("task")))
        total_hours = round(total_scheduled_minutes / 60.0, 1)

        summary = {
            "total_tasks_considered": len(pending_tasks),
            "total_tasks_scheduled": len(proposed_items),
            "total_scheduled_hours": total_hours,
            "conflicts_resolved": len(unscheduled_tasks),
            "hitl_status": "Ready for human review",
            "explanations_count": len(proposed_items)
        }

        return {
            "proposed_items": proposed_items,
            "unscheduled_tasks": unscheduled_tasks,
            "summary": summary,
            "generation_steps": generation_steps
        }

    def _build_available_slots(
        self,
        availabilities: List[Availability],
        start_date: datetime,
        days: int,
        fixed_items: List[ScheduleItem]
    ) -> List[TimeSlot]:
        """
        Creates discrete TimeSlots based on weekly availability and carves out fixed items.
        """
        slots: List[TimeSlot] = []
        base_date = start_date.date()

        for d in range(days):
            current_day = base_date + timedelta(days=d)
            weekday = current_day.weekday()  # 0=Monday, 6=Sunday

            # Find matching availabilities for this weekday
            day_avails = [a for a in availabilities if a.day_of_week == weekday]
            for avail in day_avails:
                try:
                    sh, sm = map(int, avail.start_time.split(":"))
                    eh, em = map(int, avail.end_time.split(":"))
                    s_dt = datetime.combine(current_day, time(sh, sm))
                    e_dt = datetime.combine(current_day, time(eh, em))

                    # Don't schedule in the past if current_day is today
                    if s_dt < start_date:
                        s_dt = max(s_dt, start_date)
                    if s_dt >= e_dt:
                        continue

                    slots.append(TimeSlot(start=s_dt, end=e_dt, slot_type="AVAILABLE"))
                except Exception:
                    continue

        # Carve out locked and fixed items
        for fixed in fixed_items:
            self._carve_slot(slots, fixed.start_time, fixed.end_time)

        return slots

    def _carve_slot(self, slots: List[TimeSlot], carve_start: datetime, carve_end: datetime):
        """
        Subdivides or removes time slots intersecting [carve_start, carve_end].
        """
        i = 0
        while i < len(slots):
            slot = slots[i]
            if not slot.overlaps_with(carve_start, carve_end):
                i += 1
                continue

            # Overlaps! Remove current slot and replace with non-overlapping fragments
            slots.pop(i)
            # Before carve
            if slot.start < carve_start:
                slots.insert(i, TimeSlot(start=slot.start, end=min(slot.end, carve_start)))
                i += 1
            # After carve
            if slot.end > carve_end:
                slots.insert(i, TimeSlot(start=max(slot.start, carve_end), end=slot.end))
                i += 1

    def _rank_tasks(self, tasks: List[Task], current_time: datetime, strategy: str) -> List[Task]:
        """
        Ranks pending tasks using multi-attribute scoring.
        """
        def rank_key(t: Task) -> float:
            score = 0.0
            # Priority
            p_map = {"Critical": 100.0, "High": 70.0, "Medium": 40.0, "Low": 10.0}
            score += p_map.get(t.priority, 30.0)

            # Deadline urgency
            if t.deadline:
                hrs = (t.deadline - current_time).total_seconds() / 3600.0
                if hrs <= 24:
                    score += 120.0
                elif hrs <= 48:
                    score += 70.0
                elif hrs <= 96:
                    score += 35.0
            else:
                score += 5.0

            # Difficulty boost for focus
            if strategy == "focus_first" and t.difficulty == "Hard":
                score += 30.0

            return score

        return sorted(tasks, key=rank_key, reverse=True)

    def _find_best_slot_for_task(
        self,
        task: Task,
        available_slots: List[TimeSlot],
        fixed_items: List[ScheduleItem],
        scheduled_task_ids: Set[int],
        daily_planned_minutes: Dict[date, int],
        max_daily_minutes: int,
        min_break_minutes: int,
        learned_preferences: Optional[Dict[str, Any]]
    ) -> Optional[Tuple[TimeSlot, float, Dict[str, Any]]]:
        """
        Iterates over available slots and selects the slot with the highest soft score.
        """
        best_slot: Optional[TimeSlot] = None
        best_score = -9999.0
        best_context: Dict[str, Any] = {}

        req_duration = timedelta(minutes=task.duration_minutes)

        for slot in available_slots:
            if slot.duration_minutes < task.duration_minutes:
                continue

            # Candidate start & end
            cand_start = slot.start
            cand_end = cand_start + req_duration

            # Validate hard constraints
            valid, _ = self.constraint_engine.validate_hard_constraints(
                task=task,
                candidate_start=cand_start,
                candidate_end=cand_end,
                available_slots=available_slots,
                fixed_items=fixed_items,
                scheduled_task_ids=scheduled_task_ids
            )
            if not valid:
                continue

            # Calculate soft score
            day = cand_start.date()
            daily_mins = daily_planned_minutes.get(day, 0)
            score = self.constraint_engine.calculate_soft_score(
                task=task,
                start_time=cand_start,
                end_time=cand_end,
                daily_planned_minutes=daily_mins,
                max_daily_minutes=max_daily_minutes,
                learned_preferences=learned_preferences
            )

            if score > best_score:
                best_score = score
                best_slot = TimeSlot(start=cand_start, end=cand_end)
                best_context = {
                    "deadline_near": bool(task.deadline and (task.deadline - cand_start).total_seconds() < 86400),
                    "preferred_match": bool(task.preferred_start and task.preferred_start <= cand_start.strftime("%H:%M") <= (task.preferred_end or "23:59")),
                    "break_buffered": True
                }

        if best_slot:
            return best_slot, best_score, best_context
        return None

    def _diagnose_unscheduled(self, task: Task, available_slots: List[TimeSlot], start_date: datetime) -> Tuple[str, str]:
        """
        Provides actionable diagnostic feedback when a task cannot be scheduled.
        """
        if task.deadline and task.deadline < start_date:
            return (
                f"Deadline ({task.deadline.strftime('%Y-%m-%d %H:%M')}) has already passed.",
                "Update the deadline to allow scheduling."
            )

        max_available_chunk = max([s.duration_minutes for s in available_slots], default=0)
        if max_available_chunk < task.duration_minutes:
            return (
                f"Task duration ({task.duration_minutes}m) exceeds largest open availability block ({max_available_chunk}m).",
                f"Consider splitting this task into {max(2, task.duration_minutes // 60)} smaller sessions or expanding your daily available hours."
            )

        if task.deadline:
            return (
                f"No open slot of {task.duration_minutes}m fits before deadline ({task.deadline.strftime('%Y-%m-%d %H:%M')}).",
                "Extend deadline or adjust existing scheduled tasks."
            )

        return (
            "All available time slots within the planning window are currently occupied.",
            "Add more availability hours or extend the planning range."
        )
