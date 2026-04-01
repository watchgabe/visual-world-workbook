---
phase: 01-foundation-app-shell
plan: 02
subsystem: ui
tags: [next.js, react, tailwind, layout, sidebar, topbar, theme, routing]

# Dependency graph
requires:
  - phase: 01-foundation-app-shell/01-01
    provides: globals.css with CSS tokens, src/lib/modules.ts with MODULES array, root layout with cookie theme reading

provides:
  - Three-panel app shell (sidebar + desktop topbar + main content area)
  - Mobile-responsive sidebar with hamburger menu and dark overlay
  - Cookie-backed dark/light theme toggle (ThemeToggle component)
  - Desktop topbar with brand mark, progress bar, theme toggle per D-06
  - Dynamic /modules/[slug] route for all 6 modules
  - Root redirect from / to /modules/welcome
  - AppShellClient managing mobile sidebar open/close state

affects:
  - Phase 2 (auth) - will wrap this shell with auth middleware
  - Phase 3 (context) - ProgressContext will wire into ProgressBar component
  - Phase 5 (content) - module pages inside this shell

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server component layout reads cookie, passes theme to client shell
    - AppShellClient owns sidebar open state; Sidebar/MobileTopbar receive props
    - ThemeToggle writes document.cookie then calls router.refresh()
    - CSS variables (not Tailwind dark: classes) for all design tokens
    - Tailwind responsive classes for breakpoint-specific display (hidden md:flex, flex md:hidden)

key-files:
  created:
    - src/app/(app)/layout.tsx
    - src/components/layout/AppShellClient.tsx
    - src/components/layout/Sidebar.tsx
    - src/components/layout/Topbar.tsx
    - src/components/layout/MobileTopbar.tsx
    - src/components/layout/ThemeToggle.tsx
    - src/components/layout/ProgressBar.tsx
    - src/app/(app)/modules/[slug]/page.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "AppShellClient pattern: thin client wrapper owns mobile state, both Sidebar and MobileTopbar receive props from it — avoids need for context for simple open/close state"
  - "Sidebar does not contain theme toggle — desktop puts toggle in Topbar, mobile in MobileTopbar (matches old app per D-06)"
  - "currentTheme passed as prop through the tree (not via context) — appropriate for this phase; ThemeContext in Phase 3 will replace this"
  - "generateStaticParams pre-renders all 6 module slugs at build time"

patterns-established:
  - "AppShellClient pattern: server layout reads cookie -> passes to client wrapper -> client manages interactive state"
  - "ThemeToggle: document.cookie write + router.refresh() — no flash, no SSR mismatch"
  - "Responsive layout: ml-0 md:ml-[280px] on main, hidden md:flex on desktop topbar, flex md:hidden on mobile topbar"

requirements-completed: [NAV-01, NAV-02, NAV-05, NAV-06]

# Metrics
duration: 25min
completed: 2026-04-01
---

# Phase 01 Plan 02: App Shell Summary

**Three-panel app shell with pixel-faithful sidebar, cookie-backed theme toggle, mobile hamburger menu, and dynamic module routing for all 6 modules**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-01T20:35:00Z
- **Completed:** 2026-04-01T21:00:00Z
- **Tasks:** 2 of 3 (Task 3 is checkpoint:human-verify)
- **Files modified:** 9

## Accomplishments

- App shell renders with sidebar (280px fixed desktop), desktop topbar (brand + progress + toggle), and main content area
- Mobile sidebar with slide-from-left animation, dark overlay, and hamburger toggle
- Cookie-backed theme toggle writes `blp-theme` cookie and calls `router.refresh()` — no hydration flash
- All 6 module routes accessible at `/modules/{slug}` with static pre-rendering
- Root `/` redirects to `/modules/welcome`
- Build passes clean (0 TypeScript errors) with all 6 module paths generated

## Task Commits

1. **Task 1: App shell layout, sidebar, topbar, mobile topbar, theme toggle** - `73541fc` (feat)
2. **Task 2: Module placeholder page and root redirect** - `71fb6e0` (feat)

## Files Created/Modified

- `src/app/(app)/layout.tsx` - Server layout reads blp-theme cookie, passes to AppShellClient
- `src/components/layout/AppShellClient.tsx` - Client wrapper owning sidebar open/close state
- `src/components/layout/Sidebar.tsx` - Sidebar with 6 modules, 0% badges, slide animation
- `src/components/layout/Topbar.tsx` - Desktop topbar with brand, progress bar, theme toggle
- `src/components/layout/MobileTopbar.tsx` - Mobile topbar with hamburger, brand, theme toggle
- `src/components/layout/ThemeToggle.tsx` - Cookie write + router.refresh() on click
- `src/components/layout/ProgressBar.tsx` - Progress bar component with percent prop
- `src/app/(app)/modules/[slug]/page.tsx` - Dynamic module placeholder with notFound() validation
- `src/app/page.tsx` - Updated to redirect to /modules/welcome

## Decisions Made

- AppShellClient thin-wrapper pattern used instead of Context for sidebar state — appropriate for single boolean, no over-engineering
- `currentTheme` prop name used consistently across all components (not `theme`) per plan spec
- Sidebar does not use `currentTheme` prop internally (styling via CSS vars) — unused prop removed from destructure to satisfy ESLint
- `generateStaticParams` added to module page to pre-render all 6 slugs at build time

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `currentTheme` prop from Sidebar destructure**
- **Found during:** Task 1 build verification
- **Issue:** `_currentTheme` named parameter caused ESLint `no-unused-vars` error, blocking build
- **Fix:** Removed unused destructured variable from Sidebar function signature (Sidebar uses CSS variables directly for theming, not the prop)
- **Files modified:** src/components/layout/Sidebar.tsx
- **Verification:** `npm run build` exits 0
- **Committed in:** 73541fc (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug fix)
**Impact on plan:** Minimal — Sidebar correctly uses CSS custom properties for theming; prop interface retained on SidebarProps type for forward compatibility.

## Issues Encountered

- ESLint `no-unused-vars` on `_currentTheme` in Sidebar — fixed by removing from destructure. Sidebar renders correctly using CSS vars for all color tokens.

## Known Stubs

- `ProgressBar` always shows `percent={0}` (hardcoded) — intentional per D-05/D-06. Will be wired to ProgressContext in Phase 3.
- Module pages show "Content will be added in Phase 5." placeholder — intentional per plan.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- App shell is navigable and visually complete; ready for Phase 2 auth integration
- Phase 2 will add middleware, login page, and Supabase auth wrapping this shell
- Phase 3 will wire ProgressContext into ProgressBar, replacing the hardcoded 0%
- Checkpoint Task 3 requires human visual verification before this plan is fully closed

---
*Phase: 01-foundation-app-shell*
*Completed: 2026-04-01*
