from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[str] = "High"
    target_hours: Optional[float] = 10.0

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[str] = None
    progress_percent: Optional[int] = None
    target_hours: Optional[float] = None

class GoalResponse(GoalBase):
    id: int
    user_id: int
    progress_percent: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
