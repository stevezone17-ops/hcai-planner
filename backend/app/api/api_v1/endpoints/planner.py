from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Task, Availability, ScheduleItem
from app.schemas.planner import (
    PlannerGenerateRequest,
    PlannerResponse,
    PlannerReplanRequest,
    PlannerReplanResponse,
    WhatIfRequest,
    WhatIfResponse,
)
from app.scheduler.engine import SchedulingEngine
from app.scheduler.replanner import ReplanningEngine
from app.services.schedule_service import ScheduleService
from app.services.preference_service import PreferenceService

router = APIRouter()

@router.post("/generate", response_model=PlannerResponse)
def generate_schedule(req: PlannerGenerateRequest, db: Session = Depends(get_db)):
    user_id = 1
    # 1. Fetch tasks
    if req.task_ids:
        tasks = db.query(Task).filter(Task.id.in_(req.task_ids), Task.user_id == user_id).all()
    else:
        tasks = db.query(Task).filter(Task.user_id == user_id, Task.status.in_(["PENDING", "SCHEDULED"])).all()

    if not tasks:
        raise HTTPException(
            status_code=400,
            detail="No eligible tasks found to schedule. Please add active tasks first."
        )

    # 2. Fetch availability
    avails = db.query(Availability).filter(Availability.user_id == user_id).all()
    if not avails:
        raise HTTPException(
            status_code=400,
            detail="No weekly availability defined. Please set your available hours in Settings."
        )

    # 3. Fetch existing locked/fixed items
    existing_items = db.query(ScheduleItem).filter(
        ScheduleItem.user_id == user_id,
        ScheduleItem.status.in_(["ACCEPTED", "MODIFIED", "LOCKED"])
    ).all()

    # 4. Fetch learned preferences
    pref_map = PreferenceService.get_preference_map(db, user_id)

    start_date = req.start_date or datetime.utcnow()

    # 5. Run Scheduling Engine
    engine = SchedulingEngine()
    result = engine.generate_schedule(
        tasks=tasks,
        availabilities=avails,
        existing_items=existing_items,
        start_date=start_date,
        days_to_plan=req.days_to_plan,
        strategy=req.strategy,
        max_work_hours_per_day=req.max_work_hours_per_day,
        focus_session_minutes=req.focus_session_minutes,
        min_break_minutes=req.min_break_minutes,
        learned_preferences=pref_map
    )

    # 6. Save proposed items to database
    saved_items = ScheduleService.save_proposed_items(db, result["proposed_items"], user_id=user_id)

    return PlannerResponse(
        proposed_items=saved_items,
        unscheduled_tasks=result["unscheduled_tasks"],
        summary=result["summary"],
        generation_steps=result["generation_steps"]
    )


@router.post("/replan", response_model=PlannerReplanResponse)
def replan_schedule(req: PlannerReplanRequest, db: Session = Depends(get_db)):
    user_id = 1
    # 1. Fetch current active schedules
    current_schedule = db.query(ScheduleItem).filter(
        ScheduleItem.user_id == user_id,
        ScheduleItem.status.in_(["PROPOSED", "ACCEPTED", "MODIFIED", "LOCKED"])
    ).all()

    if not current_schedule:
        raise HTTPException(status_code=400, detail="No active schedule items found to replan.")

    # 2. Fetch availabilities
    avails = db.query(Availability).filter(Availability.user_id == user_id).all()
    pref_map = PreferenceService.get_preference_map(db, user_id)
    start_date = req.start_date or datetime.utcnow()

    # 3. Run Replanning Engine
    replanner = ReplanningEngine()
    result = replanner.replan(
        current_schedule=current_schedule,
        availabilities=avails,
        start_date=start_date,
        unavailability_start=req.unavailability_start,
        unavailability_end=req.unavailability_end,
        reason=req.reason or "Availability updated",
        learned_preferences=pref_map
    )

    # 4. Update the moved items in the database
    updated_items = []
    for item_data in result["rescheduled_items"]:
        # Update existing record or insert
        db_item = db.query(ScheduleItem).filter(
            ScheduleItem.task_id == item_data["task_id"],
            ScheduleItem.user_id == user_id
        ).first()

        if db_item:
            db_item.start_time = item_data["start_time"]
            db_item.end_time = item_data["end_time"]
            db_item.ai_reason = item_data["ai_reason"]
            db_item.confidence = item_data["confidence"]
            db_item.status = "PROPOSED"
            db_item.approved = False
            updated_items.append(db_item)
        else:
            new_item = ScheduleItem(
                user_id=user_id,
                task_id=item_data["task_id"],
                start_time=item_data["start_time"],
                end_time=item_data["end_time"],
                source="AI",
                status="PROPOSED",
                ai_reason=item_data["ai_reason"],
                confidence=item_data["confidence"],
                original_start=item_data.get("original_start"),
                original_end=item_data.get("original_end")
            )
            db.add(new_item)
            updated_items.append(new_item)

    db.commit()
    for it in updated_items:
        db.refresh(it)

    return PlannerReplanResponse(
        rescheduled_items=updated_items,
        preserved_locked_count=result["preserved_locked_count"],
        preserved_accepted_count=result["preserved_accepted_count"],
        moved_items=result["moved_items"],
        unscheduled_tasks=result["unscheduled_tasks"],
        message=result["message"]
    )


