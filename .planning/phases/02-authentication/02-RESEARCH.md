# Phase 2: Authentication - Research

**Researched:** 2026-04-01
**Domain:** Supabase Auth + Next.js 15 App Router — magic link, cookie sessions, middleware route protection
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Branded & warm login page — dark background with FSCreative brand, course title, and a friendly welcome message.
- **D-02:** Standalone layout — full-page centered card, no sidebar or topbar. Route: `/login` outside the `(app)` route group.
- **D-03:** After entering email, inline success message — form transforms to show "Check your email for a magic link" with a friendly icon. Same page, no navigation.
- **D-04:** Resend magic link button appears after ~30 seconds if user hasn't navigated away.
- **D-05:** After successful auth, users land on the dashboard/module list — the root route inside the `(app)` shell.
- **D-06:** Return URL preserved — when an unauthenticated user hits a protected route, store the original URL as a query param (`/login?redirect=/modules/brand-foundation`). After auth, redirect there instead of dashboard.
- **D-07:** Open access — any email can sign in. Supabase creates the user automatically. No allowlist needed.
- **D-08:** Sign-out button lives inside a minimal user modal (not in sidebar directly). The modal shows user email + sign-out button.
- **D-09:** Instant sign-out — no confirmation dialog. Click sign-out -> immediately signed out -> redirect to login page.
- **D-10:** User modal trigger: a clickable element in the sidebar (user email or avatar icon) that opens the modal.
- **D-11:** Friendly & helpful error tone — warm language like "Hmm, that link has expired. Enter your email to get a new one."
- **D-12:** Button spinner while magic link is being sent — button shows spinner and disables. Prevents double-clicks.
- **D-13:** Failed magic link callback (expired/invalid/used) redirects to login page with a friendly error message.

### Claude's Discretion

- D-03 (partial): Claude picks the best approach for the inline confirmation UI (animation, icon choice, layout)
- Middleware implementation details: matcher patterns, cookie refresh strategy, redirect logic
- Auth callback route structure (`/auth/callback` vs `/api/auth/callback`)
- AuthContext shape and provider placement
- Rate limiting approach for magic link requests (if any)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can sign in via magic link (email sent by Supabase Auth) | `signInWithOtp` API, login page + inline confirmation pattern |
| AUTH-02 | User session persists across browser refresh via cookies | `@supabase/ssr` cookie-based session, middleware `updateSession` pattern |
| AUTH-03 | Unauthenticated users are redirected to login page | `middleware.ts` with `supabase.auth.getUser()` + redirect + return URL preservation |
| AUTH-04 | Auth callback route handles magic link token exchange | `/auth/callback/route.ts` using `exchangeCodeForSession` or `verifyOtp` |
| AUTH-05 | User can sign out from any page | `supabase.auth.signOut()` + redirect to `/login`, user modal trigger in Sidebar |

</phase_requirements>

---

## Summary

This phase implements authentication for a Next.js 15 App Router application using Supabase's `@supabase/ssr` package (v0.10.0) with magic link only. The core building blocks are already in place from Phase 1: `src/lib/supabase/client.ts` (browser client) and `src/lib/supabase/server.ts` (server client) are both correctly implemented with the `getAll`/`setAll` cookie API that `@supabase/ssr` v0.5+ requires.

The pattern is well-established: (1) `middleware.ts` at project root refreshes the auth token on every request using `supabase.auth.getUser()` and protects `/modules/*` and `/admin/*` routes by redirecting to `/login` with the original URL as a `redirect` query param; (2) a login page at `/login` outside the `(app)` route group calls `signInWithOtp` and shows an inline success state; (3) an `/auth/callback` route handler exchanges the magic link token for a session cookie via `exchangeCodeForSession`. AuthContext wraps the `(app)` layout to make the current user available client-side.

**Primary recommendation:** Follow the `@supabase/ssr` getAll/setAll cookie pattern that is already established in `src/lib/supabase/server.ts`. The middleware helper lives at `src/lib/supabase/middleware.ts` (matching the existing lib structure) and exports `updateSession`. The root `middleware.ts` imports and delegates to it.

---

## Standard Stack

