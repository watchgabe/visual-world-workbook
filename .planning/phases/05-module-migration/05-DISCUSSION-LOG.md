# Phase 5: Module Migration - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 05-module-migration
**Areas discussed:** Module routing structure, Content migration approach, Claude AI integration, Playbook compiled view

---

## Module Routing Structure

### Q1: How should sections within a module be routed?

| Option | Description | Selected |
|--------|-------------|----------|
| Nested routes per section (Recommended) | /modules/brand-foundation/core-values — each section its own URL. SectionNav tabs switch routes. Clean deep-linking. | ✓ |
| Single page with tab switching | One URL per module. SectionNav shows/hides client-side. No deep-linking. | |
| Single page with hash anchors | One page with scroll-to anchors. Deep-linkable but all sections load at once. | |

**User's choice:** Nested routes per section (Recommended)
**Notes:** Clean deep-linking, browser back/forward works naturally.

### Q2: Should the sidebar show section-level navigation?

| Option | Description | Selected |
|--------|-------------|----------|
| Module-level only (Recommended) | Sidebar shows 6 modules with progress rings. Section nav stays in SectionNav tab bar. Matches old app. | ✓ |
| Expandable sections in sidebar | Clicking module expands to show sections. More navigation but more complexity. | |
| You decide | Claude picks based on old app behavior. | |

**User's choice:** Module-level only (Recommended)

---

## Content Migration Approach

### Q1: Where should module content live?

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded in JSX components (Recommended) | Content directly in section page components. Simple, no extra data layer. 1:1 migration. | ✓ |
| Content data files (JSON/TS) | Separate data files defining questions/fields. Components render from data. | |
| MDX files | Content in markdown + JSX. Rich content with embedded components. | |

**User's choice:** Hardcoded in JSX components (Recommended)

### Q2: How should field definitions be structured?

| Option | Description | Selected |
|--------|-------------|----------|
| Per-section config objects | Config defining field IDs, types, required flags. Clear contract. | |
| Inline in components | Field IDs and required flags as direct props. Simpler but scattered. | |
| You decide | Claude picks best approach for existing patterns. | ✓ |

**User's choice:** You decide

---

## Claude AI Integration

### Q1: How should AI content generation UX work?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline with loading state (Recommended) | "Generate" button, spinner, response populates field. Matches old app. | ✓ |
| Streaming response | Same button but response streams word-by-word. More engaging but adds complexity. | |
| You decide | Claude picks to match old app UX. | |

**User's choice:** Inline with loading state (Recommended)

### Q2: Should AI content auto-save or require review?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-save after generation | Generated text triggers normal auto-save flow. Student can edit before save. | ✓ |
| Review before save | Text appears as "draft" until explicitly accepted. | |
| You decide | Claude picks based on old app behavior. | |

**User's choice:** Auto-save after generation

---

## Playbook Compiled View

### Q1: How should Playbook pull answers?

| Option | Description | Selected |
|--------|-------------|----------|
| Real-time query on page load (Recommended) | Fetches all responses from Supabase. One query per module. Always latest data. | ✓ |
| ProgressContext cached data | Reads from context. No extra queries but may be stale. | |
| You decide | Claude picks based on data freshness needs. | |

**User's choice:** Real-time query on page load (Recommended)

### Q2: How should print-friendly view work?

| Option | Description | Selected |
|--------|-------------|----------|
| CSS @media print styles | Same page with print CSS. Browser Ctrl+P produces clean output. | |
| Dedicated print route | Separate /modules/playbook/print with stripped layout. | |
| You decide | Claude picks simplest approach for clean output. | ✓ |

**User's choice:** You decide

---

## Claude's Discretion

- Field definition structure (per-section config vs inline props)
- Print-friendly view approach
- Route file organization
- SectionWrapper + nested routes integration
- ProgressContext refresh on section completion

## Deferred Ideas

None — discussion stayed within phase scope
