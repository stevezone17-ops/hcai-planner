# AI Scheduling and Optimization

## Objective
Generate feasible, useful schedules while respecting hard constraints and optimizing soft preferences.

## Hard Constraints
Never violate:
- no overlapping tasks
- task duration must fit
- task must occur within user availability
- locked schedule items cannot move
- approved fixed items must be respected
- tasks cannot be scheduled after their hard deadline unless explicitly allowed
- a task cannot be scheduled twice

## Soft Constraints
Optimize where possible:
- urgent/high-priority tasks first
- deadline proximity
- preferred working hours
- preferred task category/time
- balanced daily workload
- adequate breaks
- reduced idle time
- avoidance of excessive consecutive difficult tasks

## Recommended Scheduling Approach

Use a deterministic scheduling/optimization layer as the source of truth. AI should assist with ranking, explanations, preference interpretation, or candidate generation rather than being trusted blindly with feasibility.

A practical pipeline:

1. Validate input.
2. Normalize durations and timestamps.
3. Build available slots.
4. Reserve locked/fixed events.
5. Place urgent tasks.
6. Place remaining tasks using a weighted scoring function.
7. Check hard constraints.
8. Improve the candidate schedule using soft-constraint scoring.
9. Generate explanations.
10. Return a proposed schedule.

## Example Score

A schedule can use weighted components such as:

score =
deadline_priority
+ task_priority
+ preference_match
+ workload_balance
+ break_quality
- idle_time
- fragmentation
- conflict_penalty

Hard constraint violations should invalidate a candidate rather than merely receive a small penalty.

## AI Explanation
For each major placement, provide a concise reason, for example:
"Scheduled in the morning because this is your preferred focus period and the task has a high priority with a near deadline."

## Adaptation
Record:
- AI proposed time
- user-selected time
- modification type
- rejection reason
- feedback rating
- actual completion behavior when available

Use these signals to update a user preference profile.

## Fallback
If an external AI provider is unavailable, scheduling must still work using the deterministic scheduler.
