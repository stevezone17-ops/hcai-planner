from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.schedule import (
    ScheduleItemResponse,
    ScheduleModifyRequest,
    ScheduleRejectRequest,
    ScheduleActionResponse
)
from app.services.schedule_service import ScheduleService
from app.services.preference_service import PreferenceService

router = APIRouter()

@router.get("", response_model=List[ScheduleItemResponse])
def get_schedule(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    include_rejected: bool = False,
    db: Session = Depends(get_db)
):
    return ScheduleService.get_schedule(db, start_date=start_date, end_date=end_date, include_rejected=include_rejected)

@router.post("/{schedule_id}/approve", response_model=ScheduleActionResponse)
def approve_schedule_item(schedule_id: int, db: Session = Depends(get_db)):
    item = ScheduleService.approve_item(db, schedule_id)
    if not item:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    PreferenceService.update_learned_signals(db)
    return ScheduleActionResponse(
        success=True,
        message="Schedule suggestion approved successfully",
        item=item
    )

@router.post("/{schedule_id}/reject", response_model=ScheduleActionResponse)
def reject_schedule_item(schedule_id: int, req: Optional[ScheduleRejectRequest] = None, db: Session = Depends(get_db)):
    reason = req.reason if req else "User rejected recommendation"
    item = ScheduleService.reject_item(db, schedule_id, reason=reason)
    if not item:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    PreferenceService.update_learned_signals(db)
    return ScheduleActionResponse(
        success=True,
        message="Schedule suggestion rejected",
        item=item
    )

@router.post("/{schedule_id}/modify", response_model=ScheduleActionResponse)
def modify_schedule_item(schedule_id: int, req: ScheduleModifyRequest, db: Session = Depends(get_db)):
    item = ScheduleService.modify_item(db, schedule_id, req)
    if not item:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    PreferenceService.update_learned_signals(db)
    return ScheduleActionResponse(
        success=True,
        message="Schedule slot modified by user",
        item=item
    )

@router.post("/{schedule_id}/lock", response_model=ScheduleActionResponse)
def lock_schedule_item(schedule_id: int, db: Session = Depends(get_db)):
    item = ScheduleService.lock_item(db, schedule_id)
    if not item:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    return ScheduleActionResponse(
        success=True,
        message="Schedule item locked as hard constraint",
        item=item
    )

@router.post("/{schedule_id}/unlock", response_model=ScheduleActionResponse)
def unlock_schedule_item(schedule_id: int, db: Session = Depends(get_db)):
    item = ScheduleService.unlock_item(db, schedule_id)
    if not item:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    return ScheduleActionResponse(
        success=True,
        message="Schedule item unlocked",
        item=item
    )

@router.post("/{schedule_id}/complete", response_model=ScheduleActionResponse)
def complete_schedule_item(schedule_id: int, db: Session = Depends(get_db)):
    item = ScheduleService.complete_item(db, schedule_id)
    if not item:
        raise HTTPException(status_code=404, detail="Schedule item not found")
    return ScheduleActionResponse(
        success=True,
        message="Task and schedule marked as completed",
        item=item
    )
