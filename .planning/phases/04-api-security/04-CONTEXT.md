# Phase 4: API Security - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Server-side Next.js API route wrappers for all three Supabase edge functions (claude-proxy, circle-proxy, waterfall-analyzer) so no API keys or service role secrets ever reach the browser. Three routes: `/api/claude`, `/api/circle`, `/api/waterfall`.

</domain>

<decisions>
## Implementation Decisions

### Authentication on API Routes
- **D-01:** All three API routes require an authenticated Supabase user session. Unauthenticated requests receive 401. Use `getUser()` (not `getSession()`) per Phase 2 security decision.
- **D-02:** No additional role-based checks for v1 — any authenticated user can call any route. Admin-specific access control for circle-proxy actions deferred to Phase 6 (Admin Dashboard).

### Route Structure
- **D-03:** Claude's discretion on whether circle-proxy's two actions (get_member, module_complete) share a single `/api/circle` route or are split into separate routes. Pick the cleanest approach based on codebase patterns.

### Request Validation
- **D-04:** Thin proxy approach — API routes verify auth and forward the request body as-is to the edge function. Edge functions handle their own validation (prompt length, required fields, etc.). No duplicated validation logic.
- **D-05:** Enforce sensible max body size limits on the Next.js side as a safety net: cap prompt/message content and transcript payloads. Claude picks appropriate limits based on edge function behavior (waterfall already truncates at 8,000 chars for Claude API).

### Error Handling
- **D-06:** Claude's discretion on error response format — pick the approach that works best with existing edge function error shapes and the client code that will consume these.
- **D-07:** Log all errors server-side via console.error. Visible in Vercel function logs for production debugging.

### Rate Limiting
- **D-08:** No rate limiting for v1. Small user base (course students), Anthropic API has its own limits. Avoids unnecessary complexity (in-memory state or Redis).

### Claude's Discretion
- D-03: Circle route structure (single route with action field vs split routes)
- D-05: Specific max size limits for prompts and transcripts
- D-06: Error response format (pass-through vs normalized)
- How to forward requests to Supabase edge functions (direct fetch with service role key vs Supabase client invoke)
- Whether to use the existing `src/lib/supabase/server.ts` client or create a separate service-role client for edge function invocation

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Edge Functions (the upstream services being proxied)
- `old/supabase/functions/claude-proxy/index.ts` — Full source: accepts `{prompt, messages, maxTokens}`, returns `{text}`. Uses ANTHROPIC_API_KEY from Deno.env.
- `old/supabase/functions/circle-proxy/index.ts` — Full source: two actions (`get_member`, `module_complete`). Uses CIRCLE_API_KEY and CIRCLE_COMMUNITY_ID from Deno.env.
- `old/supabase/functions/waterfall-analyzer/index.ts` — Full source: accepts `{transcript, videoId}`, returns `{waterfall, transcriptLength}`. Uses ANTHROPIC_API_KEY, can fetch YouTube transcript by videoId.

### Old Client Code (how edge functions are currently called)
- `old/modules/content.html` line 1788 — claude-proxy call with hardcoded anon key and Supabase URL
- `old/modules/content.html` line 1861 — circle-proxy module_complete call
- `old/modules/visual-world.html` lines 1733, 2566, 2897, 3410, 3507 — Multiple claude-proxy calls (AI content generation)
- `old/modules/brand-foundation.html` line 3951 — claude-proxy call
- `old/admin.html` line 373 — circle-proxy get_member call from admin panel

### Existing Codebase
- `src/lib/supabase/server.ts` — Server Supabase client with cookie-based auth
- `src/middleware.ts` — Auth middleware using `updateSession`
- `src/lib/supabase/middleware.ts` — Middleware implementation with getUser() pattern

### Project Specs
- `.planning/REQUIREMENTS.md` — API-01, API-02, API-03 are Phase 4 requirements
- `.planning/ROADMAP.md` §Phase 4 — Success criteria
- `CLAUDE.md` §Technology Stack — Pinned versions

### Prior Phase Context
- `.planning/phases/02-authentication/02-CONTEXT.md` — Auth patterns, getUser() decision, session handling

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/supabase/server.ts` — Server Supabase client (createServerClient from @supabase/ssr) with cookie handling. Can be used in API routes to verify user session.
- `src/middleware.ts` — Already protects routes via matcher pattern. API routes under `/api/*` are matched by the middleware.
- `src/context/AuthContext.tsx` — Client-side auth state (not directly used in API routes but relevant for understanding the auth flow)

### Established Patterns
- **Server client pattern:** `createClient()` async function from `src/lib/supabase/server.ts` — same pattern usable in API route handlers
- **Auth verification:** `getUser()` over `getSession()` for JWT revalidation (Phase 2 security decision)
- **Route handlers:** No existing API route handlers yet — Phase 4 establishes the pattern for `src/app/api/` directory

### Integration Points
- `src/app/api/claude/route.ts` — New route handler for claude-proxy
- `src/app/api/circle/route.ts` — New route handler for circle-proxy (structure TBD per D-03)
- `src/app/api/waterfall/route.ts` — New route handler for waterfall-analyzer
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL` (existing), plus Supabase service role key or edge function invocation URL needed for server-side calls

</code_context>

<specifics>
## Specific Ideas

- The key security win is moving from hardcoded `Authorization: Bearer eyJhbG...` anon keys in browser HTML to server-side API routes where keys live in environment variables
- Edge functions remain unchanged — the API routes are a pass-through layer that adds auth and hides secrets
- The old code uses direct `fetch()` to `https://ljddfhzrjvxpedvfebli.supabase.co/functions/v1/{function-name}` — the new code will call these same URLs from the server side

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-api-security*
*Context gathered: 2026-04-02*
