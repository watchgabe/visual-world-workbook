# Phase 1: Foundation & App Shell - Research

**Researched:** 2026-04-01
**Domain:** Next.js 15 scaffold, Supabase SSR, Tailwind v4 theme system, app shell layout
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Claude's discretion on storage approach (single JSON column vs row-per-field vs hybrid)
- **D-02:** Fresh tables, ignore old schema. No data migration needed — students start fresh in the new app. Old tables stay in Supabase but are not used.
- **D-03:** Progress tracking is derived from responses, not a separate table. Completion % is calculated from filled fields — single source of truth, no sync issues.
- **D-04:** Pixel-faithful recreation of the old visual design. Same colors, spacing, fonts, layout proportions. Students should see no visual difference.
- **D-05:** Sidebar shows all 6 module names with placeholder progress indicators (0%) in Phase 1. Clicking navigates to an empty module page. Sidebar is fully wired for Phase 5 integration.
- **D-06:** Topbar contains FSCreative brand mark (left), overall progress bar (center), and theme toggle (right). Matches the old topbar layout. Progress bar shows 0% as static placeholder until ProgressContext exists in Phase 3.
- **D-07:** Claude's discretion on CSS implementation — pick approach that best preserves old color tokens while working idiomatically with Tailwind v4 (CSS custom properties vs Tailwind dark: class or hybrid)
- **D-08:** Default theme is dark, matching the current app experience. First-time visitors see dark mode.
- **D-09:** Grain texture overlay preserved — SVG noise texture with mix-blend-mode: overlay at ~2.5% opacity. This is a design signature of the app.
- **D-10:** Sidebar is fixed at 280px on desktop (always visible, not collapsible). Only collapses on mobile via hamburger menu.
- **D-11:** Mobile sidebar uses slide-from-left + dark overlay pattern, matching old app. Tap overlay or hamburger to close.
- **D-12:** Mobile breakpoint at 768px (standard tablet breakpoint). Below 768px, sidebar switches to hamburger menu.

### Claude's Discretion

- D-01: Database storage structure (JSON column vs row-per-field vs hybrid)
- D-07: CSS theme implementation strategy (CSS vars vs Tailwind dark: class vs hybrid)
- General: Folder structure conventions, shadcn component selection, TypeScript type organization

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Single Supabase service module with browser and server client creators | Supabase SSR client pattern: createBrowserClient + createServerClient in `src/lib/supabase/` |
| DATA-02 | Well-structured database schema (new tables/columns designed for scalability) | JSONB column for flexible field storage with row-per-module structure recommended |
| NAV-01 | App layout with sidebar, topbar, and overall progress bar shared across all pages | Root layout with three-panel shell in `src/app/(app)/layout.tsx` |
| NAV-02 | Direct routing via Next.js App Router (no iframes) | Route group `(app)` wraps all authenticated module routes |
| NAV-05 | Dark/light theme toggle stored in cookie (no SSR hydration mismatch) | Cookie read in root layout server component; `data-theme` attribute on `<html>` |
| NAV-06 | Mobile responsive sidebar with hamburger menu | Client component sidebar with `useState` for open/close; CSS transform slide-in |
| DEPLOY-02 | TypeScript throughout the codebase | `--typescript` flag in create-next-app; strict mode in tsconfig.json |
</phase_requirements>

---

## Summary

Phase 1 creates the structural skeleton every subsequent phase builds on. There is no existing Next.js project — this is a fresh `create-next-app@15` scaffold. The primary technical challenges are: (1) getting Supabase SSR clients working correctly with the App Router cookie system, (2) implementing the cookie-backed theme toggle in a way that avoids SSR hydration mismatch, and (3) establishing the project structure and CSS architecture cleanly enough that later phases can add content without rework.

The stack is fully specified in CLAUDE.md. Next.js 15.2.4 is the locked version (CLAUDE.md rationale: avoid Next.js 16 breaking changes for brownfield migration). The registry shows 15.5.14 as the current latest in the 15.x line — the planner should note this but MUST follow the CLAUDE.md pin (15.2.4) unless the user explicitly re-opens the version decision. Supabase JS 2.101.1 and @supabase/ssr 0.10.0 are confirmed current via npm.

