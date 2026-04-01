# Project Research Summary

**Project:** Brand Launch Playbook — Next.js Migration
**Domain:** Course/learning platform — brownfield migration (monolithic HTML/iframe to Next.js App Router)
**Researched:** 2026-04-01
**Confidence:** HIGH

## Executive Summary

This is a brownfield migration of a live course platform from a monolithic `index.html` shell with iframe-loaded module pages to a Next.js 15 App Router application. The platform already ships a complete feature set — 5 course modules, form-based workshops, Supabase-backed progress tracking, AI content generation (Claude), Circle.so badges, and an admin dashboard. The migration goal is structural: eliminate the iframe architecture, unify 4 competing save implementations, replace a client-side admin password with real auth, and move API keys server-side. No new features are planned. Every architectural and tooling decision should be evaluated against this brownfield lens — stability and fidelity over novelty.

The recommended approach is Next.js 15.2.4 (not 16, which has breaking changes) with the `@supabase/ssr` package (not the deprecated `auth-helpers`), Tailwind v4 CSS-first configuration, shadcn/ui for component primitives, `react-hook-form` + Zod v4 for form state, and React Context for the three shared slices of UI state. The build order is strictly dependency-driven: foundation (project scaffold, Supabase clients, types) → auth (middleware, magic link, callback route) → app shell (layout, Context, sidebar) → workshop components (pure UI) → data hooks (useAutoSave, useModuleData) → API route wrappers → module pages one at a time → admin dashboard. Any deviation from this sequence creates work that has to be redone.

The two highest-risk areas are authentication and data persistence. On auth: `getSession()` must never be used for server-side access control — only `getUser()` or `getClaims()`. On data: every module page must set `force-dynamic` and the autosave hook must use AbortController to prevent race conditions that silently overwrite student content. Both of these are easy to get wrong by following outdated documentation, and both are trust-destroying in production. A third risk specific to brownfield migrations is content loss during manual HTML-to-JSX conversion — every module migration must be checklist-verified against the source HTML before being considered done.

---

## Key Findings

### Recommended Stack

The stack is primarily Next.js 15 with Supabase, and the key decisions are all version-pinning decisions driven by the brownfield context. Next.js 16 ships Turbopack-only, renames `middleware.ts` to `proxy.ts`, and requires fully async `cookies()`/`params()` — these changes add risk with no benefit for a migration project. Stay on 15.2.4. Tailwind v4 is correct (CSS-first, no `tailwind.config.js`); if the existing HTML uses v3 syntax, run the upgrade tool at project init. The `@supabase/ssr` package (v0.10.0) replaces the deprecated `auth-helpers` package — this distinction is load-bearing throughout the auth implementation.

**Core technologies:**
- **Next.js 15.2.4**: Full-stack React framework — stay on 15, not 16; brownfield migration risk does not justify breaking changes
- **@supabase/supabase-js 2.101.1**: Supabase client SDK — latest stable, no infrastructure change needed
- **@supabase/ssr 0.10.0**: Cookie-based auth for App Router — replaces deprecated `auth-helpers`; provides `createBrowserClient` / `createServerClient`
- **Tailwind CSS v4**: CSS-first utility styling — upgrade tool handles v3 → v4 migration at project init
- **shadcn/ui (latest CLI)**: Reusable accessible components — copied into project, no bundle penalty; use for Input, Textarea, Select, Progress, Button, Separator
- **react-hook-form 7.72.0**: Form state with debounced watch() — replaces 4 competing save implementations
- **Zod 4.3.6**: Schema validation — import from `zod/v4` subpath; dramatically faster than v3
- **React Context (built-in)**: Shared state for auth, progress, theme — 3 slices, no external library needed
- **Vercel**: Zero-config hosting — first-class Next.js support, environment variable management

### Expected Features

This is a feature-preserving migration. The feature list is fixed. The only question is which features have migration complexity or sequencing constraints.

**Must have (table stakes — all already exist, must survive migration without regression):**
- Persistent progress tracking — currently unreliable (localStorage); must migrate to Supabase-backed state with zero data loss
- Auto-save on all form fields — must unify 4 separate implementations into one debounced hook
- Module/section navigation — improve by replacing iframe loading with App Router
- Mobile-responsive layout — must be preserved in new component system
- Auth / protected access — critical gap in current system (localStorage email only); Supabase magic link fixes this
- Admin dashboard — must port with server-side auth replacing client-side password
- Dark/light theme toggle — migrate to cookie-backed Context (not localStorage) to avoid hydration mismatch
- Print/export of compiled playbook — must survive migration

