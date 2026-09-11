from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, ConfigDict
from app.schemas.task import TaskResponse

ScheduleStatus = Literal["PROPOSED", "ACCEPTED", "MODIFIED", "REJECTED", "LOCKED", "COMPLETED", "CANCELLED"]
ScheduleSource = Literal["AI", "USER"]

class ScheduleItemResponse(BaseModel):
    id: int
    user_id: int
    task_id: int
    start_time: datetime
    end_time: datetime
    source: ScheduleSource
    status: ScheduleStatus
    locked: bool
    approved: bool
    ai_reason: Optional[str] = None
    confidence: float
    original_start: Optional[datetime] = None
    original_end: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    task: Optional[TaskResponse] = None

    model_config = ConfigDict(from_attributes=True)

class ScheduleModifyRequest(BaseModel):
    start_time: datetime
    end_time: Optional[datetime] = None
    reason: Optional[str] = "User adjusted schedule timing"

class ScheduleRejectRequest(BaseModel):
    reason: Optional[str] = "User rejected recommendation"

class ScheduleActionResponse(BaseModel):
    success: bool
    message: str
    item: ScheduleItemResponse
