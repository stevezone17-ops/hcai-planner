import pytest
from datetime import datetime, timedelta
from app.core.database import Base, engine, SessionLocal
from app.models.models import User, Task, Availability, ScheduleItem
from app.scheduler.constraint_engine import ConstraintEngine, TimeSlot
from app.scheduler.replanner import ReplanningEngine
from app.services.seed_service import seed_initial_data
from app.services.analytics_service import AnalyticsService

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    seed_initial_data(session)
    yield session
    session.close()

def test_hard_constraints_validation():
    task = Task(
        id=101,
        user_id=1,
        title="Test Task",
        duration_minutes=60,
        priority="High"
    )
    now = datetime(2026, 9, 12, 10, 0)
    slot = TimeSlot(start=now, end=now + timedelta(hours=2), slot_type="AVAILABLE")
    
    cand_start = now
    cand_end = cand_start + timedelta(minutes=60)
    valid, err = ConstraintEngine.validate_hard_constraints(
        task=task,
        candidate_start=cand_start,
        candidate_end=cand_end,
        available_slots=[slot],
        fixed_items=[],
        scheduled_task_ids=set()
    )
    assert valid is True
    assert err is None

    # Invalid: exceeds available slot
    cand_end_exceed = cand_start + timedelta(minutes=180)
    valid2, err2 = ConstraintEngine.validate_hard_constraints(
        task=task,
        candidate_start=cand_start,
        candidate_end=cand_end_exceed,
        available_slots=[slot],
        fixed_items=[],
        scheduled_task_ids=set()
    )
    assert valid2 is False

def test_locked_item_preservation_during_replan(db_session):
    user = db_session.query(User).first()
    schedules = db_session.query(ScheduleItem).filter(ScheduleItem.user_id == user.id).all()
    avails = db_session.query(Availability).filter(Availability.user_id == user.id).all()

    # Ensure at least one item is locked for the test
    target_item = schedules[0]
    target_item.locked = True
    target_item.status = "LOCKED"
    db_session.commit()
    db_session.refresh(target_item)

    locked_orig_start = target_item.start_time

    # Simulate an unavailability window
    unavail_start = locked_orig_start + timedelta(hours=3)
    unavail_end = unavail_start + timedelta(hours=3)

    replanner = ReplanningEngine()
    result = replanner.replan(
        current_schedule=schedules,
        availabilities=avails,
        start_date=locked_orig_start.replace(hour=8, minute=0),
        unavailability_start=unavail_start,
        unavailability_end=unavail_end,
        reason="Emergency afternoon workshop"
    )

    # Verify locked item was preserved
    preserved_locked = [item for item in result["locked_items"] if item.id == target_item.id]
    assert len(preserved_locked) == 1
    assert preserved_locked[0].start_time == locked_orig_start
    assert result["preserved_locked_count"] >= 1

def test_analytics_metrics(db_session):
    user = db_session.query(User).first()
    # Ensure one item is locked
    item = db_session.query(ScheduleItem).filter(ScheduleItem.user_id == user.id).first()
    item.locked = True
    db_session.commit()

    analytics = AnalyticsService.get_analytics(db_session, user.id)
    assert analytics.total_tasks > 0
    assert analytics.hitl_metrics.total_proposals > 0
    assert analytics.hitl_metrics.locked_count >= 1
    assert len(analytics.insights) > 0