**Should have (differentiators — high value, already implemented, preserve exactly):**
- AI content generation via Claude — preserve via Next.js API route wrapper over existing edge function
- Circle.so completion badges — preserve via API route wrapper over existing edge function
- Waterfall analyzer — preserve via API route wrapper over existing edge function
- Compiled Playbook module — aggregates all workshop data; depends on centralized Supabase data layer
- Form-based workshops (not video-first) — the core UX model; must be preserved in WorkshopTextarea/OptionSelector components
- Section-based progression with ProgressRing — granular completion tracking; must be preserved

**Defer to v2+:**
- Custom auth email branding — use Supabase default for magic link emails
- Social login (OAuth) — magic link is sufficient; add only if usage data demands it
- Any feature not in the existing platform — scope is strictly 1:1 content fidelity

**Explicit anti-features (do not build):**
- Video hosting, discussion forums, leaderboards, in-app messaging, native app, real-time collab, Stripe payments, new course modules

### Architecture Approach

The target architecture is a standard Next.js App Router application with two route groups: `(auth)` for the login flow (no shell) and `(app)` for the full course shell with sidebar, topbar, and shared layout. The existing monolith's pain points map directly to specific architecture decisions: hardcoded anon keys → server-side API route wrappers; 4 save implementations → single `useAutoSave` hook; iframe navigation → App Router file-based routing; client-side admin password → server-side `getUser()` + role check. There are two Supabase clients — a singleton browser client and a per-request server client — and these must never be mixed. The server/client component split is deliberate: Server Components fetch initial data and pass serializable props; Client Components own interactivity and form state.

**Major components:**
1. **`middleware.ts`** — session refresh on every request; redirect unauthenticated users to `/login`; redirect non-admin users away from `/admin`
2. **`app/(app)/layout.tsx`** (Server Component) — fetches initial session and progress from Supabase server client; passes to client Providers tree
3. **`context/` (AuthContext, ProgressContext, ThemeContext)** — three separate Client Component providers; hold mutable UI-layer state only
4. **`hooks/useAutoSave.ts`** — single debounced upsert with AbortController; replaces all 4 save implementations; exposes `saving` and `flush()`
5. **`hooks/useModuleData.ts`** — loads saved form state and current section position on mount
6. **`components/workshop/`** (WorkshopTextarea, WorkshopInput, OptionSelector, SectionNav, SectionWrapper, ProgressRing) — pure Client Component UI with no data-fetching; receive values via props, emit changes via onChange
7. **`app/api/` route handlers** — server-side proxies for claude-proxy, circle-proxy, waterfall-analyzer edge functions; API keys never reach the browser
8. **`app/(app)/modules/[module]/page.tsx`** (6 pages) — each integrates useModuleData, useAutoSave, workshop components, and API calls

### Critical Pitfalls

1. **`getSession()` for server-side auth checks** — use `getUser()` or `getClaims()` exclusively in middleware and Server Components; `getSession()` does not validate the JWT and makes admin bypass trivial
2. **Magic link redirect URL mismatch (localhost in production)** — set Supabase dashboard "Site URL" to the production Vercel URL AND set `NEXT_PUBLIC_SITE_URL` in Vercel before any production deployment; these are independent settings
3. **Middleware infinite redirect loop** — exclude `/login`, `/auth/callback`, and `/auth/error` from middleware protection; write refreshed tokens to both request and response cookies before branching
4. **Stale cached data after Supabase writes** — add `export const dynamic = 'force-dynamic'` to every module page; call `router.refresh()` after successful autosave
5. **Autosave race condition overwrites student content** — implement `useAutoSave` with AbortController; cancel in-flight request before issuing a new one; a plain `setTimeout` debounce without cancellation is not sufficient
6. **Hydration mismatch from theme stored in localStorage** — store theme preference in a cookie (or use `next-themes`); cookie is server-readable, localStorage is not; flash of wrong theme is a trust signal issue for students

---

## Implications for Roadmap

Based on the dependency graph from ARCHITECTURE.md and the pitfall phasing from PITFALLS.md, the build order is clear. Each layer is blocked until the previous is working. Skipping ahead creates rework.

