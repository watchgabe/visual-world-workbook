# Brand Launch Playbook — Next.js Migration

## What This Is

A modern Next.js 15 course platform that guides entrepreneurs through 5 workshop modules (Brand Foundation, Visual World, Content, Launch, and a compiled Playbook) with an admin dashboard for managing users and tracking progress. Migrated from monolithic HTML/iframe architecture to App Router with Supabase Auth, auto-save, and server-side API security.

## Core Value

Students can work through all course modules with their progress reliably saved, synced, and accessible — without data loss or auth confusion.

## Current State

**Shipped:** v1.0 MVP (2026-04-03)
**Codebase:** 76 TypeScript files, ~19,900 LOC
**Tech stack:** Next.js 15.2.4, React 19, TypeScript 5, Tailwind CSS v4, Supabase Auth + SSR, React Context

**What v1.0 delivers:**
- 5 course modules with 30+ sections, ~200 form fields, all content migrated 1:1
- Magic link auth with middleware route protection
- Auto-save with debounce and AbortController (error-only indicator by design)
- AI content generation via Claude proxy (bio, lead magnet, angles, font ID, color extraction, creator analysis)
- Read-only compiled Playbook with print CSS
- Admin dashboard with user list, progress viewer, Circle.so badge award, delete user
- Dark/light theme toggle persisted in cookie
- Mobile responsive with hamburger sidebar

**Known gaps carried to v2:**
- Waterfall analyzer feature (edge function exists, UI never built in old or new app)
- SectionNav pill-tab UX replaced by prev/next SectionNavBar

## Requirements

### Validated (v1.0)

- ✓ Supabase Auth with magic link — v1.0
- ✓ Middleware for auth redirects on protected routes — v1.0
- ✓ Server-side protected admin route (role-based) — v1.0
- ✓ Single Supabase service module — v1.0
- ✓ React Context for shared state (progress, theme, user) — v1.0
- ✓ Auto-save hook with debounce (one implementation for all modules) — v1.0
- ✓ Next.js App Router with direct routing — v1.0
- ✓ Reusable component library — v1.0
- ✓ Section wrapper with unified completion tracking — v1.0
- ✓ Next.js API routes wrapping claude-proxy and circle-proxy — v1.0
- ✓ App layout with sidebar, progress bar shared across pages — v1.0
- ✓ TypeScript throughout — v1.0
- ✓ Deploy to Vercel with environment variables — v1.0
- ✓ 5 course modules migrated 1:1 with AI integrations — v1.0
- ✓ Admin dashboard with full feature parity — v1.0
- ✓ Print-friendly playbook — v1.0
- ✓ Mobile responsive layout — v1.0

### Active

(None — fresh requirements defined in next milestone)

### Out of Scope

- Waterfall analyzer UI — deferred to v2 (never completed in old app)
- Changing course content or copy — migration only
- Redesigning the visual identity — keep existing color system
- Mobile native app — web only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Magic link auth (no passwords) | Matches current email-only UX, less friction for students | ✓ Good — works well |
| React Context over Zustand | Built-in, no extra dependency, appropriate for this app's scale | ✓ Good — 3 contexts sufficient |
| Wrap edge functions via API routes | Extra security layer, API keys never touch the client | ✓ Good — zero key leaks |
| Keep existing Supabase schema | Avoid data migration complexity, existing schema works | ✓ Good — no migration needed |
| Error-only save indicator (D-01) | Avoid distracting "Saving..." flicker UX | ✓ Good — clean UX |
| Waterfall deferred to v2 | Feature never completed in old app — not blocking launch | — Pending |

## Constraints

- **Tech stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Supabase JS SDK, React Context
- **Auth**: Supabase Auth with magic link only
- **Database**: Must work with existing Supabase tables and data format
- **Edge functions**: claude-proxy and circle-proxy wrapped via API routes
- **Visual design**: Preserve existing color system, layout patterns, and responsive behavior

---
*Last updated: 2026-04-03 after v1.0 milestone completion*
