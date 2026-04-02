# Phase 3: Component Library & Data Hooks - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 03-component-library-data-hooks
**Areas discussed:** Auto-save behavior, Component visual style, Progress tracking logic, Section navigation

---

## Auto-Save Behavior

### Q1: Save status indicator design

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle inline text | Small 'Saving...' / 'Saved' text near field | |
| Global status bar | Persistent bar showing overall save status | |
| Per-field icon | Small icon next to each field | |
| You decide | Claude picks | |

**User's choice:** (Other) Per-field icon, but shown ONLY on error. If no error, completely transparent/invisible.
**Notes:** Error indicator only appears after field loses focus (blur). While focused, no error shown even if background save failed.

### Q2: Debounce timing

| Option | Description | Selected |
|--------|-------------|----------|
| 1 second | Standard auto-save timing | |
| 2 seconds | More conservative | |
| You decide | Claude picks optimal timing | |

**User's choice:** (Other) 5 seconds OR on blur (field loses focus), whichever comes first. These are complex brand strategy questions — people think before typing.
**Notes:** None

### Q3: Error recovery behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Persist with retry button | Error stays visible with retry button | ✓ |
| Auto-retry silently | Background retry with exponential backoff | |
| You decide | Claude picks | |

**User's choice:** Persist with retry button
**Notes:** Error indicator only shown after blur — additional user clarification

---

## Component Visual Style

### Q1: Match old app or modernize

| Option | Description | Selected |
|--------|-------------|----------|
| Pixel-faithful | Same textarea styling, input borders, option buttons | ✓ |
| Modernize slightly | Keep colors but use shadcn defaults | |
| You decide | Claude picks | |

**User's choice:** Pixel-faithful
**Notes:** Matches Phase 1 decision D-04

### Q2: OptionSelector pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Button group (match old app) | Clickable styled buttons, orange highlight | ✓ |
| Radio/checkbox cards | Card-style, more accessible | |
| You decide | Claude picks | |

**User's choice:** Button group (match old app)
**Notes:** None

---

## Progress Tracking Logic

### Q1: Section completion criteria

| Option | Description | Selected |
|--------|-------------|----------|
| All required fields filled | Section defines required fields, complete when all non-empty | ✓ |
| Any field filled | Complete when student has engaged at all | |
| You decide | Claude picks | |

**User's choice:** All required fields filled
**Notes:** None

### Q2: ProgressRing display

| Option | Description | Selected |
|--------|-------------|----------|
| Percentage ring with number | SVG circle + percentage in center | ✓ |
| Simple fraction | Text like '3/7 sections' | |
| You decide | Claude picks | |

**User's choice:** Percentage ring with number
**Notes:** Matches old app

### Q3: Progress update timing

| Option | Description | Selected |
|--------|-------------|----------|
| After successful save | Progress only updates after Supabase persistence | ✓ |
| Real-time as fields fill | Updates immediately as user types | |

**User's choice:** After successful save
**Notes:** Prevents showing progress for unsaved work

---

## Section Navigation

### Q1: Navigation pattern

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal tab bar (match old app) | Tabs at top of content area | ✓ |
| Vertical sub-nav in sidebar | Sections listed under module in sidebar | |
| Previous/Next buttons only | Linear sequential flow | |
| You decide | Claude picks | |

**User's choice:** Horizontal tab bar (match old app)
**Notes:** None

### Q2: Tab completion status

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, small indicator | Checkmark or dot on completed tabs | ✓ |
| No, just tab names | Clean tabs, progress only in sidebar | |
| You decide | Claude picks | |

**User's choice:** Yes, small indicator
**Notes:** None

---

## Claude's Discretion

- react-hook-form + watch() integration with 5s debounce + blur save
- ProgressContext and ThemeContext internal shapes
- SectionWrapper API design
- Component file organization
- shadcn/ui base usage vs fully custom

## Deferred Ideas

None — discussion stayed within phase scope
