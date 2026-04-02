# Requirements: Brand Launch Playbook — Next.js Migration

**Defined:** 2026-04-01
**Core Value:** Students can work through all course modules with their progress reliably saved, synced, and accessible — without data loss or auth confusion.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Authentication

- [x] **AUTH-01**: User can sign in via magic link (email sent by Supabase Auth)
- [x] **AUTH-02**: User session persists across browser refresh via cookies
- [x] **AUTH-03**: Unauthenticated users are redirected to login page
- [x] **AUTH-04**: Auth callback route handles magic link token exchange
- [x] **AUTH-05**: User can sign out from any page

### Data Layer

- [x] **DATA-01**: Single Supabase service module with browser and server client creators
- [x] **DATA-02**: Well-structured database schema (new tables/columns designed for scalability)
- [x] **DATA-03**: Auto-save hook with debounce used by all form fields across all modules
- [x] **DATA-04**: Auto-save uses AbortController to prevent race condition overwrites
- [x] **DATA-05**: Save error indicator visible to user on blur (error-only by design — D-01)
- [x] **DATA-06**: React Context provides user state, progress state, and theme state

### Navigation & Layout

- [x] **NAV-01**: App layout with sidebar, topbar, and overall progress bar shared across all pages
- [x] **NAV-02**: Direct routing via Next.js App Router (no iframes)
- [x] **NAV-03**: Each module section is URL-addressable (e.g., /modules/brand-foundation/core-values)
- [x] **NAV-04**: Sidebar shows module list with per-module completion status
- [x] **NAV-05**: Dark/light theme toggle stored in cookie (no SSR hydration mismatch)
- [x] **NAV-06**: Mobile responsive sidebar with hamburger menu

### Component Library

- [x] **COMP-01**: WorkshopTextarea component with auto-save integration
- [x] **COMP-02**: WorkshopInput component with auto-save integration
- [x] **COMP-03**: OptionSelector component (radio/checkbox groups) with auto-save integration
- [x] **COMP-04**: SectionNav component for navigating between sections within a module
- [x] **COMP-05**: ProgressRing SVG component showing completion percentage
- [x] **COMP-06**: SectionWrapper component with completion tracking per section

### Module Migration

- [x] **MOD-01**: Module 00 — Welcome page (static overview/landing for logged-in users)
- [x] **MOD-02**: Module 01 — Brand Foundation: 7 sections, ~45 form fields, all content migrated 1:1
- [ ] **MOD-03**: Module 02 — Visual World: 6 sections including mood board, color picker, font uploader
- [ ] **MOD-04**: Module 03 — Content: 5 sections including Claude AI content generation integration
- [ ] **MOD-05**: Module 04 — Launch: 6 sections for bio, funnel, lead magnet, goals
- [ ] **MOD-06**: Module 05 — Compiled Playbook: read-only view aggregating all module data
- [ ] **MOD-07**: Print-friendly playbook view preserved

### API Security

- [x] **API-01**: Next.js API route wrapping claude-proxy edge function (API keys server-side)
- [x] **API-02**: Next.js API route wrapping circle-proxy edge function (API keys server-side)
- [x] **API-03**: Next.js API route wrapping waterfall-analyzer edge function (API keys server-side)

### Admin

- [ ] **ADMIN-01**: Server-side protected admin route (role-based, not client-side password)
- [ ] **ADMIN-02**: Admin can view list of all users
- [ ] **ADMIN-03**: Admin can view any user's progress across all modules
- [ ] **ADMIN-04**: Admin can trigger Circle.so badge award for a user
- [ ] **ADMIN-05**: Admin can delete a user account

### Deployment

- [ ] **DEPLOY-01**: Vercel deployment with environment variables (no hardcoded keys)
- [x] **DEPLOY-02**: TypeScript throughout the codebase
- [ ] **DEPLOY-03**: Magic link redirect URLs configured for both localhost and production

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Auth

- **AUTH-V2-01**: OAuth login options (Google, GitHub)
- **AUTH-V2-02**: Custom branded magic link emails

### Content Enhancements

- **CONTENT-V2-01**: Rich text editing in workshop fields
- **CONTENT-V2-02**: Image upload in workshop responses
- **CONTENT-V2-03**: Export playbook as PDF

### Analytics

- **ANALYTICS-V2-01**: Admin analytics dashboard (completion rates, drop-off points)
- **ANALYTICS-V2-02**: Student time-on-task tracking

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Video hosting/player | No video content exists; workshop model is the product identity |
| Discussion forums / in-app community | Circle.so is the community layer; duplicating creates split engagement |
| Leaderboards / gamification | Solo brand strategy work; competitive elements are off-tone |
| Social login (Google/GitHub) | Magic link is sufficient; OAuth adds complexity for unclear benefit |
| In-app messaging / DMs | Community interaction belongs in Circle.so |
| Mobile native app | Responsive web covers the need |
| Real-time collaboration | Individual brand work; collab adds complexity for no gain |
| Stripe / payments | Platform doesn't handle enrollment; Circle.so handles that |
| New course modules | Migration is 1:1 content fidelity |
| Modifying edge function logic | Keep claude-proxy, circle-proxy, waterfall-analyzer as-is |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 2 | Complete |
| AUTH-02 | Phase 2 | Complete |
| AUTH-03 | Phase 2 | Complete |
| AUTH-04 | Phase 2 | Complete |
| AUTH-05 | Phase 2 | Complete |
| DATA-01 | Phase 1 | Complete |
| DATA-02 | Phase 1 | Complete |
| DATA-03 | Phase 3 | Complete |
| DATA-04 | Phase 3 | Complete |
| DATA-05 | Phase 3 | Complete |
| DATA-06 | Phase 3 | Complete |
| NAV-01 | Phase 1 | Complete |
| NAV-02 | Phase 1 | Complete |
| NAV-03 | Phase 5 | Complete |
| NAV-04 | Phase 5 | Complete |
| NAV-05 | Phase 1 | Complete |
| NAV-06 | Phase 1 | Complete |
| COMP-01 | Phase 3 | Complete |
| COMP-02 | Phase 3 | Complete |
| COMP-03 | Phase 3 | Complete |
| COMP-04 | Phase 3 | Complete |
| COMP-05 | Phase 3 | Complete |
| COMP-06 | Phase 3 | Complete |
| MOD-01 | Phase 5 | Complete |
| MOD-02 | Phase 5 | Complete |
| MOD-03 | Phase 5 | Pending |
| MOD-04 | Phase 5 | Pending |
| MOD-05 | Phase 5 | Pending |
| MOD-06 | Phase 5 | Pending |
| MOD-07 | Phase 5 | Pending |
| API-01 | Phase 4 | Complete |
| API-02 | Phase 4 | Complete |
| API-03 | Phase 4 | Complete |
| ADMIN-01 | Phase 6 | Pending |
| ADMIN-02 | Phase 6 | Pending |
| ADMIN-03 | Phase 6 | Pending |
| ADMIN-04 | Phase 6 | Pending |
| ADMIN-05 | Phase 6 | Pending |
| DEPLOY-01 | Phase 7 | Pending |
| DEPLOY-02 | Phase 1 | Complete |
| DEPLOY-03 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 — traceability populated after roadmap creation*
