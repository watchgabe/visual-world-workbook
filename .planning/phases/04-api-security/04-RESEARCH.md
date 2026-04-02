# Phase 4: API Security - Research

**Researched:** 2026-04-02
**Domain:** Next.js Route Handlers — server-side proxy for Supabase Edge Functions
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** All three API routes require an authenticated Supabase user session. Unauthenticated requests receive 401. Use `getUser()` (not `getSession()`) per Phase 2 security decision.
- **D-02:** No additional role-based checks for v1 — any authenticated user can call any route. Admin-specific access control for circle-proxy actions deferred to Phase 6.
- **D-04:** Thin proxy approach — API routes verify auth and forward the request body as-is to the edge function. Edge functions handle their own validation. No duplicated validation logic.
- **D-05:** Enforce sensible max body size limits on the Next.js side as a safety net. Claude picks appropriate limits based on edge function behavior (waterfall already truncates at 8,000 chars for Claude API).
- **D-07:** Log all errors server-side via `console.error`. Visible in Vercel function logs.
- **D-08:** No rate limiting for v1.

### Claude's Discretion

- **D-03:** Circle route structure (single `/api/circle` route with action field vs split routes)
- **D-05:** Specific max size limits for prompts and transcripts
- **D-06:** Error response format (pass-through vs normalized)
- How to forward requests to Supabase edge functions (direct `fetch` with service role key vs Supabase client `.functions.invoke()`)
- Whether to use the existing `src/lib/supabase/server.ts` client or create a separate service-role client for edge function invocation

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| API-01 | Next.js API route wrapping claude-proxy edge function (API keys server-side) | Route handler pattern, auth guard, fetch-to-edge-function invocation |
| API-02 | Next.js API route wrapping circle-proxy edge function (API keys server-side) | Same pattern; circle-proxy body shape (action, email, module_key, community_id) documented below |
| API-03 | Next.js API route wrapping waterfall-analyzer edge function (API keys server-side) | Same pattern; transcript truncation limit from edge function source confirmed at 8,000 chars |
</phase_requirements>

---

## Summary

Phase 4 is a thin server-side proxy layer. Three Next.js Route Handlers (`/api/claude`, `/api/circle`, `/api/waterfall`) sit between the browser and Supabase Edge Functions, authenticating the caller and forwarding the request body. No validation logic is duplicated — edge functions own their own validation. The security win is that `ANTHROPIC_API_KEY`, `CIRCLE_API_KEY`, and the Supabase service role key never appear in browser network traffic.

The existing codebase has a fully working auth pattern from Phase 2 (`createClient()` + `getUser()`) that API routes can reuse directly. No new patterns need to be invented — Route Handlers in Next.js 15 App Router are well-documented and the `@supabase/ssr` `createServerClient` already handles cookie-based session reading in server context.

The primary discretion decision is **how to call the edge functions server-side**: direct `fetch()` to the Supabase edge function URL with the service role key in the `Authorization` header, or using the `supabase.functions.invoke()` helper. Direct `fetch` is more transparent and avoids needing a separate service-role client module for this use case.

**Primary recommendation:** Use direct `fetch()` from Route Handlers with `SUPABASE_SERVICE_ROLE_KEY` in the Authorization header (Bearer token). This mirrors exactly how the old browser code worked — only the key changes from the anon key to the service role key, and the call origin moves from browser to server.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js Route Handlers | built-in (15.2.4) | Server-side API endpoints | App Router native pattern, no extra package needed |
| `@supabase/ssr` | 0.10.0 (installed) | Read session cookies in Route Handler | Already installed; `createServerClient` works in Route Handler context |
| `@supabase/supabase-js` | 2.101.1 (installed) | `supabase.auth.getUser()` | Already installed; used by Phase 2 auth pattern |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Native `fetch` | Node 18+ built-in | Call Supabase edge functions from server | No extra package; same API as browser fetch; available in Next.js 15 Route Handlers |

### No new dependencies required

All packages needed for Phase 4 are already in `package.json`. No `npm install` step.

---

## Architecture Patterns

### Recommended Project Structure

