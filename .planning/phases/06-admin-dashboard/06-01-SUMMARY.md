---
phase: 06-admin-dashboard
plan: 01
subsystem: api
tags: [supabase, service-role, middleware, admin, rls, labels]

# Dependency graph
requires:
  - phase: 02-authentication
    provides: middleware.ts updateSession pattern and Supabase server client
  - phase: 04-api-security
    provides: API route patterns (auth guard, service role key usage)
provides:
  - Supabase service-role client factory (createServiceClient) for admin operations
  - Admin gate in middleware (isAdminRoute check via app_metadata.role)
  - Labels module with 200+ field-to-label mappings from old admin.html
  - DELETE /api/admin/delete-user endpoint with 401/403/400/200 responses
  - GET/POST /api/admin/circle-config endpoint reading/writing blp_config
  - blp_config table schema for Circle.so config persistence
affects: [06-admin-dashboard, plan-02]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Service role client created with @supabase/supabase-js (not @supabase/ssr) for admin bypass of RLS
    - Admin route gate in middleware as Gate 1; admin page server component will be Gate 2
    - as any cast on service client for blp_config queries (pre-schema-type mismatch workaround)

key-files:
  created:
    - src/lib/admin/service-client.ts
    - src/lib/admin/labels.ts
    - src/app/api/admin/delete-user/route.ts
    - src/app/api/admin/circle-config/route.ts
    - tests/admin-labels.test.ts
    - tests/api-admin-delete.test.ts
  modified:
    - src/lib/supabase/middleware.ts
    - supabase/schema.sql
    - src/types/database.ts

key-decisions:
  - "createServiceClient uses @supabase/supabase-js (not @supabase/ssr) — service role doesn't need cookie-based SSR auth"
  - "Admin middleware gate (Gate 1) redirects authenticated non-admin to / — defense in depth pattern per D-02"
  - "blp_config has RLS enabled but no user-facing policies — all access via service role API routes only"
  - "as any cast on service client for blp_config table access — TypeScript narrowing issue with new table; same established pattern as useAutoSave and blp_responses selects"

requirements-completed: [ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04, ADMIN-05]

# Metrics
duration: 15min
completed: 2026-04-03
---

# Phase 06 Plan 01: Admin Dashboard Infrastructure Summary

**Supabase service-role client, two-gate admin middleware, 200+ field labels migrated from old admin.html, delete-user and circle-config API routes with full auth guards, and blp_config schema**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-03T19:34:00Z
- **Completed:** 2026-04-03T19:38:00Z
- **Tasks:** 2
- **Files modified:** 9 (6 created, 3 modified)

## Accomplishments

- Service-role client factory using SUPABASE_SERVICE_ROLE_KEY (never NEXT_PUBLIC_) for RLS-bypass admin operations
- Middleware updated with isAdminRoute gate redirecting authenticated non-admin users to / (Gate 1 of 2)
- labels.ts with 200+ entries migrated 1:1 from old admin.html plus igLabel, caLabel, optLabel, prettyKey, getLabelForKey helper functions
- delete-user API route with proper 401/403/400/500/200 responses
- circle-config API route (GET + POST) reading/upserting blp_config via service role
- blp_config table added to schema.sql with RLS enabled (no user policies)
- 20 tests passing across 2 test files

## Task Commits

1. **Task 1: Service client, middleware admin gate, labels module with tests** - `9a5fd8a` (feat)
2. **Task 2: API route handlers for user deletion and Circle config, plus blp_config schema** - `7953019` (feat)

## Files Created/Modified

- `src/lib/admin/service-client.ts` - createServiceClient() using SUPABASE_SERVICE_ROLE_KEY via @supabase/supabase-js
- `src/lib/admin/labels.ts` - LABELS (200+ entries), SKIP_KEYS, CC_EXACT, igLabel, caLabel, optLabel, prettyKey, getLabelForKey
- `src/lib/supabase/middleware.ts` - Added isAdminRoute check and app_metadata.role admin gate
- `src/app/api/admin/delete-user/route.ts` - POST handler with auth, admin check, deleteUser via service role
- `src/app/api/admin/circle-config/route.ts` - GET reads, POST upserts blp_config via service role
- `supabase/schema.sql` - blp_config table with RLS enabled
- `src/types/database.ts` - BlpConfig interface and blp_config table entry in Database type
- `tests/admin-labels.test.ts` - 16 tests for labels module
- `tests/api-admin-delete.test.ts` - 4 tests for delete-user route

## Decisions Made

- `createServiceClient` uses `@supabase/supabase-js` (not `@supabase/ssr`) — service role doesn't need cookie-based SSR
- Admin middleware check runs after the existing auth gate: authenticated non-admins get redirected to `/` (Defense-in-depth Gate 1, Plan 02 adds Gate 2 in the server component)
- `blp_config` has RLS enabled but no user-facing policies — all access routes through service role API routes only
- `as any` cast on service client for `blp_config` table queries (TypeScript type narrowing issue with the new table; same established codebase pattern as `useAutoSave` and blp_responses selects)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added BlpConfig type to database.ts**
- **Found during:** Task 2 (circle-config route)
- **Issue:** TypeScript couldn't type-check blp_config queries without the table in the Database interface
- **Fix:** Added `BlpConfig` interface and `blp_config` table entry to `src/types/database.ts`
- **Files modified:** src/types/database.ts
- **Verification:** tsc --noEmit shows no errors in new files
- **Committed in:** 7953019 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (missing type definition for new table)
**Impact on plan:** Required for TypeScript correctness. No scope creep.

## Issues Encountered

Pre-existing TypeScript errors exist in test files (ProgressRing, SectionNav, WorkshopInput, WorkshopTextarea, api-circle, api-claude, api-waterfall) — these are out of scope for this plan and were not introduced by this work. New files compile cleanly.

## User Setup Required

None — no external service configuration required. Admin role is set via Supabase Auth `app_metadata.role = 'admin'` directly in the Supabase dashboard per project constraints.

## Next Phase Readiness

- All server-side admin infrastructure ready for Plan 02 (Admin UI)
- Service client, labels, and API routes are the data layer Plan 02 will consume
- Plan 02 needs: admin user list page, progress viewer, delete user button wired to /api/admin/delete-user, Circle config UI wired to /api/admin/circle-config

---
*Phase: 06-admin-dashboard*
*Completed: 2026-04-03*
