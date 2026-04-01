# Architecture Patterns

**Project:** Brand Launch Playbook — Next.js Migration
**Domain:** Course platform with auth, per-module form data, progress tracking, AI generation
**Researched:** 2026-04-01
**Confidence:** HIGH (official Next.js docs + Supabase docs + direct inspection of existing codebase)

---

## Current Architecture (What We're Replacing)

```
index.html (shell, 4,524 lines)
  └── <iframe src="modules/brand-foundation.html">
        - owns its own CSS, JS, Supabase client, anon key
        - saves via fetch() directly to Supabase REST
        - navigates via postMessage to parent shell
        - localStorage for user email/name/avatar

admin.html  — standalone, client-side password check
landing.html — standalone marketing page
```

Pain points being eliminated:
- Anon key hardcoded in every HTML file
- 4 separate save/load implementations across modules
- iframe → parent postMessage for navigation (race conditions, broken history)
- Client-side admin password check (security theater)
- No real auth session (localStorage email only)

---

## Recommended Architecture

### High-Level System Map

```
Browser
  └── Next.js App (Vercel)
        ├── middleware.ts (proxy layer — auth session refresh + route protection)
        ├── app/
        │    ├── (auth)/                  Route group — login flow, no sidebar
        │    │    └── login/page.tsx
        │    ├── (app)/                   Route group — course shell with shared layout
        │    │    ├── layout.tsx          AppShell: sidebar + topbar + progress
        │    │    ├── dashboard/page.tsx
        │    │    ├── modules/
        │    │    │    ├── welcome/page.tsx
        │    │    │    ├── brand-foundation/page.tsx
        │    │    │    ├── visual-world/page.tsx
        │    │    │    ├── content/page.tsx
        │    │    │    ├── launch/page.tsx
        │    │    │    └── playbook/page.tsx
        │    │    └── (admin)/            Nested route group — admin-only layout
        │    │         └── admin/page.tsx
        │    └── api/                     API routes — server-side proxies
        │         ├── claude/route.ts
        │         ├── circle/route.ts
        │         └── waterfall/route.ts
        ├── components/
        │    ├── layout/                  AppShell, Sidebar, Topbar, MobileMenu
        │    ├── workshop/                WorkshopTextarea, WorkshopInput, OptionSelector
        │    ├── progress/                ProgressRing, SectionNav, SectionWrapper
        │    └── ui/                      Button, SaveDot, ThemeToggle
        ├── context/
        │    ├── AuthContext.tsx          user session, signIn, signOut
        │    ├── ProgressContext.tsx      per-module completion map
        │    └── ThemeContext.tsx         dark/light toggle
        ├── hooks/
        │    ├── useAutoSave.ts           debounced Supabase write, flush-on-unmount
        │    └── useModuleData.ts         load + merge module data on mount
        ├── lib/
        │    ├── supabase/
        │    │    ├── client.ts           createBrowserClient (singleton)
        │    │    └── server.ts           createServerClient (per-request)
        │    └── types.ts                 ModuleData, UserProfile, ProgressMap
        └── middleware.ts
```

---

## Component Boundaries

### 1. Proxy / middleware.ts

**Responsibility:** Auth session refresh before every request; redirect unauthenticated users to `/login`; redirect authenticated users away from `/login`.

**Communicates with:** Supabase server client (cookie-based session), Next.js routing.

**Does NOT:** Authorize specific operations. Middleware is a network boundary, not an authorization system. Every server action and API route re-verifies identity independently.

**Key rule:** Call `supabase.auth.getClaims()` — never `getSession()` inside middleware. getClaims() validates the JWT signature against published public keys; getSession() does not re-validate.

```typescript
// middleware.ts pattern
import { createServerClient } from '@supabase/ssr'
export async function middleware(request: NextRequest) {
  // refresh session cookie
  // redirect /login → /dashboard if already authed
  // redirect protected routes → /login if not authed
  // redirect /admin → /dashboard if not admin
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] }
```

---

### 2. AppShell Layout — `app/(app)/layout.tsx`

**Responsibility:** Renders the three-panel shell (sidebar + topbar + main content area) that wraps all course pages and the admin page. Provides the context providers tree.

**Communicates with:** AuthContext (user name/avatar for topbar), ProgressContext (module completion dots in sidebar), ThemeContext (CSS variable class on `<html>`).

**Server vs. Client split:**
- `layout.tsx` is a Server Component that fetches initial session and module progress from Supabase server client, passes them as props to client providers.
- `AppShell` client component holds sidebar open/close state and theme toggle interaction.

