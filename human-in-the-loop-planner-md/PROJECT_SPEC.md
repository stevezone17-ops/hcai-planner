# Project Specification

## 1. Problem
Traditional timetable applications often generate static schedules and provide limited support when user availability, priorities, or deadlines change.

## 2. Proposed Solution
Build an adaptive AI task planner in which AI proposes schedules while the human remains the final decision-maker. Human actions become feedback that can influence later scheduling.

## 3. Functional Requirements

### Task Management
Tasks must support:
- title
- description
- category
- priority: Critical, High, Medium, Low
- estimated duration
- deadline
- preferred time window
- difficulty
- status
- recurrence
- notes

### Availability
Users can define multiple available time ranges for each day.

### Scheduling
The planner must:
1. collect pending tasks
2. collect availability and preferences
3. enforce hard constraints
4. optimize soft constraints
5. produce a proposed timetable
6. explain major scheduling decisions
7. wait for human review

### Human Control
Users can:
- accept
- reject
- modify
- drag and drop
- lock
- reschedule
- replan

### Adaptation
The system should record user modifications and feedback and derive useful scheduling preferences over time.

## 4. Non-Functional Requirements
- responsive
- accessible
- modular
- maintainable
- clear error states
- no hard-coded production secrets
- API/provider abstraction
- polished SaaS-quality interface

## 5. Demo Scenario
Create a critical two-hour presentation task due tomorrow. Generate a schedule, modify a proposed item, lock the presentation, change availability, and replan while preserving the locked item.
