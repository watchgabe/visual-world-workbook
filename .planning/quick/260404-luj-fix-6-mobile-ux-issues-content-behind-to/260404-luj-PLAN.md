---
type: quick
autonomous: true
files_modified:
  - src/app/globals.css
  - src/app/layout.tsx
  - src/components/layout/AppShellClient.tsx
  - src/components/workshop/WorkshopInput.tsx
  - src/components/workshop/WorkshopTextarea.tsx
  - src/components/workshop/OptionSelector.tsx
  - src/app/(app)/modules/playbook/page.tsx
  - src/app/(app)/modules/[slug]/[section]/page.tsx
---

<objective>
Fix 6 mobile UX issues: content behind toolbar, scroll-to-top on nav, smaller margins, prevent iOS zoom on input focus, single-column playbook cards, and loading state for module navigation.

Purpose: Improve mobile experience — these are all polish/usability issues found during device testing.
Output: Better mobile UX across all module pages and playbook.
</objective>

<context>
@src/app/globals.css
@src/app/layout.tsx
@src/components/layout/AppShellClient.tsx
@src/components/layout/MobileTopbar.tsx
@src/components/workshop/WorkshopInput.tsx
@src/components/workshop/WorkshopTextarea.tsx
@src/components/workshop/OptionSelector.tsx
@src/app/(app)/modules/playbook/page.tsx
@src/app/(app)/modules/[slug]/[section]/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix content behind toolbar, smaller mobile margins, prevent iOS zoom, and scroll-to-top</name>
  <files>
    src/app/globals.css
    src/app/layout.tsx
    src/components/layout/AppShellClient.tsx
    src/components/workshop/WorkshopInput.tsx
    src/components/workshop/WorkshopTextarea.tsx
    src/components/workshop/OptionSelector.tsx
  </files>
  <action>
    **Issue 1 — Content behind toolbar:**
    In `AppShellClient.tsx`, the content wrapper uses `pt-[var(--topbar-h)]` but also has `p-6` which only adds 1.5rem (24px) on all sides. The `pt-[var(--topbar-h)]` (48px) should be additive. Currently `p-6` sets `padding: 1.5rem` which is then overridden by `pt-[var(--topbar-h)]` for top only. This should be working, but the `<main>` has `style={{ height: '100vh' }}` and `overflow-y: auto` — the scroll container is the `<main>`, not the window. The `pt-[var(--topbar-h)]` is on the inner div but the main itself starts at position 0. The MobileTopbar is `fixed top-0` with z-200, and main starts at top of viewport. The inner div padding should push content below the topbar.

    Investigate: The issue may be that `overflow: hidden` on body (line 58 of globals.css) plus `height: 100vh` on main creates a scroll container where the fixed topbar overlaps. The fix: ensure the inner content div in AppShellClient has enough top padding. Change the mobile padding from `pt-[var(--topbar-h)]` to `pt-[calc(var(--topbar-h)+0.75rem)]` so there is breathing room between toolbar and content start. On desktop, `md:pt-0` stays as-is since there is no topbar.

    **Issue 2 — Scroll to top on navigation:**
    In `AppShellClient.tsx`, since the scroll container is `<main>` (not the window), Next.js automatic scroll restoration does not apply. Add a `usePathname()` hook and a `useEffect` that scrolls the `<main>` element to top when pathname changes. Use a ref on the `<main>` element: `const mainRef = useRef<HTMLDivElement>(null)` and in useEffect: `mainRef.current?.scrollTo(0, 0)`.

    **Issue 3 — Smaller mobile margins:**
    In `AppShellClient.tsx`, the inner content div currently uses `p-6` (24px all sides). Change to `px-3 py-4 md:p-6` so mobile gets 12px horizontal / 16px vertical padding, desktop stays at 24px. Combined with the topbar padding fix above, the full mobile classes become: `pt-[calc(var(--topbar-h)+0.75rem)] md:pt-0 px-3 py-4 md:p-6`.

    Wait — `p-6` sets all sides to 24px, then the `pt-[var(--topbar-h)]` overrides top. For mobile we want: top = topbar-h + small gap, sides = 12px, bottom = 16px. For desktop: all sides 24px, top = 0 (no topbar). Use: `pt-[calc(var(--topbar-h)+0.75rem)] pb-4 px-3 md:pt-6 md:pb-6 md:px-6`.

    **Issue 4 — Prevent iOS zoom on input focus:**
    iOS Safari zooms when input font-size is below 16px. Two approaches:
    - Option A: Set `maximum-scale=1` in viewport meta (prevents ALL pinch-zoom — bad for accessibility).
    - Option B: Set font-size to 16px on inputs on mobile only.

    Use Option B (better accessibility). In `globals.css`, add a media query:
    ```css
    @media (max-width: 768px) {
      input, textarea, select {
        font-size: 16px !important;
      }
    }
    ```
    This overrides the 13px fontSize in WorkshopInput, WorkshopTextarea, and OptionSelector on mobile without touching each component file. The `!important` is needed because those components use inline styles.
  </action>
  <verify>
    Run `npx next build` — no build errors. Visually confirm on mobile: content is not behind toolbar, scroll resets on navigation, margins are tighter, inputs do not trigger zoom.
  </verify>
  <done>
    - Mobile content starts below the toolbar with a small gap
    - Navigating between sections scrolls to top
    - Mobile horizontal margins are 12px instead of 24px
    - Input focus on mobile does not trigger iOS zoom (font-size >= 16px)
  </done>
