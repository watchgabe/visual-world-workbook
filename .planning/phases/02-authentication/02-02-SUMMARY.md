---
phase: 02-authentication
plan: 02
subsystem: auth
tags: [supabase, magic-link, login-page, user-modal, signin, signout]

# Dependency graph
requires:
  - phase: 02-01
    provides: AuthContext with useAuth hook, signOut, middleware route protection, auth callback

provides:
  - Login page at /login with FSCreative branded card layout (standalone, no app shell)
  - LoginForm client component with signInWithOtp, inline success state, 30s resend timer, spinner, friendly error messages
  - UserModal component with user email display and instant sign-out button
  - Sidebar updated with user avatar trigger between ProgressBar and ThemeToggle

affects: [03-data-layer, any phase using auth state from sidebar]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Login page uses standalone layout.tsx to bypass (app) route group — no sidebar on /login"
    - "LoginForm handles all auth UX inline: send/success/resend states in one component"
    - "UserModal positioned absolutely above trigger with fixed-position overlay for click-outside close"
    - "Sidebar conditionally renders user trigger only when user is non-null from useAuth()"

key-files:
  created:
    - src/app/login/layout.tsx
    - src/app/login/page.tsx
    - src/components/auth/LoginForm.tsx
    - src/components/auth/UserModal.tsx
  modified:
    - src/components/layout/Sidebar.tsx

key-decisions:
  - "loginLayout is a passthrough wrapper — root layout provides html/body, (app) layout is bypassed entirely for /login"
  - "User avatar shows first letter of email — simpler than SVG icon, provides identity signal"
  - "signOut from AuthContext (hard redirect via window.location.href) used directly in UserModal via onSignOut prop"

patterns-established:
  - "Pattern: Standalone auth pages use layout.tsx passthrough to opt out of (app) route group"
  - "Pattern: Inline form states (idle/loading/success) managed as local component state with useEffect for timers"

requirements-completed: [AUTH-01, AUTH-05]

# Metrics
duration: 3min
completed: 2026-04-01
---

# Phase 02 Plan 02: Login UI and Sign-out Flow Summary

**Branded /login page with Supabase signInWithOtp magic link, inline success + 30s resend, and UserModal sign-out in Sidebar footer**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-04-01T22:36:54Z
- **Completed:** 2026-04-01T22:39:00Z
- **Tasks:** 2 of 3 (stopped at checkpoint:human-verify)
- **Files modified:** 5

## Accomplishments
- Branded login page at `/login` — standalone layout, FSCreative identity, card-based centered layout matching app design system
- LoginForm client component with full OTP flow: signInWithOtp call with emailRedirectTo including encodeURIComponent return URL, spinner while sending, inline success message with envelope icon, 30-second countdown before resend button appears, friendly AUTH_ERRORS map for link_expired/rate_limit/unknown
- UserModal component with user email and Sign out button (instant, no confirmation), click-outside overlay for close
- Sidebar footer updated with user avatar trigger between ProgressBar and ThemeToggle — shows first letter of email, only renders when user is authenticated

## Task Commits

Each task was committed atomically:

1. **Task 1: Create login page with branded layout and LoginForm component** - `a67ddd7` (feat)
2. **Task 2: Create UserModal and add user trigger to Sidebar footer** - `c9bddcb` (feat)

_Task 3 is a checkpoint:human-verify — awaiting manual end-to-end flow verification._

## Files Created/Modified
- `src/app/login/layout.tsx` — Minimal passthrough layout (bypasses (app) route group)
- `src/app/login/page.tsx` — Async searchParams, FSCreative brand card, renders LoginForm
- `src/components/auth/LoginForm.tsx` — signInWithOtp, inline success state, 30s resend timer, AUTH_ERRORS map, spinner
- `src/components/auth/UserModal.tsx` — User email display, Sign out button, click-outside overlay
- `src/components/layout/Sidebar.tsx` — Added useAuth, UserModal, user avatar trigger in footer

## Decisions Made
- Login layout is a passthrough `<>{children}</>` wrapper so the (app) route group (with sidebar/AppShellClient) is completely bypassed for /login. This matches D-02 and the research recommendation to keep login outside (app).
- User avatar displays the first letter of the user's email as a simple avatar — no SVG person icon needed, gives a personalization signal without complexity.
- `onSignOut` prop in UserModal delegates directly to AuthContext's `signOut` which does `window.location.href = '/login'` (hard redirect to prevent stale router cache — established in Plan 01 decisions).

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None from code changes. The Supabase Auth dashboard "Redirect URLs" must include `http://localhost:3000/auth/callback` — this is a one-time manual step noted in the research. The checkpoint verification step includes a pre-check reminder for this.

## Next Phase Readiness
- Login UI fully implemented and TypeScript-clean
- UserModal and Sidebar updated with sign-out trigger
- Awaiting human verification of end-to-end auth flow (Task 3 checkpoint)
- After checkpoint passes, Phase 02 authentication is complete and Phase 03 can begin

---
*Phase: 02-authentication*
*Completed: 2026-04-01*

## Self-Check: PASSED
- `src/app/login/layout.tsx` — exists
- `src/app/login/page.tsx` — exists
- `src/components/auth/LoginForm.tsx` — exists
- `src/components/auth/UserModal.tsx` — exists
- `src/components/layout/Sidebar.tsx` — modified
- Commits `a67ddd7` and `c9bddcb` verified in git log
