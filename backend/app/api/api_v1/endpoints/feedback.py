from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.services.feedback_service import FeedbackService
from app.services.preference_service import PreferenceService

router = APIRouter()

@router.get("", response_model=List[FeedbackResponse])
def get_feedbacks(db: Session = Depends(get_db)):
    return FeedbackService.get_feedbacks(db)

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_feedback(fb_in: FeedbackCreate, db: Session = Depends(get_db)):
    feedback = FeedbackService.create_feedback(db, fb_in)
    PreferenceService.update_learned_signals(db)
    return feedback
