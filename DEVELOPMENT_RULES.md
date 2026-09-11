# Development Rules

## General
Build the application completely rather than creating a static mockup.

Do not leave core features as TODOs.

Do not fabricate functionality in the UI that has no backend implementation.

## Code Quality
- TypeScript on frontend
- Python type hints on backend
- reusable components
- clear naming
- modular services
- centralized API client
- environment variables for configuration
- validation at boundaries
- meaningful error handling

## Architecture
Keep:
- UI
- API
- business logic
- scheduling
- persistence
- AI integration

separated.

## AI
Never hard-code a single AI provider into scheduling logic.

If no AI API key is available, the application must remain functional through deterministic scheduling and simulated/explainable AI assistance.

## Security
- never commit secrets
- use environment variables
- validate input
- sanitize user-controlled content
- configure CORS intentionally
- do not expose internal exceptions to users

## UX
Every async operation needs a loading state.
Every failed operation needs an understandable error.
Every empty collection needs an empty state.

## Testing
Test:
- task CRUD
- availability CRUD
- conflict detection
- scheduling
- hard constraints
- soft scoring
- locked items
- approval/rejection
- modification tracking
- replanning
- feedback
- analytics

## Before Completion
Run the application and verify the complete demonstration flow manually.

Fix:
- TypeScript errors
- Python errors
- API errors
- console errors
- broken routes
- layout problems
- responsive issues
