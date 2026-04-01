# Phase 2: Authentication - Context

**Gathered:** 2026-04-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can securely sign in via Supabase magic link and stay signed in across sessions, with all protected routes enforced by Next.js middleware. This phase delivers: login page, magic link flow, auth callback, session persistence via cookies, middleware route protection, sign-out via minimal user modal, and AuthContext provider.

</domain>

<decisions>
## Implementation Decisions

### Login Page Design
- **D-01:** Branded & warm login page — dark background with FSCreative brand, course title, and a friendly welcome message. Feels like part of the course experience, not a generic auth wall.
- **D-02:** Standalone layout — full-page centered card, no sidebar or topbar. Clean entry point that transitions into the app shell after login. Route: `/login` outside the `(app)` route group.
- **D-03:** After entering email, inline success message — form transforms to show "Check your email for a magic link" with a friendly icon. Same page, no navigation.
- **D-04:** Resend magic link button appears after ~30 seconds if user hasn't navigated away. Prevents support requests about missing emails.

### Session & Redirect Flow
- **D-05:** After successful auth, users land on the dashboard/module list — the root route inside the `(app)` shell.
- **D-06:** Return URL preserved — when an unauthenticated user hits a protected route, store the original URL as a query param (`/login?redirect=/modules/brand-foundation`). After auth, redirect there instead of dashboard.
- **D-07:** Open access — any email can sign in. Supabase creates the user automatically. Access control is handled externally via Circle.so enrollment. No allowlist needed.

### Sign-Out Experience
- **D-08:** Sign-out button lives inside a minimal user modal (not in sidebar directly). The modal shows user email + sign-out button. Other modal features (clear progress, personal info) will be added in later phases.
- **D-09:** Instant sign-out — no confirmation dialog. Click sign-out -> immediately signed out -> redirect to login page.
- **D-10:** User modal trigger: a clickable element in the sidebar (user email or avatar icon) that opens the modal.

### Error & Edge Cases
- **D-11:** Friendly & helpful error tone — warm language like "Hmm, that link has expired. Enter your email to get a new one." Matches the course's supportive brand.
- **D-12:** Button spinner while magic link is being sent — button shows spinner and disables. Prevents double-clicks and gives immediate feedback.
- **D-13:** Failed magic link callback (expired/invalid/used) redirects to login page with a friendly error message explaining what went wrong and a prompt to try again.

### Claude's Discretion
- D-03 (partial): Claude picks the best approach for the inline confirmation UI (animation, icon choice, layout)
- Middleware implementation details: matcher patterns, cookie refresh strategy, redirect logic
- Auth callback route structure (`/auth/callback` vs `/api/auth/callback`)
- AuthContext shape and provider placement
- Rate limiting approach for magic link requests (if any)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Supabase Auth
- `CLAUDE.md` §Technology Stack — Pinned versions: `@supabase/supabase-js` 2.101.1, `@supabase/ssr` 0.10.0
- `src/lib/supabase/client.ts` — Existing browser client (createBrowserClient from @supabase/ssr)
- `src/lib/supabase/server.ts` — Existing server client (createServerClient from @supabase/ssr, cookie handling)

### Project Specs
- `.planning/PROJECT.md` — Core constraints: "Supabase Auth with magic link only", no schema changes
- `.planning/REQUIREMENTS.md` — AUTH-01 through AUTH-05 are Phase 2 requirements
- `.planning/ROADMAP.md` §Phase 2 — Success criteria and dependency chain

### Old App Reference (auth patterns to replace)
- `old/modules/content.html` lines 1858-1960 — Old auth pattern: `localStorage.getItem('vww-user-email')`, raw Supabase REST calls with hardcoded anon key. This is what we're replacing with proper Supabase Auth.

### Phase 1 Context
- `.planning/phases/01-foundation-app-shell/01-CONTEXT.md` — App shell decisions (sidebar layout, theme toggle placement, pixel-faithful design)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase/client.ts` — Browser Supabase client already configured with `@supabase/ssr`
- `src/lib/supabase/server.ts` — Server Supabase client with cookie get/set handling (comment notes middleware handles refresh)
- `src/app/(app)/layout.tsx` — App shell layout using `AppShellClient` wrapper, reads theme cookie
- `src/components/layout/Sidebar.tsx` — Sidebar component where user modal trigger should be added
- `src/components/layout/AppShellClient.tsx` — Client wrapper for sidebar state management

### Established Patterns
- **Cookie-based state:** Theme uses `cookies()` in server components — auth session will follow same pattern
- **Route groups:** `(app)` route group wraps protected content — login page goes outside this group
- **Server/client split:** Server layout reads cookie -> passes to client wrapper (AppShellClient pattern from Phase 1)

### Integration Points
- `middleware.ts` — Does not exist yet. Must be created at project root for auth route protection
- `src/app/login/page.tsx` — New route outside `(app)` group for standalone login page
- `src/app/auth/callback/route.ts` — New route handler for magic link token exchange
- `src/components/layout/Sidebar.tsx` — Add user modal trigger element
- `src/app/(app)/layout.tsx` — Wrap with AuthContext provider (or higher)

</code_context>

<specifics>
## Specific Ideas

- Login page should feel branded and warm — part of the FSCreative course experience, not a cold auth wall
- User modal is a pattern that will grow over time: Phase 2 delivers just email display + sign-out; later phases add clear progress, personal info, etc.
- Error messages should match the supportive, encouraging tone of the course platform ("Hmm, that link has expired..." not "Error 401: Invalid token")
- The old app stored email in localStorage with no real auth — this phase replaces that entirely with proper Supabase Auth sessions

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-authentication*
*Context gathered: 2026-04-01*