</task>

<task type="auto">
  <name>Task 2: Single-column playbook cards on mobile and module loading state</name>
  <files>
    src/app/(app)/modules/playbook/page.tsx
    src/app/(app)/modules/[slug]/[section]/page.tsx
  </files>
  <action>
    **Issue 5 — Single-column playbook cards on mobile:**
    In `playbook/page.tsx`, there are many grid layouts using inline styles like `gridTemplateColumns: '1fr 1fr'`, `repeat(3, 1fr)`, and `repeat(4, 1fr)`. These do not respond to screen size since they are inline styles.

    Add a CSS class in `globals.css` for responsive playbook grids. But since these are inline styles, the cleanest fix is a global CSS media query override for grids inside the playbook page.

    Add to `globals.css`:
    ```css
    /* Playbook: single column on mobile */
    @media (max-width: 768px) {
      .playbook-grid-responsive {
        grid-template-columns: 1fr !important;
      }
    }
    ```

    Then in `playbook/page.tsx`, add `className="playbook-grid-responsive"` to every grid div that uses `gridTemplateColumns` with 2+ columns. This includes:
    - All `1fr 1fr` grids (the FieldCard pair rows)
    - All `repeat(3, 1fr)` grids (PillarCard/value grids)
    - All `repeat(4, 1fr)` grids (metadata row, chapter nav)

    Search for all occurrences of `gridTemplateColumns` in the file and add the className to each. The inline style still applies on desktop; the CSS class overrides to single column on mobile via `!important`.

    **Issue 6 — Loading state for module navigation:**
    Currently sections use `next/dynamic` without a `loading` option, so there is no feedback while the dynamic import resolves. Two complementary fixes:

    A) Add a `loading.tsx` file at `src/app/(app)/modules/[slug]/[section]/loading.tsx` that shows a simple skeleton/spinner. This handles the server-side route transition delay. Content:
    ```tsx
    export default function SectionLoading() {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '40vh',
          color: 'var(--dimmer)',
          fontSize: '14px',
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid var(--border2)',
            borderTopColor: 'var(--orange)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
        </div>
      )
    }
    ```

    Add a `@keyframes spin` rule to `globals.css`:
    ```css
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    ```

    B) In `[section]/page.tsx`, add a `loading` option to each `dynamic()` call. Create a shared loading component inline at the top of the file:
    ```tsx
    function SectionSkeleton() {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '40vh',
          color: 'var(--dimmer)',
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid var(--border2)',
            borderTopColor: 'var(--orange)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }} />
        </div>
      )
    }
    ```

    Then update the dynamic imports to include loading:
    ```tsx
    dynamic(() => import('@/components/sections/brand-foundation/overview'), { loading: () => <SectionSkeleton /> })
    ```

    Apply this to ALL entries in SECTION_REGISTRY. The `loading.tsx` handles route-level transitions while the `dynamic({ loading })` handles the client-side chunk load.

    Also add a `loading.tsx` at `src/app/(app)/modules/[slug]/loading.tsx` for module-level navigation (when clicking a module in sidebar, before redirect to first section).
  </action>
  <verify>
    Run `npx next build` — no build errors. On mobile, playbook page shows single-column cards. When clicking a module link, a spinner appears immediately instead of a blank page.
  </verify>
  <done>
    - Playbook FieldCard grids display as single column on mobile screens
    - Clicking a module/section shows a loading spinner immediately while content loads
    - Loading state appears for both route transitions and dynamic imports
  </done>
</task>

</tasks>

<verification>
- `npx next build` completes without errors
- Mobile viewport: content does not overlap with toolbar
- Mobile viewport: navigating between sections scrolls to top
- Mobile viewport: horizontal margins are visibly smaller than desktop
- Mobile viewport: tapping an input does not trigger zoom
- Mobile viewport: playbook cards are single column
- Clicking a module shows loading state before content appears
</verification>

<success_criteria>
All 6 mobile UX issues are resolved. Build passes. No regressions on desktop layout.
</success_criteria>
