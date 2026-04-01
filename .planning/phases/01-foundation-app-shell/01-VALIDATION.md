---
phase: 1
slug: foundation-app-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (or jest 29.x — planner decides) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DATA-01 | unit | `npm test` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | DATA-02 | manual | SQL check in Supabase | N/A | ⬜ pending |
| 01-03-01 | 03 | 1 | NAV-01 | e2e | `npm run dev` visual | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 | 1 | NAV-02 | unit | `npm test` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 1 | NAV-05 | manual | Cookie + refresh test | N/A | ⬜ pending |
| 01-03-04 | 03 | 1 | NAV-06 | manual | Viewport resize test | N/A | ⬜ pending |
| 01-01-02 | 01 | 1 | DEPLOY-02 | unit | `npx tsc --noEmit` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test framework install (vitest or jest)
- [ ] Test config file (vitest.config.ts or jest.config.ts)
- [ ] Basic test stubs for Supabase client imports

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Theme toggle survives refresh | NAV-05 | Requires browser cookie + full reload | Toggle theme, refresh browser, verify theme persists |
| Sidebar hamburger on mobile | NAV-06 | Requires viewport resize | Resize to <768px, verify hamburger appears and sidebar slides |
| Supabase schema applied | DATA-02 | Requires Supabase dashboard | Check tables exist in Supabase Studio |
| App shell loads visually | NAV-01 | Visual verification | `npm run dev` and check sidebar + topbar + main area render |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
