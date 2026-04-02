# Roadmap: Brand Launch Playbook — Next.js Migration

## Overview

A brownfield migration of a live course platform from monolithic HTML/iframe architecture to a modern Next.js 15 App Router application. The build order is strictly dependency-driven: foundation and app shell establish the scaffold and shared state; authentication secures every protected route; workshop components and data hooks provide the reusable building blocks; API wrappers move edge function secrets server-side; module pages integrate all prior layers one at a time; admin completes the internal tooling; and deployment hardens the production environment.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation & App Shell** - Next.js 15 scaffold, Supabase clients, TypeScript types, new DB schema, and three-panel app layout with theme support (completed 2026-04-01)
- [x] **Phase 2: Authentication** - Supabase magic link auth with middleware route protection, session cookies, and AuthContext (completed 2026-04-01)
- [x] **Phase 3: Component Library & Data Hooks** - Reusable workshop UI components and unified auto-save hook with AbortController (completed 2026-04-02)
- [x] **Phase 4: API Security** - Server-side Next.js API route wrappers for all three Supabase edge functions (completed 2026-04-02)
- [x] **Phase 5: Module Migration** - All six course module pages migrated 1:1 with full content, URL routing, and progress tracking (completed 2026-04-02)
- [ ] **Phase 5.1: Module Migration Remediation** - Restore missing features, content, and AI integrations for true 1:1 feature parity (INSERTED)
- [ ] **Phase 6: Admin Dashboard** - Server-side protected admin with user list, progress viewer, badge award, and delete
- [ ] **Phase 7: Deployment** - Vercel environment variables, Supabase production URL config, and production smoke test

## Phase Details

### Phase 1: Foundation & App Shell
**Goal**: A runnable Next.js 15 project with the correct packages, a well-structured Supabase schema, shared TypeScript types, and a three-panel app shell (sidebar + topbar + main) with cookie-backed theme toggle — every subsequent phase builds on top of this
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, NAV-01, NAV-02, NAV-05, NAV-06, DEPLOY-02
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts without errors and loads a visible app shell with sidebar, topbar, and main content area
  2. Supabase browser client and server client are importable from a single module and connect to the project without errors
  3. New database schema is applied in Supabase with tables and columns designed for the unified auto-save pattern
  4. Dark/light theme toggle switches the app theme and the choice survives a browser refresh (stored in cookie, no hydration flash)
  5. Sidebar collapses to a hamburger menu on mobile and expands on desktop
**Plans:** 2/2 plans complete
Plans:
- [x] 01-01-PLAN.md — Scaffold Next.js 15, Supabase clients, DB schema, CSS architecture
- [x] 01-02-PLAN.md — Three-panel app shell with sidebar, theme toggle, mobile responsive, module routing
**UI hint**: yes

### Phase 2: Authentication
**Goal**: Users can securely sign in via magic link and stay signed in across sessions, with all protected routes enforced by middleware
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Success Criteria** (what must be TRUE):
  1. User enters their email, receives a magic link, clicks it, and lands on the dashboard as a signed-in user
  2. User refreshes the browser and remains signed in (session persists via cookie)
  3. User who is not signed in and navigates to any module URL is redirected to the login page
  4. Auth callback route exchanges the magic link token and redirects to the dashboard without error
  5. User clicks sign out from any page and is immediately redirected to the login page
**Plans:** 2/2 plans complete
Plans:
- [x] 02-01-PLAN.md — Auth infrastructure: middleware, callback route, AuthContext provider
- [x] 02-02-PLAN.md — Login page UI, LoginForm, UserModal, sign-out in sidebar
**UI hint**: yes

### Phase 3: Component Library & Data Hooks
**Goal**: A complete set of reusable workshop form components and a single unified auto-save hook that all module pages will use — no data fetching, pure UI and hooks
**Depends on**: Phase 2
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, DATA-03, DATA-04, DATA-05, DATA-06
**Success Criteria** (what must be TRUE):
  1. WorkshopTextarea, WorkshopInput, and OptionSelector components render correctly and show a save-status indicator (syncing / saved / error) when their value changes
  2. Auto-save hook debounces keystrokes and writes to Supabase no more than once per debounce window, even under rapid input
  3. Auto-save hook cancels any in-flight request before issuing a new one (AbortController), preventing race condition overwrites
  4. SectionWrapper marks a section complete when all required fields are filled and reflects this in the ProgressRing
  5. AuthContext, ProgressContext, and ThemeContext are available to all components in the app shell and provide correct initial state
**Plans:** 3/3 plans complete
Plans:
- [x] 03-01-PLAN.md — Test infra, ThemeContext, ProgressContext, useAutoSave hook, layout wiring
- [x] 03-02-PLAN.md — ProgressRing SVG and SectionNav tab bar components
- [x] 03-03-PLAN.md — WorkshopTextarea, WorkshopInput, OptionSelector, SectionWrapper + visual checkpoint
**UI hint**: yes

### Phase 4: API Security
**Goal**: All three Supabase edge function calls are routed through server-side Next.js API routes so no API keys or service role secrets ever reach the browser
**Depends on**: Phase 2
**Requirements**: API-01, API-02, API-03
**Success Criteria** (what must be TRUE):
  1. A call to `/api/claude` from the browser reaches the Claude proxy edge function and returns a response — no Supabase URL or keys appear in browser network requests
  2. A call to `/api/circle` from the browser reaches the Circle proxy edge function and returns a response — API keys remain server-side
  3. A call to `/api/waterfall` from the browser reaches the waterfall analyzer edge function and returns a response — API keys remain server-side
**Plans:** 1/1 plans complete
Plans:
- [x] 04-01-PLAN.md — API route handlers for claude-proxy, circle-proxy, waterfall-analyzer with auth, size limits, and tests

