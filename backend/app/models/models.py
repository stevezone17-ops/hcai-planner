from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tasks = relationship("Task", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="user", cascade="all, delete-orphan")
    availabilities = relationship("Availability", back_populates="user", cascade="all, delete-orphan")
    schedule_items = relationship("ScheduleItem", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", cascade="all, delete-orphan")


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=True, index=True)
    priority = Column(String(20), default="High")
    progress_percent = Column(Integer, default=0)
    target_hours = Column(Float, default=10.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="goals")
    tasks = relationship("Task", back_populates="goal")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="Work", index=True)
    priority = Column(String(20), default="Medium", index=True)  # Critical, High, Medium, Low
    duration_minutes = Column(Integer, nullable=False, default=60)
    deadline = Column(DateTime, nullable=True, index=True)
    preferred_start = Column(String(10), nullable=True)  # e.g. "09:00"
    preferred_end = Column(String(10), nullable=True)    # e.g. "12:00"
    difficulty = Column(String(20), default="Medium")    # Easy, Medium, Hard
    status = Column(String(30), default="PENDING", index=True)  # PENDING, SCHEDULED, COMPLETED, CANCELLED
    recurrence = Column(String(50), nullable=True)       # Daily, Weekly, None
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="tasks")
    goal = relationship("Goal", back_populates="tasks")
    schedule_items = relationship("ScheduleItem", back_populates="task", cascade="all, delete-orphan")


class Availability(Base):
    __tablename__ = "availabilities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=False)  # 0=Monday, 6=Sunday
    start_time = Column(String(10), nullable=False)  # "09:00"
    end_time = Column(String(10), nullable=False)    # "17:00"

    user = relationship("User", back_populates="availabilities")


class ScheduleItem(Base):
    __tablename__ = "schedule_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False, index=True)
    source = Column(String(20), default="AI")  # AI, USER
    status = Column(String(30), default="PROPOSED", index=True)  # PROPOSED, ACCEPTED, MODIFIED, REJECTED, LOCKED, COMPLETED, CANCELLED
    locked = Column(Boolean, default=False, index=True)
    approved = Column(Boolean, default=False)
    ai_reason = Column(Text, nullable=True)
    confidence = Column(Float, default=0.9)
    original_start = Column(DateTime, nullable=True)
    original_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="schedule_items")
    task = relationship("Task", back_populates="schedule_items")
    feedbacks = relationship("Feedback", back_populates="schedule_item", cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    schedule_item_id = Column(Integer, ForeignKey("schedule_items.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(30), nullable=False)  # ACCEPT, MODIFY, REJECT, LOCK, UNLOCK
    reason = Column(String(200), nullable=True)
    rating = Column(Integer, nullable=True)  # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")
    schedule_item = relationship("ScheduleItem", back_populates="feedbacks")


class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    key = Column(String(100), nullable=False, index=True)
    value = Column(Text, nullable=False)
    confidence = Column(Float, default=0.8)
    source = Column(String(50), default="INITIAL")  # INITIAL, LEARNED, EXPLICIT
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="preferences")