### Core (all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/ssr` | 0.10.0 (installed) | Cookie-based auth for App Router | Official Supabase SSR package; replaces deprecated auth-helpers. Provides `createBrowserClient` and `createServerClient`. v0.10.0 adds automatic CDN cache headers on token refresh. |
| `@supabase/supabase-js` | 2.101.1 (installed) | Supabase client SDK | Core auth methods: `signInWithOtp`, `signOut`, `getUser`, `exchangeCodeForSession` |
| Next.js App Router | 15.2.4 (installed) | Middleware + route handlers | `middleware.ts` for session refresh and route protection; Route Handlers for callback |
| React Context (built-in) | React 19 | AuthContext — user state in client tree | Project constraint; appropriate for this scale |

### No New Packages Required

All dependencies for this phase are already installed. No `npm install` needed.

---

## Architecture Patterns

### Recommended File Structure

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx          # Standalone login page (outside (app) group)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts      # Magic link token exchange
│   └── (app)/
│       └── layout.tsx        # Wrap with AuthProvider here (or root layout)
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx     # Client component: email input + OTP send
│   │   └── UserModal.tsx     # Client component: email display + sign out
│   └── layout/
│       └── Sidebar.tsx       # Add user modal trigger here (Phase 2 edit)
├── context/
│   └── AuthContext.tsx       # AuthContext + AuthProvider
└── lib/
    └── supabase/
        ├── client.ts         # Already exists — no changes needed
        ├── server.ts         # Already exists — no changes needed
        └── middleware.ts     # NEW: updateSession helper
middleware.ts                 # NEW: project root, imports updateSession
```

### Pattern 1: Middleware — Session Refresh + Route Protection

**What:** Runs on every request. Refreshes the auth token (Server Components can't set cookies) and redirects unauthenticated users away from protected routes.

**Critical:** Use `getUser()` not `getSession()` inside middleware. `getUser()` validates the JWT against the Supabase Auth server every time. `getSession()` only reads from the cookie without revalidation and is NOT safe for authorization decisions.

**When to use:** Always present in an app with protected routes.

```typescript
// Source: https://supabase.com/docs/guides/auth/server-side/nextjs
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do NOT add any logic between createServerClient and getUser()
  // getUser() revalidates the auth token every request
  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected =
    pathname.startsWith('/modules') || pathname.startsWith('/admin')

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', url.pathname + url.search)
    return NextResponse.redirect(loginUrl)
  }

  // If user is logged in and hits /login, redirect to (app) root
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return supabaseResponse
}
```

```typescript
// middleware.ts (project root — src/ is in tsconfig paths, so also works at src/middleware.ts)
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### Pattern 2: Auth Callback Route — Token Exchange

**What:** Supabase magic links embed an auth code in the URL. This Route Handler exchanges the code for a session cookie.

**Auth flow:** Magic link email -> user clicks -> `?code=xxx` appended to callback URL -> this handler calls `exchangeCodeForSession` -> Supabase sets session cookie -> redirect to destination.

**PKCE note:** `@supabase/ssr` enables PKCE flow by default. The callback URL receives a `code` parameter (not `token_hash`). Use `exchangeCodeForSession` for PKCE. Some older docs show `verifyOtp` with `token_hash` — that is the implicit flow, not what `@supabase/ssr` produces.

```typescript
// Source: Supabase official docs — auth server-side Next.js guide
// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('next') ?? '/'
  const errorParam = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle Supabase auth errors (expired/used link)
  if (errorParam) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'link_expired')
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, origin))
    }

    // Exchange failed (expired, already used)
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'link_expired')
    return NextResponse.redirect(loginUrl)
  }

  // No code — malformed callback URL
  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('error', 'unknown')
  return NextResponse.redirect(loginUrl)
}
```

### Pattern 3: signInWithOtp (Magic Link Send)

**What:** Client-side call from the login form. Sends a magic link email. On success, show inline confirmation. The `emailRedirectTo` must be configured in Supabase Auth dashboard under "Redirect URLs".

**D-06 return URL:** Pass the `redirect` query param through to `emailRedirectTo` so the callback lands the user where they originally wanted. Append it as the `next` param on the callback URL (Supabase will preserve query params in the link).

