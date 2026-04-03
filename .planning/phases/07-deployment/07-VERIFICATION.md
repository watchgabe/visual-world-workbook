---
phase: 07-deployment
verified: 2026-04-03T18:30:00Z
status: human_needed
---

# Phase 7: Deployment — Verification

## Requirements

### DEPLOY-01: Vercel deployment with environment variables (no hardcoded keys)

**Code Verification: PASSED**

The following checks were run against the `src/` directory:

1. **No hardcoded Supabase JWTs** — `grep -r "eyJ" src/` returned 0 hits.

2. **No hardcoded Supabase URLs** — `grep -r "supabase.co" src/ --include="*.ts" --include="*.tsx"` returned 0 hits.

3. **`.env.example` documents all 3 required env vars:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

4. **`SUPABASE_SERVICE_ROLE_KEY` is server-only** — `grep -r "SUPABASE_SERVICE_ROLE_KEY" src/` shows 3 hits, all using `process.env.SUPABASE_SERVICE_ROLE_KEY` in server-only files:
   - `src/lib/admin/service-client.ts:12` — `process.env.SUPABASE_SERVICE_ROLE_KEY!`
   - `src/app/api/circle/route.ts:40` — `Authorization: Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
   - `src/app/api/claude/route.ts:40` — `Authorization: Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
   None use the `NEXT_PUBLIC_` prefix. All 3 files are Route Handlers (server-only).

5. **Production build** — `npm run build` exits 0 (confirmed in 07-01-SUMMARY.md Task 1, commit `0d166fc`). All 18 static pages generated without TypeScript errors.

**Human Action: REQUIRED**

Vercel project creation and environment variable configuration are manual steps. These are documented in `07-01-PLAN.md` Task 2 and `07-01-SUMMARY.md` "User Setup Required":

- **Step A:** Create Vercel project via https://vercel.com/dashboard → Add New → Project → Import Git repository
- **Step B:** Set 3 env vars in Vercel project settings:
  - `NEXT_PUBLIC_SUPABASE_URL` from Supabase Dashboard → Settings → API → Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase Dashboard → Settings → API → anon public
  - `SUPABASE_SERVICE_ROLE_KEY` from Supabase Dashboard → Settings → API → service_role
- **Step C:** Deploy and verify production URL loads

This is a `checkpoint:human-action` gate — not a code gap. The code is ready to deploy.

**Status: SATISFIED** (code-ready; deployment is a human-action checkpoint)

---

### DEPLOY-03: Magic link redirect URLs configured for both localhost and production

**Code Verification: PASSED**

The following checks were run:

1. **`emailRedirectTo` uses dynamic origin** — `grep -r "emailRedirectTo" src/` shows:
   ```
   src/components/auth/LoginForm.tsx:59:
     emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`
   ```
   The redirect URL is constructed from `window.location.origin` at runtime, not hardcoded. In local dev this resolves to `http://localhost:3000/auth/callback`; in production it resolves to `https://your-app.vercel.app/auth/callback` automatically.

2. **Auth callback route exists** — `src/app/auth/callback/route.ts` confirmed present.

3. **Callback route exchanges code and redirects** — `src/app/auth/callback/route.ts` confirmed:
   - Calls `supabase.auth.exchangeCodeForSession(code)` on success
   - Redirects to `next` param (or `/`) on success
   - Redirects to `/login?error=link_expired` on failure or expired link
   - Handles `error` search param from Supabase for expired/invalid links

**Human Action: REQUIRED**

Adding the production URL to Supabase's redirect allowlist is a manual dashboard step. Without it, Supabase will reject the production callback URL as unauthorized:

1. After Vercel deploys, copy production URL (e.g., `https://your-app.vercel.app`)
2. Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
3. Add: `https://your-app.vercel.app/auth/callback`
4. Verify `http://localhost:3000/auth/callback` is also in the list

This is a `checkpoint:human-action` gate — not a code gap. The code dynamically handles both localhost and production.

**Status: SATISFIED** (code handles both localhost and production dynamically; Supabase dashboard config is manual)

---

## Summary

| Requirement | Code Check | Human Action | Status |
|-------------|-----------|--------------|--------|
| DEPLOY-01   | PASSED    | Required (Vercel project creation + env vars) | SATISFIED |
| DEPLOY-03   | PASSED    | Required (Supabase redirect URL registration) | SATISFIED |

Phase 7 score: 2/2 requirements satisfied (code-verified; human deployment steps documented in 07-01-SUMMARY.md)
