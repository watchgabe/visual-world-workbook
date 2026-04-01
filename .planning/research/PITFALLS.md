# Domain Pitfalls: Next.js App Router Migration from Monolithic HTML

**Domain:** Course platform — brownfield migration from HTML/iframe to Next.js 14+ App Router with Supabase Auth
**Researched:** 2026-04-01
**Confidence:** HIGH (critical items verified against Supabase official docs and verified Next.js issues)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or security vulnerabilities.

---

### Pitfall 1: Using `getSession()` Instead of `getUser()` for Server-Side Auth Checks

**What goes wrong:** Middleware and Server Components that call `supabase.auth.getSession()` to protect routes are trusting unvalidated JWT data from cookies. An attacker can craft a cookie with a valid-looking token that passes the session check without ever being verified by Supabase Auth servers.

**Why it happens:** The old `@supabase/auth-helpers` package (now deprecated) used `getSession()` everywhere. Developers copy patterns from outdated tutorials or the old package's README. The code works in development and passes QA because no one is actually spoofing tokens.

**Consequences:** Admin dashboard becomes bypassable. A user can forge a session cookie and access any protected route, including the server-side admin route the migration is explicitly trying to secure. This is the primary security regression the migration is meant to fix — and the fix can be done wrong.

**Prevention:**
- Use `supabase.auth.getUser()` in all middleware auth checks. It makes a network call to the Supabase Auth server to validate the token on every request.
- The newer `supabase.auth.getClaims()` (introduced in 2025) validates JWT signatures against public keys without a full network round-trip — prefer this in middleware if available in the current `@supabase/ssr` version.
- Never use `getSession()` in server code for access control decisions.

**Warning signs:**
- Any middleware file calling `supabase.auth.getSession()` and branching on the result for redirects
- Tutorials or copied code using `session?.user` from `getSession()` to identify the current user server-side

**Phase:** Auth foundation phase (Supabase Auth integration + middleware setup)

---

### Pitfall 2: Magic Link Redirect URL Localhost-to-Production Mismatch

**What goes wrong:** Magic link emails sent from the production Supabase project contain redirect URLs pointing to `localhost:3000` instead of the production domain. The email link works in local dev but takes production users back to localhost (where nothing is running), breaking the entire auth flow.

**Why it happens:** The Supabase dashboard "Site URL" defaults to `http://localhost:3000` and must be explicitly changed to the production URL. Additionally, the `NEXT_PUBLIC_SITE_URL` environment variable in Vercel must be set. Both must be configured independently — fixing one does not fix the other.

**Consequences:** Production users receive emails with broken auth links. Magic link is the only auth method in this app. Every production user is locked out until the environment is corrected.

**Prevention:**
- Before deploying to production, set Supabase dashboard "Site URL" to the production Vercel URL.
- Add the production URL to Supabase dashboard "Additional Redirect URLs". The path must match exactly — not just the host.
- Set `NEXT_PUBLIC_SITE_URL` in Vercel environment variables.
- For local development, keep `http://localhost:3000` in Additional Redirect URLs (wildcard patterns like `http://localhost:3000/**` are supported).
- The auth callback route (`/auth/callback`) must exist as a Next.js route handler that exchanges the `code` query param for a session — the magic link does not set cookies directly.

**Warning signs:**
- First deployment to Vercel without checking Supabase dashboard URL configuration
- Auth callback route (`/auth/callback`) not yet created when testing magic link in production

**Phase:** Auth foundation phase — must be verified before any production deployment

---

### Pitfall 3: Middleware Infinite Redirect Loop

**What goes wrong:** Every request to a protected page redirects to `/login`. From `/login`, the user signs in, the magic link arrives, but clicking it redirects to a protected page again — which immediately redirects back to `/login`. Loop is invisible without careful debugging because the browser just shows the login page.

**Why it happens:** The middleware checks for auth using `getSession()` which returns null when the session exists only in cookies that haven't been refreshed yet. Or: the auth callback route isn't excluded from middleware protection. Or: middleware matches the `/auth/callback` route itself and redirects before the session is established.

**Consequences:** Complete auth breakage. Users can sign in but cannot access any content.

