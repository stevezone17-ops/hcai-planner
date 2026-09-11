from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.analytics import AnalyticsResponse
from app.services.analytics_service import AnalyticsService

router = APIRouter()

@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    return AnalyticsService.get_analytics(db)
