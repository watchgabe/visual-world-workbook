# Phase 7: Deployment - Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Deploy the application to Vercel with all environment variables configured, magic link emails pointing to the correct production callback URL, and the app running without hardcoded keys in the client bundle.

</domain>

<decisions>
## Implementation Decisions

### Vercel project setup
- **D-01:** Create a new Vercel project from scratch. Connect to the existing Git repo.
- **D-02:** Use the default Vercel `.vercel.app` domain. No custom domain for now.

### Environment variables
- **D-03:** Same Supabase project for dev and production — one set of env vars. No staging/production split.
- **D-04:** Environment variables to set in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
  - `SUPABASE_SERVICE_ROLE_KEY` — Service role key (used by admin routes, NOT prefixed with NEXT_PUBLIC_)
- **D-05:** No hardcoded keys in client bundle — verify after deploy by checking page source.

### Magic link redirect URLs
- **D-06:** Manual step — add the production Vercel URL to Supabase Auth > URL Configuration > Redirect URLs in the Supabase dashboard. Document as a checklist item, not a script.
- **D-07:** Auth callback route at `/auth/callback` must work with both localhost and production URL.

### Smoke test
- **D-08:** No smoke tests for now. Skip the end-to-end smoke test requirement. Manual verification by the user after deploy is sufficient.

### Claude's Discretion
- Vercel build settings (should auto-detect Next.js)
- Whether to create a `.env.example` file documenting required variables
- Any build configuration tweaks (output, regions, etc.)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing infrastructure
- `src/lib/supabase/client.ts` — Browser client uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `src/lib/supabase/server.ts` — Server client uses same env vars
- `src/lib/admin/service-client.ts` — Admin service client uses `SUPABASE_SERVICE_ROLE_KEY`
- `src/app/api/claude/route.ts` — Uses `SUPABASE_SERVICE_ROLE_KEY` for edge function proxy
- `src/app/api/circle/route.ts` — Same pattern
- `src/app/api/waterfall/route.ts` — Same pattern
- `src/app/auth/callback/route.ts` — Auth callback that exchanges magic link token
- `src/lib/supabase/middleware.ts` — Auth middleware protecting routes
- `supabase/schema.sql` — SQL to create `blp_responses` and `blp_config` tables

### Requirements
- `.planning/REQUIREMENTS.md` — DEPLOY-01, DEPLOY-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Auth callback route already handles token exchange and redirect
- Middleware already protects `/modules/*` and `/admin/*` routes
- All API routes already use server-side env vars (no NEXT_PUBLIC_ for secrets)

### Established Patterns
- Environment variables accessed via `process.env.NEXT_PUBLIC_SUPABASE_URL!` etc. (non-null assertion)
- No `.env` file committed — env vars expected from environment (Vercel dashboard)

### Integration Points
- Supabase Auth redirect URL configuration (Supabase dashboard)
- Vercel project environment variables (Vercel dashboard)
- Git repo connection (Vercel <-> GitHub/GitLab)

</code_context>

<specifics>
## Specific Ideas

No specific requirements — standard Vercel + Supabase deployment workflow.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-deployment*
*Context gathered: 2026-04-03*
