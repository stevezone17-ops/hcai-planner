from pydantic import BaseModel, Field, ConfigDict
from typing import List

class AvailabilityBase(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6, description="0=Monday, 6=Sunday")
    start_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="e.g. 09:00")
    end_time: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="e.g. 17:00")

class AvailabilityCreate(AvailabilityBase):
    pass

class AvailabilityResponse(AvailabilityBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class AvailabilityBatch(BaseModel):
    availabilities: List[AvailabilityCreate]
