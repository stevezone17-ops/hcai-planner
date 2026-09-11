# Human-in-the-Loop AI Task Planner

An adaptive timetable generation system that combines AI-assisted scheduling with explicit user control.

## Project Goal
The system accepts tasks, deadlines, priorities, durations, availability, and scheduling preferences. It generates a proposed timetable, allows the user to accept, reject, modify, or lock schedule items, and replans around human decisions.

## Core Loop
User Input → Constraint Analysis → AI/Optimization Proposal → Human Review → Approval/Modification → Feedback → Adaptive Replanning

## Recommended Stack
- Frontend: React + Vite + TypeScript + Tailwind CSS
- UI: shadcn/ui + Lucide
- Charts: Recharts
- Backend: Python + FastAPI
- Database: PostgreSQL preferred; SQLite acceptable for local development
- AI: provider-agnostic AI service abstraction

## Primary Pages
Dashboard, Tasks, AI Planner, Timetable, Calendar, Analytics, Settings.

## Definition of Done
The complete demo flow must work: create tasks → configure availability → generate proposal → modify/reject/approve → lock an item → change availability → replan remaining tasks → record feedback → display analytics.
