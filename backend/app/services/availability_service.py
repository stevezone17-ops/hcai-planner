from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Availability
from app.schemas.availability import AvailabilityCreate

class AvailabilityService:
    @staticmethod
    def get_availabilities(db: Session, user_id: int = 1) -> List[Availability]:
        return db.query(Availability).filter(Availability.user_id == user_id).order_by(Availability.day_of_week, Availability.start_time).all()

    @staticmethod
    def create_availability(db: Session, avail_in: AvailabilityCreate, user_id: int = 1) -> Availability:
        avail = Availability(**avail_in.model_dump(), user_id=user_id)
        db.add(avail)
        db.commit()
        db.refresh(avail)
        return avail

    @staticmethod
    def update_availability(db: Session, avail_id: int, avail_in: AvailabilityCreate, user_id: int = 1) -> Optional[Availability]:
        avail = db.query(Availability).filter(Availability.id == avail_id, Availability.user_id == user_id).first()
        if not avail:
            return None
        avail.day_of_week = avail_in.day_of_week
        avail.start_time = avail_in.start_time
        avail.end_time = avail_in.end_time
        db.commit()
        db.refresh(avail)
        return avail

    @staticmethod
    def delete_availability(db: Session, avail_id: int, user_id: int = 1) -> bool:
        avail = db.query(Availability).filter(Availability.id == avail_id, Availability.user_id == user_id).first()
        if not avail:
            return False
        db.delete(avail)
        db.commit()
        return True

    @staticmethod
    def replace_all(db: Session, availabilities: List[AvailabilityCreate], user_id: int = 1) -> List[Availability]:
        db.query(Availability).filter(Availability.user_id == user_id).delete()
        created = []
        for a in availabilities:
            avail = Availability(**a.model_dump(), user_id=user_id)
            db.add(avail)
            created.append(avail)
        db.commit()
        for c in created:
            db.refresh(c)
        return created
