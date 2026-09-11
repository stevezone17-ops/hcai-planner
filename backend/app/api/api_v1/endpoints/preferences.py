from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.preference import PreferenceResponse, PreferenceUpdate
from app.services.preference_service import PreferenceService

router = APIRouter()

@router.get("", response_model=List[PreferenceResponse])
def get_preferences(db: Session = Depends(get_db)):
    return PreferenceService.get_preferences(db)

@router.put("", response_model=PreferenceResponse)
def update_preference(pref_in: PreferenceUpdate, db: Session = Depends(get_db)):
    return PreferenceService.set_preference(db, key=pref_in.key, value=pref_in.value, source="EXPLICIT", confidence=1.0)