```
src/app/api/
├── claude/
│   └── route.ts        # POST /api/claude — wraps claude-proxy
├── circle/
│   └── route.ts        # POST /api/circle — wraps circle-proxy (both actions)
└── waterfall/
    └── route.ts        # POST /api/waterfall — wraps waterfall-analyzer
```

### Pattern 1: Route Handler with Auth Guard

Every route follows this structure:

```typescript
// src/app/api/claude/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  // 1. Auth guard — getUser() revalidates JWT (Phase 2 decision)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse and size-cap request body
  const body = await request.json()
  // ... apply size limits (see D-05 guidance below)

  // 3. Forward to edge function with service role key
  const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claude-proxy`
  const response = await fetch(edgeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(body),
  })

  // 4. Return edge function response to browser
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
```

**Why service role key, not anon key:** The anon key works for edge functions (the old code used it), but using the service role key on the server side is cleaner — it's already an environment variable the server owns, it bypasses any RLS restrictions on the function, and it makes the intent explicit (server-to-server call).

**Why reuse `createClient()` from `server.ts`:** The existing function already wires up cookie-based session reading correctly. Creating a second client for just the auth check would be redundant. The `createClient()` result is used only to call `supabase.auth.getUser()` — no DB queries needed.

### Pattern 2: Body Size Limits for D-05

Based on edge function source analysis:

| Route | Body field | Recommended cap | Rationale |
|-------|-----------|-----------------|-----------|
| `/api/claude` | `prompt` (string) | 20,000 chars | Generous for AI content gen; edge function has no cap of its own |
| `/api/claude` | `messages` (array) | Serialize and cap at 50,000 chars total | Vision/image calls can be larger |
| `/api/circle` | Full body | 2,000 chars | Only action/email/module_key/community_id — tiny fields |
| `/api/waterfall` | `transcript` (string) | 10,000 chars | Edge function truncates to 8,000 itself; 10k gives a small buffer before rejection |

Implementation: Check `JSON.stringify(body).length` before forwarding. Return 413 if exceeded.

```typescript
const bodyStr = JSON.stringify(body)
if (bodyStr.length > MAX_BODY_SIZE) {
  return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
}
```

### Pattern 3: Error Handling (D-06)

**Recommendation: pass-through errors from edge functions.** The edge functions return structured `{ error: string }` JSON with meaningful HTTP status codes. The client code in old HTML already reads `data.error`. Passing edge function error responses straight through (same status code, same body) means:
1. No mapping logic needed
2. Existing client error-handling patterns continue to work unchanged
3. A new wrapper error from the Route Handler itself (network failure calling edge function) gets a generic 502.

```typescript
// Network failure calling the edge function
try {
  const response = await fetch(edgeUrl, ...)
  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
} catch (err) {
  console.error('[/api/claude] edge function call failed:', err)
  return NextResponse.json({ error: 'Service unavailable' }, { status: 502 })
}
```

### Pattern 4: Circle Route Structure (D-03)

**Recommendation: single `/api/circle` route.** The circle-proxy edge function is already action-dispatched — callers send `{ action: 'get_member' | 'module_complete', ... }`. Splitting into two Next.js routes would mean the action field is duplicated in the URL structure AND in the body. A single route with pass-through body is consistent with the thin proxy approach (D-04) and requires zero client-side URL changes when migrating the old code.

### Anti-Patterns to Avoid

- **Using `getSession()` instead of `getUser()`:** `getSession()` reads the JWT from the cookie without server-side revalidation. If a session is revoked, `getSession()` will still return data. Phase 2 established `getUser()` as the secure pattern.
- **Using the anon key as Authorization on server-side edge function calls:** Works, but misrepresents the security boundary. The anon key is for browser clients. Use the service role key server-side.
- **Duplicating edge function validation:** D-04 explicitly prohibits this. Edge functions own their own input validation. The Route Handler only enforces: (1) auth, (2) body size cap.
- **Returning raw `Response` instead of `NextResponse.json()`:** In Next.js App Router, Route Handlers should use `NextResponse` for correct type handling.
- **Ignoring OPTIONS preflight in Route Handlers:** Next.js 15 handles CORS preflight automatically for Route Handlers when accessed from the same origin. The edge functions' CORS headers are irrelevant once the browser talks to `/api/*` instead of Supabase directly.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session validation | Custom JWT parsing | `supabase.auth.getUser()` from `createClient()` | Handles token refresh, revalidation against Supabase Auth server |
| Body parsing | `request.text()` + `JSON.parse()` | `request.json()` | Built into `NextRequest`; handles encoding, throws on invalid JSON |
| Error serialization | Custom error classes | `NextResponse.json({ error: msg }, { status: N })` | Standard Next.js pattern, correct content-type headers |

**Key insight:** This phase is infrastructure plumbing — the less custom code, the better. The security property (keys stay server-side) is structural, not algorithmic.

---

## Edge Function Interface Reference

Verified by direct source reading from `old/supabase/functions/`.

### claude-proxy

**URL:** `{SUPABASE_URL}/functions/v1/claude-proxy`
**Method:** POST
**Request body:**
```typescript
{
  prompt?: string        // plain text prompt (min 5 chars when trimmed)
  messages?: Array<{role: string, content: any}>  // OR messages array for vision
  maxTokens?: number     // defaults to 1000
}
```
**Response body:**
```typescript
{ text: string }                   // success
{ error: string }                  // failure (various status codes)
```
**Notes:** Accepts either `prompt` OR `messages` array, not both. Calls `claude-sonnet-4-5` model.

### circle-proxy

**URL:** `{SUPABASE_URL}/functions/v1/circle-proxy`
**Method:** POST
**Request body:**
```typescript
{
  action: 'get_member' | 'module_complete'
  email: string           // required for both actions
  community_id?: string   // optional; defaults to '301190' from env
  module_key?: string     // required for module_complete ('cf'|'vw'|'cc'|'launch-v1')
}
```
**Response body:**
```typescript
// get_member success:
{ member: CircleMember | null }

// module_complete success:
{ success: true, member_id: number, headline: string }

// failure:
{ error: string, detail?: string }
```
**Notes:** `community_id` falls back to `CIRCLE_COMMUNITY_ID` env var (value `'301190'`). The proxy does NOT require callers to pass `community_id` — it's optional.

### waterfall-analyzer

**URL:** `{SUPABASE_URL}/functions/v1/waterfall-analyzer`
**Method:** POST
**Request body:**
```typescript
{
  transcript?: string   // raw text content (min 50 chars)
  videoId?: string      // YouTube video ID — fetches transcript server-side if no transcript provided
}
```
**Response body:**
```typescript
// success:
{ waterfall: WaterfallObject, transcriptLength: number }

// failure:
{ error: string }
```
**Notes:** Edge function truncates transcript to 8,000 chars before sending to Claude (`transcript.substring(0, 8000)` in `buildPrompt`). Uses `claude-opus-4-5` model. Returns rich JSON waterfall structure.

---

## Environment Variables

### Required (must exist in `.env.local` and Vercel)

| Variable | Existing | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (Phase 1) | Base URL for edge function calls |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (Phase 1) | Already in env; NOT used in API routes |
| `SUPABASE_SERVICE_ROLE_KEY` | **NEW — must add** | Authorization for server-to-server edge function calls |

**SUPABASE_SERVICE_ROLE_KEY is the only new environment variable this phase introduces.** It must be added to:
1. `.env.local` for local development
2. Vercel environment variables for production

This key must NEVER be prefixed with `NEXT_PUBLIC_` — doing so would expose it to the browser.

---

## Common Pitfalls

### Pitfall 1: Middleware Intercepting API Routes

**What goes wrong:** The middleware in `src/middleware.ts` matches all routes except static assets. When an unauthenticated request hits `/api/claude`, the middleware currently only redirects `/modules/*` and `/admin/*` — `/api/*` requests from unauthenticated clients pass through to the Route Handler.

**Why it happens:** The middleware's `isProtected` check only covers `/modules` and `/admin`. This is intentional — API routes are responsible for their own auth response (401 JSON vs. HTML redirect).

**How to avoid:** Route Handlers must call `getUser()` themselves and return 401 JSON (not a redirect). The middleware MUST NOT redirect `/api/*` to `/login` — that would return HTML to an API client. Confirmed: current middleware implementation only redirects on `/modules` and `/admin` paths. No change to middleware needed.

**Warning signs:** If `/api/claude` returns a 302 redirect to `/login`, the middleware has been incorrectly expanded.

### Pitfall 2: Service Role Key in NEXT_PUBLIC_ Variable

**What goes wrong:** Developer accidentally names the variable `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` — Next.js bundles all `NEXT_PUBLIC_*` variables into the client JavaScript bundle. The service role key becomes visible in the browser.

**Why it happens:** Copy-paste from existing `NEXT_PUBLIC_SUPABASE_*` variables.

**How to avoid:** The variable MUST be `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix). Verify with `process.env.SUPABASE_SERVICE_ROLE_KEY` in Route Handler (server context only).

**Warning signs:** The Vercel deployment build will warn if a non-`NEXT_PUBLIC_` variable is used in a client component. No warning = correct.

### Pitfall 3: Calling `createClient()` in a Route Handler That Also Writes Cookies

**What goes wrong:** `createClient()` from `server.ts` calls `cookies()` from `next/headers`, which is a Server Component API. In a Route Handler, this works correctly for reading cookies but cookie writes in Route Handlers require using `NextResponse.cookies` — the `setAll` try/catch in `server.ts` silently swallows write errors from Route Handlers.

**Why it happens:** The `setAll` try/catch was designed for Server Components that can't set cookies. Route Handlers can set cookies via the response object.

**How to avoid:** For Phase 4, Route Handlers only read the session (auth check) — no session mutation occurs. `createClient()` used only for `getUser()` is safe. No cookie-writing is needed in these proxy routes.

### Pitfall 4: Forgetting to Await `request.json()`

**What goes wrong:** `request.json()` is async in Next.js 15 Route Handlers. Forgetting `await` results in a Promise being forwarded to the edge function instead of the parsed body.

**How to avoid:** Always `const body = await request.json()`. TypeScript won't catch this — it's a runtime error.

### Pitfall 5: Edge Function Returns Non-JSON on Some Error Paths

**What goes wrong:** If the edge function URL is wrong or Supabase is down, the response may be HTML (Supabase error page) not JSON. Calling `response.json()` throws, which the outer try/catch catches — but the error message will be confusing.

**How to avoid:** Check `response.headers.get('content-type')` before calling `.json()`, or wrap in try/catch and fall back to reading `.text()` for error logging. Since D-07 says log all errors via `console.error`, log the raw text when JSON parse fails.

---

## Code Examples

### Complete `/api/claude/route.ts`

```typescript
// Source: established project pattern + Next.js App Router Route Handler docs
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_BODY_CHARS = 50_000  // covers prompt (20k) or messages array

export async function POST(request: NextRequest) {
  // Auth guard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Size guard
  const bodyStr = JSON.stringify(body)
  if (bodyStr.length > MAX_BODY_CHARS) {
    return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
  }

  // Forward to edge function
  const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claude-proxy`
  try {
    const edgeRes = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: bodyStr,
    })
    const data = await edgeRes.json()
    return NextResponse.json(data, { status: edgeRes.status })
  } catch (err) {
    console.error('[/api/claude] edge function error:', err)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 502 })
  }
}
```

The circle and waterfall routes follow the same structure with different `edgeUrl`, `MAX_BODY_CHARS`, and function name in the error log.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `fetch()` from browser HTML with hardcoded anon JWT | `fetch()` from Next.js Route Handler with service role key in env var | Phase 4 (this phase) | Secrets leave browser entirely |
| `@supabase/auth-helpers-nextjs` for server auth | `@supabase/ssr` `createServerClient` | Already in place (Phase 2) | Already correct |
| `getSession()` in server auth check | `getUser()` with JWT revalidation | Already in place (Phase 2) | Already correct |

---

## Environment Availability

**Step 2.6: SKIPPED — no new external dependencies.** Phase 4 adds server-side `fetch()` calls to Supabase edge functions, which are already deployed and working. No new tools, services, or runtimes needed. The only requirement is the `SUPABASE_SERVICE_ROLE_KEY` environment variable — this is a configuration task, not a dependency to probe.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run tests/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| API-01 | `/api/claude` returns 401 for unauthenticated request | unit | `npx vitest run tests/api.test.ts -t "claude"` | Wave 0 |
| API-01 | `/api/claude` returns 413 when body exceeds size limit | unit | `npx vitest run tests/api.test.ts -t "claude"` | Wave 0 |
| API-01 | `/api/claude` forwards body to edge function and returns response | unit (mocked fetch) | `npx vitest run tests/api.test.ts -t "claude"` | Wave 0 |
| API-02 | `/api/circle` returns 401 for unauthenticated request | unit | `npx vitest run tests/api.test.ts -t "circle"` | Wave 0 |
| API-02 | `/api/circle` forwards action/email body to edge function | unit (mocked fetch) | `npx vitest run tests/api.test.ts -t "circle"` | Wave 0 |
| API-03 | `/api/waterfall` returns 401 for unauthenticated request | unit | `npx vitest run tests/api.test.ts -t "waterfall"` | Wave 0 |
| API-03 | `/api/waterfall` rejects transcript > 10,000 chars with 413 | unit | `npx vitest run tests/api.test.ts -t "waterfall"` | Wave 0 |
| API-03 | `/api/waterfall` forwards transcript and returns waterfall response | unit (mocked fetch) | `npx vitest run tests/api.test.ts -t "waterfall"` | Wave 0 |

**Note on testing Route Handlers with Vitest:** Next.js Route Handlers can be imported and called directly in Vitest tests using `NextRequest`. The `createClient` Supabase call and the outbound `fetch` to edge functions both need to be mocked. The project already uses `vi.mock()` for Supabase clients — same pattern applies here.

```typescript
// Vitest mock pattern for Route Handler tests
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))
// Mock global fetch to intercept edge function calls
global.fetch = vi.fn()
```

### Sampling Rate

- **Per task commit:** `npx vitest run tests/api.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/api.test.ts` — covers API-01, API-02, API-03 (three describe blocks)
- [ ] `process.env.NEXT_PUBLIC_SUPABASE_URL` and `process.env.SUPABASE_SERVICE_ROLE_KEY` need to be set in test environment or mocked via `vi.stubEnv()`

---

## Open Questions

1. **Should `SUPABASE_SERVICE_ROLE_KEY` be added to `.env.local.example`?**
   - What we know: Project has no `.env.local.example` yet
   - What's unclear: Whether the project tracks an example env file
   - Recommendation: Add it as part of Wave 1 setup. Document the variable name clearly so it doesn't get prefixed with `NEXT_PUBLIC_`.

2. **Is there a `.env.local` already with the Supabase URL and anon key?**
   - What we know: The app is functional from Phase 1-3, so these vars exist locally
   - What's unclear: Whether to add the service role key task to the plan explicitly
   - Recommendation: Plan should include a Wave 0 task to add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` — not the value (that's secret), but the planner should note it as a prerequisite.

---

## Sources

### Primary (HIGH confidence)

- Direct source reading: `old/supabase/functions/claude-proxy/index.ts` — full interface documented
- Direct source reading: `old/supabase/functions/circle-proxy/index.ts` — full interface documented
- Direct source reading: `old/supabase/functions/waterfall-analyzer/index.ts` — full interface documented
- Direct source reading: `src/lib/supabase/server.ts` — existing `createClient()` pattern
- Direct source reading: `src/lib/supabase/middleware.ts` — `getUser()` pattern confirmed
- Direct source reading: `old/modules/content.html` lines 1788, 1861 — old browser call patterns
- Direct source reading: `old/admin.html` line 373 — circle get_member call pattern
- Direct source reading: `vitest.config.ts` — test framework confirmed
- Direct source reading: `package.json` — all installed versions confirmed

### Secondary (MEDIUM confidence)

- Next.js App Router Route Handler docs (established pattern, verified by prior phase usage)
- `@supabase/ssr` docs pattern for Route Handler auth (same `createServerClient` used in middleware)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed and in use
- Architecture: HIGH — patterns derived directly from source code, not from documentation guesses
- Pitfalls: HIGH — all pitfalls verified against actual code paths in the project
- Test strategy: MEDIUM — Route Handler unit testing with Vitest is a known pattern but no existing API tests to reference in this project

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (30 days — stable stack)