```
layout.tsx (Server Component)
  └── <Providers initialUser={...} initialProgress={...}>  (Client boundary)
        ├── <AppShell>   (Client — sidebar toggle state)
        │    ├── <Sidebar>  (Client — active module highlight)
        │    ├── <Topbar>   (Client — user avatar, theme toggle)
        │    └── {children}
```

---

### 3. Context Providers

Three separate contexts, co-located in `context/`. Each is a `'use client'` provider wrapping its subtree.

| Context | State | Who Reads It |
|---------|-------|-------------|
| `AuthContext` | `user`, `signIn()`, `signOut()` | Topbar, Admin, any component needing user email for Supabase queries |
| `ProgressContext` | `progress: Record<moduleId, SectionProgress>`, `markComplete(moduleId, sectionIdx)` | Sidebar (completion dots), ProgressRing, SectionWrapper |
| `ThemeContext` | `theme: 'dark' \| 'light'`, `toggle()` | ThemeToggle button; root `<html>` className |

**Design rule:** Contexts hold mutable UI-layer state. Server Components use Supabase server client directly for immutable data — they never read from context. Context is for client-side synchronisation only.

---

### 4. Module Pages — `app/(app)/modules/[module]/page.tsx`

**Responsibility:** Each module is a direct Next.js page (not an iframe). Renders a SectionWrapper that shows one section at a time. Loads saved data on mount via `useModuleData`. Auto-saves on field change via `useAutoSave`.

**Communicates with:**
- `useModuleData` hook → Supabase browser client → `vww_progress` table
- `useAutoSave` hook → Supabase browser client → `vww_progress` table
- `ProgressContext` → calls `markComplete` when a section is finished
- `api/claude/route.ts` → AI generation buttons
- `api/circle/route.ts` → completion badge award

**Section navigation pattern:** A `currentSection` state integer lives inside the module page component (or a `useSectionNav` hook). No URL search param needed — section state is ephemeral and should reset to last-saved position on page load (stored in `vww_progress.data.cur`).

```
ModulePage (Client Component — 'use client')
  ├── useModuleData(moduleId)   → loads vww_progress row on mount
  ├── useAutoSave(moduleId, formValues)  → debounced write on change
  ├── SectionNav  (section list, completion indicators)
  └── SectionWrapper(currentSection)
       ├── WorkshopTextarea / WorkshopInput / OptionSelector
       └── AI generation buttons → fetch('/api/claude', ...)
```

---

### 5. Reusable Workshop Components

**Location:** `components/workshop/`

| Component | Props | Notes |
|-----------|-------|-------|
| `WorkshopTextarea` | `id`, `label`, `placeholder`, `value`, `onChange` | Controlled; triggers auto-save via onChange |
| `WorkshopInput` | `id`, `label`, `placeholder`, `value`, `onChange` | Same pattern |
| `OptionSelector` | `group`, `options`, `selected`, `onChange` | Replaces `.opt[data-g]` buttons |
| `SectionNav` | `sections[]`, `currentIndex`, `completedMap`, `onNavigate` | Left sidebar section list within a module |
| `SectionWrapper` | `index`, `total`, `onNext`, `onBack`, `children` | Renders prev/next controls + section content |
| `ProgressRing` | `completed`, `total` | SVG ring showing X/Y sections done |
| `SaveDot` | `saving: boolean` | Visual indicator; shown in topbar or section footer |

All workshop components are Client Components (they own onChange handlers). They contain no data-fetching logic — data flows in from the module page via props.

---

### 6. Auto-Save Hook — `hooks/useAutoSave.ts`

**Responsibility:** Single implementation of debounced save that replaces the 4 scattered `saveData()` + `cfSyncToSupabase()` patterns in the old codebase.

**Communicates with:** Supabase browser client → `vww_progress` table.

**Behavior:**
- Debounce delay: 800ms (matching existing `cfSyncTimer` timeout)
- Flush immediately on: section navigation, module completion, `beforeunload`
- Returns `{ saving: boolean, lastSaved: Date | null }`
- Cancel pending debounce on unmount to prevent stale writes

```typescript
// hooks/useAutoSave.ts
export function useAutoSave(moduleId: string, data: ModuleData) {
  // debounce write to vww_progress
  // expose flush() for explicit save before navigation
  // return { saving, flush }
}
```

---

### 7. Supabase Service Layer — `lib/supabase/`

**Two clients, never mixed:**

