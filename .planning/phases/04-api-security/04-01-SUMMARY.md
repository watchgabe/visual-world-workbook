---
phase: 04-api-security
plan: 01
subsystem: api
tags: [next.js, supabase, route-handlers, edge-functions, proxy, security, vitest, tdd]

# Dependency graph
requires:
  - phase: 02-authentication
    provides: createClient() + getUser() pattern for server-side auth in route handlers
  - phase: 03-component-library-data-hooks
    provides: existing test infrastructure and vi.mock patterns
provides:
  - Three Next.js API route handlers proxying Supabase edge functions server-side
  - Auth guard (401) and body size limits (413) on all three routes
  - SUPABASE_SERVICE_ROLE_KEY kept server-only (no NEXT_PUBLIC_ prefix)
affects: [05-data-layer, 06-module-pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route Handler auth guard: createClient() -> getUser() -> 401 if null"
    - "Thin proxy: parse body, check size, fetch edge function, pass-through response"
    - "Body size guard: JSON.stringify(body).length > MAX_BODY_CHARS -> 413"
    - "Edge function auth: SUPABASE_SERVICE_ROLE_KEY in Bearer header"
    - "Error logging: console.error('[/api/{route}] edge function error:', err)"

key-files:
  created:
    - src/app/api/claude/route.ts
    - src/app/api/circle/route.ts
    - src/app/api/waterfall/route.ts
    - tests/api-claude.test.ts
    - tests/api-circle.test.ts
    - tests/api-waterfall.test.ts

key-decisions:
  - "Direct fetch() from Route Handlers to edge functions with SUPABASE_SERVICE_ROLE_KEY in Authorization header (server-to-server)"
  - "Single /api/circle route with pass-through action field (thin proxy D-03/D-04)"
  - "Body size limits: claude 50k, circle 2k, waterfall 10k chars (D-05)"
  - "Pass-through error handling: edge function status/body forwarded as-is; 502 only for network failure (D-06)"

patterns-established:
  - "Route Handler pattern: auth -> parse -> size-check -> proxy -> return"
  - "All API routes use getUser() not getSession() (consistency with Phase 2 decision)"
  - "No NEXT_PUBLIC_ prefix on server-side secrets"

requirements-completed: [API-01, API-02, API-03]

# Metrics
duration: 15min
completed: 2026-04-01
---

# Phase 4 Plan 01: API Route Handlers Summary

**Three Next.js Route Handlers proxying claude-proxy, circle-proxy, and waterfall-analyzer edge functions with auth guards, body size limits, and SUPABASE_SERVICE_ROLE_KEY kept server-side**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-04-01T09:17:00Z
- **Completed:** 2026-04-01T09:32:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Three API route handlers created at `/api/claude`, `/api/circle`, `/api/waterfall`
- All routes authenticate via `getUser()` and return 401 JSON for unauthenticated requests
- Body size limits enforced: 50k (claude), 2k (circle), 10k (waterfall) — return 413 on violation
- All routes proxy to Supabase edge functions using `SUPABASE_SERVICE_ROLE_KEY` in Authorization header
- Edge function responses passed through with original status codes (thin proxy)
- 13 unit tests passing covering all routes: 401, 413, forward success, 502, and invalid JSON (claude)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create unit tests for all three API route handlers** - `2a04b14` (test)
2. **Task 2: Implement all three API route handlers** - `8162a18` (feat)

_Note: TDD tasks committed in RED then GREEN phases_

## Files Created/Modified
- `src/app/api/claude/route.ts` - POST proxy to claude-proxy, MAX_BODY_CHARS=50k
- `src/app/api/circle/route.ts` - POST proxy to circle-proxy, MAX_BODY_CHARS=2k
- `src/app/api/waterfall/route.ts` - POST proxy to waterfall-analyzer, MAX_BODY_CHARS=10k
- `tests/api-claude.test.ts` - 5 tests: 401, 400 bad JSON, 413, forward success, 502
- `tests/api-circle.test.ts` - 4 tests: 401, 413, forward success, 502
- `tests/api-waterfall.test.ts` - 4 tests: 401, 413, forward success, 502

## Decisions Made
- Direct `fetch()` used for edge function calls (over `supabase.functions.invoke()`) — more transparent, avoids needing a separate service-role client module
- Single `/api/circle` route accepts both `get_member` and `module_complete` actions via pass-through body — consistent with thin proxy approach (D-03/D-04)
- `SUPABASE_SERVICE_ROLE_KEY` without `NEXT_PUBLIC_` prefix confirmed — variable stays server-only

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all 13 tests pass, full suite (82 tests) green with no regressions.

## User Setup Required

**SUPABASE_SERVICE_ROLE_KEY must be added to `.env.local` before local development can call these routes.**

Steps:
1. Go to Supabase Dashboard -> Settings -> API
2. Copy the `service_role` key (secret — do NOT commit)
3. Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=your-key-here`
4. Add to Vercel environment variables for production

Note: This key must NEVER have a `NEXT_PUBLIC_` prefix. The route handlers only access it in server context.

## Next Phase Readiness

- All three API routes ready to receive requests from module pages (Phase 6)
- Auth guard pattern established — consistent with Phase 2 `getUser()` decision
- Body size limits protect the routes from oversized payloads without duplicating edge function validation
- Full test coverage; any future changes to route logic will be caught by existing tests

---
*Phase: 04-api-security*
*Completed: 2026-04-01*
