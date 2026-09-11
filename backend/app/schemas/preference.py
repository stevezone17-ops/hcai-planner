from datetime import datetime
from pydantic import BaseModel, ConfigDict

class PreferenceBase(BaseModel):
    key: str
    value: str
    confidence: float = 0.8
    source: str = "EXPLICIT"

class PreferenceUpdate(BaseModel):
    key: str
    value: str

class PreferenceResponse(PreferenceBase):
    id: int
    user_id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
