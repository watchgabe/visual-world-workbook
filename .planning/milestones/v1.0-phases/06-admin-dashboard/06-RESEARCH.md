# Phase 6: Admin Dashboard — Research

**Researched:** 2026-04-02
**Domain:** Next.js App Router admin dashboard — server-side role-based access, Supabase service-role queries, expandable row UI, Circle.so badge award, user deletion
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Admin role determined by `user.app_metadata.role === 'admin'` — set via Supabase dashboard or service role API. Most secure, can't be spoofed client-side.
- **D-02:** Defense in depth — middleware checks admin role and redirects non-admins away from `/admin/*`; each admin page server component also verifies role independently.
- **D-03:** Expandable row pattern (same as old admin) — click a user row to expand inline showing progress bars, Circle profile, and all module answers. Single-page experience, no separate user detail route.
- **D-04:** Full answer data display — all user answers grouped by module/section with human-readable labels (200+ field labels mapped from old admin's LABELS object). Exact 1:1 migration of old admin's answer grid.
- **D-05:** Circle.so API key entered by admin in a config strip UI (same UX as old admin), but persisted to a Supabase config/settings table instead of localStorage. Shared across devices, persists server-side.
- **D-06:** Circle.so badge award uses existing `/api/circle` route handler (Phase 4). Admin triggers badge from the user detail panel.
- **D-07:** User deletion requires confirmation dialog showing user email before executing. Deletes auth user + their responses from `blp_responses`.
- **D-08:** Standalone layout — admin has its own layout.tsx with header (brand + logout), not inside the app shell sidebar. Clean separation between student and admin experience.
- **D-09:** Supports dark/light theme toggle — reuses existing ThemeContext. Admin respects user's theme preference, consistent with rest of app.

### Claude's Discretion

- Stat cards design (total users, started, completed, active 7d) — follow old admin's pattern
- User table column design and sorting
- Loading/empty states for user list
- Circle profile card design within expanded detail row
- Answer grid layout and responsive behavior
- Config strip positioning and styling

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-01 | Server-side protected admin route (role-based, not client-side password) | D-01 + D-02: `app_metadata.role === 'admin'` checked in middleware AND server component. Service role client bypasses RLS for auth.users list. |
| ADMIN-02 | Admin can view list of all users | Service role Supabase client calls `supabase.auth.admin.listUsers()`. Stat cards computed from blp_responses. Old admin LABELS + field grouping logic migrated as a TypeScript module. |
| ADMIN-03 | Admin can view any user's progress across all modules | blp_responses queried by user_id. expandable row renders progress bars + answer grid inline. 200+ LABELS object migrated 1:1 from old admin.html. |
| ADMIN-04 | Admin can trigger Circle.so badge award for a user | Existing `/api/circle` POST handler (Phase 4) accepts `action: 'award_badge'`. Config strip reads Circle API key + community ID from Supabase config table. |
| ADMIN-05 | Admin can delete a user account | Supabase admin API `supabase.auth.admin.deleteUser(userId)` — `blp_responses` cascade-deletes via FK. Confirmation dialog required (D-07). |
</phase_requirements>

---

## Summary

The admin dashboard replaces a client-side password-gated HTML page with a proper server-rendered, role-gated Next.js route. The critical shift is that access control now lives server-side (middleware + server component double-check), and privileged Supabase operations (listing all auth users, deleting auth users) require a service-role client — the anon client cannot perform those operations.

The old admin.html is a complete, working reference implementation. Its LABELS object (200+ field keys mapped to human-readable strings), field-grouping logic (CC_EXACT for content module detection, `ig_` prefix for content pillars, `opt_` prefix for option selectors, `ca[123]` for competitor analysis), and UI patterns (expandable rows, stat cards, config strip, Circle card, answer grid) must be migrated 1:1 into TypeScript.

The database schema has changed from the old app's `vww_users` + `vww_progress` tables to the new `blp_responses` table (one row per user per module_slug, JSONB responses column). The admin must work with this new schema — querying `auth.users` for the user list and `blp_responses` for per-module answer data.

**Primary recommendation:** Build as a `src/app/admin/` route group with its own `layout.tsx`. All data fetching (user list, blp_responses) happens in server components using a service-role Supabase client. Mutations (delete user, save Circle config, award badge) use client-side fetch calls to dedicated API route handlers. The expandable row is a Client Component receiving user data as props.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@supabase/supabase-js` | 2.101.1 (in use) | Admin API — `auth.admin.listUsers()`, `auth.admin.deleteUser()` | The `auth.admin` namespace requires the service role key, which is already in env. This is the only way to list all auth users without custom RPC. |
| `@supabase/ssr` | 0.10.0 (in use) | `createServerClient` for service-role server component | Already used for regular server client; same API, different key. |
| Next.js Route Handlers | built-in | API endpoints for mutations (delete user, save config, award badge) | Consistent with Phases 2-4 patterns. Keeps service role key server-side. |
| React (Client Components) | 19.x (in use) | Expandable row state, confirmation dialog, Circle config form | Row expand/collapse and dialogs require client-side interactivity. |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ThemeContext (project) | existing | Dark/light toggle in admin layout | D-09: admin wraps with ThemeProvider, reads cookie for initial theme |
| `useRouter` (Next.js) | built-in | Post-delete page refresh | Call `router.refresh()` after successful user deletion to re-fetch server component data |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `auth.admin.listUsers()` | Custom RPC + `auth.users` view | Service role admin API is simpler and type-safe. RPC requires a DB function and additional migration. |
| Server component data fetching | Client-side fetch with anon key | RLS prevents anon key from reading other users' data. Must use service role on server. |
| `router.refresh()` after mutations | `window.location.reload()` | `router.refresh()` re-runs server component without full page reload, preserving client state. |

---

## Architecture Patterns

### Recommended Project Structure

```
src/app/admin/
├── layout.tsx          # Standalone layout: ThemeProvider + admin header (brand + logout)
├── page.tsx            # Server component: fetches users + blp_responses, renders dashboard
└── (no sub-routes)     # Single page, expandable rows in-page (D-03)

src/app/api/admin/
├── delete-user/
│   └── route.ts        # POST: service role deleteUser + verify caller is admin
└── circle-config/
    └── route.ts        # GET/POST: read/write Circle config from Supabase settings table

src/lib/admin/
├── labels.ts           # LABELS object (200+ entries), SKIP_KEYS, CC_EXACT, igLabel(), caLabel(), optLabel(), prettyKey()
└── service-client.ts   # createServiceClient() — creates Supabase client with SUPABASE_SERVICE_ROLE_KEY
```

### Pattern 1: Service Role Client for Admin Queries

The anon key + RLS blocks reading other users' data. Admin operations require the service role key, which bypasses RLS entirely.

**What:** Create a separate server-only Supabase client using `SUPABASE_SERVICE_ROLE_KEY` (never `NEXT_PUBLIC_`).

**When to use:** Any time admin page reads `auth.users`, reads all `blp_responses`, or deletes an auth user.

```typescript
// src/lib/admin/service-client.ts
// Source: Supabase docs — service role usage
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,  // NOT NEXT_PUBLIC_ — server only
  )
}
```

Note: Do NOT use `@supabase/ssr`'s `createServerClient` for service-role ops — it's designed for cookie-based auth, not service role. Use the base `createClient` from `@supabase/supabase-js` directly.

### Pattern 2: Defense-in-Depth Admin Role Check (D-02)

Two independent gates:
1. Middleware (`src/lib/supabase/middleware.ts`) — adds admin role check for `/admin/*` paths.
2. Admin page server component — re-fetches user and re-checks role before rendering data.

```typescript
// In middleware.ts updateSession() — add after existing unauthenticated check:
// Source: Supabase docs — app_metadata role check
const isAdminRoute = pathname.startsWith('/admin')
if (isAdminRoute && user && user.app_metadata?.role !== 'admin') {
  return NextResponse.redirect(new URL('/', request.url))
}

// In src/app/admin/page.tsx (server component):
const { data: { user } } = await supabase.auth.getUser()
if (!user || user.app_metadata?.role !== 'admin') {
  redirect('/')
}
```

### Pattern 3: Listing All Auth Users

The `auth.admin.listUsers()` method returns paginated results. For this dashboard, all users fit in one call (no pagination needed at current scale).

```typescript
// In admin page server component:
const serviceClient = createServiceClient()
const { data: { users }, error } = await serviceClient.auth.admin.listUsers()
// users: User[] — each has id, email, created_at, last_sign_in_at, app_metadata, user_metadata
```

### Pattern 4: Fetching All blp_responses

After fetching the user list, fetch all blp_responses in one query. Join in application code (not SQL) to map user_id → responses per module.

```typescript
// In admin page server component:
const { data: allResponses } = await serviceClient
  .from('blp_responses')
  .select('user_id, module_slug, responses, updated_at')
// Build a Map<userId, Map<moduleSlug, responses>> for O(1) lookup when rendering rows
```

Note: `serviceClient.from('blp_responses')` bypasses RLS, returning all rows across all users. This is the correct approach for an admin query.

### Pattern 5: Expandable Row as Client Component

The user table row itself is server-rendered (static). The expand/collapse behavior and the detail panel require client state.

**Structure:**
- `AdminUsersTable` — Client Component, receives `users` + `responsesByUser` as serialized props from the server component
- Manages `expandedUserId: string | null` state
- Renders `UserDetailPanel` when a row is expanded
- `UserDetailPanel` — Client Component, receives one user's data, renders progress bars + Circle card + answer grid

### Pattern 6: Circle Config Stored in Supabase

Old admin stored Circle API key + Community ID in localStorage. D-05 requires persisting to Supabase instead. Approach: a `blp_config` table (or `app_settings`) with key-value rows. Admin page reads config on load; config strip saves via API route.

**Database table needed (new — no schema changes to existing tables):**
```sql
create table if not exists public.blp_config (
  key   text primary key,
  value text not null
);
-- RLS: only service role can read/write (admin API routes use service role)
alter table public.blp_config enable row level security;
-- No user-facing policies — all access through service role API routes
```

**Note:** This IS a new table, but the CLAUDE.md constraint "no schema changes" refers to existing tables (auth/responses format). A new config table is additive and doesn't break existing data.

### Pattern 7: User Deletion (D-07)

Delete auth user via `auth.admin.deleteUser(userId)`. The `blp_responses` table has `ON DELETE CASCADE` on `user_id → auth.users(id)`, so responses auto-delete.

```typescript
// In /api/admin/delete-user/route.ts
// 1. Verify caller is admin (getUser + app_metadata.role check)
// 2. Parse target userId from request body
// 3. serviceClient.auth.admin.deleteUser(userId)
// blp_responses cascade-deletes automatically
```

### Anti-Patterns to Avoid

- **Using anon key to list users:** RLS blocks it. Must use service role. No workaround exists.
- **Storing service role key in NEXT_PUBLIC_ env:** Would expose it to the browser. Fatal security flaw.
- **Client-side admin role check only:** Can be bypassed. Always check server-side (D-02).
- **Re-rendering the entire server component on every user expansion:** Pass all user data to the client table component as props; expand/collapse is pure client state, no server round-trips.
- **Separate route per user:** D-03 explicitly requires expandable rows, not `/admin/users/[id]` routes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Listing all auth users | Custom DB view of `auth.users` | `serviceClient.auth.admin.listUsers()` | The admin namespace is the official, type-safe API. Direct `auth.users` queries require extra Postgres setup. |
| Deleting an auth user | Direct `DELETE FROM auth.users` | `serviceClient.auth.admin.deleteUser(userId)` | Admin API handles cascades, token invalidation, and audit logging correctly. |
| Confirmation dialog | Custom modal component | `window.confirm()` or a simple inline state-driven dialog | Old admin used `confirm()` and it works. A simple `useState(confirmingEmail)` pattern is cleaner in React, but no need for a full dialog library. |
| Relative timestamps ("3d ago") | `date-fns` or similar | Inline `relTime()` function (port from old admin) | The function is 10 lines and already tested in production. No dependency needed. |

**Key insight:** The Supabase `auth.admin` namespace (available via service role client) handles all privileged user management operations with correct semantics. The only new infrastructure needed is a `blp_config` table for Circle credentials.

---

## Common Pitfalls

### Pitfall 1: Service Role Key Leaking to Client

**What goes wrong:** Developer prefixes service role key with `NEXT_PUBLIC_`, making it available in the browser bundle. Any visitor can read all user data.

**Why it happens:** Copying the pattern from anon key setup, which does use `NEXT_PUBLIC_`.

**How to avoid:** `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_` prefix). Only used in server components and Route Handlers. Never imported in Client Components.

**Warning signs:** TypeScript build warning about `NEXT_PUBLIC_` env access; `process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` anywhere in code.

### Pitfall 2: Admin Role Check Only in Middleware

**What goes wrong:** Middleware is bypassed by direct Next.js fetch calls, stale caches, or edge cases. A non-admin sees the admin data.

**Why it happens:** Treating middleware as the sole gate.

**How to avoid:** D-02 mandates double-check. Admin `page.tsx` server component always calls `getUser()` and verifies `app_metadata.role === 'admin'` before passing any data to child components.

**Warning signs:** Admin page renders successfully without `role === 'admin'` in user metadata during testing.

### Pitfall 3: Old Schema Data Mismatch

**What goes wrong:** Old admin read from `vww_users` and `vww_progress` tables with a nested `data.cf`, `data.vw`, `data.cc`, `data['launch-v1']` structure. New schema uses `blp_responses` with `module_slug` and flat `responses` JSONB.

**Why it happens:** Direct port of old admin's `modPct()`, `hasAnyData()`, and module field extraction logic without adapting to new schema.

**How to avoid:** The new schema maps cleanly: one `blp_responses` row per `module_slug`. Fetch all rows for a user, key by `module_slug`, and extract `responses` directly — no nested `data.vw` or `data['launch-v1']` paths needed.

**Mapping:**
| Old admin key | New module_slug |
|--------------|-----------------|
| `data.cf` | `brand-foundation` |
| `data.vw.inputs` | `visual-world` |
| `data.cc.inputs` | `content` |
| `data['launch-v1']` | `launch` |

### Pitfall 4: `auth.admin.listUsers()` Pagination

**What goes wrong:** By default, `listUsers()` returns up to 1,000 users per page. If the platform grows past that, the dashboard silently shows incomplete data.

**Why it happens:** Not checking the pagination API.

**How to avoid:** At current scale (early-stage course platform), a single call is fine. Add a `// TODO: paginate if users > 1000` comment and document the `page` + `perPage` parameters for future use.

### Pitfall 5: RLS Blocking blp_responses Admin Reads

**What goes wrong:** Using `createClient()` (the anon/regular server client from `src/lib/supabase/server.ts`) to query all `blp_responses` rows — returns only the current user's own rows due to RLS.

**Why it happens:** Reusing the existing `createClient()` helper without realizing it uses the anon key.

**How to avoid:** Admin data fetching MUST use `createServiceClient()` (service role key). Regular `createClient()` is for student-facing pages only.

### Pitfall 6: `blp_config` Table Missing on First Deploy

**What goes wrong:** Admin page loads but Circle config save/read fails with a 404 or "relation does not exist" error.

**Why it happens:** `blp_config` table is a new addition not in the existing `schema.sql`.

**How to avoid:** Add `blp_config` creation to the migration/schema file. Document that this table must exist before Phase 6 runs in production.

---

## Code Examples

### Service Role Client Factory

```typescript
// src/lib/admin/service-client.ts
// Source: supabase-js docs — service role usage
import { createClient } from '@supabase/supabase-js'

export function createServiceClient() {
  // NEVER use NEXT_PUBLIC_ prefix — service role key must stay server-side
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
```

### Admin Role Check in Middleware

```typescript
// Addition to src/lib/supabase/middleware.ts updateSession()
// Add after the existing unauthenticated redirect block:
const isAdminRoute = pathname.startsWith('/admin')
if (isAdminRoute && user && user.app_metadata?.role !== 'admin') {
  return NextResponse.redirect(new URL('/', request.url))
}
```

### Admin Page Server Component (data fetch skeleton)

```typescript
// src/app/admin/page.tsx
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/admin/service-client'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  // Gate 2 — independent server-side check (D-02)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    redirect('/')
  }

  // Privileged queries via service role
  const service = createServiceClient()
  const { data: { users } } = await service.auth.admin.listUsers()
  const { data: responses } = await service
    .from('blp_responses')
    .select('user_id, module_slug, responses, updated_at')

  // Build lookup: userId -> moduleSlug -> responses
  const responsesByUser = new Map<string, Map<string, Record<string, unknown>>>()
  for (const row of responses ?? []) {
    if (!responsesByUser.has(row.user_id)) {
      responsesByUser.set(row.user_id, new Map())
    }
    responsesByUser.get(row.user_id)!.set(row.module_slug, row.responses)
  }

  return <AdminUsersTable users={users ?? []} responsesByUser={/* serialize */ ...} />
}
```

Note: `Map` is not serializable as a server component prop. Convert to a plain object `Record<string, Record<string, Record<string, unknown>>>` before passing to Client Components.

### Delete User API Route (skeleton)

```typescript
// src/app/api/admin/delete-user/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/admin/service-client'

