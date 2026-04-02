---
phase: 5
slug: module-migration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-02
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (exists from Phase 1) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | NAV-03, NAV-04 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | MOD-01 | smoke | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | MOD-02 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-03-01 | 03 | 2 | MOD-03 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-03-02 | 03 | 2 | MOD-04 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-04-01 | 04 | 2 | MOD-05 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |
| 05-05-01 | 05 | 3 | MOD-06, MOD-07 | integration | `npx vitest run` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Fix useAutoSave partial overwrite risk (full-responses upsert pattern)
- [ ] Module layout with SectionNav wired to nested routes
- [ ] Sidebar ProgressRing integration with ProgressContext
- [ ] Vitest config already exists — no framework install needed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| 1:1 content fidelity | MOD-02 through MOD-05 | Visual comparison of migrated content vs old HTML | Side-by-side comparison of each section in browser vs old app |
| Print view renders cleanly | MOD-07 | Requires browser print preview | Open Playbook, Ctrl+P, verify clean layout with no nav elements |
| Auto-save persists across tab close/reopen | All MOD-* | Requires actual browser tab lifecycle | Type in field, close tab, reopen, verify answer persists |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
