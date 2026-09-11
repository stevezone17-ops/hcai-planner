# HCAI Planner — Design System Specification

## 1. System Philosophy

HCAI Planner is an **intelligent, human-centered productivity workspace**.
Its visual design prioritizes:
- **Clarity and cohesion**: The entire interface functions as one unified environment.
- **Visual hierarchy through typography and spacing**: Containers and borders are used sparingly; content density is purposeful.
- **Explainable intelligence**: The AI suggests, the human decides, and the system adapts. Color and badges denote state and provenance, not decorative flash.

---

## 2. Color Palette & Surface Hierarchy

| Role | Hex Code | HSL / CSS Var | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#F5F6F8` | `--app-bg` | Main application background (soft, warm neutral) |
| **Sidebar Surface** | `#FAFBFC` | `--sidebar-bg` | Quiet, low-contrast navigation surface |
| **Header Surface** | `#FFFFFF` | `--header-bg` | Top context bar with clean 1px border |
| **Card Surface** | `#FFFFFF` | `--surface-card` | Contained focal objects (NOW card, proposals, modal dialogs) |
| **Border Subtle** | `#E5E7EB` | `--border-subtle` | 1px clean separators |
| **Primary Text** | `#111827` | `--text-primary` | Headings, titles, numeric metrics |
| **Secondary Text** | `#667085` | `--text-secondary`| Body text, subtitles, descriptions |
| **Muted Text** | `#98A2B3` | `--text-muted` | Timestamps, metadata, labels |
| **Primary Accent** | `#5B5CE2` | `--accent-primary`| Primary buttons, active indicators, selected states |
| **Primary Hover** | `#4F46E5` | `--accent-hover` | Hover state for interactive primary actions |
| **Primary Soft** | `#EEF2FF` | `--accent-soft` | Active navigation pill, AI suggested badge background |

---

## 3. Human-in-the-Loop Semantic Badges

Color communicates semantic provenance and user authority:

| Status | Background | Text Color | Border | Icon / Label |
| :--- | :--- | :--- | :--- | :--- |
| **AI Suggested** | `#EEF2FF` | `#4338CA` | `#C7D2FE` | `Sparkles` / AI Suggested |
| **Modified by You** | `#FEF3C7` | `#B45309` | `#FDE68A` | `Edit3` / Modified by You |
| **Accepted** | `#ECFDF5` | `#047857` | `#A7F3D0` | `CheckCircle2` / Accepted |
| **Rejected** | `#FEF2F2` | `#B91C1C` | `#FECACA` | `XCircle` / Rejected |
| **Locked** | `#EFF6FF` | `#1D4ED8` | `#BFDBFE` | `Lock` / Locked (Hard Constraint) |

---

## 4. Typography Hierarchy

Font Family: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
Monospace: `JetBrains Mono`, `monospace`

| Level | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title** | `28px–30px` | `700` (Bold) | `1.2` | `-0.02em` | Page header |
| **Section Title** | `18px–20px` | `600` (Semibold) | `1.3` | `-0.015em` | Major sections (NOW, Timeline) |
| **Card / Group Title** | `15px–16px` | `600` (Semibold) | `1.4` | `-0.01em` | Task titles, modal headers |
| **Body** | `14px–15px` | `400` (Regular) | `1.5` | `normal` | General descriptions, helper copy |
| **Label / Metadata** | `12px–13px` | `500` (Medium) | `1.4` | `normal` | Badges, timestamps, small tags |
| **Compact Monospace** | `11px–12px` | `500` (Medium) | `1.4` | `normal` | Hours (`09:00`), durations (`45m`) |

---

## 5. Shape, Elevation & Radii

- **Controls (Buttons, Inputs, Selects)**: `8px` (`rounded-lg`)
- **Cards & Modal Containers**: `10px–12px` (`rounded-xl`)
- **Semantic Badges & Tags**: `4px` (`rounded`)
- **Shadows**:
  - `subtle`: `0 1px 2px 0 rgba(0, 0, 0, 0.03)`
  - `card`: `0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)`
  - `elevated`: `0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.04)`

---

## 6. Layout Composition Principles

1. **Unified Background**: `#F5F6F8` spans the full viewport. No black content background or gray disconnects.
2. **Quiet Sidebar**: 240px width, `#FAFBFC` surface, `#E5E7EB` right border. Grouped into `WORKSPACE` and `PREFERENCES`.
3. **Clean Top Header**: 56px height, `#FFFFFF` surface, `#E5E7EB` bottom border. Consistent button heights (32px).
4. **Current Focus**: The central object of the dashboard, showing the immediate task, time window, locked status, and explainability reasoning.
5. **Vertical Timeline**: Continuous vertical guide with node circles (`●` task, `○` break) for quick chronological scanning.
6. **Restrained Data Visualization**: Primary metric in Indigo, positive in Emerald, warning in Amber, negative in Red. Accessible custom tooltips.
