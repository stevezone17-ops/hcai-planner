from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.models import Task
from app.schemas.task import TaskCreate, TaskUpdate

class TaskService:
    @staticmethod
    def get_tasks(db: Session, user_id: int = 1, status: Optional[str] = None, category: Optional[str] = None) -> List[Task]:
        query = db.query(Task).filter(Task.user_id == user_id)
        if status:
            query = query.filter(Task.status == status)
        if category:
            query = query.filter(Task.category == category)
        return query.order_by(Task.created_at.desc()).all()

    @staticmethod
    def get_task(db: Session, task_id: int, user_id: int = 1) -> Optional[Task]:
        return db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    @staticmethod
    def create_task(db: Session, task_in: TaskCreate, user_id: int = 1) -> Task:
        task = Task(**task_in.model_dump(), user_id=user_id)
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def update_task(db: Session, task_id: int, task_in: TaskUpdate, user_id: int = 1) -> Optional[Task]:
        task = TaskService.get_task(db, task_id, user_id)
        if not task:
            return None
        update_data = task_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)
        db.commit()
        db.refresh(task)
        return task

    @staticmethod
    def delete_task(db: Session, task_id: int, user_id: int = 1) -> bool:
        task = TaskService.get_task(db, task_id, user_id)
        if not task:
            return False
        db.delete(task)
        db.commit()
        return True