**Prevention:**
- Middleware must explicitly exclude auth routes from protection: `/login`, `/auth/callback`, `/auth/error`, and any public assets.
- Middleware must call `supabase.auth.getUser()` (not `getSession()`) and write the refreshed token back into both `request.cookies` and `response.cookies` before branching on auth status.
- The `middleware.ts` file must be placed at the project root (or inside `/src` if that layout is used) — not inside the `app/` directory.
- After handling the auth exchange in the callback route, redirect to the originally-requested URL (stored in the magic link's `next` query param), not always to `/dashboard`.

**Warning signs:**
- Network tab shows repeated 307 redirects between `/` (or any protected route) and `/login`
- No `Set-Cookie` response headers after the auth callback is hit
- `middleware.ts` located inside `app/` directory

**Phase:** Auth foundation phase, specifically the middleware implementation step

---

### Pitfall 4: Stale Cached Data After Supabase Writes

**What goes wrong:** A student saves worksheet answers. The data goes into Supabase via a Server Action or API route. They navigate away and return — and their old answers appear because Next.js cached the page. The save appeared to succeed (no error) but the render shows old data.

**Why it happens:** Next.js App Router aggressively caches Server Component data fetches. By default, `fetch()` calls inside Server Components are cached indefinitely unless explicitly opted out. The Supabase JS SDK does not automatically set `cache: 'no-store'` on its underlying fetch calls when running in Next.js.

**Consequences:** Students see stale worksheet content, think their saves failed, re-enter data, potentially triggering double-save confusion. This is a trust-destroying bug for an education platform where progress is the product.

**Prevention:**
- For all pages that display user-specific content (every module page), set `export const dynamic = 'force-dynamic'` at the top of the page file, or `export const revalidate = 0`.
- Alternatively, use `unstable_noStore()` from `next/cache` in each data-fetching function.
- After a successful autosave write, call `router.refresh()` on the client side to revalidate the current page's server data.
- Do not rely on the Next.js Data Cache for any user-generated content — it is designed for public, shared content, not per-user worksheet state.

**Warning signs:**
- Page shows old content after saving and navigating back
- Network tab shows the page load is served from cache (304 or `x-nextjs-cache: HIT` header) after a write operation
- No `dynamic = 'force-dynamic'` export on module pages

**Phase:** Data layer phase (autosave hook + Supabase service module)

---

### Pitfall 5: Hydration Mismatch from Theme and Auth State in localStorage

**What goes wrong:** The app renders differently on the server than on the client. The server renders with the default theme (light), then the client reads localStorage for the user's saved theme (dark) and immediately re-renders. React logs a hydration error, or worse, silently mismatches the DOM, causing layout flicker or broken styles on first load.

**Why it happens:** The existing app stores theme preference in localStorage, which is a browser-only API the server cannot read. When the React Context for theme initializes on the server, it uses the default value. The client reads localStorage and uses a different value. The tree doesn't match.

**Consequences:** Users see a flash of the wrong theme (typically white flash in a dark-mode-default app). If suppressHydrationWarning is misapplied, silent DOM mismatches can produce broken layout. Console errors in development.

**Prevention:**
- For theme state, store preference in a cookie instead of localStorage. Cookies are readable by the server, so the initial server render matches what the client will show. The `next-themes` library handles this pattern automatically.
- For auth state, do not initialize the React Context with user data from localStorage. Initialize with null and populate via Supabase's onAuthStateChange listener in a useEffect — this is client-only behavior and expected.
- Do not render theme-dependent UI (e.g., class names conditionally applied to `<html>`) inside Server Components unless the value comes from cookies.
- The existing dark/light toggle must be migrated to cookie-backed state before wiring up Context.

**Warning signs:**
- Flash of wrong background color on first page load
- "Hydration failed because the initial UI does not match" error in browser console
- Theme Context initializing with `localStorage.getItem(...)` in its default value or in synchronous component code

**Phase:** App shell phase (layout, Context setup, theme toggle migration)

---

### Pitfall 6: Autosave Race Condition with Concurrent Supabase Writes

**What goes wrong:** A student types quickly in a textarea. The debounced autosave triggers at 1.5 seconds and fires a Supabase update. Before that request resolves, they type another character and a second save fires. The first response arrives after the second — overwriting the newer content with older data. The student loses their most recent changes.

**Why it happens:** The existing codebase has 4 different save/load implementations, suggesting this problem already exists in production. When unified into a single debounced hook, the race condition becomes more visible. A debounce prevents excessive requests but does not handle out-of-order responses.

**Consequences:** Silent data loss for user-generated content, which is the core product value. Particularly dangerous for the Playbook module that compiles all previous module answers.

**Prevention:**
- Implement the autosave hook with an AbortController: cancel the in-flight request before issuing the next one.
- Or use a request ID / version counter: discard responses that arrive out of order (response version < current version).
- Do not use `useEffect` with a debounce timeout alone — this does not cancel in-flight requests.
- The unified autosave hook should expose a `isSaving` and `lastSaved` state to give visual confirmation to students.

**Warning signs:**
- Autosave hook without AbortController or request versioning
- `useEffect` with `setTimeout` + direct Supabase call, no cleanup function that cancels the pending request
- Multiple concurrent saves visible in Network tab when typing quickly

**Phase:** Data layer phase (unified autosave hook)

---

## Moderate Pitfalls

---

### Pitfall 7: Passing Non-Serializable Props Across the Server/Client Boundary

**What goes wrong:** A Server Component passes a callback function as a prop to a Client Component. TypeScript may not catch this, and the app appears to work in development, but Next.js throws a serialization error at runtime or build time: "Props must be serializable for components in the 'use client' entry file."

**Why it happens:** The Pages Router allowed passing functions freely as props. The App Router cannot serialize functions over the server/client boundary (they cannot be sent as JSON). Developers migrating from the Pages Router pattern naturally attempt this.

**Prevention:**
- Functions passed to Client Components must be Server Actions (marked with `use server`).
- Event handlers (onClick, onChange, etc.) must live in Client Components — they cannot originate from Server Components.
- Data-only props (strings, numbers, plain objects, arrays) are safe to pass from Server to Client Components.
- When a component needs both server-fetched data and interactivity, fetch data in a Server Component parent and pass serializable data down; handle events in Client Component children.

**Phase:** Component library phase (WorkshopTextarea, WorkshopInput, SectionNav, OptionSelector)

---

### Pitfall 8: Over-Broad `use client` Directives Causing Unnecessary Bundle Bloat

**What goes wrong:** A top-level layout component gets marked `use client` because it contains a theme toggle. Every component imported by that layout — including course content, static copy, navigation — is now pulled into the client JavaScript bundle, negating the performance benefits of Server Components.

**Why it happens:** When something doesn't work in a Server Component, the fastest fix is adding `use client`. This works but creates a client boundary that pulls all descendants into the bundle.

**Prevention:**
- Isolate interactive pieces into small leaf components with `use client`. The layout itself stays a Server Component.
- The theme toggle button, hamburger menu, and progress ring animations are the interactive elements — wrap only those in `use client` components.
- Static course copy, section titles, and read-only content should never be in Client Components.
- Use React Server Component patterns: render interactive client islands inside server-rendered shells.

**Phase:** App shell phase (layout, sidebar, topbar)

---

### Pitfall 9: Content Loss During Manual HTML-to-JSX Migration

**What goes wrong:** Course content from the 4,524-line HTML file is manually copied into JSX components. A section is accidentally skipped, a textarea placeholder is lost, or a block of instructional copy is omitted. Students encounter blank sections or missing prompts. This is hard to detect without systematically comparing the old and new content.

**Why it happens:** The content is embedded in monolithic HTML files without a clear separation between structure, logic, and content. Manual copy-paste across a large file at high velocity leads to errors.

**Consequences:** Students hit blank sections or incomplete worksheets. This is a content regression that undermines the entire migration's goal of "same material, modern stack."

**Prevention:**
- Before migrating each module, extract all static copy from the `/old` HTML file into a structured list (section title, label, placeholder, description) and use it as a checklist.
- After migrating each module component, run a diff between the old HTML's visible text content and the new component's render output.
- Migrate one module at a time and do a full content review before starting the next.
- Preserve the `/old` directory as a reference throughout the entire migration — do not delete it.

**Warning signs:**
- Any textarea or input component rendered without a `label` and `placeholder` prop
- Section component rendered without checking against the `/old` HTML source

**Phase:** Module migration phases (each of the 5 modules)

---

### Pitfall 10: Admin Route Secured Only at the Middleware Level

**What goes wrong:** The admin dashboard is protected by middleware that redirects unauthenticated users. The page itself does not verify that the authenticated user has admin privileges — only that they are authenticated. Any authenticated student can access the admin route if they know the URL or if middleware is misconfigured.

**Why it happens:** The existing system uses a hardcoded password check in the browser, which is being replaced. It's tempting to replace it with "is authenticated?" but the correct replacement is "is authenticated AND is admin?"

**Prevention:**
- The admin page's Server Component must check user role/admin status from Supabase after confirming auth with `getUser()`.
- Admin privilege check should be against a Supabase column or metadata field, not a hardcoded email check.
- Middleware handles redirecting unauthenticated users; the page itself handles authorization (is this user allowed here?).
- Return a 403 or redirect to a "not authorized" page if the authenticated user is not an admin.

**Phase:** Auth foundation phase and admin dashboard phase

---

## Minor Pitfalls

---

### Pitfall 11: `@supabase/auth-helpers` vs `@supabase/ssr` Package Confusion

**What goes wrong:** Documentation from 2023–2024 uses `@supabase/auth-helpers-nextjs`. This package is deprecated. Installing and following its patterns produces deprecation warnings and may not support the latest Supabase Auth features.

**Prevention:** Install `@supabase/ssr` and `@supabase/supabase-js`. Follow only the official docs at `supabase.com/docs/guides/auth/server-side/nextjs` which use the `@supabase/ssr` package. Reject any code sample that imports from `@supabase/auth-helpers-nextjs`.

**Phase:** Project setup / dependency installation

---

### Pitfall 12: CDN Caching Auth Responses and Serving Stale Sessions to Wrong Users

**What goes wrong:** Vercel or a CDN caches a page response that contains refreshed auth tokens in Set-Cookie headers. A different user receives the cached response, inheriting the first user's session.

**Why it happens:** Supabase middleware responses include `Set-Cookie` headers for token refresh. If the response is cached without a `Cache-Control: private` or `no-store` directive, CDN edge nodes may serve it to other users.

**Prevention:**
- All pages that run the Supabase session refresh must return `Cache-Control: private, no-store` headers.
- Use `force-dynamic` export on all authenticated pages.
- Verify Vercel deployment does not cache routes that include the Supabase middleware response.

**Phase:** Deployment / infrastructure phase

---

### Pitfall 13: Edge Function API Keys Exposed in Client-Side Code After Migration

**What goes wrong:** During the migration, the Next.js API routes that wrap the existing Supabase edge functions (claude-proxy, circle-proxy, waterfall-analyzer) are written as Client Components calling the edge functions directly, instead of server-side API routes. The Supabase service role key or other secrets appear in the browser's Network tab.

**Why it happens:** The original HTML files call the edge functions directly with hardcoded keys. During a fast migration, the pattern is copied into a Client Component without thinking about where secrets should live.

**Prevention:**
- All calls to claude-proxy, circle-proxy, and waterfall-analyzer must go through Next.js API route handlers (`/app/api/...`), never from Client Components.
- The Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`) must never be prefixed with `NEXT_PUBLIC_` and must never appear in any Client Component or `use client` file.
- Review environment variable names after setup: only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` should be client-visible.

**Phase:** API route wrapper phase

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Supabase Auth + middleware | Infinite redirect loop | Exclude all auth routes from protection; use `getUser()` not `getSession()` |
| Supabase Auth + middleware | getSession security hole | Always use `getUser()` for access control decisions server-side |
| Magic link setup | Localhost URL in production emails | Set Site URL and `NEXT_PUBLIC_SITE_URL` before any production test |
| App shell (layout + Context) | Hydration mismatch from theme | Store theme in cookie not localStorage; use `next-themes` |
| Data layer (autosave hook) | Race condition overwrites | AbortController in debounced hook; cancel in-flight on new keypress |
| Data layer (Supabase service) | Stale cached data after writes | `force-dynamic` on all module pages; `router.refresh()` after save |
| Component library | Non-serializable prop errors | No function props from Server to Client components except Server Actions |
| Component library | Over-broad `use client` | Isolate interactive leaves; keep layout as Server Component |
| Module content migration | Content loss in JSX conversion | Checklist per section from old HTML before starting each module |
| Admin dashboard | Auth vs authorization confusion | Page must verify admin role, not just "is authenticated" |
| API route wrappers | Secrets leaking to client | Wrappers must be server-side API routes, never client-side calls |
| Deployment | Stale session tokens cached by CDN | `Cache-Control: private, no-store` on all auth-dependent routes |

---

## Sources

- [Supabase: Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — HIGH confidence
- [Supabase: Auth Helpers to SSR Migration Guide](https://supabase.com/docs/guides/troubleshooting/how-to-migrate-from-supabase-auth-helpers-to-ssr-package-5NRunM) — HIGH confidence
- [Supabase: Advanced Server-Side Auth Guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide) — HIGH confidence
- [Supabase GitHub: getSession security discussion #23224](https://github.com/orgs/supabase/discussions/23224) — HIGH confidence
- [Supabase GitHub: getUser vs getSession issue #898](https://github.com/supabase/auth-js/issues/898) — HIGH confidence
- [Supabase: Redirect URLs documentation](https://supabase.com/docs/guides/auth/redirect-urls) — HIGH confidence
- [Supabase: Why redirected to wrong URL troubleshooting](https://supabase.com/docs/guides/troubleshooting/why-am-i-being-redirected-to-the-wrong-url-when-using-auth-redirectto-option-_vqIeO) — HIGH confidence
- [Supabase: Next.js 13/14 stale data with RLS discussion](https://github.com/orgs/supabase/discussions/19084) — HIGH confidence
- [Next.js: Hydration error documentation](https://nextjs.org/docs/messages/react-hydration-error) — HIGH confidence
- [Next.js GitHub: Hydration mismatch discussion #35773](https://github.com/vercel/next.js/discussions/35773) — HIGH confidence
- [Next.js GitHub: Props must be serializable discussion #46795](https://github.com/vercel/next.js/discussions/46795) — HIGH confidence
- [Supabase GitHub: Always redirects to localhost #26483](https://github.com/orgs/supabase/discussions/26483) — MEDIUM confidence (community report, patterns verified in official docs)
- [Medium: Fixing Hydration Mismatch in Next.js next-themes issue](https://medium.com/@pavan1419/fixing-hydration-mismatch-in-next-js-next-themes-issue-8017c43dfef9) — MEDIUM confidence