```typescript
// Source: https://supabase.com/docs/guides/auth/auth-magic-link
// LoginForm.tsx (client component)
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

async function sendMagicLink(email: string, redirectPath: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // shouldCreateUser: true is the default — D-07: open access, any email
      emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
    },
  })
  return error
}
```

### Pattern 4: AuthContext

**What:** Makes the current user available to all client components inside the `(app)` route group. Uses `onAuthStateChange` to stay in sync.

**Placement:** Wrap the `(app)/layout.tsx` with `<AuthProvider>`. The server layout already reads the theme cookie and passes it to `AppShellClient` — `AuthProvider` wraps the same children.

```typescript
// context/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Initial session check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### Pattern 5: Sign Out in UserModal

**What:** Minimal modal in Sidebar footer area. Shows user email + sign-out button. Follows D-09 (instant, no confirmation).

**Implementation approach:** `useAuth()` provides `user` and `signOut`. The modal trigger is a button in Sidebar footer. Modal state is local `useState` in the Sidebar or a new `UserModal` component.

```typescript
// Pseudocode — actual styling will match existing var(--surface)/var(--border) pattern
function UserModal({ user, onSignOut }) {
  return (
    <div> {/* positioned above trigger, matches app's existing inline style pattern */}
      <p>{user.email}</p>
      <button onClick={onSignOut}>Sign out</button>
    </div>
  )
}
```

### Anti-Patterns to Avoid

- **Using `getSession()` in middleware or server code:** `getSession()` reads the cookie without revalidating the JWT. An attacker who forges a cookie could bypass protection. Always use `getUser()` for authorization.
- **Using `get`/`set`/`remove` cookie API (old pattern):** `@supabase/ssr` v0.5+ requires `getAll`/`setAll` only. The old individual cookie methods were removed. The existing `server.ts` already uses the correct pattern.
- **Creating a singleton Supabase client on the server:** Server-side clients must be created per-request (cookies differ). Only browser clients use singleton pattern.
- **Calling `signOut()` then `router.push('/login')`:** After `signOut()`, the session cookie is cleared but the Next.js router cache may still show the old page. Use `window.location.href = '/login'` (hard redirect) or `router.refresh()` followed by `router.push('/login')` to ensure the server re-evaluates auth state.
- **Not configuring `emailRedirectTo` in Supabase dashboard:** Magic links will fail silently or redirect to the wrong URL if the redirect URL is not in the Supabase "Allowed Redirect URLs" list. For local development, `http://localhost:3000/auth/callback` must be explicitly allowed.
- **Placing `middleware.ts` inside `src/app/`:** Middleware must be at the project root OR inside `src/` directory (i.e., `src/middleware.ts`). This project uses `src/` so `src/middleware.ts` is the correct location.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token exchange from magic link | Custom JWT parsing | `supabase.auth.exchangeCodeForSession(code)` | PKCE flow has code verifier complexity; Supabase SDK handles it completely |
| Session refresh in middleware | Manual cookie expiry checks | `createServerClient` + `getUser()` in `updateSession` | Supabase SDK handles token refresh, cookie updates, and cache headers automatically |
| Auth state on client | Manual cookie reads | `onAuthStateChange` + `getUser()` in AuthContext | Handles all auth events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED) |
| Protected route logic | Custom session parsing in each page | Middleware `updateSession` with redirect | Single point of control; pages don't need to check auth individually |

**Key insight:** The `@supabase/ssr` middleware pattern handles all the hard parts — PKCE code exchange, token refresh, cookie propagation from server to client. Implementing any of this manually introduces subtle security holes.

---

## Common Pitfalls

### Pitfall 1: Middleware Not Running on Expected Routes

**What goes wrong:** Auth protection appears to work in development but some routes are not protected, or the login redirect loop occurs.
**Why it happens:** The `matcher` pattern excludes too many or too few paths. The default matcher excludes `_next/static`, `_next/image`, and static files — but `/login` and `/auth/callback` must NOT be protected routes.
**How to avoid:** The `updateSession` function itself handles the `/login` exclusion (if user exists + `/login` -> redirect to `/`). The `isProtected` check should only cover `/modules/*` and `/admin/*`.
**Warning signs:** Users being redirect-looped (login -> protected -> login) or being able to access protected routes without a session.

