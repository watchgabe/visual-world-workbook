---
phase: 05-module-migration
plan: 01
subsystem: routing
tags: [next.js, routing, dynamic-imports, module-sections, auto-save, testing]

# Dependency graph
requires:
  - phase: 03-component-library-data-hooks
    provides: useAutoSave hook, SectionNav component, SectionWrapper, ProgressContext
  - phase: 02-authentication
    provides: AuthContext, middleware auth protection
provides:
  - Module section URL routing infrastructure ([slug]/[section]/page.tsx)
  - MODULE_SECTIONS config defining all 4 workshop module section structures
  - useAutoSave extended with getFullResponses callback for safe full-response upserts
  - SectionNav wired to URL routing via module layout.tsx
  - Sidebar ProgressBar wired to real overallProgress
  - Welcome page static content migrated 1:1 from old HTML
  - 7 test stub files (36 todo tests) for Wave 0 Nyquist compliance
affects: [05-02, 05-03, 05-04, 05-05, 05-06]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Static registry pattern for dynamic section routing (SECTION_REGISTRY in [slug]/[section]/page.tsx)"
    - "Module layout.tsx client component reads useParams + usePathname to wire SectionNav to URL"
    - "getFullResponses callback pattern in useAutoSave for multi-field sections"

key-files:
  created:
    - src/app/(app)/modules/[slug]/layout.tsx
    - src/app/(app)/modules/[slug]/[section]/page.tsx
    - src/components/sections/ (base directory for section components)
    - tests/modules/welcome.test.tsx
    - tests/modules/brand-foundation.test.tsx
    - tests/modules/visual-world.test.tsx
    - tests/modules/content.test.tsx
    - tests/modules/launch.test.tsx
    - tests/modules/playbook.test.tsx
    - tests/modules/section-routing.test.tsx
  modified:
    - src/app/(app)/modules/[slug]/page.tsx
    - src/app/(app)/modules/welcome/page.tsx
    - src/hooks/useAutoSave.ts
    - src/lib/modules.ts
    - src/components/layout/Sidebar.tsx
    - src/components/workshop/SectionWrapper.tsx

key-decisions:
  - "Static SECTION_REGISTRY in [section]/page.tsx instead of template-literal dynamic imports — webpack requires base directory to exist at build time, static registry avoids this constraint"
  - "MODULE_SECTIONS field arrays left empty — Plans 02-05 populate field keys when building section components"
  - "module [slug]/page.tsx now redirects to first section for modules with sections; welcome and playbook fall through to dedicated routes"

patterns-established:
  - "Section component convention: default export from src/components/sections/{slug}/{section-slug}.tsx"
  - "Plans 02-05 add SECTION_REGISTRY entries in [slug]/[section]/page.tsx when creating section components"
  - "getFullResponses callback passed to useAutoSave to prevent partial field overwrites"

requirements-completed: [NAV-03, NAV-04, MOD-01]

# Metrics
duration: 20min
completed: 2026-04-02
---

# Phase 5 Plan 01: Module Routing Infrastructure Summary

**Section URL routing via static component registry, SectionNav wired to URL, MODULE_SECTIONS config for all 4 workshop modules, and Welcome page migrated from old HTML**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-04-02T10:58:00Z
- **Completed:** 2026-04-02T11:08:00Z
- **Tasks:** 4 (Task 0 + Task 1 + Task 2 + Task 3)
- **Files modified:** 14

## Accomplishments

- Created 7 test stub files with 36 todo tests for Wave 0 Nyquist compliance (MOD-01 through MOD-06, NAV-03)
- Extended useAutoSave with `getFullResponses` callback preventing partial field overwrites when saving multi-field sections
- Added MODULE_SECTIONS config defining section slugs/names for brand-foundation (8), visual-world (6), content (6), launch (7)
- Built module routing: [slug]/layout.tsx with SectionNav, [slug]/page.tsx redirecting to first section, [slug]/[section]/page.tsx dispatching via SECTION_REGISTRY
- Wired Sidebar ProgressBar to real `overallProgress` from ProgressContext (was hardcoded to 0)
- Migrated Welcome page 1:1 from old HTML: intro text, 5 module cards, quote block, Brand Launch Sprint CTA

## Task Commits

Each task was committed atomically:

1. **Task 0: Wave 0 test stubs** - `557c91e` (test)
2. **Task 1: useAutoSave + MODULE_SECTIONS** - `6c02d98` (feat)
3. **Task 2: Module layout + routing + sidebar** - `3aeeba3` (feat)
4. **Task 3: Welcome page migration** - `75d5c84` (feat)
5. **Deviation fix: section router + SectionWrapper** - `b4f2321` (fix)

## Files Created/Modified

