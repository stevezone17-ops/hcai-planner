# Database Specification

## User
- id
- name
- email
- created_at
- updated_at

## Task
- id
- user_id
- title
- description
- category
- priority
- duration_minutes
- deadline
- preferred_start
- preferred_end
- difficulty
- status
- recurrence
- notes
- created_at
- updated_at

## Availability
- id
- user_id
- day_of_week
- start_time
- end_time

## ScheduleItem
- id
- user_id
- task_id
- start_time
- end_time
- source
- status
- locked
- approved
- ai_reason
- confidence
- created_at
- updated_at

## Feedback
- id
- user_id
- schedule_item_id
- action
- reason
- rating
- comment
- created_at

## UserPreference
- id
- user_id
- key
- value
- confidence
- source
- updated_at

## Design Rules
- use foreign keys
- index user_id and deadline-related fields
- use UTC/storage-safe timestamps where appropriate
- validate enums at the API boundary
- do not store API keys in the database
- preserve an audit trail for important human scheduling decisions
