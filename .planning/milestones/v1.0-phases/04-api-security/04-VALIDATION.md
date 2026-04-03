---
phase: 4
slug: api-security
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (exists from Phase 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | API-01 | integration | `npx vitest run src/app/api/claude` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | API-02 | integration | `npx vitest run src/app/api/circle` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | API-03 | integration | `npx vitest run src/app/api/waterfall` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for API route handlers (mock Supabase auth + fetch)
- [ ] Vitest config already exists — no framework install needed

*Existing vitest infrastructure covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| No API keys in browser network tab | API-01, API-02, API-03 | Requires browser DevTools inspection | Open Network tab, trigger each API call, verify no Supabase URL or keys in request headers/body |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
