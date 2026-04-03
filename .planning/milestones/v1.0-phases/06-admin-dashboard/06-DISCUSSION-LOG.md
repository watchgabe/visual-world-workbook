# Phase 6: Admin Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-02
**Phase:** 06-admin-dashboard
**Areas discussed:** Access control, User detail view, Badge & delete actions, Layout & navigation

---

## Access Control

| Option | Description | Selected |
|--------|-------------|----------|
| app_metadata.role (Recommended) | Check user.app_metadata.role === 'admin' server-side. Set in Supabase dashboard or via service role API. | ✓ |
| Hardcoded email list | Check user.email against env var list of admin emails. Simpler but less flexible. | |
| You decide | Claude picks best approach. | |

**User's choice:** app_metadata.role (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Middleware + page (Recommended) | Middleware redirects non-admins. Page-level also verifies (defense in depth). | ✓ |
| Page-level only | Middleware keeps auth-only check. Each page checks role individually. | |
| You decide | Claude picks layering approach. | |

**User's choice:** Middleware + page (Recommended)
**Notes:** None

---

## User Detail View

| Option | Description | Selected |
|--------|-------------|----------|
| Expandable row (Recommended) | Same as old admin — click row to expand inline. Single-page experience. | ✓ |
| Separate user page | /admin/users/[id] with full detail. URL-shareable but more navigation. | |
| You decide | Claude picks pattern. | |

**User's choice:** Expandable row (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Full answers like old admin | All user answers grouped by module/section with 200+ field labels mapped. | ✓ |
| Progress only, no answers | Per-module/section completion bars only. Simpler, less data exposure. | |
| Progress + key answers | Completion bars plus curated subset of important answers. | |

**User's choice:** Full answers like old admin
**Notes:** None

---

## Badge & Delete Actions

| Option | Description | Selected |
|--------|-------------|----------|
| Server env var (Recommended) | Store as environment variables. Admin never sees/enters key. Most secure. | |
| Admin-entered like old app | Config strip where admin enters key in browser. Stored in localStorage. | ✓ |
| You decide | Claude picks storage approach. | |

**User's choice:** Admin-entered like old app
**Notes:** User wants to keep the admin-entered UX.

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage (same as old) | Per-browser storage. Admin re-enters on new device. | |
| Supabase config table | Store in config/settings table. Shared across devices, server-side. | ✓ |
| You decide | Claude picks based on patterns. | |

**User's choice:** Supabase config table
**Notes:** Upgrade from localStorage to Supabase table for persistence across devices.

| Option | Description | Selected |
|--------|-------------|----------|
| Confirm dialog (Recommended) | Click delete → confirmation modal with email → confirm → delete user + responses. | ✓ |
| Type email to confirm | Must type user's email to confirm. Extra safety. | |
| You decide | Claude picks confirmation pattern. | |

**User's choice:** Confirm dialog (Recommended)
**Notes:** None

---

## Layout & Navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Standalone layout (Recommended) | Own layout with header (brand + logout). Not inside app shell sidebar. | ✓ |
| Inside app shell | Admin as another sidebar section alongside course modules. | |
| You decide | Claude picks based on old admin pattern. | |

**User's choice:** Standalone layout (Recommended)
**Notes:** None

| Option | Description | Selected |
|--------|-------------|----------|
| Dark-only like old admin | Always dark theme. Matches old admin exactly. | |
| Support dark/light toggle | Reuse ThemeContext. Respects user's theme preference. | ✓ |
| You decide | Claude picks based on patterns. | |

**User's choice:** Support dark/light toggle
**Notes:** Consistency with rest of app.

---

## Claude's Discretion

- Stat cards design
- User table column design and sorting
- Loading/empty states
- Circle profile card design
- Answer grid layout and responsive behavior
- Config strip positioning and styling

## Deferred Ideas

None — discussion stayed within phase scope
