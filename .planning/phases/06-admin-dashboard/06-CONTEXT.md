# Phase 6: Admin Dashboard - Context

**Gathered:** 2026-04-02
**Status:** Ready for planning

<domain>
## Phase Boundary

Server-side protected admin dashboard where admins can view all users, inspect any user's full module progress and answers, award Circle.so badges, and delete accounts. Replaces the old client-side password-gated admin.html with proper role-based access control.

</domain>

<decisions>
## Implementation Decisions

### Access control
- **D-01:** Admin role determined by `user.app_metadata.role === 'admin'` — set via Supabase dashboard or service role API. Most secure, can't be spoofed client-side.
- **D-02:** Defense in depth — middleware checks admin role and redirects non-admins away from `/admin/*`; each admin page server component also verifies role independently.

### User detail view
- **D-03:** Expandable row pattern (same as old admin) — click a user row to expand inline showing progress bars, Circle profile, and all module answers. Single-page experience, no separate user detail route.
- **D-04:** Full answer data display — all user answers grouped by module/section with human-readable labels (200+ field labels mapped from old admin's LABELS object). Exact 1:1 migration of old admin's answer grid.

### Badge & delete actions
- **D-05:** Circle.so API key entered by admin in a config strip UI (same UX as old admin), but persisted to a Supabase config/settings table instead of localStorage. Shared across devices, persists server-side.
- **D-06:** Circle.so badge award uses existing `/api/circle` route handler (Phase 4). Admin triggers badge from the user detail panel.
- **D-07:** User deletion requires confirmation dialog showing user email before executing. Deletes auth user + their responses from `blp_responses`.

### Layout & navigation
- **D-08:** Standalone layout — admin has its own layout.tsx with header (brand + logout), not inside the app shell sidebar. Clean separation between student and admin experience.
- **D-09:** Supports dark/light theme toggle — reuses existing ThemeContext. Admin respects user's theme preference, consistent with rest of app.

### Claude's Discretion
- Stat cards design (total users, started, completed, active 7d) — follow old admin's pattern
- User table column design and sorting
- Loading/empty states for user list
- Circle profile card design within expanded detail row
- Answer grid layout and responsive behavior
- Config strip positioning and styling

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Old admin reference
- `old/admin.html` — Complete old admin implementation. Contains: auth flow, stat cards, user table, expandable detail rows, Circle profile card, answer grid with 200+ LABELS mapping, delete flow, Circle config strip. This is the source of truth for 1:1 feature parity.

### Existing infrastructure
- `src/lib/supabase/middleware.ts` — Already protects `/admin` routes (line 38). Needs admin role check added.
- `src/app/api/circle/route.ts` — Existing Circle.so proxy route handler. Admin badge award calls go through this.
- `src/lib/supabase/server.ts` — Server-side Supabase client creator for use in admin server components.
- `src/lib/supabase/client.ts` — Browser Supabase client for client-side operations.

### Requirements
- `.planning/REQUIREMENTS.md` — ADMIN-01 through ADMIN-05 define acceptance criteria for this phase.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ThemeContext` (src/contexts/ThemeContext.tsx): Admin layout can wrap with ThemeProvider for dark/light toggle support
- `/api/circle` route handler: Already wraps circle-proxy edge function — admin badge award uses this directly
- `createClient()` from `src/lib/supabase/server.ts`: Server-side Supabase client for admin page data fetching
- `updateSession()` in middleware: Already redirects unauthenticated users from `/admin/*` — needs role check addition

### Established Patterns
- Server components fetch data with `createClient()` + `getUser()` (Phase 2 pattern)
- `user.app_metadata.role` is the Supabase convention for role-based access
- Standalone layouts: login page already uses its own layout bypassing the (app) route group — admin can follow same pattern
- API route handlers use auth guard + edge function proxy pattern (Phase 4)

### Integration Points
- Middleware (`src/lib/supabase/middleware.ts`): Add admin role check for `/admin/*` paths
- App routing: New `/admin` route group with its own layout.tsx (outside `(app)` group)
- Supabase queries: Read from `auth.users` (via service role) and `blp_responses` table
- Circle.so: Badge award calls `/api/circle` with appropriate action payload

</code_context>

<specifics>
## Specific Ideas

- Old admin's LABELS object (200+ entries mapping field keys to human-readable names) must be migrated for the answer display grid
- Old admin's field grouping logic (CC_EXACT for content module detection, ig_ prefix for content pillars, opt_ prefix for option selectors) should be preserved
- Config strip for Circle API key + Community ID at top of dashboard, same UX as old admin
- Stat row with 4 cards: Total Users, Started, Completed All 4, Active Last 7 Days — matching old admin exactly

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-admin-dashboard*
*Context gathered: 2026-04-02*
