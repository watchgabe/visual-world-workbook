# Phase 3: Component Library & Data Hooks - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

A complete set of reusable workshop form components (WorkshopTextarea, WorkshopInput, OptionSelector, SectionNav, ProgressRing, SectionWrapper) and a single unified auto-save hook with debounce + AbortController that all module pages will use. Plus ProgressContext and ThemeContext providers. No module content — pure UI primitives and data hooks.

</domain>

<decisions>
## Implementation Decisions

### Auto-Save Behavior
- **D-01:** Save status indicator is error-only — no "Saving..." or "Saved" indicators. Silent when working. Per-field error icon appears ONLY if save fails AND the field has lost focus (blur). While the field is focused, no error shown even if background save failed.
- **D-02:** 5-second debounce OR save on blur (field loses focus), whichever comes first. These are thoughtful brand strategy answers, not rapid chat — 5s is appropriate.
- **D-03:** AbortController cancels any in-flight request before issuing a new one (per DATA-04 requirement).
- **D-04:** On save failure: error indicator persists next to the field with a small retry button. Student knows their work isn't saved and can manually trigger retry.

### Component Visual Style
- **D-05:** Pixel-faithful recreation of old app's form components — same textarea styling, input borders, option button look. Matches Phase 1 decision (D-04) for pixel-faithful recreation.
- **D-06:** OptionSelector uses button-group pattern matching old app — clickable styled buttons in a row/wrap layout. Selected option highlighted with orange. Matches old app's `.opt` button pattern.

### Progress Tracking Logic
- **D-07:** Section is complete when ALL required fields have non-empty values. Each section definition specifies which fields are required vs optional.
- **D-08:** ProgressRing is an SVG circle that fills as sections complete, with percentage number in center. Matches old app's progress display.
- **D-09:** Progress updates ONLY after successful save to Supabase — not real-time as fields fill. Prevents showing progress for unsaved work.

### Section Navigation
- **D-10:** Horizontal tab bar at the top of module content area, matching old app's section navigation pattern. Each tab is a section name.
- **D-11:** Section tabs show small completion indicator (checkmark or dot) for at-a-glance progress within a module.

### Claude's Discretion
- react-hook-form integration approach (how to wire `watch()` with the 5s debounce + blur save pattern)
- ProgressContext and ThemeContext internal shapes and provider placement
- SectionWrapper API design (how it receives field definitions and tracks completion)
- Component file organization (flat vs grouped in components/workshop/)
- shadcn/ui base component usage vs fully custom

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Old App Reference (form components, styling, save logic)
- `old/modules/brand-foundation.html` — Canonical reference for form fields: textareas, text inputs, option selectors (`.opt` buttons), section tabs, save/load pattern
- `old/modules/brand-foundation.html` lines 447-471 — CSS for textarea/input styling (borders, focus states, placeholders)
- `old/modules/brand-foundation.html` lines 1765-1900 — Example form field HTML structure (questions + textareas + option groups)
- `old/index.html` lines 391-427 — Sidebar with module progress display

### Existing Codebase
- `src/types/database.ts` — `BlpResponse` type: `responses: Record<string, unknown>` per module per user
- `src/context/AuthContext.tsx` — Established Context provider pattern (same pattern for ProgressContext, ThemeContext)
- `src/lib/supabase/client.ts` — Browser Supabase client for auto-save writes
- `src/components/layout/ProgressBar.tsx` — Existing overall progress bar (sidebar)
- `src/components/layout/Sidebar.tsx` — Where per-module ProgressRing will display

### Project Specs
- `.planning/REQUIREMENTS.md` — COMP-01 through COMP-06, DATA-03 through DATA-06
- `.planning/ROADMAP.md` §Phase 3 — Success criteria
- `CLAUDE.md` §Technology Stack — react-hook-form 7.72.0, Zod 4.3.6, @hookform/resolvers

### Prior Phase Context
- `.planning/phases/01-foundation-app-shell/01-CONTEXT.md` — D-01 (storage approach), D-03 (progress derived from responses)
- `.planning/phases/02-authentication/02-CONTEXT.md` — AuthContext pattern established

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/context/AuthContext.tsx` — Pattern for React Context providers (ProgressContext and ThemeContext will follow same structure)
- `src/components/layout/ProgressBar.tsx` — Existing progress bar component (may need refactoring to use ProgressContext)
- `src/components/layout/ThemeToggle.tsx` — Existing theme toggle (ThemeContext may wrap this)
- `src/lib/supabase/client.ts` — Browser client for auto-save upsert calls
- `src/types/database.ts` — `BlpResponse` type with `responses: Record<string, unknown>` — auto-save hook will upsert to this

### Established Patterns
- **Context pattern:** `createContext` + `Provider` + `useXxx` hook (from AuthContext)
- **Cookie-based theme:** Already working via `blp-theme` cookie — ThemeContext wraps this
- **CSS variables:** Color tokens in `globals.css` — all components use `var(--xxx)` for theming
- **Module structure:** `src/app/(app)/modules/[slug]/page.tsx` — where form components will be rendered

### Integration Points
- `src/components/workshop/` — New directory for all workshop components
- `src/hooks/useAutoSave.ts` — New hook consumed by all workshop components
- `src/context/ProgressContext.tsx` — New context providing per-module completion data
- `src/context/ThemeContext.tsx` — New context wrapping existing theme cookie logic
- `src/app/(app)/layout.tsx` — Add ProgressContext and ThemeContext providers (alongside existing AuthProvider)

</code_context>

<specifics>
## Specific Ideas

- Error-only save indicator means the common case (everything working) is completely invisible to the student — zero UI noise while they write
- Error only surfaces on blur — so if a save fails mid-typing, the student won't see it until they move to the next field. This prioritizes uninterrupted writing flow
- 5-second debounce reflects the thoughtful nature of brand strategy answers — students aren't speed-typing
- Button-group OptionSelector with orange highlight is a signature visual of the old app — important to match exactly
- ProgressRing in sidebar with percentage matches old app's at-a-glance module progress

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-component-library-data-hooks*
*Context gathered: 2026-04-01*