@router.post("/what-if", response_model=WhatIfResponse)
def simulate_what_if(req: WhatIfRequest, db: Session = Depends(get_db)):
    user_id = 1
    current_schedule = db.query(ScheduleItem).filter(
        ScheduleItem.user_id == user_id,
        ScheduleItem.status.in_(["PROPOSED", "ACCEPTED", "MODIFIED", "LOCKED"])
    ).all()

    avails = db.query(Availability).filter(Availability.user_id == user_id).all()
    start_date = req.date or datetime.utcnow()

    # Determine simulation scenario parameters
    desc = ""
    unavail_start = None
    unavail_end = None

    if req.scenario_type == "lost_hours":
        hours = req.lost_hours or 3.0
        desc = f"Simulating loss of {hours} available hours tomorrow (e.g., emergency meeting / transit delay)"
        from datetime import timedelta
        base_day = (start_date + timedelta(days=1)).replace(hour=13, minute=0, second=0, microsecond=0)
        unavail_start = base_day
        unavail_end = base_day + timedelta(hours=hours)
    elif req.scenario_type == "exam_tomorrow":
        desc = "Simulating surprise exam/assessment tomorrow requiring dedicated morning prep block"
        from datetime import timedelta
        base_day = (start_date + timedelta(days=1)).replace(hour=9, minute=0, second=0, microsecond=0)
        unavail_start = base_day
        unavail_end = base_day + timedelta(hours=4)
    elif req.scenario_type == "deadline_shift":
        desc = "Simulating high-priority deadline pulled forward by 24 hours"
        from datetime import timedelta
        base_day = (start_date + timedelta(days=1)).replace(hour=14, minute=0, second=0, microsecond=0)
        unavail_start = base_day
        unavail_end = base_day + timedelta(hours=2.5)
    else:
        desc = "Simulating workload surge: extra 2h high-priority deliverable added"
        from datetime import timedelta
        base_day = (start_date + timedelta(days=1)).replace(hour=15, minute=0, second=0, microsecond=0)
        unavail_start = base_day
        unavail_end = base_day + timedelta(hours=2)

    replanner = ReplanningEngine()
    result = replanner.replan(
        current_schedule=current_schedule,
        availabilities=avails,
        start_date=start_date,
        unavailability_start=unavail_start,
        unavailability_end=unavail_end,
        reason=desc
    )

    # Build simulated items as non-persisted ScheduleItemResponse objects
    simulated_res = []
    for item_data in result["rescheduled_items"]:
        # Find original task info
        task = db.query(Task).filter(Task.id == item_data["task_id"]).first()
        sim_item = {
            "id": item_data.get("id") or 999000 + item_data["task_id"],
            "user_id": user_id,
            "task_id": item_data["task_id"],
            "start_time": item_data["start_time"],
            "end_time": item_data["end_time"],
            "source": item_data.get("source", "SIMULATED"),
            "status": item_data.get("status", "PROPOSED"),
            "locked": item_data.get("locked", False),
            "approved": item_data.get("approved", False),
            "ai_reason": f"[Simulation] {item_data.get('ai_reason', 'Rebalanced')}",
            "confidence": item_data.get("confidence", 0.9),
            "original_start": item_data.get("original_start"),
            "original_end": item_data.get("original_end"),
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "task": task
        }
        simulated_res.append(sim_item)

    moved_count = len(result["moved_items"])
    impact = f"Rebalance resolved without violating hard constraints. {result['preserved_locked_count']} locked tasks remained completely fixed, while {moved_count} items shifted to available buffer windows."

    return WhatIfResponse(
        scenario_description=desc,
        current_items=current_schedule,
        simulated_items=simulated_res,
        moved_count=moved_count,
        preserved_locked_count=result["preserved_locked_count"],
        diffs=result["moved_items"],
        impact_summary=impact
    )

