# Phase 1: Foundation & App Shell - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

A runnable Next.js 15 scaffold with the correct packages installed, a well-structured new Supabase database schema with TypeScript types, Supabase browser and server client modules, and a three-panel app shell (sidebar + topbar + main content area) with cookie-backed dark/light theme toggle. This is the foundation every subsequent phase builds on.

</domain>

<decisions>
## Implementation Decisions

### Database Schema
- **D-01:** Claude's discretion on storage approach (single JSON column vs row-per-field vs hybrid) — pick what best fits auto-save + progress tracking requirements
- **D-02:** Fresh tables, ignore old schema. No data migration needed — students start fresh in the new app. Old tables stay in Supabase but are not used.
- **D-03:** Progress tracking is derived from responses, not a separate table. Completion % is calculated from filled fields — single source of truth, no sync issues.

### App Shell Appearance
- **D-04:** Pixel-faithful recreation of the old visual design. Same colors, spacing, fonts, layout proportions. Students should see no visual difference.
- **D-05:** Sidebar shows all 6 module names with placeholder progress indicators (0%) in Phase 1. Clicking navigates to an empty module page. Sidebar is fully wired for Phase 5 integration.
- **D-06:** Topbar contains FSCreative brand mark (left), overall progress bar (center), and theme toggle (right). Matches the old topbar layout. Progress bar shows 0% as static placeholder until ProgressContext exists in Phase 3.

### Theme Approach
- **D-07:** Claude's discretion on CSS implementation — pick approach that best preserves old color tokens while working idiomatically with Tailwind v4 (CSS custom properties vs Tailwind dark: class or hybrid)
- **D-08:** Default theme is dark, matching the current app experience. First-time visitors see dark mode.
- **D-09:** Grain texture overlay preserved — SVG noise texture with mix-blend-mode: overlay at ~2.5% opacity. This is a design signature of the app.

### Sidebar Behavior
- **D-10:** Sidebar is fixed at 280px on desktop (always visible, not collapsible). Only collapses on mobile via hamburger menu.
- **D-11:** Mobile sidebar uses slide-from-left + dark overlay pattern, matching old app. Tap overlay or hamburger to close.
- **D-12:** Mobile breakpoint at 768px (standard tablet breakpoint). Below 768px, sidebar switches to hamburger menu.

### Claude's Discretion
- D-01: Database storage structure (JSON column vs row-per-field vs hybrid)
- D-07: CSS theme implementation strategy (CSS vars vs Tailwind dark: class vs hybrid)
- General: Folder structure conventions, shadcn component selection, TypeScript type organization

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Old App Reference (layout, colors, behavior)
- `old/index.html` — Main app shell: sidebar, topbar, theme toggle, module navigation, CSS tokens (lines 14-35 for color variables, lines 53-77 for mobile topbar, lines 226-234 for theme button)
- `old/index.html` lines 391-427 — Sidebar HTML structure with theme toggle and module list
- `old/index.html` lines 1095-1154 — Theme toggle JavaScript and localStorage handling

### Project Specs
- `.planning/PROJECT.md` — Core constraints, tech stack decisions
- `.planning/REQUIREMENTS.md` — DATA-01, DATA-02, NAV-01, NAV-02, NAV-05, NAV-06, DEPLOY-02 are Phase 1 requirements
- `.planning/ROADMAP.md` §Phase 1 — Success criteria and dependency chain
- `CLAUDE.md` §Technology Stack — Pinned versions (Next.js 15.2.4, Supabase JS 2.101.1, @supabase/ssr 0.10.0, Tailwind v4, shadcn/ui)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing Next.js project — this is a fresh scaffold from scratch
- Old HTML files in `/old` serve as visual reference only

### Established Patterns (from old code)
- **Color system:** CSS custom properties in `:root` (dark) and `body.light` (light override). Key tokens: `--bg`, `--surface`, `--card`, `--border`, `--text`, `--dim`, `--orange`, `--green-text`
- **Layout dimensions:** Sidebar 280px (`--sidebar-w`), topbar 48px (`--topbar-h`)
- **Fonts:** System font stack `'Helvetica Neue', Helvetica, Arial, sans-serif` for body, `'Barlow Condensed'` for numbers/stats
- **Theme toggle:** `body.light` class approach, localStorage key `blp-theme`, default dark
- **Grain overlay:** SVG noise via `body::before` pseudo-element, `mix-blend-mode: overlay`, 2.5% opacity

### Integration Points
- Supabase project URL: exists in old code (must move to env vars, never hardcode)
- Module routes: will be `/modules/{slug}` pattern based on old iframe loading
- 6 modules: welcome, brand-foundation, visual-world, content, launch, playbook

</code_context>

<specifics>
## Specific Ideas

- Pixel-faithful means replicating the exact CSS custom property values from the old `:root` and `body.light` blocks
- The grain texture is a specific SVG filter pattern — port the exact SVG from old/index.html line 49
- Module list in sidebar should show all 6 module names even in Phase 1 (wired for future integration)
- Overall progress bar in topbar even before ProgressContext — shows 0% as static placeholder

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-app-shell*
*Context gathered: 2026-04-01*
