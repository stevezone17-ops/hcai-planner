# Human-in-the-Loop Design

## Principle
AI proposes; the human decides.

The application must never silently replace user decisions with AI decisions.

## Schedule States

Recommended states:
- PROPOSED
- ACCEPTED
- MODIFIED
- REJECTED
- LOCKED
- COMPLETED
- CANCELLED

## User Actions

### Accept
The proposed schedule item becomes accepted.

### Modify
The user changes time, duration, or another allowed attribute. Store both the original AI proposal and the human modification.

### Reject
Remove the suggestion and record an optional reason.

### Lock
A locked item becomes a hard constraint for future replanning.

### Replan
Recalculate only what is necessary while preserving locked items and honoring accepted/fixed decisions.

## Feedback Loop

AI proposal
↓
Human decision
↓
Decision recorded
↓
Preference signal extracted
↓
Future scheduling adjusted

## Example
AI proposes:
09:00–11:00 DSA

User moves it to:
18:00–20:00

Record:
- proposed_start = 09:00
- selected_start = 18:00
- action = MODIFIED

Over repeated interactions, the preference service may infer that the user prefers DSA in the evening.

## Transparency
Always distinguish:
- AI-generated content
- user-created content
- user-modified content
- locked decisions

Use visible labels such as "AI Suggested", "Modified by You", and "Locked".
