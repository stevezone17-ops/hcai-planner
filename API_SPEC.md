# API Specification

Base path: `/api`

## Tasks
GET `/tasks`
POST `/tasks`
GET `/tasks/{id}`
PUT `/tasks/{id}`
DELETE `/tasks/{id}`

## Availability
GET `/availability`
POST `/availability`
PUT `/availability/{id}`
DELETE `/availability/{id}`

## Planner
POST `/planner/generate`
POST `/planner/replan`

### Generate Request
Should accept:
- task IDs or task collection
- availability
- scheduling preferences
- optional date range

### Generate Response
Return:
- proposed schedule items
- conflicts
- unscheduled tasks
- explanations
- summary metrics

## Schedule Actions
POST `/schedule/{id}/approve`
POST `/schedule/{id}/reject`
POST `/schedule/{id}/modify`
POST `/schedule/{id}/lock`
POST `/schedule/{id}/unlock`
POST `/schedule/{id}/complete`

## Feedback
POST `/feedback`

## Analytics
GET `/analytics`

Return:
- completion rate
- planned hours
- completed hours
- overdue tasks
- acceptance rate
- modification rate
- rejection rate
- schedule efficiency
- common user changes

## Preferences
GET `/preferences`
PUT `/preferences`

## API Rules
- validate all request bodies
- return useful HTTP status codes
- use consistent error response structure
- never expose secrets
- document schemas
- support CORS for local frontend development
