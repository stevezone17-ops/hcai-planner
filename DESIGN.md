---
name: HCAI Planner
description: Adaptive timetable generation system balancing algorithmic optimization with human autonomy, flexible constraints, and circadian rhythms.
colors:
  canvas-bg: "#F5F6F8"
  sidebar-bg: "#FAFBFC"
  header-bg: "#FFFFFF"
  card-bg: "#FFFFFF"
  border-subtle: "#E5E7EB"
  text-primary: "#111827"
  text-secondary: "#667085"
  text-muted: "#98A2B3"
  primary: "#5B5CE2"
  primary-hover: "#4E4FD6"
  primary-soft: "#EEF2FF"
  badge-ai-bg: "#EEF2FF"
  badge-ai-text: "#4338CA"
  badge-ai-border: "#C7D2FE"
  badge-modified-bg: "#FEF3C7"
  badge-modified-text: "#B45309"
  badge-modified-border: "#FDE68A"
  badge-accepted-bg: "#ECFDF5"
  badge-accepted-text: "#047857"
  badge-accepted-border: "#A7F3D0"
  badge-rejected-bg: "#FEF2F2"
  badge-rejected-text: "#B91C1C"
  badge-rejected-border: "#FECACA"
  badge-locked-bg: "#EFF6FF"
  badge-locked-text: "#1D4ED8"
  badge-locked-border: "#BFDBFE"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  code:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
---

## Overview

HCAI Planner is an intelligent, human-centered productivity workspace. The design embodies calm authority, exceptional scanability, and transparent AI reasoning, benchmarked against Linear, Notion, and Apple productivity tools.

## Colors

- **Canvas Background (`#F5F6F8`)**: Warm, neutral baseline across all screens.
- **Sidebar Surface (`#FAFBFC`)**: Quiet, low-contrast navigation container.
- **Header & Card Surfaces (`#FFFFFF`)**: Crisp, foreground containers with subtle 1px borders.
- **Primary Accent (`#5B5CE2`)**: Restrained indigo used for primary actions, active indicators, and brand identity.
- **Semantic HITL Badges**:
  - `AI Suggested`: Soft indigo (`#EEF2FF` / `#4338CA`)
  - `Modified by You`: Soft amber (`#FEF3C7` / `#B45309`)
  - `Accepted`: Soft emerald (`#ECFDF5` / `#047857`)
  - `Rejected`: Soft rose (`#FEF2F2` / `#B91C1C`)
  - `Locked`: Soft blue (`#EFF6FF` / `#1D4ED8`)

## Typography

- **Primary Sans**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
- **Monospace**: `JetBrains Mono`, `monospace` for all timestamps, durations, and tabular figures (`font-variant-numeric: tabular-nums`).
- Strict hierarchy: Page Titles (28–30px), Section Titles (18–20px), Card Headers (15–16px), Body Copy (14–15px), Small Metadata (12–13px).

## Layout

- **Unified Viewport**: 240px persistent quiet sidebar on desktop, 56px white header with search trigger (`⌘K`), and high-density responsive main content.
- **Three-Question Dashboard Hierarchy**:
  1. *What am I doing now?* → Current Focus Hero card.
  2. *What should I do next?* → Vertical Productivity Timeline.
  3. *Is my schedule healthy?* → Compact KPI strip + Learned Insights.
- **High-Density Tables**: 1px dividers, inline metadata tags, and quick-add input bar.

## Elevation & Depth

- Elevation is declared once: subtle 1px border (`#E5E7EB`) or a soft, realistic drop shadow (`0 1px 3px rgba(0,0,0,0.04)`).
- Never use zero-offset colored halos or heavy block shadows.

## Shapes

- Controls (buttons, inputs): `8px` (`rounded-lg`)
- Cards and Modals: `12px` (`rounded-xl`)
- Badges and status indicators: `4px` (`rounded`)

## Components

- **Button**: Discrete heights (32px / 36px), primary `#5B5CE2`, secondary `#FFFFFF` with `#E5E7EB` border.
- **Current Focus Hero**: Elevated card showing live obligation, countdown, duration, and explainable rationale.
- **Vertical Timeline**: Continuous thread with status-colored node circles.
- **AI Proposal Card**: Structured card with "Why this time?" explanation and discrete `[Accept]`, `[Modify]`, `[Reject]`, `[Lock]` actions.

## Do's and Don'ts

- **Do** use solid, high-contrast typography (≥4.5:1).
- **Do** theme browser surfaces (custom scrollbars, text selection, focus rings).
- **Do** provide transparent explainability for every AI placement.
- **Don't** use decorative gradient text or gratuitous neon glows.
- **Don't** stack nested cards or create floating white card grids.
- **Don't** use thick side-tab colored accent borders.
