---
type: quick
id: 260404-luj
date: "2026-04-04"
duration: 15
tasks_completed: 2
files_changed: 7
commits:
  - 067bcd9
  - 87f672c
tags: [mobile, ux, responsive, loading, ios, scroll]
key_files:
  created:
    - src/app/(app)/modules/[slug]/[section]/loading.tsx
    - src/app/(app)/modules/[slug]/loading.tsx
  modified:
    - src/app/globals.css
    - src/components/layout/AppShellClient.tsx
    - src/app/(app)/modules/playbook/page.tsx
    - src/app/(app)/modules/[slug]/[section]/page.tsx
decisions:
  - "CSS @keyframes spin in globals.css (not inline) — shared across loading.tsx and SectionSkeleton"
  - "playbook-grid-responsive CSS class overrides inline gridTemplateColumns on mobile — avoids touching all inline style objects"
  - "AppShellClient uses mainRef.current?.scrollTo(0,0) instead of window.scrollTo — main is the scroll container (height:100vh overflow-y-auto), not the window"
---

# Quick Task 260404-luj Summary

**One-liner:** Six mobile UX fixes — toolbar overlap, scroll-to-top on nav, tighter margins, iOS zoom prevention, single-column playbook grids, and spinner loading states for dynamic imports.

## Tasks Completed

### Task 1: Fix content behind toolbar, smaller mobile margins, prevent iOS zoom, scroll-to-top

**Files:** `src/app/globals.css`, `src/components/layout/AppShellClient.tsx`

- `AppShellClient.tsx`: Changed inner content div padding from `pt-[var(--topbar-h)] p-6` to `pt-[calc(var(--topbar-h)+0.75rem)] pb-4 px-3 md:pt-6 md:pb-6 md:px-6` — clears topbar with a small breathing gap on mobile, tighter horizontal margins (12px vs 24px)
- `AppShellClient.tsx`: Added `useRef<HTMLDivElement>` on `<main>` and `useEffect([pathname])` calling `mainRef.current?.scrollTo(0,0)` — scrolls the actual scroll container (not window) on route change
- `globals.css`: Added `@media (max-width: 768px) { input, textarea, select { font-size: 16px !important } }` — prevents iOS Safari zoom on focus
- `globals.css`: Added `.playbook-grid-responsive` media query and `@keyframes spin` for loading spinners

**Commit:** 067bcd9

### Task 2: Single-column playbook cards on mobile, module loading states

**Files:** `src/app/(app)/modules/playbook/page.tsx`, `src/app/(app)/modules/[slug]/[section]/page.tsx`, two new `loading.tsx` files

- `playbook/page.tsx`: Added `className="playbook-grid-responsive"` to all 25+ multi-column grid divs (1fr 1fr, repeat(3,1fr), repeat(4,1fr)) — CSS class overrides inline `gridTemplateColumns` to 1fr on mobile via `!important`
- `[section]/page.tsx`: Added `SectionSkeleton` component and `{ loading: () => <SectionSkeleton /> }` to all 30 `dynamic()` calls in `SECTION_REGISTRY`
- `[section]/loading.tsx`: New Next.js route-level loading UI — spinner shown during server-side route transition to a section
- `[slug]/loading.tsx`: New Next.js route-level loading UI — spinner shown when navigating to a module before redirect to first section

**Commit:** 87f672c

## Verification

Build result: `npx next build` — compiled successfully, 18 static pages generated, no errors. Only pre-existing warnings (custom font link tag, img elements in cinematic-content and typography — out of scope).

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files confirmed created/modified:
- src/app/globals.css — modified
- src/components/layout/AppShellClient.tsx — modified
- src/app/(app)/modules/playbook/page.tsx — modified
- src/app/(app)/modules/[slug]/[section]/page.tsx — modified
- src/app/(app)/modules/[slug]/[section]/loading.tsx — created
- src/app/(app)/modules/[slug]/loading.tsx — created

Commits confirmed:
- 067bcd9 — fix(260404-luj): toolbar overlap, scroll-to-top, mobile margins, iOS zoom
- 87f672c — fix(260404-luj): single-column playbook cards on mobile, section loading state