### Phase 5: Module Migration
**Goal**: All six course module pages are fully migrated with 1:1 content fidelity, URL-addressable sections, and working auto-save and progress tracking on every form field
**Depends on**: Phase 3, Phase 4
**Requirements**: MOD-01, MOD-02, MOD-03, MOD-04, MOD-05, MOD-06, MOD-07, NAV-03, NAV-04
**Success Criteria** (what must be TRUE):
  1. Each module section is accessible at its own URL (e.g., `/modules/brand-foundation/core-values`) and navigating directly to that URL loads the correct content
  2. Sidebar displays each module with a per-module completion percentage that updates as sections are completed
  3. A student types into any form field in any module, closes the tab, reopens it, and their answer is still there
  4. Module 04 Content page generates AI copy via the Claude integration and populates the relevant form field
  5. Module 05 Playbook page displays a read-only compiled view of all answers from all prior modules, and the print view renders cleanly
**Plans:** 6/6 plans complete
Plans:
- [x] 05-01-PLAN.md — Infrastructure: useAutoSave full-responses, MODULE_SECTIONS config, module layout routing, sidebar progress, Welcome page
- [x] 05-02-PLAN.md — Brand Foundation: 7 sections migrated with ~45 form fields
- [x] 05-03-PLAN.md — Visual World: 6 sections with color palette, typography, and compiled doc
- [x] 05-04-PLAN.md — Content: 6 sections with Claude AI generation integration
- [x] 05-05-PLAN.md — Launch: 7 sections for bio, funnel, lead magnet, goals
- [x] 05-06-PLAN.md — Playbook: read-only compiled view with print CSS + visual checkpoint
**UI hint**: yes

### Phase 05.1: Module Migration Remediation (INSERTED)

**Goal:** Restore all missing features, content, and AI integrations from the old HTML modules that were not migrated in Phase 5 — achieving true 1:1 feature parity
**Depends on:** Phase 5
**Requirements**: MOD-02, MOD-03, MOD-04, MOD-05
**Success Criteria** (what must be TRUE):
  1. Brand Foundation Values Audit (12 scored items, 4 categories, chart visualization) is fully functional
  2. Visual World Creator Analysis has the dynamic creator card system with Instagram AI lookup and per-creator notes
  3. Visual World Mood Board has drag-and-drop image gallery with 4 categories and mosaic view
  4. Visual World Typography has AI font identifier, pairing suggestions, live font preview, and italic/bold toggles
  5. Visual World Color Palette has clickable color picker on swatches and AI color extraction from photo
  6. Content module includes Cinematic Content section (Workshop 10) with all instructional content and shot type images
  7. Content Blueprint/Playbook view with compiled summary and 19 unique fields (brand colors, mood vibe, creator analysis x3)
  8. Content Idea Generation has individual angle fields or AI generation matching old behavior
  9. Launch Bio and Lead Magnet sections have AI generate buttons calling Claude proxy
  10. Launch Goals section has "Set My Date" 90-day calculator button
**Plans:** 2/6 plans executed
Plans:
- [x] 05.1-01-PLAN.md — Launch AI buttons (bio, lead magnet) + Set My Date + Brand Foundation 5 AI generate buttons
- [x] 05.1-02-PLAN.md — Brand Foundation Values Audit (12 scored items, chart visualization)
- [ ] 05.1-03-PLAN.md — Content: 80 angle fields + Cinematic Content section + Content Blueprint section
- [ ] 05.1-04-PLAN.md — Visual World Creator Analysis rewrite with dynamic cards and AI
- [ ] 05.1-05-PLAN.md — Visual World Color Palette: mood board gallery, color picker, AI extraction, Pinterest
- [ ] 05.1-06-PLAN.md — Visual World Typography: font identifier, pairing, live preview, italic/bold
**UI hint**: yes

### Phase 6: Admin Dashboard
**Goal**: Admins can access a server-side protected dashboard to view all users, inspect any user's module progress, award Circle.so badges, and delete accounts — with no client-side password check
**Depends on**: Phase 5
**Requirements**: ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05
**Success Criteria** (what must be TRUE):
  1. A non-admin user who navigates to `/admin` is redirected away (role check happens server-side via `getUser()`, not a client-side password)
  2. Admin can see a list of all registered users with their email and last active date
  3. Admin can click any user and view their completion status for each module and section
  4. Admin can trigger a Circle.so badge award for a user and receive confirmation
  5. Admin can delete a user account and the user no longer appears in the list
**Plans**: TBD
**UI hint**: yes

### Phase 7: Deployment
**Goal**: The application is running in production on Vercel with all environment variables configured, magic links pointing to the correct production URL, and a passing end-to-end smoke test
**Depends on**: Phase 6
**Requirements**: DEPLOY-01, DEPLOY-03
**Success Criteria** (what must be TRUE):
  1. The application is deployed to Vercel and loads at the production URL with no hardcoded keys in the client bundle
  2. A magic link email sent in production contains the correct production callback URL (not localhost)
  3. A full end-to-end smoke test passes: sign in → complete a form field → verify save → view playbook → sign out
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 5.1 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & App Shell | 2/2 | Complete   | 2026-04-01 |
| 2. Authentication | 2/2 | Complete   | 2026-04-01 |
| 3. Component Library & Data Hooks | 3/3 | Complete   | 2026-04-02 |
| 4. API Security | 1/1 | Complete   | 2026-04-02 |
| 5. Module Migration | 6/6 | Complete   | 2026-04-02 |
| 5.1 Module Migration Remediation | 0/6 | Not started | - |
| 6. Admin Dashboard | 0/TBD | Not started | - |
| 7. Deployment | 0/TBD | Not started | - |