The theme system recommendation is a hybrid approach: use Tailwind v4's `@custom-variant dark` directive pointed at a `data-theme="dark"` attribute on `<html>`, AND preserve all color tokens as CSS custom properties in `:root` and `[data-theme="light"]` selectors (porting the old app's exact hex values). This gives pixel-faithful color fidelity without re-expressing every token as Tailwind `dark:` classes, while still making the `dark:` variant available for any component that wants it.

**Primary recommendation:** Scaffold with `npx create-next-app@15.2.4` (pinned version), use `src/` directory, set up the Supabase client module immediately after scaffold, establish the CSS architecture in `globals.css` before building any layout, then build the app shell.

---

## Project Constraints (from CLAUDE.md)

| Directive | Detail |
|-----------|--------|
| Framework | Next.js 15.2.4 (not 16 — breaking changes) with App Router |
| Language | TypeScript throughout |
| Auth | Supabase Auth, magic link only |
| Supabase client | `@supabase/ssr` 0.10.0 (NOT deprecated `auth-helpers`) |
| Styling | Tailwind CSS v4 (CSS-first, no tailwind.config.js) |
| State | React Context only — no Zustand/Jotai |
| Database | New tables only, no schema changes to existing tables |
| Edge functions | Unchanged; wrap via Next.js API routes |
| Visual design | Pixel-faithful to old app |
| Deployment | Vercel, env vars in dashboard |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 15.2.4 (pinned) | Full-stack React framework | CLAUDE.md locked — avoids Next.js 16 breaking changes |
| react | 19.x (bundled) | UI runtime | Ships with Next.js 15, no separate decision |
| react-dom | 19.x (bundled) | DOM renderer | Same as above |
| typescript | 5.x | Type safety | CLAUDE.md mandated, `DEPLOY-02` requirement |
| @supabase/supabase-js | 2.101.1 | Supabase JS SDK | Latest stable confirmed via npm 2026-04-01 |
| @supabase/ssr | 0.10.0 | Cookie-based auth for App Router | Official replacement for deprecated auth-helpers |
| tailwindcss | 4.2.2 | Utility-first CSS | Latest v4; CSS-first config, no tailwind.config.js |
| @tailwindcss/postcss | (bundled with v4) | PostCSS integration | Required for Next.js to process Tailwind v4 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| next-themes | 0.4.6 | Theme management with SSR | NOT used — cookie approach is simpler and avoids a dependency for this use case; see Architecture Patterns |
| tw-animate-css | latest | CSS animations | Install if transition animations needed in shell (sidebar slide) |
| shadcn/ui | CLI-managed | Component primitives | Add individual components as needed (no monolith install) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual cookie theme | next-themes 0.4.6 | next-themes adds a dependency and uses localStorage by default (not cookies); requires extra config for cookie persistence; manual approach is 20 lines of code and perfectly suited here |
| `data-theme` attribute | `.dark` class on `<html>` | Both work; `data-theme` is more semantic, pairs well with CSS custom property overrides, and avoids collision with other class-based logic |
| JSONB single column per module | Separate row per field | JSONB is simpler to query and update for structured workshop data; row-per-field requires more complex queries for auto-save |

### Installation

```bash
# Scaffold (interactive — answer yes to TypeScript, Tailwind, App Router, src/)
npx create-next-app@15.2.4 .

# Supabase
npm install @supabase/supabase-js@2.101.1 @supabase/ssr@0.10.0

# No additional packages needed for Phase 1 — RHF, Zod, shadcn added in Phase 3
```