### Phase 1: Foundation
**Rationale:** Everything imports from these. TypeScript types catch mistakes before they compound. Supabase clients are used by every subsequent layer.
**Delivers:** Runnable Next.js 15 project with Tailwind v4, Supabase client/server split, shared types, and design tokens from the existing color system
**Addresses:** Eliminates hardcoded anon keys (architecture pain point #1); establishes correct `@supabase/ssr` package (avoids Pitfall 11)
**Avoids:** Pitfall 11 (auth-helpers vs @supabase/ssr confusion) — get the correct packages in place before writing any auth code

### Phase 2: Authentication
**Rationale:** All protected routes depend on auth working correctly. This is also the highest-security phase — mistakes here are security vulnerabilities, not just bugs.
**Delivers:** Working magic link auth flow (signIn, callback, session cookie, redirect to /dashboard), `middleware.ts` protecting all `/module/*` and `/admin/*` routes, `AuthContext`
**Addresses:** Biggest trust gap in current platform (localStorage email → real auth session)
**Avoids:** Pitfalls 1 (getSession), 2 (localhost URL in production), 3 (middleware redirect loop), 10 (auth vs authorization)
**Research flag:** Standard patterns — Supabase official docs cover this exactly; skip phase research

### Phase 3: App Shell
**Rationale:** Module pages need the shell (sidebar, topbar, layout) to render inside. Shell needs auth to display user data. ThemeContext must be done here — not later — to avoid hydration mismatches creeping in.
**Delivers:** Three-panel app shell (sidebar + topbar + main), ThemeContext (cookie-backed), ProgressContext (empty initial state), `app/(app)/layout.tsx` Server Component + Providers tree
**Addresses:** Dark/light theme (must move from localStorage to cookie), navigation structure
**Avoids:** Pitfall 5 (hydration mismatch from localStorage theme), Pitfall 8 (over-broad `use client` — keep layout as Server Component)
**Research flag:** Standard patterns — Next.js App Router layout docs are authoritative; skip phase research

### Phase 4: Workshop Component Library
**Rationale:** Pure UI components with no data dependencies. Can be built and verified in isolation (Storybook or just local test pages) before wiring to real data. Must be complete before any module migration begins.
**Delivers:** WorkshopTextarea, WorkshopInput, OptionSelector, SectionNav, SectionWrapper, ProgressRing, SaveDot — all accessible, mobile-responsive, Tailwind v4 styled
**Addresses:** Reusable component foundation for all 5 modules
**Avoids:** Pitfall 7 (non-serializable props — event handlers stay in Client Components), Pitfall 8 (use client isolation at leaf level)
**Research flag:** Standard patterns — shadcn/ui primitives are well-documented; skip phase research

### Phase 5: Data Layer
**Rationale:** Hooks depend on Supabase clients and auth session. This layer unifies the 4 competing save implementations. Must be fully correct before any module content is migrated.
**Delivers:** `useAutoSave` (debounced, AbortController, flush-on-unmount), `useModuleData` (load on mount, hydrate form state), finalized `vww_progress` Supabase schema
**Addresses:** Unifies 4 save implementations; reliable data persistence
**Avoids:** Pitfall 4 (stale cached data — force-dynamic), Pitfall 6 (race condition — AbortController)
**Research flag:** May need brief research on AbortController + react-hook-form watch() integration patterns; otherwise standard

### Phase 6: API Route Wrappers
**Rationale:** Auth must be established before protecting these routes. Edge functions themselves are unchanged (already deployed). This phase is purely about securing the call path.
**Delivers:** `/api/claude`, `/api/circle`, `/api/waterfall` route handlers that proxy the existing Supabase edge functions with server-side auth validation and service role key
**Addresses:** Moves API key security from client HTML to server environment variables
**Avoids:** Pitfall 13 (API keys exposed in client-side code)
**Research flag:** Standard patterns — skip phase research

### Phase 7: Module Migration (one at a time)
**Rationale:** Each module page integrates all lower layers. Migrate one module fully before starting the next. Welcome → Brand Foundation → Visual World → Content → Launch → Playbook (read-only compiled view last, since it depends on all other modules' data).
**Delivers:** All 6 module pages fully migrated with complete content, auto-save, section navigation, progress tracking, and AI generation
**Addresses:** All table-stakes features; all differentiator features
**Avoids:** Pitfall 9 (content loss during HTML-to-JSX migration — use per-module content checklist from old HTML)
**Research flag:** No research needed — source content is in `/old/modules/*.html`; this is an execution phase

### Phase 8: Admin Dashboard
**Rationale:** Internal tool; students don't need it. Requires auth and shell (done in phases 2-3). Lowest priority relative to core student experience.
**Delivers:** Server-side admin page with user list, per-user progress viewer, and delete functionality; role-based access control
**Addresses:** Replaces client-side hardcoded password with real server-side role check
**Avoids:** Pitfall 10 (admin route authorization vs authentication distinction)
**Research flag:** Standard patterns — skip phase research

### Phase 9: Deployment Hardening
**Rationale:** Auth URL configuration, cache headers, and CDN settings must be verified before the app is live for real students.
**Delivers:** Vercel environment variables configured, Supabase Site URL set to production, `Cache-Control: private, no-store` on auth-dependent routes, end-to-end production smoke test
**Avoids:** Pitfall 2 (localhost URL in production emails), Pitfall 12 (CDN caching auth responses)
**Research flag:** Standard patterns — skip phase research

### Phase Ordering Rationale

- Foundation before everything: types and Supabase clients are imported by every subsequent file
- Auth before shell: you cannot render user data in the shell without a session; auth bugs become impossible to isolate if the shell adds complexity
- Shell before modules: modules render inside the shell; building them without the shell means rebuilding the mounting structure
- Workshop components early: pure UI, no data dependencies, enables parallel work with data hooks
- Data hooks after auth: hooks need the user session to associate saves with a user
- API routes before modules: modules call AI/circle/waterfall APIs; the route handlers must exist first
- Modules last: they are the integration point for all previous layers; one-at-a-time migration enables systematic content verification
- Admin last: it does not block any student-facing functionality and is the lowest-risk area to defer

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All version decisions verified against official GitHub releases and npm registry as of 2026-04-01. Next.js 16 vs 15 tradeoff is well-documented. |
| Features | HIGH | Feature list is fixed by the existing platform; migration scope is explicitly defined. Table stakes list cross-referenced with LMS surveys. |
| Architecture | HIGH | Based on official Next.js App Router docs and Supabase SSR docs, plus direct inspection of the existing codebase in `/old/`. |
| Pitfalls | HIGH | Critical pitfalls (getSession, redirect loop, race condition) verified against official Supabase GitHub discussions and Next.js docs. All sources cited with confidence levels. |

**Overall confidence:** HIGH

### Gaps to Address

- **AbortController + react-hook-form watch() integration**: The data layer design is clear conceptually, but the exact wiring of `watch()` → debounce → AbortController in `useAutoSave` may need a brief spike during Phase 5 to validate. Not a blocker for planning.
- **`next-themes` vs custom cookie theme**: The research recommends cookie-backed theme storage to avoid hydration mismatch. `next-themes` handles this automatically. The decision of whether to use `next-themes` as a dependency or hand-roll a cookie-backed ThemeContext should be made during Phase 3. Either approach is valid; `next-themes` saves ~20 lines, adds a dependency.
- **Magic link email branding**: Supabase default email templates are functional but unbranded. This is explicitly deferred (anti-feature), but if the client expects branded emails, it should be captured as a known gap before launch.
- **`vww_progress` schema**: The existing Supabase table is referenced throughout but not fully documented in the research. Phase 5 must begin with a schema review to confirm the data structure supports the new unified autosave pattern.

---

## Sources

### Primary (HIGH confidence)
- [Next.js 15.2.4 current stable](https://www.abhs.in/blog/nextjs-current-version-march-2026-stable-release-whats-new)
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) — breaking changes catalog
- [Supabase Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — createServerClient, createBrowserClient, getUser()
- [@supabase/supabase-js GitHub Releases](https://github.com/supabase/supabase-js/releases) — v2.101.1 confirmed
- [@supabase/ssr GitHub Releases](https://github.com/supabase/ssr/releases) — v0.10.0 confirmed
- [Supabase: getSession security discussion #23224](https://github.com/orgs/supabase/discussions/23224) — getUser() vs getSession()
- [Supabase: Redirect URLs documentation](https://supabase.com/docs/guides/auth/redirect-urls)
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4)
- [Zod v4 Release Notes](https://zod.dev/v4) — v4.3.6, zod/v4 subpath
- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) — v7.72.0
- [Next.js App Router Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [Supabase: Next.js 13/14 stale data discussion #19084](https://github.com/orgs/supabase/discussions/19084)

### Secondary (MEDIUM confidence)
- [shadcn/ui Tailwind v4 docs](https://ui.shadcn.com/docs/tailwind-v4) — shadcn evolves quickly; always use latest CLI
- [Supabase: Always redirects to localhost #26483](https://github.com/orgs/supabase/discussions/26483) — community report, patterns verified in official docs
- [Medium: Fixing Hydration Mismatch in next-themes](https://medium.com/@pavan1419/fixing-hydration-mismatch-in-next-js-next-themes-issue-8017c43dfef9)
- Existing codebase `/old/` directory — direct inspection of index.html, module HTML files, admin.html, supabase/functions/

---
*Research completed: 2026-04-01*
*Ready for roadmap: yes*
