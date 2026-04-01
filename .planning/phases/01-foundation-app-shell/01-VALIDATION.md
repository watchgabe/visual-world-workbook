---
phase: 1
slug: foundation-app-shell
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-01
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | build-only (no unit test framework in Phase 1) |
| **Config file** | N/A — `npm run build` with TypeScript strict mode is the automated check |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~15 seconds |

### Wave 0 Rationale

Phase 1 is pure scaffolding: project setup, Supabase client modules, CSS tokens, layout components, and placeholder pages. There is no business logic with defined I/O to unit test. The meaningful automated verification is:

1. **`npm run build`** — TypeScript strict mode catches type errors, import resolution failures, and JSX issues across all files.
2. **Human checkpoint (01-02 Task 3)** — Visual fidelity and interaction verification for the app shell.

Unit test infrastructure (Vitest) will be introduced in Phase 3 (Component Library & Data Hooks) where business logic and data hooks provide testable behavior. This avoids installing test tooling that sits unused for two phases.

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Build must pass + human checkpoint approved
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 01-01-T1 | 01 | 1 | DEPLOY-02 | build | `npm run build` | pending |
| 01-01-T2 | 01 | 1 | DATA-01, DATA-02 | build | `npm run build` | pending |
| 01-01-T3 | 01 | 1 | NAV-05 (foundation) | build | `npm run build` | pending |
| 01-02-T1 | 02 | 2 | NAV-01, NAV-06 | build | `npm run build` | pending |
| 01-02-T2 | 02 | 2 | NAV-02 | build | `npm run build` | pending |
| 01-02-T3 | 02 | 2 | NAV-01, NAV-05, NAV-06 | human | Visual + interaction check | pending |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Theme toggle survives refresh | NAV-05 | Requires browser cookie + full reload | Toggle theme, refresh browser, verify theme persists |
| Sidebar hamburger on mobile | NAV-06 | Requires viewport resize | Resize to <768px, verify hamburger appears and sidebar slides |
| Supabase schema applied | DATA-02 | Requires Supabase dashboard | Run SQL in Supabase Studio, check table exists |
| App shell loads visually | NAV-01 | Visual verification | `npm run dev` and check sidebar + topbar + main area render |
| Desktop topbar layout | D-06 | Visual verification | Check brand left, progress center, theme toggle right |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify (`npm run build`)
- [x] Sampling continuity: every task runs build check
- [x] Wave 0 not needed — no unit-testable logic in Phase 1 (build-only approach)
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (build-only for scaffolding phase)