**Version verification (confirmed 2026-04-01 via npm registry):**
- `next@15.2.4` — pinned per CLAUDE.md (latest 15.x is 15.5.14, latest overall is 16.2.2)
- `@supabase/supabase-js@2.101.1` — latest stable
- `@supabase/ssr@0.10.0` — latest stable
- `tailwindcss@4.2.2` — latest v4

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── layout.tsx           # Root layout: reads theme cookie, sets data-theme on <html>
│   ├── globals.css          # Tailwind import + CSS custom properties + @custom-variant dark
│   ├── page.tsx             # Redirect to /modules/welcome (or login in Phase 2)
│   ├── (app)/               # Route group: authenticated app shell
│   │   ├── layout.tsx       # AppShell layout: Sidebar + Topbar + main
│   │   └── modules/
│   │       └── [slug]/
│   │           └── page.tsx # Module placeholder page
│   └── (auth)/              # Route group: auth pages (populated in Phase 2)
│       └── login/
│           └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx      # Client component (useState for mobile)
│   │   ├── Topbar.tsx       # Brand mark + progress bar + theme toggle
│   │   └── MobileOverlay.tsx
│   └── ui/                  # shadcn/ui components (added per-phase)
├── lib/
│   └── supabase/
│       ├── client.ts        # createBrowserClient (client components)
│       └── server.ts        # createServerClient (server components, server actions)
└── types/
    └── database.ts          # Supabase-generated types + domain types
```

### Pattern 1: Supabase Client Module (DATA-01)

**What:** Two separate files export typed Supabase clients — one for client components (browser), one for server components and route handlers.

**When to use:** Any component that needs Supabase access imports from the appropriate file.

```typescript
// src/lib/supabase/client.ts — browser (client components)
'use client'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts — server (server components, server actions, route handlers)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server components cannot set cookies — middleware handles refresh
          }
        },
      },
    }
  )
}
```

**Critical note:** `@supabase/ssr` 0.10.0 uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (not `NEXT_PUBLIC_SUPABASE_ANON_KEY` — verify env var name matches what Supabase dashboard provides).

**Security note:** In server code, use `supabase.auth.getClaims()` to validate sessions — it validates JWT signatures. Never rely on `getSession()` in server code.

### Pattern 2: Cookie-Backed Theme Toggle (NAV-05)

**What:** Root layout reads theme cookie server-side and applies `data-theme` attribute to `<html>`. Client toggle button writes the cookie and calls `router.refresh()` to re-render the server. Zero hydration flash because the server already knows the theme.

**When to use:** Theme initialization (root layout) and anywhere the toggle button is placed.

```typescript
// src/app/layout.tsx — server component
import { cookies } from 'next/headers'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('blp-theme')?.value ?? 'dark'  // D-08: default dark

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
```

```typescript
// src/components/layout/ThemeToggle.tsx — client component
'use client'
import { useRouter } from 'next/navigation'

