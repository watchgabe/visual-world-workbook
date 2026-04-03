# Phase 4: API Security - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 04-api-security
**Areas discussed:** Auth on API routes, Request validation, Error handling, Rate limiting

---

## Auth on API Routes

### Q1: Should all three API routes require an authenticated user session?

| Option | Description | Selected |
|--------|-------------|----------|
| All routes require auth (Recommended) | Every API route checks for a valid Supabase session via getUser(). Unauthenticated requests get 401. Simple, consistent, secure. | ✓ |
| Student routes auth, admin routes role-check | claude/waterfall require any authenticated user. circle-proxy additionally checks for admin role. | |
| Auth + admin role on circle | All require auth. Circle-proxy requires admin role for get_member but allows module_complete from any user. | |

**User's choice:** All routes require auth (Recommended)
**Notes:** Simple and consistent approach. No role-based checks for v1.

### Q2: Should circle-proxy actions share one route or be split?

| Option | Description | Selected |
|--------|-------------|----------|
| Single /api/circle route | Mirrors edge function structure. Action field determines behavior. | |
| Split into /api/circle and /api/admin/circle | Student-facing and admin-facing separated. | |
| You decide | Claude picks the cleanest approach. | ✓ |

**User's choice:** You decide
**Notes:** Claude has discretion on route structure.

---

## Request Validation

### Q1: How much validation should the API routes do?

| Option | Description | Selected |
|--------|-------------|----------|
| Thin proxy — minimal validation (Recommended) | Verify auth, forward body as-is. Edge functions handle validation. Only add max body size check. | ✓ |
| Full validation with Zod | Define Zod schemas for each route. Catches bad requests early but duplicates logic. | |
| Allowlist fields only | Strip unexpected fields before forwarding. | |

**User's choice:** Thin proxy — minimal validation (Recommended)
**Notes:** Avoids duplicating validation logic in two places.

### Q2: Max prompt/transcript length on Next.js side?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — sensible limits | Cap prompt at ~10,000 chars, transcript at ~50,000 chars. | ✓ |
| No limits — edge functions handle it | Edge functions already truncate. | |
| You decide | Claude picks appropriate limits. | |

**User's choice:** Yes — sensible limits
**Notes:** Prevents accidental huge payloads from hitting edge functions and Anthropic API.

---

## Error Handling

### Q1: How should API route errors be returned to the browser?

| Option | Description | Selected |
|--------|-------------|----------|
| Pass through edge function errors (Recommended) | Forward JSON error response and status code as-is. | |
| Normalize to consistent format | Wrap all errors in standard shape. | |
| You decide | Claude picks best approach for existing error shapes. | ✓ |

**User's choice:** You decide
**Notes:** Claude has discretion on error format.

### Q2: Should API routes log errors server-side?

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — log all errors | console.error on any failure. Visible in Vercel function logs. | ✓ |
| Log only 5xx errors | Skip 4xx to reduce noise. | |
| No logging | Silent proxy. | |

**User's choice:** Yes — log all errors
**Notes:** Helps debug production issues via Vercel function logs.

---

## Rate Limiting

### Q1: Rate limiting for AI calls?

| Option | Description | Selected |
|--------|-------------|----------|
| No rate limiting for v1 (Recommended) | Skip for now. Small user base, Anthropic has own limits. | ✓ |
| Simple in-memory rate limit | Basic per-user limit using Map. Resets on restart. | |
| You decide | Claude picks based on scale and deployment. | |

**User's choice:** No rate limiting for v1 (Recommended)
**Notes:** Avoids unnecessary complexity for a small course platform.

---

## Claude's Discretion

- Circle route structure (single vs split)
- Specific max size limits for payloads
- Error response format

## Deferred Ideas

None — discussion stayed within phase scope