### Pitfall 2: `getSession()` vs `getUser()` in Middleware

**What goes wrong:** Routes appear protected but the session check is not revalidating the JWT — a manipulated cookie could bypass protection.
**Why it happens:** `getSession()` reads from the cookie without hitting the Supabase Auth server. `getUser()` makes a network call to validate.
**How to avoid:** Always use `supabase.auth.getUser()` in middleware and server components where authorization matters.
**Warning signs:** Lint warnings from Supabase ESLint plugin; Supabase docs explicitly flag this.

### Pitfall 3: Magic Link `emailRedirectTo` Not in Allowed URLs

**What goes wrong:** After clicking the magic link, the user sees a Supabase error "Redirect URL not allowed."
**Why it happens:** Supabase only allows redirects to URLs explicitly listed in the project's Auth dashboard under "Redirect URLs."
**How to avoid:** Add `http://localhost:3000/auth/callback` for local dev and the production URL `https://yourdomain.com/auth/callback` to the allowed list in Supabase project settings.
**Warning signs:** Error immediately after clicking magic link; URL shows `error=redirect_uri_mismatch`.

### Pitfall 4: `signOut` + `router.push` Stale Cache

**What goes wrong:** After sign-out, navigating back shows the user as still signed in (stale React state or Next.js router cache).
**Why it happens:** `signOut()` clears the cookie, but the client-side router cache still holds page data from when the user was authenticated.
**How to avoid:** After `signOut()`, use `window.location.href = '/login'` (hard redirect) instead of `router.push`. This forces a full page reload and fresh middleware evaluation.
**Warning signs:** "Signed in" UI visible briefly after sign-out before redirect.

### Pitfall 5: Race Condition Between onAuthStateChange and Initial Render

**What goes wrong:** Components flash "no user" state for a frame before showing authenticated content.
**Why it happens:** `onAuthStateChange` fires asynchronously; the initial `user` state is `null` and `loading: true`.
**How to avoid:** The `loading` state in AuthContext suppresses rendering of auth-dependent UI until the initial user check completes. Protected pages can show a skeleton while `loading` is true.
**Warning signs:** Content flash (authenticated -> unauthenticated -> authenticated) on page load.

### Pitfall 6: `middleware.ts` Location

**What goes wrong:** Middleware is not running at all.
**Why it happens:** `middleware.ts` placed in `src/app/` or `src/lib/` — it only runs from `src/` root or project root.
**How to avoid:** Place at `src/middleware.ts` (since this project uses the `src/` directory structure).
**Warning signs:** Protected routes accessible without auth; no console logs from middleware.

---

## Code Examples

### Complete Login Page Structure

```typescript
// Source: Pattern from @supabase/ssr docs + D-01 through D-04 decisions
// src/app/login/page.tsx
// Note: standalone layout — no Sidebar, no AppShell

import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; error?: string }
}) {
  return (
    // Full-page centered layout — dark background, FSCreative brand
    // LoginForm handles: email input, spinner (D-12), inline success (D-03),
    // resend button after 30s (D-04), and error display (D-11, D-13)
  )
}
```

### Error Message Map (D-11, D-13)

```typescript
// Map Supabase error codes to friendly copy
const AUTH_ERRORS: Record<string, string> = {
  link_expired: "Hmm, that link has expired. Enter your email to get a new one.",
  unknown: "Something went wrong. Please try again.",
  rate_limit: "Too many requests. Please wait a minute before trying again.",
}
```

### Resend Timer (D-04)

