# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Productivity-focused professionals, knowledge workers, researchers, and students managing variable workloads, rigid external obligations (meetings, classes), and fluctuating cognitive energy throughout the day.

## Product Purpose

The Human-in-the-Loop AI Task Planner generates adaptive, conflict-free daily and weekly timetables. It replaces rigid calendar templates and purely autonomous "black-box" schedulers with an explainable, collaborative scheduling system where algorithmic optimization proposes schedules, but the human user retains ultimate decision authority.

## Positioning

Unlike traditional static to-do lists or rigid algorithmic schedulers that silently displace commitments, HCAI Planner provides:
1. **Mathematical Guarantees**: Hard availability windows and user-locked tasks are strictly immutable.
2. **Transparent Explainability**: Every AI slot placement explicitly states *why* it was chosen (e.g. circadian focus peak, buffer protection, deadline proximity).
3. **Adaptive Human Feedback**: Manual user steering (accept, modify, reject, lock) updates circadian scoring weights without invalidating hard schedule boundaries.

## Operating Context

- **Daily Planning Workflow**: Reviewing the day's priority obligations, checking the Current Focus, and tracking live progress.
- **Dynamic Replanning Ritual**: When unexpected disruptions or urgent tasks arrive, triggering a 1-click replan that preserves locked tasks and redistributes remaining workload.
- **Execution & Auditing**: Reviewing acceptance rates, modification clustering, and schedule efficiency in the Analytics & Governance view.

## Capabilities and Constraints

- **Deterministic Constraint Satisfaction**: Core scheduling engine operates with zero hallucinated time slots, zero overlapping commitments, and strict respect for hard constraints.
- **Explainable Rationale**: Every proposal displays a human-readable justification.
- **Human Decision States**:
  - `AI Suggested` (algorithmic proposal)
  - `Accepted` (human-approved)
  - `Modified by You` (human-steered adjustments)
  - `Rejected` (human-dismissed)
  - `Locked` (human-enforced immutable hard constraint)
- **Zero Silent Overrides**: The system never modifies a locked task or silently alters a user's timetable without explicit review.

## Brand Commitments

- **Visual Direction**: Calm, modern, professional productivity workspace benchmarked against Linear, Notion, and Apple productivity software.
- **Palette**: Unified off-white canvas (`#F5F6F8`), quiet sidebar (`#FAFBFC`), crisp surfaces (`#FFFFFF`), subtle borders (`#E5E7EB`), and restrained indigo accent (`#5B5CE2`).
- **Typography**: Clean humanist sans (`Inter`) paired with tabular monospace numerals for time intervals.

## Evidence on Hand

- Fully operational FastAPI backend with SQLite persistence (`d:\hcai\backend`).
- 15/15 automated Vitest unit, component, and HITL workflow tests passing (`d:\hcai\frontend\src\test`).
- Formalized Design System tokens in `DESIGN_SYSTEM.md`.

## Product Principles

1. **Human Agency Outranks Algorithmic Elegance**: The AI suggests, but the user decides. The machine never overrides a human lock.
2. **Explainability Precedes Acceptance**: Users should never wonder why a task was scheduled at a specific hour.
3. **Calm Density Over Clutter**: Maximize actionable clarity and scanability without visual noise or gratuitous decoration.
4. **Resilient Replanning**: Disruptions are expected; replanning must be effortless, preserving established progress.

## Accessibility & Inclusion

Conforms to WCAG 2.1/2.2 AA standards: semantic landmarks, full keyboard operability, visible focus indicators, high-contrast text ratios (≥4.5:1), and respects reduced-motion system preferences.