- `tests/modules/*.test.tsx` (7 files) - Wave 0 todo test stubs for all module requirements
- `src/hooks/useAutoSave.ts` - Added `getFullResponses` callback option to prevent partial overwrites
- `src/lib/modules.ts` - Added `SectionDef` interface and `MODULE_SECTIONS` export
- `src/app/(app)/modules/[slug]/layout.tsx` - Client layout with SectionNav wired to URL routing
- `src/app/(app)/modules/[slug]/page.tsx` - Redirects to first section for sectioned modules
- `src/app/(app)/modules/[slug]/[section]/page.tsx` - SECTION_REGISTRY dispatcher for all module sections
- `src/app/(app)/modules/welcome/page.tsx` - Full welcome content migrated from old HTML
- `src/components/layout/Sidebar.tsx` - ProgressBar now uses `overallProgress` from ProgressContext
- `src/components/sections/` - Base directory for section components (Plans 02-05)
- `src/components/workshop/SectionWrapper.tsx` - Added eslint-disable for intentional unused param

## Decisions Made

- **Static SECTION_REGISTRY over template-literal dynamic imports:** Webpack's static analysis requires the base directory to exist at build time. Template literal `import(\`@/components/sections/${slug}/${section}\`)` fails when the directory is empty. Static registry is explicit and reliable — Plans 02-05 add `dynamic()` entries as they create section components.
- **MODULE_SECTIONS field arrays empty:** Populated by Plans 02-05 when implementing section components — section slugs/names needed now for routing, field keys deferred.
- **Welcome page as server component:** Static content needs no client-side state — no `'use client'` directive, no hooks.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Switched section router from template-literal dynamic imports to static SECTION_REGISTRY**
- **Found during:** Task 2 verification (next build)
- **Issue:** `import(\`@/components/sections/${slug}/${section}\`)` causes webpack build failure — "Module not found: Can't resolve '@/components/sections'" because the directory doesn't exist yet and webpack requires it for static analysis
- **Fix:** Changed to `SECTION_REGISTRY` pattern — a static Record mapping `slug/section` keys to `dynamic()` imports. Plans 02-05 add entries as they build section components. Created `src/components/sections/` base directory.
- **Files modified:** `src/app/(app)/modules/[slug]/[section]/page.tsx`, `src/components/sections/`
- **Verification:** `next build` succeeds
- **Committed in:** `b4f2321`

**2. [Rule 1 - Bug] Fixed pre-existing SectionWrapper ESLint error blocking build**
- **Found during:** Task 2 verification (next build)
- **Issue:** `SectionWrapper.tsx:31` had `_moduleSlug` param triggering `@typescript-eslint/no-unused-vars` ESLint error — pre-existing but blocking `next build`
- **Fix:** Added `// eslint-disable-next-line @typescript-eslint/no-unused-vars` comment above the destructured parameter (intentionally unused, prefixed with `_`)
- **Files modified:** `src/components/workshop/SectionWrapper.tsx`
- **Verification:** Build passes
- **Committed in:** `b4f2321`

---

**Total deviations:** 2 auto-fixed (both Rule 1 - Bug)
**Impact on plan:** Both fixes necessary for correct build. The registry pattern is strictly better than template literal approach for this use case. No scope creep.

## Issues Encountered

- next/dynamic with template literal imports failed at build time — needed static registry pattern (see Deviations above)

## Known Stubs

- `SECTION_REGISTRY` in `src/app/(app)/modules/[slug]/[section]/page.tsx` is empty — all entries commented out. Plans 02-05 must add `dynamic()` imports per section component. Navigating to any `/modules/{slug}/{section}` URL currently returns 404 until those entries are added.
- `MODULE_SECTIONS` field arrays are empty — Plans 02-05 populate field keys.

These stubs are intentional: this plan's goal is routing infrastructure, not section content. Plans 02-05 resolve them.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All routing infrastructure in place — Plans 02-05 only need to create `src/components/sections/{slug}/{section-slug}.tsx` files and add `SECTION_REGISTRY` entries
- Test stubs ready for Plans 02-05 to convert to real implementations
- `getFullResponses` callback available in `useAutoSave` for safe multi-field saves
- Sidebar progress now live once users start completing module sections

## Self-Check: PASSED

- tests/modules/welcome.test.tsx: FOUND
- tests/modules/brand-foundation.test.tsx: FOUND
- tests/modules/visual-world.test.tsx: FOUND
- tests/modules/content.test.tsx: FOUND
- tests/modules/launch.test.tsx: FOUND
- tests/modules/playbook.test.tsx: FOUND
- tests/modules/section-routing.test.tsx: FOUND
- src/app/(app)/modules/[slug]/layout.tsx: FOUND
- src/app/(app)/modules/[slug]/page.tsx: FOUND
- src/app/(app)/modules/[slug]/[section]/page.tsx: FOUND
- src/app/(app)/modules/welcome/page.tsx: FOUND
- src/hooks/useAutoSave.ts: FOUND
- src/lib/modules.ts: FOUND
- src/components/layout/Sidebar.tsx: FOUND
- Commits 557c91e, 6c02d98, 3aeeba3, 75d5c84, b4f2321: ALL FOUND

---
*Phase: 05-module-migration*
*Completed: 2026-04-02*
