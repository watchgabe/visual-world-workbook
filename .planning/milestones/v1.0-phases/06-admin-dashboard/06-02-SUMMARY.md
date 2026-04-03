---
phase: 06-admin-dashboard
plan: 02
subsystem: ui
tags: [supabase, admin, react, nextjs, circle, tailwind]

# Dependency graph
requires:
  - phase: 06-admin-dashboard
    plan: 01
    provides: service-client, labels.ts, delete-user API route, circle-config API route
  - phase: 02-authentication
    provides: ThemeContext, ThemeProvider, createBrowserClient pattern
  - phase: 03-component-library-data-hooks
    provides: ThemeProvider interface and initialTheme cookie pattern

provides:
  - Standalone admin layout at /admin (own header, ThemeProvider, no app shell sidebar)
  - Admin server component page with Gate 2 role check (defense-in-depth)
  - AdminHeader client component with logout (hard redirect) and theme toggle
  - AdminDashboard client component: config strip (Circle keys), 4 stat cards, user table with expandable rows
  - UserDetailPanel: progress bars per module, Circle member card, badge award, answer grid, delete with confirmation
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Standalone layout pattern (no app shell, own ThemeProvider wrapping the route group)
    - Server component Gate 2 pattern: createClient() auth check + redirect before service client use
    - Config strip: UI inputs pre-populated from server props, persisted to Supabase via fetch POST
    - Inline expandable table row: single useState expandedUserId, only one expanded at a time
    - Circle member lookup in useEffect on panel mount, controlled by circleApiKey/circleCommunityId config state

key-files:
  created:
    - src/app/admin/layout.tsx
    - src/app/admin/page.tsx
    - src/components/admin/AdminHeader.tsx
    - src/components/admin/AdminDashboard.tsx
    - src/components/admin/UserDetailPanel.tsx
  modified: []

key-decisions:
  - "Admin layout is standalone (not inside (app) route group) — no sidebar, own ThemeProvider wrapping"
  - "signOut in AdminHeader calls createBrowserClient directly (not AuthContext) — admin layout has no AuthProvider"
  - "Delete confirmation uses inline useState dialog (not window.confirm) per D-07"
  - "Progress % based on non-empty fields / total fields from MODULE_SECTIONS — matches field count from modules.ts"
  - "Circle member fetch on UserDetailPanel mount, not on AdminDashboard level — avoids N+1 on table render"

requirements-completed: [ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05]

# Metrics
duration: 4min
completed: 2026-04-03
---

# Phase 06 Plan 02: Admin Dashboard UI Summary

**Standalone admin UI at /admin with stat cards, expandable user table, Circle integration, progress bars, answer grid with 200+ human-readable labels, and delete confirmation — full feature parity with old admin.html**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-03T02:39:46Z
- **Completed:** 2026-04-03T02:43:06Z
- **Tasks:** 3 (2 auto + 1 checkpoint:human-verify approved)
- **Files modified:** 5 (all created)

## Accomplishments

- Standalone admin layout reads blp-theme cookie, wraps with ThemeProvider, renders AdminHeader (logout + theme toggle)
- Server component page performs Gate 2 admin role check before any data fetch, lists all users and responses via service role
- AdminDashboard: Circle config strip persisted to Supabase, 4 stat cards (Total/Started/Completed All 4/Active 7 Days), user table with avatar, module badges, last-seen relative timestamps, expandable rows
- UserDetailPanel: module progress bars with SKIP_KEYS-aware non-empty field counting, Circle member lookup on mount, award badge button, full answer grid via getLabelForKey, inline delete confirmation dialog

## Task Commits

1. **Task 1: Admin layout, server component page, and AdminHeader** - `8972ebb` (feat)
2. **Task 2: AdminDashboard and UserDetailPanel client components** - `d35d565` (feat)
3. **Task 3: Visual and functional verification** — checkpoint approved by user

## Files Created/Modified

- `src/app/admin/layout.tsx` - Standalone ThemeProvider layout reading blp-theme cookie
- `src/app/admin/page.tsx` - Server component: Gate 2 admin check, listUsers, blp_responses, blp_config fetch, sorted by last_sign_in_at
- `src/components/admin/AdminHeader.tsx` - Client header with createBrowserClient signOut and theme toggle
- `src/components/admin/AdminDashboard.tsx` - Config strip, 4 stat cards, user table with expandable rows
- `src/components/admin/UserDetailPanel.tsx` - Progress bars, Circle card, badge award, answer grid, delete confirmation

## Decisions Made

- Admin layout is standalone — not inside the `(app)` route group — no sidebar, own ThemeProvider
- AdminHeader creates its own Supabase browser client (not AuthContext) because admin layout has no AuthProvider
- Delete confirmation is an inline `useState` dialog (not `window.confirm`) per plan requirement D-07
- Progress percentage calculated from non-empty text fields vs. total fields in MODULE_SECTIONS, with SKIP_KEYS filtering
- Circle member is fetched in UserDetailPanel's useEffect on mount — avoids rendering N fetches for the full user table

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Pre-existing TypeScript errors in test files (api-circle, api-claude, api-waterfall, ProgressRing, SectionNav, WorkshopInput, WorkshopTextarea, OptionSelector) — out of scope, not introduced by this plan.

## Known Stubs

None — all data is wired from the server component to client components via props.

## User Setup Required

For the admin dashboard to work:
1. Set `app_metadata.role = "admin"` for your Supabase user in the Supabase Dashboard
2. Ensure `SUPABASE_SERVICE_ROLE_KEY` is in `.env.local`
3. Run `supabase/schema.sql` to create `blp_config` table if not already done

## Next Phase Readiness

- Admin dashboard verified and approved by user
- All admin features from old admin.html are migrated 1:1
- Phase 06 is complete — the full Next.js migration admin dashboard is done

## Self-Check: PASSED

- `src/app/admin/layout.tsx` — exists
- `src/app/admin/page.tsx` — exists
- `src/components/admin/AdminHeader.tsx` — exists
- `src/components/admin/AdminDashboard.tsx` — exists
- `src/components/admin/UserDetailPanel.tsx` — exists
- Commits `8972ebb` and `d35d565` — verified via git log

---
*Phase: 06-admin-dashboard*
*Completed: 2026-04-03*
