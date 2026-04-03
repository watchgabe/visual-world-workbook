---
phase: 2
slug: authentication
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (or jest — TBD by planner based on existing config) |
| **Config file** | none — Wave 0 installs if needed |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | AUTH-01 | integration | Manual: send magic link, verify email | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | AUTH-02 | integration | Manual: refresh browser, check session | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | AUTH-03 | unit | `npx vitest run middleware` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | AUTH-04 | integration | Manual: click magic link, verify callback | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | AUTH-05 | integration | Manual: click sign out, verify redirect | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test framework installed (vitest or jest) if not already present
- [ ] `src/middleware.test.ts` — stub for AUTH-03 middleware redirect logic
- [ ] Test utilities for mocking Supabase client

*AUTH-03 (middleware redirect) is the only unit-testable requirement. Other AUTH requirements are integration/smoke tests requiring a live Supabase connection.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Magic link email received | AUTH-01 | Requires live Supabase email service | Enter email on login page, check inbox |
| Session persists on refresh | AUTH-02 | Requires browser cookie persistence | Sign in, refresh browser, verify still signed in |
| Auth callback token exchange | AUTH-04 | Requires live Supabase PKCE flow | Click magic link in email, verify redirect to dashboard |
| Sign out redirect | AUTH-05 | Requires live session to destroy | Click sign out in user modal, verify redirect to login |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