| File | Used In | Pattern |
|------|---------|---------|
| `lib/supabase/server.ts` | Server Components, API routes, middleware | Created fresh per request with `cookies()` |
| `lib/supabase/client.ts` | Client Components, hooks | Singleton via `createBrowserClient` |

**No raw fetch calls to Supabase REST API** — all database access goes through the Supabase JS SDK. The old `fetch(SUPABASE_URL + '/rest/v1/...')` pattern with hardcoded anon keys is fully replaced.

**Admin data access:** Admin page uses the server client inside a Server Component. The route is protected by middleware AND re-verifies admin status server-side before returning any user data.

---

### 8. API Routes — `app/api/`

**Responsibility:** Server-side proxies for the three Supabase edge functions. They receive requests from client components, verify auth, then call the edge functions with the service key (never exposed to browser).

| Route | Wraps | Auth Required |
|-------|-------|--------------|
| `app/api/claude/route.ts` | `supabase/functions/v1/claude-proxy` | Yes — authenticated users only |
| `app/api/circle/route.ts` | `supabase/functions/v1/circle-proxy` | Yes — authenticated users only |
| `app/api/waterfall/route.ts` | `supabase/functions/v1/waterfall-analyzer` | Yes — authenticated users only |

**Why this layer:** The old code called edge functions directly from the browser, requiring the Supabase anon key to be exposed. API routes run on the server; the edge function call uses the service key stored in `SUPABASE_SERVICE_ROLE_KEY` environment variable, never sent to the client.

---

## Data Flow

### Authentication Flow

```
User visits /modules/brand-foundation
  → middleware intercepts
  → createServerClient reads session cookie
  → no valid session → redirect to /login

User at /login → enters email → clicks "Send Magic Link"
  → AuthContext.signIn(email) → supabase.auth.signInWithOtp()
  → Supabase sends magic link email
  → User clicks link → /auth/callback (Supabase callback URL)
  → Next.js handles exchange → sets session cookie
  → redirect to /dashboard
```

### Module Data Load Flow

```
User navigates to /modules/brand-foundation
  → ModulePage mounts
  → useModuleData('brand-foundation') fires
  → supabase.from('vww_progress').select('data').eq('email', user.email)
  → returns saved JSON blob
  → hydrates form fields, restores currentSection, completedSections[]
```

### Auto-Save Flow

```
User types in WorkshopTextarea
  → onChange fires → local state updates (instant)
  → useAutoSave receives new formValues
  → debounce timer resets (800ms)
  → after 800ms of inactivity:
      → supabase.from('vww_progress').upsert({ email, data: merged, updated_at })
      → SaveDot shows "saved" flash
```

### AI Generation Flow

```
User clicks "Generate" button in a module section
  → fetch('/api/claude', { method: 'POST', body: { prompt } })
  → API route verifies session (supabase server client)
  → calls Supabase edge function with service key
  → streams or returns text response
  → component populates WorkshopTextarea value
  → useAutoSave picks up the change → debounced write
```

### Progress Tracking Flow

```
User completes all required fields in a section
  → SectionWrapper detects completion (field validation logic)
  → calls ProgressContext.markComplete(moduleId, sectionIdx)
  → ProgressContext updates in-memory map
  → Sidebar re-renders completion dots
  → ProgressRing re-renders
  → on module finish: calls api/circle → awards Circle.so badge
```

---

## Suggested Build Order

Dependencies drive this order. Each layer depends on the previous.

### Layer 0: Foundation (no dependencies)
1. Next.js project scaffold with TypeScript, Tailwind, ESLint
2. `lib/supabase/client.ts` and `lib/supabase/server.ts`
3. `lib/types.ts` — ModuleData, UserProfile, ProgressMap, SectionProgress
4. Tailwind config with design tokens (CSS variables from existing color system)

**Why first:** Everything else imports from these. Types catch mistakes early.

### Layer 1: Auth (depends on Layer 0)
5. `middleware.ts` — session refresh + route protection
6. `AuthContext.tsx` — user state, signIn, signOut
7. `app/(auth)/login/page.tsx` — magic link form
8. Auth callback handler

**Why second:** All protected routes require auth to be working first.

### Layer 2: Shell (depends on Layer 1)
9. `ThemeContext.tsx` — dark/light toggle
10. `ProgressContext.tsx` — empty initial state, markComplete stub
11. `app/(app)/layout.tsx` — providers tree, initial data fetch
12. `AppShell`, `Sidebar`, `Topbar`, `MobileMenu` components

**Why third:** Module pages need the shell to render inside. Shell needs auth to get user data.

