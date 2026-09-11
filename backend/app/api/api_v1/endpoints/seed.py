from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db, Base, engine
from app.services.seed_service import seed_initial_data

router = APIRouter()

@router.post("/reset")
def reset_database(db: Session = Depends(get_db)):
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_initial_data(db)
    return {"message": "Database reset and seeded with realistic demo data"}

@router.post("/seed")
def seed_database(db: Session = Depends(get_db)):
    seed_initial_data(db)
    return {"message": "Database seeded successfully"}
