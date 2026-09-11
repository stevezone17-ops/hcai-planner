# System Architecture

## Overview

Use a modular full-stack architecture:

Browser
↓
React Frontend
↓
REST API
↓
FastAPI Backend
↓
Services
├── Task Service
├── Scheduling Engine
├── Constraint Engine
├── Feedback Service
├── Preference/Adaptation Service
└── AI Service
↓
Database

## Frontend Structure

Recommended:

src/
- components/
- pages/
- layouts/
- features/
  - tasks/
  - planner/
  - timetable/
  - calendar/
  - analytics/
- services/
- hooks/
- types/
- lib/

Keep business logic out of presentation components where practical.

## Backend Structure

backend/
- app/
  - api/
  - models/
  - schemas/
  - services/
  - scheduler/
  - commands/
  - core/
  - db/

## Scheduling Separation
The scheduling engine must not depend directly on a specific AI provider.

Use interfaces such as:
- AIService
- SchedulerEngine
- ConstraintEngine
- PreferenceService

## Data Flow
1. Frontend sends task and availability data.
2. Backend validates it.
3. Constraint engine classifies constraints.
4. Scheduler creates feasible candidate schedules.
5. AI service may rank, explain, or improve candidates.
6. Backend returns a PROPOSED schedule.
7. User reviews it.
8. User actions are stored.
9. Replanning preserves locked and approved items according to their status.