### Layer 3: Workshop Components (depends on Layer 0)
13. `WorkshopTextarea`, `WorkshopInput`, `OptionSelector`
14. `SectionNav`, `SectionWrapper`, `ProgressRing`, `SaveDot`

**Why here:** These are pure UI components with no data dependencies. Can be built and tested in isolation before wiring to real data.

### Layer 4: Data Hooks (depends on Layers 0 + 1)
15. `useAutoSave.ts` — debounced upsert, flush method
16. `useModuleData.ts` — load on mount, hydrate form state

**Why fourth:** Hooks depend on Supabase clients and auth session being available.

### Layer 5: API Routes (depends on Layer 1)
17. `app/api/claude/route.ts`
18. `app/api/circle/route.ts`
19. `app/api/waterfall/route.ts`

**Why fifth:** Auth must be established before protecting these routes.

### Layer 6: Module Pages (depends on Layers 2 + 3 + 4 + 5)
20. `modules/welcome/page.tsx`
21. `modules/brand-foundation/page.tsx`
22. `modules/visual-world/page.tsx`
23. `modules/content/page.tsx`
24. `modules/launch/page.tsx`
25. `modules/playbook/page.tsx` (read-only compiled view)

**Why last:** Each module page is an integration of all lower layers. Migrate modules one at a time using `/old/modules/*.html` as content source.

### Layer 7: Admin (depends on Layer 6)
26. `app/(app)/(admin)/admin/page.tsx`
27. Server-side admin data fetching (user list, progress viewer, delete)

**Why last:** Admin has no module dependencies but requires auth and the shell, and is lower priority than the core student experience.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Client Components fetching data directly from Supabase
**What goes wrong:** Business logic leaks into UI, Supabase client proliferates, auth state diverges between server and client.

**Instead:** Server Components fetch initial data and pass it as props; hooks handle subsequent mutations.

### Anti-Pattern 2: Putting all module content in a single page component
**What goes wrong:** Recreates the 4,524-line monolith in React form.

**Instead:** Each section within a module is its own component file. The module page orchestrates section rendering via `currentSection` state and a sections array. Section components import their content as constants or from a data file.

### Anti-Pattern 3: Using middleware as the only auth check on admin
**What goes wrong:** A matcher misconfiguration silently removes protection.

**Instead:** Admin page does a server-side getClaims() check and returns 404 or redirect if the session is not an admin. Middleware is a UX convenience, not the security perimeter.

### Anti-Pattern 4: Storing form state in URL params
**What goes wrong:** Long URLs, back-button confusion, sensitive user content in browser history.

**Instead:** `currentSection` is component state initialized from `vww_progress.data.cur`. It is not part of the URL.

### Anti-Pattern 5: One monolithic ProgressContext write on every keystroke
**What goes wrong:** Excessive re-renders of the entire sidebar and shell on every character typed.

**Instead:** Progress state changes only on section completion events (coarse-grained). Keystroke-level changes stay local to the module page and are handled by useAutoSave without touching context.

---

## Scalability Considerations

This is a small-scale course platform (tens to low hundreds of concurrent students). The architecture does not need to scale beyond that. Design accordingly:

| Concern | At Current Scale | Notes |
|---------|-----------------|-------|
| Concurrent saves | Low — 800ms debounce, one row per user | Supabase free tier handles this easily |
| Auth sessions | Supabase cookie-based, stateless JWT refresh | No session server needed |
| Module page rendering | Client-rendered after initial auth check | No static generation needed — content is gated |
| Admin data | Server Component fetch on demand | No real-time needed; refresh on page load is fine |

---

## Sources

- Next.js Project Structure (official, updated 2026-03-31): https://nextjs.org/docs/app/getting-started/project-structure
- Supabase Auth Server-Side for Next.js (official): https://supabase.com/docs/guides/auth/server-side/nextjs
- Next.js App Router Patterns 2026: https://dev.to/teguh_coding/nextjs-app-router-the-patterns-that-actually-matter-in-2026-146
- Next.js Architecture 2026 — Server-First, Client-Islands: https://www.yogijs.tech/blog/nextjs-project-architecture-app-router
- Supabase Auth with Next.js App Router: https://supabase.com/docs/guides/auth/auth-helpers/nextjs
- Next.js Best Practices for Production 2026: https://ztabs.co/blog/nextjs-app-router-best-practices
- Existing codebase: `/old/` directory (direct inspection of index.html, modules/brand-foundation.html, admin.html, supabase/functions/)
