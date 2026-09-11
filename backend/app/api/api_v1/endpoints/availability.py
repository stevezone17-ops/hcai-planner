from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.availability import AvailabilityCreate, AvailabilityResponse, AvailabilityBatch
from app.services.availability_service import AvailabilityService

router = APIRouter()

@router.get("", response_model=List[AvailabilityResponse])
def get_availabilities(db: Session = Depends(get_db)):
    return AvailabilityService.get_availabilities(db)

@router.post("", response_model=AvailabilityResponse, status_code=status.HTTP_201_CREATED)
def create_availability(avail_in: AvailabilityCreate, db: Session = Depends(get_db)):
    return AvailabilityService.create_availability(db, avail_in)

@router.post("/batch", response_model=List[AvailabilityResponse])
def batch_update_availabilities(batch: AvailabilityBatch, db: Session = Depends(get_db)):
    return AvailabilityService.replace_all(db, batch.availabilities)

@router.put("/{avail_id}", response_model=AvailabilityResponse)
def update_availability(avail_id: int, avail_in: AvailabilityCreate, db: Session = Depends(get_db)):
    avail = AvailabilityService.update_availability(db, avail_id, avail_in)
    if not avail:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    return avail

@router.delete("/{avail_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(avail_id: int, db: Session = Depends(get_db)):
    success = AvailabilityService.delete_availability(db, avail_id)
    if not success:
        raise HTTPException(status_code=404, detail="Availability slot not found")
    return None
