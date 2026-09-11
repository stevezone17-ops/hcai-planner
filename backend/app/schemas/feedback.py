from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class FeedbackCreate(BaseModel):
    schedule_item_id: Optional[int] = None
    action: str = Field(..., description="ACCEPT, MODIFY, REJECT, LOCK, UNLOCK")
    reason: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    schedule_item_id: Optional[int] = None
    action: str
    reason: Optional[str] = None
    rating: Optional[int] = None
    comment: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
