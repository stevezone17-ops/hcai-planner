from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Goal
from app.schemas.goal import GoalCreate, GoalUpdate, GoalResponse

router = APIRouter()

@router.get("/", response_model=List[GoalResponse])
def get_goals(db: Session = Depends(get_db)):
    user_id = 1
    return db.query(Goal).filter(Goal.user_id == user_id).order_by(Goal.created_at.desc()).all()

@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(goal_in: GoalCreate, db: Session = Depends(get_db)):
    user_id = 1
    goal = Goal(
        user_id=user_id,
        title=goal_in.title,
        description=goal_in.description,
        deadline=goal_in.deadline,
        priority=goal_in.priority or "High",
        target_hours=goal_in.target_hours or 10.0,
        progress_percent=0
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal

@router.patch("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, goal_in: GoalUpdate, db: Session = Depends(get_db)):
    user_id = 1
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = goal_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(goal, field, value)

    db.commit()
    db.refresh(goal)
    return goal

@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    user_id = 1
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return None
