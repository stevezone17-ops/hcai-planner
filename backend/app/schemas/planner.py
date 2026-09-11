from datetime import datetime
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.schedule import ScheduleItemResponse

PlannerStrategy = Literal["balanced", "urgent_first", "focus_first"]

class PlannerGenerateRequest(BaseModel):
    task_ids: Optional[List[int]] = None
    start_date: Optional[datetime] = None
    days_to_plan: int = Field(default=3, ge=1, le=14)
    strategy: PlannerStrategy = "balanced"
    max_work_hours_per_day: float = Field(default=6.0, ge=1.0, le=14.0)
    focus_session_minutes: int = Field(default=60, ge=15, le=240)
    min_break_minutes: int = Field(default=15, ge=0, le=60)

class UnscheduledTask(BaseModel):
    task_id: int
    title: str
    priority: str
    duration_minutes: int
    reason: str
    suggested_action: str

class PlannerSummary(BaseModel):
    total_tasks_considered: int
    total_tasks_scheduled: int
    total_scheduled_hours: float
    conflicts_resolved: int
    hitl_status: str
    explanations_count: int

class PlannerResponse(BaseModel):
    proposed_items: List[ScheduleItemResponse]
    unscheduled_tasks: List[UnscheduledTask]
    summary: PlannerSummary
    generation_steps: List[str]

class PlannerReplanRequest(BaseModel):
    start_date: Optional[datetime] = None
    unavailability_start: Optional[datetime] = None
    unavailability_end: Optional[datetime] = None
    reason: Optional[str] = "User availability changed"

class ReplanDiffItem(BaseModel):
    task_id: int
    task_title: str
    previous_start: datetime
    previous_end: datetime
    new_start: datetime
    new_end: datetime
    status: str
    reason: str

class PlannerReplanResponse(BaseModel):
    rescheduled_items: List[ScheduleItemResponse]
    preserved_locked_count: int
    preserved_accepted_count: int
    moved_items: List[ReplanDiffItem]
    unscheduled_tasks: List[UnscheduledTask]
    message: str

class WhatIfRequest(BaseModel):
    scenario_type: Literal["lost_hours", "deadline_shift", "add_task", "exam_tomorrow"] = "lost_hours"
    lost_hours: Optional[float] = 3.0
    date: Optional[datetime] = None
    new_task_title: Optional[str] = "Urgent Research Deliverable"
    new_task_duration: Optional[int] = 120
    new_task_priority: Optional[str] = "High"
    shift_task_id: Optional[int] = None
    shift_to_date: Optional[datetime] = None

class WhatIfResponse(BaseModel):
    scenario_description: str
    current_items: List[ScheduleItemResponse]
    simulated_items: List[ScheduleItemResponse]
    moved_count: int
    preserved_locked_count: int
    diffs: List[ReplanDiffItem]
    impact_summary: str

class ApplyWhatIfRequest(BaseModel):
    simulated_item_ids: List[int]

