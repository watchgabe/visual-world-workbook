---
phase: quick
plan: 260403-esz
subsystem: auth-ui
tags: [auth, login, user-metadata, sidebar, modal]
dependency_graph:
  requires: []
  provides: [name-in-login, name-in-sidebar, name-in-user-modal]
  affects: [LoginForm, Sidebar, UserModal]
tech_stack:
  added: []
  patterns: [signInWithOtp data option, user_metadata.full_name]
key_files:
  created: []
  modified:
    - src/components/auth/LoginForm.tsx
    - src/components/layout/Sidebar.tsx
    - src/components/auth/UserModal.tsx
decisions:
  - Only pass full_name in signInWithOtp data when name is non-empty to avoid overwriting existing metadata with empty string
  - Submit button disabled logic unchanged — name is truly optional, only email required
metrics:
  duration: 8
  completed_date: "2026-04-03"
  tasks: 2
  files: 3
---

# Quick Task 260403-esz: Add Optional Name Field to Login Form Summary

**One-liner:** Optional name field on login passes full_name to Supabase user_metadata; sidebar avatar and UserModal display name when available.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add optional name field to LoginForm | ae697e0 | src/components/auth/LoginForm.tsx |
| 2 | Update Sidebar avatar and UserModal to display name | 2dcf6bb | src/components/layout/Sidebar.tsx, src/components/auth/UserModal.tsx |

## What Was Built

**LoginForm.tsx:**
- Added `name` state variable (empty string default)
- Added name input field above email with matching styling (12px uppercase label with "(optional)" in normal weight, same border/focus/blur transitions)
- `signInWithOtp` now passes `data: { full_name: name.trim() }` when name is non-empty; passes `undefined` when empty to avoid overwriting existing metadata
- Submit button still only requires email — name is genuinely optional

**Sidebar.tsx:**
- Avatar initial now prefers `user.user_metadata?.full_name[0]` over email initial
- `UserModal` receives `name={user.user_metadata?.full_name ?? undefined}` prop

**UserModal.tsx:**
- `UserModalProps` interface extended with optional `name?: string`
- When name is present: shows name as bold primary line (13px, fontWeight 600) with email below as secondary (12px, var(--dim))
- When name is absent: shows email only as before (13px, var(--text))
- Both lines have overflow/ellipsis/nowrap and title attributes for long values

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None. All data flows are wired: name input -> state -> signInWithOtp data -> Supabase user_metadata -> sidebar reads user_metadata.full_name -> UserModal displays it.

## Self-Check: PASSED

- src/components/auth/LoginForm.tsx: modified with name field and data option
- src/components/layout/Sidebar.tsx: modified with user_metadata.full_name avatar logic
- src/components/auth/UserModal.tsx: modified with name prop and conditional display
- Commit ae697e0: Task 1
- Commit 2dcf6bb: Task 2
- Build: passed clean (no TypeScript errors)
