---
phase: 06
slug: admin-dashboard
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-02
---

# Phase 06 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification + structural checks |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Nyquist Compliance Rationale

This phase builds a server-side admin dashboard with role-based access, user listing via Supabase admin API, expandable detail rows, Circle.so badge awarding, and user deletion. All features require a running Supabase instance with real auth.users data to verify meaningfully. Structural checks (TypeScript compilation, grep for key patterns) plus manual walkthrough are the appropriate verification strategy.

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual check
- **Before `/gsd:verify-work`:** Build must pass, manual admin walkthrough
- **Max feedback latency:** 30 seconds

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Non-admin redirected from /admin | ADMIN-01 | Requires Supabase auth | Login as non-admin, navigate to /admin, verify redirect |
| User list with email and last seen | ADMIN-02 | Requires Supabase admin API | Login as admin, verify user table loads |
| Expandable user detail with progress | ADMIN-03 | Requires saved user data | Click user row, verify progress bars and answers |
| Circle badge award | ADMIN-04 | Requires Circle API | Enter Circle key, trigger badge, verify response |
| Delete user + confirmation | ADMIN-05 | Destructive action | Click delete, confirm dialog, verify user removed |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands (tsc/grep structural checks)
- [x] Sampling continuity: structural checks after every task
- [x] Wave 0 not needed — rationale documented
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter with rationale

**Approval:** approved (structural + manual verification strategy)
