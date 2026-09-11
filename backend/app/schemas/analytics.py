from typing import List, Dict, Any
from pydantic import BaseModel

class HITLMetrics(BaseModel):
    total_proposals: int
    accepted_count: int
    modified_count: int
    rejected_count: int
    locked_count: int
    acceptance_rate: float
    modification_rate: float
    rejection_rate: float
    human_intervention_rate: float

class CategoryBreakdown(BaseModel):
    category: str
    count: int
    hours: float

class PriorityBreakdown(BaseModel):
    priority: str
    count: int

class HourlyModification(BaseModel):
    hour: int
    count: int

class AnalyticsResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    overdue_tasks: int
    completion_rate: float
    planned_hours: float
    completed_hours: float
    schedule_efficiency: float
    hitl_metrics: HITLMetrics
    category_distribution: List[CategoryBreakdown]
    priority_distribution: List[PriorityBreakdown]
    hourly_modifications: List[HourlyModification]
    insights: List[str]
