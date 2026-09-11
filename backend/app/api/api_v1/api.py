from fastapi import APIRouter
from app.api.api_v1.endpoints import tasks, availability, planner, schedule, feedback, analytics, preferences, seed, goals

api_router = APIRouter()

api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(goals.router, prefix="/goals", tags=["Goals"])
api_router.include_router(availability.router, prefix="/availability", tags=["Availability"])
api_router.include_router(planner.router, prefix="/planner", tags=["Planner"])
api_router.include_router(schedule.router, prefix="/schedule", tags=["Schedule"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(preferences.router, prefix="/preferences", tags=["Preferences"])
api_router.include_router(seed.router, prefix="/seed", tags=["Seed & Demo"])
