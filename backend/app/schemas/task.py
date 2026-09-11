from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

PriorityType = Literal["Critical", "High", "Medium", "Low"]
DifficultyType = Literal["Easy", "Medium", "Hard"]
StatusType = Literal["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"]

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: str = Field(default="Work", max_length=50)
    priority: PriorityType = "Medium"
    duration_minutes: int = Field(default=60, ge=10, le=720)
    deadline: Optional[datetime] = None
    preferred_start: Optional[str] = None  # "09:00"
    preferred_end: Optional[str] = None    # "12:00"
    difficulty: DifficultyType = "Medium"
    recurrence: Optional[str] = None
    notes: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[PriorityType] = None
    duration_minutes: Optional[int] = None
    deadline: Optional[datetime] = None
    preferred_start: Optional[str] = None
    preferred_end: Optional[str] = None
    difficulty: Optional[DifficultyType] = None
    status: Optional[StatusType] = None
    recurrence: Optional[str] = None
    notes: Optional[str] = None

class TaskResponse(TaskBase):
    id: int
    user_id: int
    status: StatusType
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
