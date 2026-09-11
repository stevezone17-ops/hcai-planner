from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Feedback
from app.schemas.feedback import FeedbackCreate

class FeedbackService:
    @staticmethod
    def get_feedbacks(db: Session, user_id: int = 1) -> List[Feedback]:
        return db.query(Feedback).filter(Feedback.user_id == user_id).order_by(Feedback.created_at.desc()).all()

    @staticmethod
    def create_feedback(db: Session, fb_in: FeedbackCreate, user_id: int = 1) -> Feedback:
        feedback = Feedback(**fb_in.model_dump(), user_id=user_id)
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
        return feedback
