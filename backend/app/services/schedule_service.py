from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import ScheduleItem, Task, Feedback
from app.schemas.schedule import ScheduleModifyRequest

class ScheduleService:
    @staticmethod
    def get_schedule(
        db: Session,
        user_id: int = 1,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        include_rejected: bool = False
    ) -> List[ScheduleItem]:
        query = db.query(ScheduleItem).filter(ScheduleItem.user_id == user_id)
        if not include_rejected:
            query = query.filter(ScheduleItem.status != "REJECTED")
        if start_date:
            query = query.filter(ScheduleItem.end_time >= start_date)
        if end_date:
            query = query.filter(ScheduleItem.start_time <= end_date)
        return query.order_by(ScheduleItem.start_time.asc()).all()

    @staticmethod
    def get_item(db: Session, item_id: int, user_id: int = 1) -> Optional[ScheduleItem]:
        return db.query(ScheduleItem).filter(ScheduleItem.id == item_id, ScheduleItem.user_id == user_id).first()

    @staticmethod
    def approve_item(db: Session, item_id: int, user_id: int = 1) -> Optional[ScheduleItem]:
        item = ScheduleService.get_item(db, item_id, user_id)
        if not item:
            return None
        if item.locked:
            item.status = "LOCKED"
            item.approved = True
            db.commit()
            db.refresh(item)
            return item
        item.status = "ACCEPTED"
        item.approved = True
        
        # Log feedback audit
        feedback = Feedback(
            user_id=user_id,
            schedule_item_id=item.id,
            action="ACCEPT",
            reason="User accepted AI recommendation"
        )
        db.add(feedback)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def reject_item(db: Session, item_id: int, reason: Optional[str] = None, user_id: int = 1) -> Optional[ScheduleItem]:
        item = ScheduleService.get_item(db, item_id, user_id)
        if not item:
            return None
        if item.locked:
            return None
        item.status = "REJECTED"
        item.approved = False
        item.locked = False

        # If associated with task, task goes back to PENDING
        if item.task:
            item.task.status = "PENDING"

        # Log feedback audit
        feedback = Feedback(
            user_id=user_id,
            schedule_item_id=item.id,
            action="REJECT",
            reason=reason or "User rejected recommendation"
        )
        db.add(feedback)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def modify_item(db: Session, item_id: int, req: ScheduleModifyRequest, user_id: int = 1) -> Optional[ScheduleItem]:
        item = ScheduleService.get_item(db, item_id, user_id)
        if not item:
            return None
        if item.locked:
            return None
        
        # Save original timing if not already saved
        if not item.original_start:
            item.original_start = item.start_time
            item.original_end = item.end_time

        duration = item.end_time - item.start_time
        item.start_time = req.start_time
        item.end_time = req.end_time if req.end_time else (req.start_time + duration)
        item.status = "MODIFIED"
        item.approved = True
        item.source = "USER"

        # Log feedback audit
        feedback = Feedback(
            user_id=user_id,
            schedule_item_id=item.id,
            action="MODIFY",
            reason=req.reason or "User modified schedule timing"
        )
        db.add(feedback)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def lock_item(db: Session, item_id: int, user_id: int = 1) -> Optional[ScheduleItem]:
        item = ScheduleService.get_item(db, item_id, user_id)
        if not item:
            return None
        item.locked = True
        item.approved = True
        item.status = "LOCKED"

        feedback = Feedback(
            user_id=user_id,
            schedule_item_id=item.id,
            action="LOCK",
            reason="User locked task slot to prevent replanning changes"
        )
        db.add(feedback)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def unlock_item(db: Session, item_id: int, user_id: int = 1) -> Optional[ScheduleItem]:
        item = ScheduleService.get_item(db, item_id, user_id)
        if not item:
            return None
        item.locked = False
        if item.status == "LOCKED":
            item.status = "ACCEPTED"

        feedback = Feedback(
            user_id=user_id,
            schedule_item_id=item.id,
            action="UNLOCK",
            reason="User unlocked task slot"
        )
        db.add(feedback)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def complete_item(db: Session, item_id: int, user_id: int = 1) -> Optional[ScheduleItem]:
        item = ScheduleService.get_item(db, item_id, user_id)
        if not item:
            return None
        item.status = "COMPLETED"
        if item.task:
            item.task.status = "COMPLETED"
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def save_proposed_items(db: Session, proposed_data: List[Dict[str, Any]], user_id: int = 1) -> List[ScheduleItem]:
        saved_items = []
        for p in proposed_data:
            item = ScheduleItem(
                user_id=user_id,
                task_id=p["task_id"],
                start_time=p["start_time"],
                end_time=p["end_time"],
                source=p.get("source", "AI"),
                status=p.get("status", "PROPOSED"),
                locked=p.get("locked", False),
                approved=p.get("approved", False),
                ai_reason=p.get("ai_reason"),
                confidence=p.get("confidence", 0.9),
                original_start=p.get("original_start"),
                original_end=p.get("original_end")
            )
            db.add(item)
            saved_items.append(item)
            
            # Update task status to SCHEDULED
            task = db.query(Task).filter(Task.id == p["task_id"]).first()
            if task and task.status == "PENDING":
                task.status = "SCHEDULED"

        db.commit()
        for it in saved_items:
            db.refresh(it)
        return saved_items
