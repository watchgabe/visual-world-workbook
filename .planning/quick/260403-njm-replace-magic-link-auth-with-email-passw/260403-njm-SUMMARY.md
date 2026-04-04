---
phase: quick
plan: 260403-njm
subsystem: auth
tags: [auth, login, supabase, email-password]
dependency_graph:
  requires: []
  provides: [email-password-auth]
  affects: [src/components/auth/LoginForm.tsx, src/app/login/page.tsx]
tech_stack:
  added: []
  patterns: [supabase.auth.signUp, supabase.auth.signInWithPassword, window.location.href hard redirect]
key_files:
  created: []
  modified:
    - src/components/auth/LoginForm.tsx
    - src/app/login/page.tsx
  deleted:
    - src/app/auth/callback/route.ts
decisions:
  - "window.location.href hard redirect on signIn/signUp — consistent with existing signOut pattern, ensures clean Next.js router cache"
  - "Name field shown only in signup mode — reduces form complexity for returning users"
  - "Error messages mapped from Supabase error text patterns — invalid_credentials, user_exists, rate_limit, unknown"
metrics:
  duration: 10
  completed_date: "2026-04-03"
  tasks_completed: 2
  files_changed: 3
---

# Quick Task 260403-njm: Replace Magic Link Auth with Email+Password Summary

**One-liner:** Email+password sign-up/sign-in with mode toggle, replacing magic link OTP flow and deleting the auth callback route.

## What Was Done

Replaced Supabase magic link (`signInWithOtp`) authentication with email+password (`signUp` / `signInWithPassword`). The login form now presents sign-in mode by default with a toggle to sign-up mode. Sign-up shows an optional name field; sign-in hides it. On success, redirects with `window.location.href` for a clean hard navigation (consistent with the existing `signOut` pattern). The auth callback route that handled magic link code exchange was removed entirely.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Rewrite LoginForm for email+password + update login page copy | 259bd5b | src/components/auth/LoginForm.tsx, src/app/login/page.tsx |
| 2 | Delete auth callback route | 2a72afc | src/app/auth/callback/route.ts (deleted) |

## Verification

- `npx next build` passes cleanly after both tasks
- No references to `signInWithOtp`, `magic link`, `check your email`, or `/auth/callback` in `src/`
- LoginForm.tsx contains both `signUp` (line 43) and `signInWithPassword` (line 70) calls
- `src/app/auth/callback/route.ts` does not exist

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- src/components/auth/LoginForm.tsx exists: FOUND
- src/app/login/page.tsx exists: FOUND
- src/app/auth/callback/route.ts deleted: CONFIRMED
- Commit 259bd5b exists: CONFIRMED
- Commit 2a72afc exists: CONFIRMED
