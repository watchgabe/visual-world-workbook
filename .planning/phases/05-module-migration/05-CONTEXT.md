# Phase 5: Module Migration - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

All six course module pages migrated 1:1 from old HTML files to Next.js pages with URL-addressable sections, working auto-save on every form field, progress tracking per section and per module, Claude AI content generation (Content module), and a compiled read-only Playbook view with print support. This phase wires together everything built in Phases 1-4.

</domain>

<decisions>
## Implementation Decisions

### Module Routing Structure
- **D-01:** Nested routes per section — each section gets its own URL (e.g., `/modules/brand-foundation/core-values`). SectionNav tabs switch between section routes. Browser back/forward works naturally. Deep-linking to any section is supported.
- **D-02:** Sidebar shows module-level navigation only — 6 modules with progress rings. Section navigation lives in the SectionNav tab bar at the top of the content area, matching old app pattern.

### Content Migration Approach
- **D-03:** Content (questions, descriptions, instructions) hardcoded directly in JSX section page components. No separate data layer, no MDX. Each section is a standalone page file with its questions and form fields inline. Matches the 1:1 migration goal — content is ported from old HTML to JSX.
- **D-04:** Claude's discretion on field definition structure — whether to use per-section config objects (field IDs, types, required flags) or inline props on each workshop component. Pick what works best with existing useAutoSave and SectionWrapper patterns.

### Claude AI Integration (Content Module)
- **D-05:** Inline generation with loading state — "Generate" button next to the target field. Click shows spinner + "Generating..." text, response populates the field when complete. Matches old app behavior. No streaming.
- **D-06:** AI-generated content auto-saves after generation via the normal auto-save flow (5s debounce or blur). Student can edit before save triggers. No separate "accept" step.

### Playbook Compiled View
- **D-07:** Real-time query on page load — Playbook page fetches all user responses from Supabase when loaded. One query per module from blp_responses table. Always shows latest data.
- **D-08:** Claude's discretion on print approach — pick between CSS @media print styles on the same page or a dedicated print route, whichever produces the cleanest output with least complexity.

### Claude's Discretion
- D-04: Field definition structure (per-section config vs inline props)
- D-08: Print-friendly view approach (CSS @media print vs dedicated route)
- Route file organization within `src/app/(app)/modules/`
- How SectionWrapper integrates with nested section routes
- How ProgressContext refreshes when sections are completed
- Waterfall analyzer integration in the Content module (if applicable to a section)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Old Module HTML Files (content source of truth — migrate 1:1)
- `old/modules/welcome.html` — Module 00: Welcome page (151 lines, static overview)
- `old/modules/brand-foundation.html` — Module 01: Brand Foundation (4,524 lines, 7 sections, ~45 form fields)
- `old/modules/visual-world.html` — Module 02: Visual World (3,572 lines, 6 sections including mood board, color picker, font uploader)
- `old/modules/content.html` — Module 03: Create Content (1,993 lines, 5 sections including Claude AI content generation)
- `old/modules/launch.html` — Module 04: Launch (951 lines, 6 sections for bio, funnel, lead magnet, goals)
- `old/modules/playbook.html` — Module 05: The Playbook (533 lines, read-only compiled view)

### Existing Workshop Components (reuse in every section page)
- `src/components/workshop/WorkshopTextarea.tsx` — Auto-save textarea component
- `src/components/workshop/WorkshopInput.tsx` — Auto-save text input component
- `src/components/workshop/OptionSelector.tsx` — Button-group selection with orange highlight
- `src/components/workshop/SectionNav.tsx` — Horizontal tab bar for section navigation
- `src/components/workshop/ProgressRing.tsx` — SVG progress circle with percentage
- `src/components/workshop/SectionWrapper.tsx` — Section container with completion tracking

### Existing Hooks & Context
- `src/hooks/useAutoSave.ts` — Unified auto-save hook (5s debounce, AbortController)
- `src/context/ProgressContext.tsx` — Per-module completion data
- `src/context/AuthContext.tsx` — Current user for Supabase queries
- `src/context/ThemeContext.tsx` — Theme state

### API Routes (for AI generation and Circle.so badges)
- `src/app/api/claude/route.ts` — Proxies to claude-proxy edge function (Phase 4)
- `src/app/api/circle/route.ts` — Proxies to circle-proxy edge function for module_complete (Phase 4)

### Existing Route Structure
- `src/app/(app)/modules/[slug]/page.tsx` — Placeholder module page (replace with real content)
- `src/app/(app)/modules/welcome/page.tsx` — Welcome page (may need content migration)
- `src/lib/modules.ts` — Module definitions (slug, number, title)

### Project Specs
- `.planning/REQUIREMENTS.md` — MOD-01 through MOD-07, NAV-03, NAV-04
- `.planning/ROADMAP.md` §Phase 5 — Success criteria
- `CLAUDE.md` §Technology Stack — react-hook-form, Zod, shadcn/ui

### Prior Phase Context
- `.planning/phases/01-foundation-app-shell/01-CONTEXT.md` — D-04 (pixel-faithful), D-05 (sidebar modules with progress), D-10 (sidebar 280px fixed)
- `.planning/phases/03-component-library-data-hooks/03-CONTEXT.md` — D-01 through D-11 (auto-save, component styling, progress tracking, section nav)
- `.planning/phases/04-api-security/04-CONTEXT.md` — API route decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/workshop/` — All 6 workshop components ready to use in section pages
- `src/hooks/useAutoSave.ts` — Hook for auto-saving form field values to Supabase
- `src/context/ProgressContext.tsx` — Module completion tracking (needs wiring to real section data)
- `src/lib/modules.ts` — Module slug/title definitions
- `src/app/(app)/modules/[slug]/page.tsx` — Dynamic route scaffold (replace placeholder content)
- `src/components/layout/Sidebar.tsx` — Sidebar with module list (needs progress ring integration)

### Established Patterns
- **Cookie-based auth:** Server components read session, client components use AuthContext
- **CSS variables:** All theming via `var(--xxx)` tokens in globals.css
- **Auto-save pattern:** `useAutoSave(moduleSlug, sectionId, fieldId)` → debounce + AbortController → upsert to blp_responses
- **Context providers:** AuthContext, ProgressContext, ThemeContext all wrap `(app)` layout

### Integration Points
- `src/app/(app)/modules/[slug]/[section]/page.tsx` — New nested route for each section
- `src/app/(app)/modules/[slug]/layout.tsx` — Module layout with SectionNav
- `src/components/layout/Sidebar.tsx` — Wire ProgressRing per module from ProgressContext
- `/api/claude` — AI generation calls from Content module sections
- `/api/circle` — Module completion badge calls when a module reaches 100%

</code_context>

<specifics>
## Specific Ideas

- 1:1 content fidelity is the top priority — every question, description, and instruction from the old HTML must appear in the new pages
- Brand Foundation is the largest module (4,524 lines, 7 sections, ~45 fields) — likely needs to be its own plan
- Visual World includes mood board, color picker, and font uploader — these are more complex interactive components beyond simple text fields
- Content module has multiple Claude AI generation points across its sections
- Playbook is read-only — pulls all answers from blp_responses and renders them organized by module/section
- Welcome page is static (151 lines) — simplest migration, good starting point
- Old app uses iframe postMessage for cross-module communication — this is eliminated by React Context in the new app

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-module-migration*
*Context gathered: 2026-04-02*
