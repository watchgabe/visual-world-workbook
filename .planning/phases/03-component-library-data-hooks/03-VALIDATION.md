---
phase: 3
slug: component-library-data-hooks
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest + @testing-library/react |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 0 | infra | setup | `npx vitest run` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | DATA-03,04 | unit | `npx vitest run useAutoSave` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | DATA-06 | unit | `npx vitest run Context` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | COMP-01 | unit | `npx vitest run WorkshopTextarea` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | COMP-02 | unit | `npx vitest run WorkshopInput` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | COMP-03 | unit | `npx vitest run OptionSelector` | ❌ W0 | ⬜ pending |
| 03-02-04 | 02 | 2 | COMP-04 | unit | `npx vitest run SectionNav` | ❌ W0 | ⬜ pending |
| 03-02-05 | 02 | 2 | COMP-05 | unit | `npx vitest run ProgressRing` | ❌ W0 | ⬜ pending |
| 03-02-06 | 02 | 2 | COMP-06 | unit | `npx vitest run SectionWrapper` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- [ ] Create vitest.config.ts with jsdom environment
- [ ] Create test setup file with @testing-library/jest-dom matchers

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual pixel-fidelity | D-05, D-06 | CSS comparison requires visual inspection | Compare rendered components to old app screenshots |
| Save status on blur | DATA-05, D-01 | Requires live Supabase + browser blur events | Fill field, blur, verify no indicator. Disconnect network, fill, blur, verify error icon |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
