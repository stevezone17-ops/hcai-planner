from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.services.task_service import TaskService

router = APIRouter()

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return TaskService.get_tasks(db, status=status, category=category)

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: TaskCreate, db: Session = Depends(get_db)):
    return TaskService.create_task(db, task_in)

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = TaskService.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db)):
    task = TaskService.update_task(db, task_id, task_in)
    if not task:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    success = TaskService.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Task with ID {task_id} not found")
    return None
