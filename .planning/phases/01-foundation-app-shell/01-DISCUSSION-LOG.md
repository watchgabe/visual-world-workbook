# Phase 1: Foundation & App Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-01
**Phase:** 01-foundation-app-shell
**Areas discussed:** Database Schema, App Shell Appearance, Theme Approach, Sidebar Behavior

---

## Database Schema

| Option | Description | Selected |
|--------|-------------|----------|
| Single JSON column | One row per user per module, JSON blob for all fields | |
| Row per field | One row per user per field (user_id, module, section, field_key, value) | |
| You decide | Claude picks best approach for auto-save + progress tracking | ✓ |

**User's choice:** You decide
**Notes:** Claude has discretion on storage structure

---

| Option | Description | Selected |
|--------|-------------|----------|
| Fresh tables, ignore old | New tables, old tables stay but unused, no migration | ✓ |
| Fresh tables + migrate data | New schema with migration script for existing student data | |
| You decide | Claude picks based on data importance | |

**User's choice:** Fresh tables, ignore old
**Notes:** Students start fresh in new app

---

| Option | Description | Selected |
|--------|-------------|----------|
| Derived from responses | Calculate completion % from filled fields, single source of truth | ✓ |
| Separate progress table | Dedicated table tracking per-section completion | |
| You decide | Claude picks balancing simplicity and performance | |

**User's choice:** Derived from responses
**Notes:** No separate progress table needed

---

## App Shell Appearance

| Option | Description | Selected |
|--------|-------------|----------|
| Pixel-faithful | Recreate existing look exactly — same colors, spacing, fonts | ✓ |
| Same spirit, modernized | Keep color system, let Tailwind/shadcn clean up polish | |
| Fresh design | Use color tokens but redesign freely | |

**User's choice:** Pixel-faithful
**Notes:** Students should see no visual difference

---

| Option | Description | Selected |
|--------|-------------|----------|
| Module list with placeholders | Show all 6 module names with 0% progress indicators | ✓ |
| Static placeholder | Branded sidebar with "Modules coming soon" | |
| You decide | Claude picks for smoothest Phase 5 integration | |

**User's choice:** Module list with placeholders
**Notes:** Sidebar fully wired for Phase 5

---

| Option | Description | Selected |
|--------|-------------|----------|
| Brand + theme + overall progress | FSCreative left, progress center, theme toggle right | ✓ |
| Brand + theme only | Brand mark and theme toggle, progress added in Phase 3 | |
| You decide | Claude picks based on implementability | |

**User's choice:** Brand + theme + overall progress
**Notes:** Progress bar shows 0% as static placeholder until Phase 3

---

## Theme Approach

| Option | Description | Selected |
|--------|-------------|----------|
| CSS custom properties | Replicate old approach with :root and data-theme attribute | |
| Tailwind dark: class | Use Tailwind built-in dark mode with class strategy | |
| You decide | Claude picks best approach for old colors + Tailwind v4 | ✓ |

**User's choice:** You decide
**Notes:** Claude has discretion on CSS implementation strategy

---

| Option | Description | Selected |
|--------|-------------|----------|
| Dark (like old app) | Default dark theme matching current experience | ✓ |
| System preference | Detect OS prefers-color-scheme on first visit | |
| Light | Default light, dark as opt-in | |

**User's choice:** Dark (like old app)
**Notes:** None

---

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, keep the grain | Preserve SVG noise texture overlay (2.5% opacity) | ✓ |
| No, drop it | Clean look without grain | |
| You decide | Claude decides based on visual fidelity goals | |

**User's choice:** Yes, keep the grain
**Notes:** Grain is a design signature of the app

---

## Sidebar Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed on desktop | Always visible at 280px, only collapses on mobile | ✓ |
| Collapsible everywhere | Users can collapse to icon rail on desktop too | |
| You decide | Claude picks based on pixel-faithful goal | |

**User's choice:** Fixed on desktop
**Notes:** Matches old app exactly

---

| Option | Description | Selected |
|--------|-------------|----------|
| Slide from left + overlay | Matches old app pattern | ✓ |
| You decide | Claude picks consistent with old behavior | |
| Full-screen drawer | Full mobile width drawer, more modern but different | |

**User's choice:** Slide from left + overlay
**Notes:** Tap overlay or hamburger to close

---

| Option | Description | Selected |
|--------|-------------|----------|
| 768px (tablet) | Standard tablet breakpoint | ✓ |
| Match old app exactly | Check old CSS for exact breakpoint | |
| You decide | Claude picks reasonable breakpoint | |

**User's choice:** 768px (tablet)
**Notes:** Standard breakpoint

## Claude's Discretion

- Database storage structure (JSON column vs row-per-field vs hybrid)
- CSS theme implementation strategy (CSS vars vs Tailwind dark: class vs hybrid)

## Deferred Ideas

None — discussion stayed within phase scope