```typescript
// 30-second countdown before showing resend button
const [secondsLeft, setSecondsLeft] = useState(30)
const [showResend, setShowResend] = useState(false)

useEffect(() => {
  if (!sent) return
  const interval = setInterval(() => {
    setSecondsLeft(s => {
      if (s <= 1) { clearInterval(interval); setShowResend(true); return 0 }
      return s - 1
    })
  }, 1000)
  return () => clearInterval(interval)
}, [sent])
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2023 | auth-helpers is deprecated; all new work uses `@supabase/ssr` |
| `get`/`set`/`remove` cookie API | `getAll`/`setAll` only | `@supabase/ssr` v0.5 | Old individual cookie methods removed; must use bulk API |
| `getSession()` for route protection | `getUser()` | Security advisory 2024 | `getSession()` does not revalidate JWT; `getUser()` does |
| Implicit flow (token in URL fragment) | PKCE flow (code in query param) | Default since `@supabase/ssr` | More secure; requires `exchangeCodeForSession` in callback |
| `localStorage` + raw Supabase REST calls | `@supabase/ssr` cookie sessions | This phase | Eliminates old `vww-user-email` localStorage pattern entirely |

**Deprecated/outdated:**
- `localStorage.getItem('vww-user-email')` pattern from old app: replaced entirely by `supabase.auth.getUser()` and AuthContext
- Hardcoded anon key in client HTML: replaced by env vars + Next.js API routes

---

## Open Questions

1. **Supabase `emailRedirectTo` for localhost vs production**
   - What we know: Both URLs must be in the Supabase allowed redirect list. For this project, the Supabase project ID is `ljddfhzrjvxpedvfebli` (visible in old app source).
   - What's unclear: Whether localhost redirect URL is already configured in the existing Supabase project. This project existed before — the dashboard may already have it.
   - Recommendation: Verify Supabase Auth dashboard → "Redirect URLs" has `http://localhost:3000/auth/callback` before running the callback for the first time. Include a Wave 0 checklist item for this.

2. **`shouldCreateUser` default (D-07 open access)**
   - What we know: `signInWithOtp` default is `shouldCreateUser: true` — Supabase auto-creates users on first sign-in.
   - What's unclear: Whether existing production users (from the old `vww-user-email` localStorage app) have Supabase Auth accounts or only database rows. If they authenticated via old raw Supabase calls with the anon key, they may not have proper Supabase Auth accounts.
   - Recommendation: Treat as open access; `shouldCreateUser: true` is correct. Existing users who click a magic link will create a proper Auth account. No migration needed for this phase.

3. **AuthProvider placement: root layout vs `(app)` layout**
   - What we know: The `(app)/layout.tsx` wraps all protected pages. The root `layout.tsx` wraps everything including `/login`.
   - What's unclear: Whether placing AuthProvider only in `(app)/layout.tsx` is sufficient, or whether it should be in root `layout.tsx` for completeness.
   - Recommendation: Place `AuthProvider` in `(app)/layout.tsx` only. The `/login` page doesn't need user state (it's pre-auth), and the `UserModal` and sidebar components are inside `(app)`. This avoids unnecessary Supabase client initialization on the login page.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@supabase/ssr` | Cookie sessions, server clients | Yes | 0.10.0 (installed) | — |
| `@supabase/supabase-js` | `signInWithOtp`, `signOut`, `getUser` | Yes | 2.101.1 (installed) | — |
| Next.js | Middleware, Route Handlers | Yes | 15.2.4 (installed) | — |
| `NEXT_PUBLIC_SUPABASE_URL` | All clients | Assumed present (Phase 1 ran) | — | Check `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All clients | Assumed present (Phase 1 ran) | — | Check `.env.local` |
| Supabase project `emailRedirectTo` URL | Magic link flow | Unknown — needs dashboard check | — | Add to Supabase allowed URLs |

**Missing dependencies with no fallback:**
- Supabase Auth dashboard "Redirect URLs" must include `http://localhost:3000/auth/callback` — this cannot be set in code and requires a one-time manual step in the Supabase project dashboard.

**Missing dependencies with fallback:**
- None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — project has no test infrastructure yet |
| Config file | None |
| Quick run command | N/A — Wave 0 must install |
| Full suite command | N/A — Wave 0 must install |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Magic link email sent for valid email | smoke / manual | manual — requires real email + Supabase connection | N/A |
| AUTH-02 | Session persists after page refresh | smoke / e2e | manual — requires browser + cookie inspection | N/A |
| AUTH-03 | `/modules/brand-foundation` redirects to `/login` when unauthenticated | unit (middleware logic) | `jest` or `vitest` + `next-test-api-route-handler` | Wave 0 |
| AUTH-04 | Callback with valid `?code=` param results in session cookie set | integration | manual (requires real Supabase code) | N/A |
| AUTH-05 | Sign-out clears session and redirects to `/login` | smoke | manual | N/A |

