from datetime import datetime, timedelta, time
from typing import List, Dict, Any, Optional, Tuple
from app.models.models import Task, Availability, ScheduleItem

class TimeSlot:
    def __init__(self, start: datetime, end: datetime, slot_type: str = "AVAILABLE", metadata: Optional[Dict[str, Any]] = None):
        self.start = start
        self.end = end
        self.slot_type = slot_type  # AVAILABLE, LOCKED, FIXED, BREAK
        self.metadata = metadata or {}

    @property
    def duration_minutes(self) -> int:
        return int((self.end - self.start).total_seconds() / 60)

    def overlaps_with(self, start: datetime, end: datetime) -> bool:
        return max(self.start, start) < min(self.end, end)

    def contains(self, start: datetime, end: datetime) -> bool:
        return self.start <= start and end <= self.end

    def __repr__(self):
        return f"<TimeSlot {self.start.strftime('%Y-%m-%d %H:%M')} - {self.end.strftime('%H:%M')} ({self.slot_type})>"


class ConstraintEngine:
    """
    Evaluates and validates both Hard Constraints and Soft Constraints
    for candidate schedule placements.
    """

    PRIORITY_WEIGHTS = {
        "Critical": 50.0,
        "High": 35.0,
        "Medium": 20.0,
        "Low": 10.0
    }

    DIFFICULTY_WEIGHTS = {
        "Hard": 15.0,
        "Medium": 10.0,
        "Easy": 5.0
    }

    @staticmethod
    def validate_hard_constraints(
        task: Task,
        candidate_start: datetime,
        candidate_end: datetime,
        available_slots: List[TimeSlot],
        fixed_items: List[ScheduleItem],
        scheduled_task_ids: set[int]
    ) -> Tuple[bool, Optional[str]]:
        """
        Check all hard constraints. Returns (True, None) if valid,
        or (False, reason) if any hard constraint is violated.
        """
        # 1. Task duration check
        req_duration = timedelta(minutes=task.duration_minutes)
        if candidate_end - candidate_start != req_duration:
            return False, f"Candidate duration ({candidate_end - candidate_start}) does not match task duration ({task.duration_minutes}m)"

        # 2. Cannot be scheduled twice
        if task.id in scheduled_task_ids:
            return False, f"Task '{task.title}' is already scheduled"

        # 3. Deadline check
        if task.deadline and candidate_end > task.deadline:
            return False, f"Scheduled end {candidate_end} exceeds task deadline {task.deadline}"

        # 4. Must fit fully inside an available user availability slot
        fits_in_available = False
        for slot in available_slots:
            if slot.slot_type == "AVAILABLE" and slot.contains(candidate_start, candidate_end):
                fits_in_available = True
                break
        if not fits_in_available:
            return False, "Placement is outside user available working hours"

        # 5. Overlap with locked or fixed items
        for fixed in fixed_items:
            if max(candidate_start, fixed.start_time) < min(candidate_end, fixed.end_time):
                fixed_name = fixed.task.title if fixed.task else "Locked Item"
                return False, f"Overlaps with locked/fixed item '{fixed_name}'"

        return True, None

    @classmethod
    def calculate_soft_score(
        cls,
        task: Task,
        start_time: datetime,
        end_time: datetime,
        daily_planned_minutes: int,
        max_daily_minutes: int,
        preferred_working_hours: Optional[Dict[str, Any]] = None,
        learned_preferences: Optional[Dict[str, Any]] = None
    ) -> float:
        """
        Calculates a soft score for a feasible candidate slot.
        Higher score = better schedule placement.
        """
        score = 0.0

        # 1. Base Priority Score
        priority_weight = cls.PRIORITY_WEIGHTS.get(task.priority, 20.0)
        score += priority_weight

        # 2. Deadline Urgency Factor
        if task.deadline:
            hours_until_deadline = (task.deadline - start_time).total_seconds() / 3600.0
            if hours_until_deadline < 24:
                score += 40.0  # Due today / within 24h
            elif hours_until_deadline < 48:
                score += 25.0  # Due tomorrow
            elif hours_until_deadline < 72:
                score += 15.0
            else:
                score += 5.0

        # 3. Task preferred window match
        slot_time_str = start_time.strftime("%H:%M")
        if task.preferred_start and task.preferred_end:
            if task.preferred_start <= slot_time_str <= task.preferred_end:
                score += 30.0  # Explicit user preference match
        else:
            # Morning preference for difficult / high priority tasks
            if task.priority in ["Critical", "High"] and start_time.hour < 12:
                score += 20.0

        # 4. Workload balance (avoid overburdening a single day)
        new_total_minutes = daily_planned_minutes + task.duration_minutes
        if new_total_minutes <= max_daily_minutes:
            score += 15.0
        else:
            # Over-capacity penalty
            overflow_hours = (new_total_minutes - max_daily_minutes) / 60.0
            score -= overflow_hours * 15.0

        # 5. Learned preferences match
        if learned_preferences:
            fav_hour = learned_preferences.get(f"category_time_{task.category}")
            if fav_hour is not None and abs(start_time.hour - fav_hour) <= 2:
                score += 15.0

        return score