export function ThemeToggle({ currentTheme }: { currentTheme: 'dark' | 'light' }) {
  const router = useRouter()

  function toggle() {
    const next = currentTheme === 'dark' ? 'light' : 'dark'
    document.cookie = `blp-theme=${next}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <button onClick={toggle} aria-label="Toggle theme">
      {currentTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
```

**Cookie name matches old app:** `blp-theme` — maintains continuity if users have it set.

**Tradeoff:** `router.refresh()` causes a server round-trip. This is acceptable — theme toggling is infrequent and the UX is a brief reload rather than a flash. Alternative (write cookie + class toggle in JS) would not require a refresh but loses SSR consistency.

### Pattern 3: Tailwind v4 Theme CSS Architecture (D-07)

**What:** Hybrid approach — CSS custom properties in `:root` (dark default) and `[data-theme="light"]` override, PLUS Tailwind `@custom-variant dark` for the `dark:` utility class prefix.

**Recommendation:** Use this hybrid because the old app's entire color system is already CSS custom properties. Porting them directly preserves pixel-fidelity (D-04) without having to re-express every color as a Tailwind token.

```css
/* src/app/globals.css */
@import "tailwindcss";

/* Activate dark: prefix utilities when data-theme="dark" is on <html> */
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

/* ─── DESIGN TOKENS — DARK (default) ─── */
:root {
  --bg: #0a0a0a;
  --surface: #111111;
  --card: #161616;
  --border: #1f1f1f;
  --border2: #2a2a2a;
  --text: #ffffff;
  --dim: #a0a0a0;
  --dimmer: #555555;
  --orange: #F0601B;
  --orange-hover: #ff6d28;
  --orange-tint: rgba(240, 96, 27, 0.1);
  --orange-border: rgba(240, 96, 27, 0.28);
  --orange-dark: #ff8050;
  --green-bg: rgba(61, 184, 100, 0.1);
  --green-text: #5DCAA5;
  --green-border: rgba(93, 202, 165, 0.3);
  --radius-lg: 10px;
  --radius-md: 6px;
  --font: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  --font-num: 'Barlow Condensed', sans-serif;
  --topbar-h: 48px;
  --sidebar-w: 280px;
}

/* ─── TOKENS — LIGHT OVERRIDE ─── */
[data-theme="light"] {
  --bg: #f7f6f4;
  --surface: #edecea;
  --card: #e2e0dc;
  --border: #ccc9c2;
  --border2: #b8b4ac;
  --text: #0a0a0a;
  --dim: #404040;
  --dimmer: #888888;
  --orange-tint: #FEF0E8;
  --orange-border: #F4B89A;
  --orange-dark: #B84410;
  --green-bg: #E6F5EF;
  --green-text: #085041;
  --green-border: #5DCAA5;
}

/* ─── BASE ─── */
body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  transition: background .25s, color .25s;
}

/* ─── GRAIN OVERLAY (D-09) ─── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.025'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}
```

**Why not put tokens in Tailwind `@theme`?** The `@theme` directive creates Tailwind utility classes from each token (e.g., `--color-bg` becomes `bg-bg`, `text-bg`). This project doesn't need those utility classes — the existing design already uses CSS custom properties directly in component styles. Using `@theme` for these tokens would create hundreds of unused utilities and add noise without benefit.

### Pattern 4: Three-Panel App Shell (NAV-01)

**What:** A route group layout `(app)/layout.tsx` renders the fixed sidebar and topbar, with a main content area for the page. The root layout only handles `<html>/<body>` and theme.

```
Root layout (layout.tsx)
  └── html[data-theme] > body
       └── App layout ((app)/layout.tsx)
            ├── Sidebar (fixed, 280px)
            ├── MobileTopbar (mobile only)
            └── main (margin-left: var(--sidebar-w) on desktop)
                 └── {page content}
```

```typescript
// src/app/(app)/layout.tsx
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileTopbar } from '@/components/layout/MobileTopbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileTopbar />
      <Sidebar />
      <main
        style={{ marginLeft: 'var(--sidebar-w)' }}
        className="min-h-screen pt-[var(--topbar-h)] md:pt-0"
      >
        {children}
      </main>
    </>
  )
}
```

**Key decision:** `Sidebar` is a Client Component (`'use client'`) because it needs `useState` for mobile open/close. The layout wrapper itself stays as a Server Component.

### Pattern 5: Mobile Sidebar (NAV-06)

**What:** Below 768px, the sidebar is hidden off-screen (`transform: translateX(-100%)`). A hamburger button in the mobile topbar sets `isOpen = true`. The overlay div catches outside clicks.

```typescript
// src/components/layout/Sidebar.tsx
'use client'
import { useState } from 'react'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/65 backdrop-blur-sm z-[150] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-[var(--sidebar-w)]
          bg-[var(--surface)] border-r border-[var(--border)]
          flex flex-col z-[200]
          transition-transform duration-250 ease-[cubic-bezier(.4,0,.2,1)]
          md:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar content */}
      </aside>
    </>
  )
}
```

**MobileTopbar:** Separate component, visible only on `<768px`, contains hamburger button that calls a shared state handler. The cleanest approach for sharing the open state is to lift it to a wrapper client component or use a context limited to the app layout — avoid prop drilling through the server layout.

### Pattern 6: Database Schema Design (DATA-02, D-01, D-03)

**Recommendation: Row-per-module with JSONB responses column (hybrid)**

**Rationale:** One row per user per module. The `responses` column is JSONB containing all field values keyed by field ID. This provides:
- Simple `upsert` for auto-save (one query per module, not one per field)
- Easy progress calculation (count non-empty keys)
- Flexible schema evolution (add fields without ALTER TABLE)
- Efficient reads (fetch entire module state in one query)

```sql
-- New tables (do NOT touch existing tables)

create table public.blp_responses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  module_slug  text not null,  -- 'brand-foundation', 'visual-world', etc.
  responses    jsonb not null default '{}',
  updated_at   timestamptz not null default now(),
  constraint blp_responses_user_module unique (user_id, module_slug)
);

-- Row-level security
alter table public.blp_responses enable row level security;

create policy "Users can read own responses"
  on public.blp_responses for select
  using (auth.uid() = user_id);

create policy "Users can upsert own responses"
  on public.blp_responses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own responses"
  on public.blp_responses for update
  using (auth.uid() = user_id);

-- Index for fast user+module lookups
create index blp_responses_user_module_idx
  on public.blp_responses (user_id, module_slug);
```

**Progress calculation pattern (D-03):**
```typescript
// Count non-empty values in responses JSONB
function calculateProgress(responses: Record<string, unknown>, totalFields: number): number {
  const filled = Object.values(responses).filter(v => v !== '' && v !== null && v !== undefined).length
  return Math.round((filled / totalFields) * 100)
}
```

**Why not row-per-field?** Would require one query per field on save, creating chatty auto-save behavior. JSONB upsert is atomic and efficient.

**Why not a single giant JSON for all modules?** Separate rows per module keep individual module updates isolated — concurrent saves from different modules don't overwrite each other.

### Anti-Patterns to Avoid

- **Supabase session in client-side code:** Never call `getSession()` in server components to validate — use `getClaims()` which validates the JWT signature. `getSession()` is for display only.
- **Cookie read in Client Component:** `cookies()` from `next/headers` is server-only. Read the cookie in the root layout (server component) and pass theme down as a prop if needed.
- **Storing theme in localStorage (not cookies):** localStorage is client-only — the server can't read it, causing a flash on every page load. Cookie is the correct storage for SSR-aware theme.
- **Putting Supabase clients in a single file:** Browser client and server client must be in separate files. Importing server client in a client component causes a build error (`next/headers` is server-only).
- **Using `middleware.ts` for theme:** Phase 2 will add middleware for auth. Keep theme handling purely in the root layout to avoid middleware complexity in Phase 1.
- **Using Tailwind `@theme` for the brand's CSS custom properties:** The old app uses raw CSS custom properties directly in styles. Keep them as `:root` vars; only use `@theme` if you need Tailwind utility class generation (not needed here).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cookie parsing for theme | Manual cookie string split | `cookies()` from `next/headers` in server component | Handles encoding, security attributes, SameSite automatically |
| Supabase auth cookie management | Custom cookie set/get helpers | `@supabase/ssr` createServerClient with `cookies` config | Handles token refresh, multi-cookie tokens, secure flags |
| TypeScript types for DB | Hand-typed interfaces | `supabase gen types typescript` CLI | Auto-generates from live schema, stays in sync |
| SVG noise grain texture | CSS libraries or canvas | Port exact SVG from `old/index.html` line 49 | Zero dependencies, exact visual match guaranteed |

**Key insight:** This phase is infrastructure, not features. The biggest time sinks are typically (1) Supabase client misconfiguration, and (2) theme flash on first load. Both have clear solutions documented above.

---

## Common Pitfalls

### Pitfall 1: Supabase Cookie Names Changed
**What goes wrong:** `@supabase/ssr` 0.10.0 uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as the env var name in docs, but older tutorials use `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If the wrong name is used, the client fails to initialize silently.
**Why it happens:** Supabase renamed the key in updated docs. The actual anon key value is the same — just the env var name differs in newer examples.
**How to avoid:** Check the Supabase dashboard "API Settings" for the exact env var name. Use whatever the dashboard shows. `NEXT_PUBLIC_SUPABASE_ANON_KEY` still works — just be consistent.
**Warning signs:** `Error: supabaseKey is required` at runtime.

### Pitfall 2: `cookies()` is Async in Next.js 15
**What goes wrong:** In Next.js 15, `cookies()` from `next/headers` is an async function. Calling it synchronously (without `await`) returns a Promise, not the cookie store.
**Why it happens:** Next.js 15 made dynamic APIs (`cookies()`, `headers()`, `params`) async to improve tree-shaking and performance.
**How to avoid:** Always `await cookies()`. Make the layout/server component `async`.
**Warning signs:** `cookieStore.get is not a function` or `cookieStore.getAll is not a function`.

### Pitfall 3: Tailwind v4 Dark Mode `darkMode` Config Key Removed
**What goes wrong:** Adding `darkMode: 'class'` to a `tailwind.config.js` or `tailwind.config.ts` has no effect in Tailwind v4 — the config file itself is gone.
**Why it happens:** Tailwind v4 is CSS-first. All configuration lives in `globals.css`.
**How to avoid:** Use `@custom-variant dark (...)` in `globals.css` instead. No JS config file needed.
**Warning signs:** `dark:` utilities have no effect even with `.dark` class on `<html>`.

### Pitfall 4: Theme Flash on Hard Refresh
**What goes wrong:** Even with the cookie approach, if a user has the cookie but the layout render is slow, there can be a brief flash of the wrong theme before the server-rendered HTML arrives.
**Why it happens:** Network latency between request and first paint.
**How to avoid:** The cookie-in-root-layout approach eliminates flash entirely — the server renders the correct `data-theme` attribute before sending HTML. This is zero-flash by design, unlike localStorage approaches.
**Warning signs:** Only applies to localStorage-based themes; the cookie approach doesn't have this problem.

### Pitfall 5: Mobile Sidebar State Sharing
**What goes wrong:** The hamburger button is in `MobileTopbar`, but the sidebar open state is in `Sidebar`. Neither has access to the other's state if they're sibling components.
**Why it happens:** State lifting requires a common ancestor, which in Next.js App Router is a Server Component layout — which can't use `useState`.
**How to avoid:** Create a thin `'use client'` wrapper component `AppShellClient` that wraps both `Sidebar` and `MobileTopbar` and owns the `isOpen` state. The server layout renders `AppShellClient`.
**Warning signs:** Hamburger button does nothing, or sidebar state doesn't update.

### Pitfall 6: `overflow: hidden` on `body` Breaks Mobile Scroll
**What goes wrong:** The old app sets `overflow: hidden` on body to prevent scroll (content scrolls inside the sidebar/main panels). In Next.js with App Router, this can conflict with how the framework handles scroll restoration.
**Why it happens:** App Router manages scroll differently than traditional web pages.
**How to avoid:** Keep `overflow: hidden` on `body` but set `overflow-y: auto` on the `main` content area explicitly. Test scroll on mobile carefully.
**Warning signs:** Pages can't scroll on mobile, or scroll position isn't restored on navigation.

---

## Code Examples

### Root Layout with Theme Cookie
```typescript
// Source: Official Next.js cookies() docs + Supabase SSR pattern
// src/app/layout.tsx
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: 'FSCreative — The Brand Launch Playbook™',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const theme = (cookieStore.get('blp-theme')?.value as 'dark' | 'light') ?? 'dark'

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
```

### Module Routes List (for Sidebar)
```typescript
// src/lib/modules.ts
export const MODULES = [
  { slug: 'welcome',          number: '00', title: 'Welcome' },
  { slug: 'brand-foundation', number: '01', title: 'Brand Foundation' },
  { slug: 'visual-world',     number: '02', title: 'Visual World' },
  { slug: 'content',          number: '03', title: 'Create Content' },
  { slug: 'launch',           number: '04', title: 'Launch' },
  { slug: 'playbook',         number: '05', title: 'The Playbook' },
] as const

export type ModuleSlug = typeof MODULES[number]['slug']
```

### Sidebar Module Item (from old HTML reference)
The old sidebar items have this exact structure (from `old/index.html` lines ~120-155):
- Module number: `font-family: var(--font-num); font-size: 22px; font-weight: 900; color: var(--orange)`
- Module title: `font-size: 12.5px; font-weight: 700`
- Active state: `background: var(--orange-tint); border-left: 2px solid var(--orange)`
- Progress badge: `font-size: 9.5px; font-weight: 600; color: var(--dimmer)`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` with `darkMode: 'class'` | `@custom-variant dark` in CSS | Tailwind v4 (Jan 2025) | No JS config file — configure in `globals.css` |
| `@supabase/auth-helpers-nextjs` | `@supabase/ssr` | 2024 | auth-helpers is deprecated; `createServerClient`/`createBrowserClient` replaces it |
| `cookies()` synchronous | `await cookies()` | Next.js 15 | Dynamic APIs are async; always `await` |
| `localStorage` for theme | Cookie (server-readable) | App Router era | localStorage causes SSR flash; cookies don't |
| Iframe module loading | Next.js App Router routes | This migration | Direct routing, URL-addressable, no postMessage |

**Deprecated/outdated:**
- `@supabase/auth-helpers-nextjs`: replaced by `@supabase/ssr`, do not use
- `tailwind.config.js darkMode`: removed in v4, use `@custom-variant` in CSS
- Synchronous `cookies()`: breaking in Next.js 15, must `await`

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | create-next-app, npm | ✓ | v25.2.1 (Homebrew) | — |
| npm | Package installation | ✓ | via Homebrew | — |
| Git | Version control | ✓ | (confirmed via git status) | — |
| Supabase project | Database, Auth | ✓ | (existing project in old code) | — |
| Vercel account | Deployment (Phase 7) | Not verified | — | Local dev unaffected |

**Note on Node.js path:** Node.js is installed at `/opt/homebrew/bin/node` but is not in the default shell PATH for this agent session. All `npm` commands during implementation must use the full path `/opt/homebrew/bin/npm` or the executor must run `export PATH="/opt/homebrew/bin:$PATH"` first.

**Missing dependencies with no fallback:** None for Phase 1.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None installed yet — Wave 0 must add Playwright or Vitest |
| Config file | None — see Wave 0 |
| Quick run command | `npm run test` (once configured) |
| Full suite command | `npm run test:e2e` (once Playwright configured) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | Supabase browser client can be imported without error | unit | `vitest run src/lib/supabase/client.test.ts` | ❌ Wave 0 |
| DATA-01 | Supabase server client imports correctly (server-only) | unit | `vitest run src/lib/supabase/server.test.ts` | ❌ Wave 0 |
| DATA-02 | `blp_responses` table exists with correct columns | manual | Supabase dashboard inspection | N/A |
| NAV-01 | App shell renders with sidebar, topbar, main area | e2e smoke | `playwright test tests/shell.spec.ts` | ❌ Wave 0 |
| NAV-02 | `/modules/brand-foundation` route resolves without error | e2e smoke | `playwright test tests/routes.spec.ts` | ❌ Wave 0 |
| NAV-05 | Dark theme persists after refresh (cookie round-trip) | e2e | `playwright test tests/theme.spec.ts` | ❌ Wave 0 |
| NAV-05 | Light theme applies after toggle (data-theme="light" on html) | e2e | `playwright test tests/theme.spec.ts` | ❌ Wave 0 |
| NAV-06 | Sidebar hidden on mobile viewport, hamburger visible | e2e | `playwright test tests/mobile.spec.ts` | ❌ Wave 0 |
| NAV-06 | Hamburger opens sidebar on mobile | e2e | `playwright test tests/mobile.spec.ts` | ❌ Wave 0 |
| DEPLOY-02 | TypeScript compiles without errors | build check | `npm run build` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm run build` (TypeScript compile check, zero-setup)
- **Per wave merge:** Full test suite once Playwright is installed
- **Phase gate:** `npm run build` clean + all e2e tests green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/shell.spec.ts` — covers NAV-01, NAV-02
- [ ] `tests/theme.spec.ts` — covers NAV-05
- [ ] `tests/mobile.spec.ts` — covers NAV-06
- [ ] `playwright.config.ts` — Playwright configuration
- [ ] Framework install: `npm install -D @playwright/test && npx playwright install` — if Playwright chosen
- [ ] Alternative minimal approach: `npm run build` as the only automated check for this phase (sufficient for DEPLOY-02; DATA-01 verified by build success if clients are imported somewhere)

---

## Open Questions

1. **Next.js version: 15.2.4 (pinned) vs 15.5.14 (latest stable 15.x)**
   - What we know: CLAUDE.md pins 15.2.4. npm registry shows 15.5.14 as the latest 15.x release.
   - What's unclear: Whether 15.2.4-to-15.5.14 contains any breaking changes that would affect this project.
   - Recommendation: Follow CLAUDE.md (15.2.4). If the executor wants to use 15.5.14, this is a Claude-discretion call within the same major.minor line — document in CLAUDE.md conventions section after the decision.

2. **Supabase env var name: `PUBLISHABLE_KEY` vs `ANON_KEY`**
   - What we know: @supabase/ssr docs use `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in newer examples. Old code uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - What's unclear: Which var name is set in the existing Supabase project's `.env.local`.
   - Recommendation: Use `NEXT_PUBLIC_SUPABASE_ANON_KEY` (matches existing old code). Add a comment noting the alias.

3. **Mobile state sharing approach for sidebar**
   - What we know: `Sidebar` and `MobileTopbar` need shared `isOpen` state but the layout is a Server Component.
   - What's unclear: Whether to use a thin client wrapper or a simple React Context.
   - Recommendation: Use a thin `AppShellClient` wrapper component — simpler than a context for this narrow use case.

---

## Sources

### Primary (HIGH confidence)
- [Next.js Installation Docs](https://nextjs.org/docs/app/getting-started/installation) — scaffold command, create-next-app options, confirmed version 16.2.2 as latest (15.x for this project)
- [Next.js Project Structure Docs](https://nextjs.org/docs/app/getting-started/project-structure) — official folder conventions, route groups, src/ directory
- [Supabase Creating SSR Client Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client) — createBrowserClient/createServerClient exact patterns
- [Tailwind CSS v4 Dark Mode Docs](https://tailwindcss.com/docs/dark-mode) — @custom-variant directive, data-theme approach
- [Tailwind CSS v4 Theme Docs](https://tailwindcss.com/docs/theme) — @theme directive vs :root CSS variables
- npm registry (via `/opt/homebrew/bin/npm view`) — confirmed package versions 2026-04-01

### Secondary (MEDIUM confidence)
- [michaelangelo.io — Dark mode RSC pattern](https://michaelangelo.io/blog/darkmode-rsc) — cookie+router.refresh() pattern, verified consistent with Next.js docs
- [Supabase SSR Setup Docs](https://supabase.com/docs/guides/auth/server-side/nextjs) — middleware pattern, cookie handling
- [Tailwind v4 @custom-variant — sujalvanjare.vercel.app](https://sujalvanjare.vercel.app/blog/dark-mode-nextjs15-tailwind-v4) — Tailwind v4 dark variant syntax

### Tertiary (LOW confidence)
- WebSearch results on project structure best practices — general patterns, consistent with official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed via npm registry 2026-04-01
- Architecture: HIGH — patterns from official Next.js and Supabase docs
- CSS theme system: HIGH — Tailwind v4 docs directly confirm @custom-variant approach
- Database schema: MEDIUM — JSONB recommendation is well-established but exact column structure is Claude's discretion (D-01)
- Pitfalls: HIGH — async cookies() and Tailwind v4 darkMode removal are documented breaking changes

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (Next.js 15.x/Supabase stable; Tailwind v4 CSS-first approach is stable)
