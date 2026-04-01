---
phase: 02-authentication
plan: 01
subsystem: auth
tags: [supabase, supabase-ssr, middleware, next-auth, react-context, cookie-session]

# Dependency graph
requires:
  - phase: 01-foundation-app-shell
    provides: AppShellClient, src/lib/supabase/client.ts, src/lib/supabase/server.ts

provides:
  - Middleware session refresh (updateSession) protecting /modules/* and /admin/*
  - Auth callback route at /auth/callback for PKCE magic link token exchange
  - AuthContext with user/loading/signOut for all (app) route group components

affects:
  - 02-authentication (plan 02: login page, UserModal)
  - 03-data-layer (progress loading requires authenticated user from AuthContext)
  - all-module-pages (route protection via middleware)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Supabase SSR middleware pattern: updateSession with getAll/setAll cookie API"
    - "Route protection: middleware redirects unauthenticated users to /login?redirect={originalUrl}"
    - "Auth callback: PKCE exchangeCodeForSession, not verifyOtp (implicit flow)"
    - "AuthContext: getUser() for initial check + onAuthStateChange for live updates"
    - "signOut: window.location.href hard redirect to avoid stale Next.js router cache"

key-files:
  created:
    - src/lib/supabase/middleware.ts
    - src/middleware.ts
    - src/app/auth/callback/route.ts
    - src/context/AuthContext.tsx
  modified:
    - src/app/(app)/layout.tsx

key-decisions:
  - "getUser() not getSession() in middleware — getSession() does not revalidate JWT against Supabase Auth server (security)"
  - "AuthProvider wraps AppShellClient in (app) layout so Sidebar can access useAuth() for user modal"
  - "Hard redirect (window.location.href) on signOut — prevents stale Next.js router cache showing authenticated UI"
  - "Auth callback uses exchangeCodeForSession (PKCE flow, default in @supabase/ssr) not verifyOtp (implicit flow)"

patterns-established:
  - "Middleware helper at src/lib/supabase/middleware.ts, entry point at src/middleware.ts — mirrors existing supabase lib structure"
  - "Return URL preserved as ?redirect param on /login; passed as ?next param to /auth/callback"
  - "Auth errors map to friendly error codes: link_expired, unknown"

requirements-completed: [AUTH-02, AUTH-03, AUTH-04]

# Metrics
duration: 2min
completed: 2026-04-01
---

# Phase 02 Plan 01: Auth Infrastructure Summary

**Supabase SSR middleware with getUser() route protection, PKCE callback for magic link exchange, and AuthContext provider wired into the (app) layout**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-01T22:33:03Z
- **Completed:** 2026-04-01T22:34:33Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Created middleware infrastructure that refreshes Supabase auth tokens on every request and protects /modules/* and /admin/* routes using getUser() (not getSession()) for secure JWT revalidation
- Created /auth/callback route handler for PKCE magic link token exchange, with friendly error redirects for expired/invalid links
- Created AuthContext provider exposing user/loading/signOut, wired into (app) layout so all child components can access auth state via useAuth()

## Task Commits

1. **Task 1: Middleware helper and root middleware** - `5e89081` (feat)
2. **Task 2: Auth callback route, AuthContext, app layout update** - `fa62a95` (feat)

**Plan metadata:** (final docs commit — recorded below)

## Files Created/Modified

- `src/lib/supabase/middleware.ts` — updateSession helper: session refresh + route protection + redirect logic
- `src/middleware.ts` — Next.js entry point delegating to updateSession with broad matcher
- `src/app/auth/callback/route.ts` — PKCE token exchange via exchangeCodeForSession, error handling
- `src/context/AuthContext.tsx` — AuthProvider + useAuth hook with user/loading/signOut state
- `src/app/(app)/layout.tsx` — Updated to wrap AppShellClient with AuthProvider

## Decisions Made

- Used `getUser()` not `getSession()` in middleware — getSession reads cookie without JWT revalidation (Supabase security advisory)
- AuthProvider wraps AppShellClient in (app) layout (not root layout) — login page is pre-auth and doesn't need user state; sidebar/modal components inside (app) do
- Hard redirect via `window.location.href = '/login'` on signOut — prevents stale Next.js router cache from showing authenticated UI after sign-out
- Auth callback uses `exchangeCodeForSession` (PKCE, default in @supabase/ssr) not `verifyOtp` (implicit flow, older pattern)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — all five files compiled cleanly on the first attempt. Build completed successfully.

## User Setup Required

The Supabase Auth dashboard requires one manual configuration step before the magic link flow will work:

**Add Redirect URL to Supabase project:**
- Location: Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
- Add: `http://localhost:3000/auth/callback` (local development)
- Add: production URL `https://yourdomain.com/auth/callback` when deploying

Without this step, Supabase will reject magic link redirects with "Redirect URL not allowed."

## Next Phase Readiness

- Middleware is live and protecting /modules/* and /admin/* routes
- Auth callback at /auth/callback is ready to handle magic link clicks
- AuthContext is available to all (app) components via useAuth()
- Ready for Plan 02: Login page UI, LoginForm component, UserModal in sidebar

---
*Phase: 02-authentication*
*Completed: 2026-04-01*

## Self-Check: PASSED

- FOUND: src/lib/supabase/middleware.ts
- FOUND: src/middleware.ts
- FOUND: src/app/auth/callback/route.ts
- FOUND: src/context/AuthContext.tsx
- FOUND: src/app/(app)/layout.tsx
- FOUND: commit 5e89081 (Task 1)
- FOUND: commit fa62a95 (Task 2)
