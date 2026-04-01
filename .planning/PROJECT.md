# Brand Launch Playbook — Next.js Migration

## What This Is

A full refactor of the Brand Launch Playbook course platform from monolithic HTML/iframe architecture to a modern Next.js 14+ app. The platform guides entrepreneurs through 5 course modules (Brand Foundation, Visual World, Content, Launch, and a compiled Playbook) with an admin dashboard for managing users and tracking progress. Currently deployed as standalone HTML files with iframes, localStorage, and raw Supabase fetch calls.

## Core Value

Students can work through all course modules with their progress reliably saved, synced, and accessible — without data loss or auth confusion.

## Requirements

### Validated

- ✓ 5 course modules with section-based progression — existing
- ✓ Form-based workshops with text inputs, selectors, and textareas — existing
- ✓ Per-section and overall progress tracking — existing
- ✓ Dark/light theme toggle — existing
- ✓ Admin dashboard with user list, progress viewer, delete user — existing
- ✓ AI content generation via Claude proxy edge function — existing
- ✓ Circle.so integration for module completion badges — existing
- ✓ Waterfall analyzer for YouTube transcript repurposing — existing
- ✓ Mobile responsive layout with hamburger menu — existing
- ✓ Print-friendly playbook view — existing

### Active

- [ ] Supabase Auth with magic link (replace localStorage email system)
- [ ] Server-side protected admin route (replace client-side password check)
- [ ] Middleware for auth redirects on protected routes
- [ ] Single Supabase service module replacing 4 scattered implementations
- [ ] React Context for shared state (progress, theme, user)
- [ ] Auto-save hook with debounce (one implementation for all modules)
- [ ] Next.js App Router with direct routing (replace iframe loading)
- [ ] Reusable component library (WorkshopTextarea, WorkshopInput, OptionSelector, SectionNav, ProgressRing)
- [ ] Section wrapper with unified completion tracking
- [ ] Next.js API routes wrapping edge function calls (claude-proxy, circle-proxy, waterfall-analyzer)
- [ ] App layout with sidebar, topbar, progress bar shared across pages
- [ ] TypeScript throughout
- [ ] Deploy to Vercel with environment variables

### Out of Scope

- Changing course content or copy — migration only, same material
- Redesigning the visual identity — keep existing orange/green/dark color system
- Modifying Supabase database schema — same tables, same data format
- Rewriting edge functions — keep claude-proxy, circle-proxy, waterfall-analyzer as-is
- Adding new course modules — scope is migrating existing 5 + welcome
- Mobile native app — web only

## Context

- **Current architecture:** 6 HTML files (largest 4,524 lines), iframe-based module loading, localStorage for state, postMessage for cross-frame communication, 4 different save/load implementations
- **Total codebase:** ~14,600 lines of HTML across the app
- **Supabase:** Already set up with tables and 3 edge functions (claude-proxy, circle-proxy, waterfall-analyzer)
- **Key pain points:** Hardcoded API keys in client, no real auth, duplicated save/load logic, iframe race conditions, massive monolithic files
- **Existing code location:** `/old` directory in repo (reference during migration)
- **Circle.so:** Used for awarding module completion badges

## Constraints

- **Tech stack**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Supabase JS SDK, React Context
- **Auth**: Supabase Auth with magic link only
- **Database**: Must work with existing Supabase tables and data format — no schema changes
- **Edge functions**: Keep existing Supabase edge functions unchanged, but wrap calls through Next.js API routes
- **Visual design**: Preserve existing color system, layout patterns, and responsive behavior
- **Content**: All course content must be migrated 1:1 from old HTML files

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Magic link auth (no passwords) | Matches current email-only UX, less friction for students | — Pending |
| React Context over Zustand | Built-in, no extra dependency, appropriate for this app's scale | — Pending |
| Wrap edge functions via API routes | Extra security layer, API keys never touch the client | — Pending |
| Keep existing Supabase schema | Avoid data migration complexity, existing schema works | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after initialization*