export async function POST(request: NextRequest) {
  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.app_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const service = createServiceClient()
  const { error } = await service.auth.admin.deleteUser(userId)
  // blp_responses auto-cascade via FK ON DELETE CASCADE
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
```

### LABELS Object Migration (structure preview)

```typescript
// src/lib/admin/labels.ts
// Migrated 1:1 from old/admin.html LABELS variable
export const LABELS: Record<string, string> = {
  // Brand Foundation
  q1outcome: 'Desired Outcome',
  q1why: 'Why It Matters',
  brandJourneyStmt: 'Brand Journey Statement',
  av1Age: 'Avatar 1 — Age',
  // ... 200+ entries — full list from old/admin.html lines 238-299
}

export const SKIP_KEYS = new Set(['cur', 'done', 'auditVals', 'checks', 'opts', 'inputs'])

export const CC_EXACT = new Set([
  'nextStep', 'painProblem', 'uniqueSol', /* ... full list from old admin */
])

export function isCCKey(k: string): boolean {
  return CC_EXACT.has(k) || /^(ig_|ca[123][a-z])/.test(k)
}

export function igLabel(k: string): string {
  const m1 = k.match(/^ig_pillar(\d)$/)
  if (m1) return `Content Pillar ${m1[1]}`
  const m2 = k.match(/^ig_p(\d)i(\d)a(\d)$/)
  if (m2) return `Pillar ${m2[1]} · Idea ${['A','B','C','D'][+m2[2]-1]} · Angle ${m2[3]}`
  const m3 = k.match(/^ig_p(\d)i(\d)$/)
  if (m3) return `Pillar ${m3[1]} — Idea ${['A','B','C','D'][+m3[2]-1]}`
  return k
}

export function caLabel(k: string): string {
  const m = k.match(/^ca([123])(name|why|take|diff)$/)
  if (!m) return prettyKey(k)
  const map: Record<string, string> = { name: 'Name', why: 'Why Study', take: 'Key Takeaway', diff: 'How I\'m Different' }
  return `Competitor ${m[1]} — ${map[m[2]]}`
}

export function optLabel(k: string): string {
  const g = k.replace('opt_', '')
  const map: Record<string, string> = { genre: 'Brand Genre', style: 'Brand Style', vibe: 'Vibe', mbvibe: 'Mood Board Vibe' }
  return map[g] ?? (g.charAt(0).toUpperCase() + g.slice(1))
}

export function prettyKey(k: string): string {
  return k.replace(/[-_]/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function getLabelForKey(k: string): string {
  if (LABELS[k]) return LABELS[k]
  if (/^ig_/.test(k)) return igLabel(k)
  if (/^ca[123]/.test(k)) return caLabel(k)
  if (/^opt_/.test(k)) return optLabel(k)
  return prettyKey(k)
}
```

### Standalone Admin Layout (skeleton)

```typescript
// src/app/admin/layout.tsx
import { cookies } from 'next/headers'
import { ThemeProvider } from '@/context/ThemeContext'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = (cookieStore.get('blp-theme')?.value as 'dark' | 'light') ?? 'dark'

  return (
    <ThemeProvider initialTheme={theme}>
      {children}
      {/* Header is rendered inside page.tsx or a shared AdminHeader client component */}
    </ThemeProvider>
  )
}
```

The admin header (brand label + logout button) is a small Client Component that calls `useAuth().signOut()`. Since `AuthProvider` is NOT wrapping the admin layout, the logout button must call `supabase.auth.signOut()` directly from a local Supabase browser client, then redirect to `/login`.

---

## Runtime State Inventory

Step 2.5: SKIPPED — this is a greenfield feature addition (new `/admin` route, new `blp_config` table), not a rename/refactor/migration phase. No existing runtime state is being renamed or moved.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | Yes | v25.2.1 | — |
| `@supabase/supabase-js` | `auth.admin.*` API calls | Yes | 2.101.1 | — |
| `SUPABASE_SERVICE_ROLE_KEY` env var | Service role client | Assumed (must verify in .env.local) | — | No fallback — must be set |
| `blp_config` table | Circle config persistence (D-05) | No — does not exist yet | — | Wave 0 task: create via schema migration |

**Missing dependencies with no fallback:**
- `SUPABASE_SERVICE_ROLE_KEY` env var — must be set in `.env.local` and Vercel dashboard before admin routes work. The key is available in Supabase project settings under API keys.
- `blp_config` table — must be created as part of this phase (Wave 0 or Plan 1 task).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + @testing-library/react 16.3.2 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npx vitest run tests/api-admin-delete.test.ts` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-01 | Non-admin is rejected at API route level | unit | `npx vitest run tests/api-admin-delete.test.ts` | No — Wave 0 |
| ADMIN-01 | Admin is allowed through API route | unit | `npx vitest run tests/api-admin-delete.test.ts` | No — Wave 0 |
| ADMIN-04 | Badge award calls `/api/circle` with correct payload | unit | `npx vitest run tests/api-circle.test.ts` | Partial — existing circle test covers proxy, admin badge path untested |
| ADMIN-05 | Delete user returns 403 for non-admin | unit | `npx vitest run tests/api-admin-delete.test.ts` | No — Wave 0 |
| ADMIN-05 | Delete user calls `auth.admin.deleteUser` and returns ok | unit | `npx vitest run tests/api-admin-delete.test.ts` | No — Wave 0 |
| ADMIN-02/03 | Labels module maps known keys to human-readable strings | unit | `npx vitest run tests/admin-labels.test.ts` | No — Wave 0 |
| ADMIN-02/03 | `getLabelForKey` handles ig_, ca, opt_, and unknown patterns | unit | `npx vitest run tests/admin-labels.test.ts` | No — Wave 0 |

Server component rendering (admin page data fetching) is manual-only — testing Next.js server components in Vitest requires complex mocking with diminishing returns. The critical paths (auth guard on API routes, labels utility) are automatable.

### Sampling Rate

- **Per task commit:** `npx vitest run tests/api-admin-delete.test.ts tests/admin-labels.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/api-admin-delete.test.ts` — covers ADMIN-01 and ADMIN-05 (auth guard, delete call, 403 for non-admin)
- [ ] `tests/admin-labels.test.ts` — covers ADMIN-02/03 (LABELS lookup, igLabel, caLabel, optLabel, prettyKey)

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side password check (`ADMIN_PASSWORD = 'fscreative2025'`) | `app_metadata.role === 'admin'` server-side check | Phase 6 | Password was hardcoded in HTML source — visible to anyone. New approach is cryptographically secure. |
| `localStorage` for Circle API key | Supabase `blp_config` table | Phase 6 | Config now shared across devices/sessions; admin does not need to re-enter key on each browser. |
| Direct Supabase REST API calls with anon key from browser | Service role client in server component + API routes | Phase 6 | Admin operations now server-only; service role key never exposed to browser. |
| `vww_users` + `vww_progress` tables | `blp_responses` (new schema) | Phase 1 (Data-02) | Old module field grouping logic (vw/cc sub-keys) replaced by explicit `module_slug` column. |

---

## Open Questions

1. **`blp_config` table schema migration delivery**
   - What we know: The table needs to exist for Circle config persistence. It is not in `supabase/schema.sql` yet.
   - What's unclear: Whether there is a Supabase migration workflow in place, or if schema changes are applied manually to the production project.
   - Recommendation: Add the `CREATE TABLE blp_config` statement to `supabase/schema.sql` and document that it must be applied to the Supabase project before deploying. Make this a Plan 1 task.

2. **`auth.admin.listUsers()` response shape in TypeScript**
   - What we know: Returns `{ data: { users: User[] }, error }` where `User` is from `@supabase/supabase-js`. The `app_metadata` field is typed as `Record<string, unknown>`.
   - What's unclear: Whether the existing `Database` type in `src/types/database.ts` needs to be extended for `blp_config`.
   - Recommendation: Add `blp_config` to the Database type when creating the table. Admin code can use `as any` cast for `app_metadata.role` — acceptable for a single admin-only check.

3. **Logout from standalone admin layout**
   - What we know: `AuthProvider` is not wrapping the admin layout (D-08). `useAuth().signOut()` will not be available.
   - What's unclear: Whether to import AuthProvider into admin layout just for signOut, or call Supabase client directly.
   - Recommendation: Create a thin `AdminLogoutButton` Client Component that instantiates `createClient()` directly, calls `supabase.auth.signOut()`, then does `window.location.href = '/login'`. No need to bring in full AuthProvider. This matches the hard-redirect pattern from Phase 2.

---

## Project Constraints (from CLAUDE.md)

- **Framework:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Supabase JS SDK, React Context
- **Auth:** Supabase Auth with magic link only
- **Database:** Must work with existing Supabase tables — no schema changes to EXISTING tables (new `blp_config` table is additive and acceptable)
- **Edge functions:** Keep existing edge functions unchanged; wrap calls through Next.js API routes
- **Visual design:** Preserve existing color system, layout patterns, and responsive behavior
- **Content:** All course content migrated 1:1 from old HTML (admin LABELS + field grouping must be 1:1)
- **No direct repo edits outside GSD workflow** (enforced by CLAUDE.md)

---

## Sources

### Primary (HIGH confidence)

- `old/admin.html` (project file, lines 238-343) — complete LABELS object, field grouping logic, CC_EXACT set, igLabel/caLabel/optLabel functions, UI patterns — authoritative source for 1:1 migration
- `supabase/schema.sql` (project file) — confirms `blp_responses` table structure, RLS policies, FK cascade behavior
- `src/lib/supabase/middleware.ts` (project file) — exact middleware pattern that needs admin role check added
- `src/app/api/circle/route.ts` (project file) — existing Circle proxy pattern that admin badge award calls
- `src/types/database.ts` (project file) — Database type with `blp_responses` shape
- Supabase docs (supabase.com/docs/reference/javascript/auth-admin-listusers) — `auth.admin.listUsers()` API (HIGH confidence from official docs)
- Supabase docs (supabase.com/docs/reference/javascript/auth-admin-deleteuser) — `auth.admin.deleteUser()` API (HIGH confidence from official docs)

### Secondary (MEDIUM confidence)

- Next.js App Router docs — standalone layout pattern (route groups with own layout.tsx) — consistent with Phase 2 login page implementation already in codebase

### Tertiary (LOW confidence)

None — all critical claims verified against project codebase or official docs.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries already in use in the project; no new dependencies required
- Architecture: HIGH — patterns are direct extensions of existing Phase 1-4 patterns already in codebase
- Pitfalls: HIGH — service role key exposure and RLS bypass are documented Supabase pitfalls; schema mismatch verified by reading both old admin.html and new schema.sql
- LABELS migration: HIGH — full source available in old/admin.html lines 238-343; 1:1 migration to TypeScript is mechanical

**Research date:** 2026-04-02
**Valid until:** 2026-05-02 (stable stack — @supabase/supabase-js, Next.js 15.x; 30-day validity)