**Note on test feasibility:** AUTH-01, AUTH-02, AUTH-04, AUTH-05 depend on real Supabase Auth network calls and browser cookie behavior — they are not unit-testable in isolation. AUTH-03 (middleware redirect logic) is the one requirement that can be unit tested by passing a mock `NextRequest` to `updateSession`. However, given the project has zero test infrastructure, the practical approach is manual smoke testing using the success criteria as a checklist.

### Sampling Rate

- **Per task commit:** Manual smoke test of the specific feature (e.g., verify login page renders, verify redirect fires)
- **Per wave merge:** Full success criteria checklist (all 5 auth scenarios)
- **Phase gate:** All 5 success criteria passing before `/gsd:verify-work`

### Wave 0 Gaps

- No test framework installed. Given the auth requirements are majority integration/smoke tests requiring a live Supabase connection, recommend:
  - Prioritize manual smoke testing using the success criteria as the validation gate
  - Defer test framework setup to Phase 3 (Data Layer), which will have more unit-testable surface area

*(The team can choose to add Playwright for e2e auth flow testing in a future phase — it is not blocking for Phase 2 planning or execution)*

---

## Project Constraints (from CLAUDE.md)

These are the directives from `CLAUDE.md` that the planner must verify compliance with:

| Directive | How it applies to Phase 2 |
|-----------|--------------------------|
| Tech stack: Next.js 14+ App Router, TypeScript, Tailwind CSS, Supabase JS SDK, React Context | All Phase 2 files must use these — no new libraries |
| Auth: Supabase Auth with magic link only | No password form, no OAuth in this phase |
| Database: No schema changes | Auth phase creates Supabase Auth users — no DB schema changes required |
| Edge functions: Keep unchanged | Phase 2 does not touch edge functions |
| Visual design: Preserve existing color system and layout patterns | Login page uses existing CSS vars (`--surface`, `--orange`, `--text`, `--border`, etc.) |
| `@supabase/ssr` 0.10.0 pinned | Do not upgrade; use `getAll`/`setAll` API |
| `@supabase/supabase-js` 2.101.1 pinned | Already installed |
| Tailwind v4 CSS-first | No `tailwind.config.js` classes; use CSS vars and inline styles as established in Phase 1 |
| React Context (not Zustand/Jotai) | AuthContext uses built-in React Context |
| Shell commands: No `&&`, `||`, `;`, no `$(...)` | Applies to any bash commands in plan tasks |

---

## Sources

### Primary (HIGH confidence)
- [Supabase SSR — Setting up Server-Side Auth for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs) — middleware pattern, `getAll`/`setAll` cookie API, `getUser()` requirement
- [Supabase Auth Magic Link docs](https://supabase.com/docs/guides/auth/auth-magic-link) — `signInWithOtp` API, `emailRedirectTo` parameter
- [Supabase @supabase/ssr GitHub releases](https://github.com/supabase/ssr/releases) — v0.10.0 confirmed, cache header changes
- Existing codebase: `src/lib/supabase/client.ts` + `src/lib/supabase/server.ts` — already implement `getAll`/`setAll` pattern correctly

### Secondary (MEDIUM confidence)
- [Supabase community discussion — route protection with @supabase/ssr](https://github.com/orgs/supabase/discussions/21468) — `updateSession` pattern, middleware helper structure
- [Supabase advanced SSR guide](https://supabase.com/docs/guides/auth/server-side/advanced-guide) — PKCE flow default in `@supabase/ssr`, `exchangeCodeForSession` requirement

### Tertiary (LOW confidence)
- Multiple community implementations of `updateSession` from 2024-2025 — consistent across sources, validates the pattern
- Medium article on getAll/setAll 2025 pattern — cross-references official Supabase statement that `getAll`/`setAll` are ONLY supported cookie methods

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed, versions confirmed in package.json
- Architecture: HIGH — `@supabase/ssr` pattern is well-documented and consistent across official and community sources; existing code already follows it
- Pitfalls: HIGH for `getUser()` vs `getSession()` and cookie API (official Supabase security advisory); MEDIUM for others (consistent community reports, plausible from the API design)

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (30 days; `@supabase/ssr` is stable, Next.js 15.x is not changing rapidly)
