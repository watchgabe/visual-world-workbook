# Technology Stack

**Project:** Brand Launch Playbook — Next.js Migration
**Researched:** 2026-04-01
**Research mode:** Ecosystem

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.2.4 (stable) | Full-stack React framework | Next.js 16 was released October 2025 but introduces breaking changes (middleware renamed to proxy.ts, fully async params/cookies, Turbopack-only default) that create migration risk for a brownfield project. 15.x is the current stable LTS-equivalent line with full ecosystem support. |
| React | 19.x (bundled with Next.js 15) | UI runtime | Ships with Next.js 15, no separate version decision needed. |
| TypeScript | 5.x | Type safety | Mandated by project constraints. Next.js 16 requires 5.1+ minimum; 15.x works with any 5.x release. |

**On Next.js 16:** Do not upgrade to 16 for this migration. The `middleware.ts` → `proxy.ts` rename, removal of sync `cookies()`/`params()`, and Turbopack-as-default all add churn to a brownfield project trying to stabilize. Revisit after the app is stable on 15.

### Authentication & Backend

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `@supabase/supabase-js` | 2.101.1 | Supabase client SDK | Latest stable (March 31, 2026). Existing project already uses Supabase — no new infrastructure needed. |
| `@supabase/ssr` | 0.10.0 | Cookie-based auth for App Router | The official Supabase package for SSR. Replaces the deprecated `@supabase/auth-helpers-nextjs`. Provides `createBrowserClient` and `createServerClient`. v0.10.0 adds automatic CDN cache headers for auth responses. |

**Critical auth pattern:** Use `supabase.auth.getClaims()` (or `getUser()`) on the server — never `getSession()`. `getSession()` does not revalidate the JWT against the Supabase auth server and cannot be trusted in middleware/server components.

**Magic link flow:** Supabase PKCE flow is the default for `signInWithOtp`. After the user clicks the link, they land on a `/auth/confirm` Route Handler that exchanges the token for a session cookie. Do not redirect to a page that prefetches routes before the session cookie is set.

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.x | Utility-first CSS | Tailwind v4 (released January 2025) is CSS-first: no `tailwind.config.js`, configuration via `@theme` in CSS. 3-10x faster full builds, up to 100x faster incremental. Next.js 15 supports it via `@tailwindcss/postcss`. Existing project already uses Tailwind — stay on v4 for the migration. |
| `tw-animate-css` | latest | CSS animations | Replaces `tailwindcss-animate` which is deprecated in Tailwind v4 ecosystem. Default in new shadcn installs. |

**Tailwind v3 vs v4:** If the existing HTML uses `tailwind.config.js` or `@tailwind base/components/utilities` directives, those are v3 syntax. The automated upgrade tool (`npx @tailwindcss/upgrade`) handles most of the migration. Do this upgrade at project init, not mid-migration.

### Component Library

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn/ui | latest (CLI-managed) | Reusable component primitives | Not a dependency — components are copied into the project. Built on Radix UI + Tailwind. Provides accessible, composable primitives for Input, Textarea, Select, Progress, and navigation patterns needed for workshop UI. Supports Tailwind v4 natively. |

**Note:** shadcn/ui is not installed as a package — run `npx shadcn@latest init` to scaffold, then `npx shadcn@latest add [component]` per component. The project will only include the components it actually uses, avoiding bundle bloat.

**Components needed for this project:**
- `input`, `textarea` — WorkshopInput, WorkshopTextarea
- `select` — OptionSelector
- `progress` — ProgressRing (or build custom with Tailwind)
- `button` — form actions, nav items
- `separator`, `scroll-area` — sidebar layout

### Forms & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| `react-hook-form` | 7.72.0 | Form state management | Performance-first (uncontrolled inputs, minimal re-renders). Integrates with Zod via `@hookform/resolvers`. Handles debounced auto-save patterns well via `watch()`. Works with React 19's `useActionState` for server action submission. |
| `zod` | 4.3.6 | Schema validation | Zod v4 is a major improvement: ~175 type instantiations vs 25,000+ in v3. Available at `zod/v4` subpath. Use for workshop field validation (text length limits, required fields) and API route input sanitization. |
| `@hookform/resolvers` | latest | RHF + Zod bridge | Required to connect react-hook-form with Zod schemas. |

**Auto-save pattern:** Use `react-hook-form`'s `watch()` combined with a `useDebounce` hook (custom, ~10 lines) to trigger Supabase upserts 800ms after the last keystroke. This replaces the 4 separate save implementations in the existing codebase.

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Context (built-in) | React 19 | Shared app state | Appropriate for this app's scale: 3 contexts (auth/user, progress, theme). No external library needed. Avoids Zustand/Jotai dependency. Project constraints explicitly call for this. |

**What goes in Context:**
- `AuthContext` — current user, loading state, signOut helper
- `ProgressContext` — per-module completion percentages, section status
- `ThemeContext` — dark/light preference, persisted to localStorage + `data-theme` attribute

**What does NOT go in Context:** Workshop form data (stays local in react-hook-form; synced to Supabase on save).

### Routing & Middleware

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js App Router | built-in | File-based routing | Replaces iframe-based module loading. Each module becomes a route (`/module/brand-foundation`, etc.). Shared layout with sidebar/topbar via `layout.tsx`. |
| `middleware.ts` | built-in | Auth route protection | Intercepts requests to `/module/*` and `/admin/*`. Uses `createServerClient` from `@supabase/ssr` to validate session. Redirects unauthenticated users to `/login`. Admin check via `user.app_metadata.role`. |

**Route structure:**
```
/                    → redirect → /module/welcome
/login               → magic link form
/auth/confirm        → Route Handler (exchanges token, sets cookie)
/module/[slug]       → protected course module pages
/admin               → protected admin dashboard
/admin/users/[id]    → user progress viewer
```

### API Routes

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js Route Handlers | built-in | Proxy for edge functions | Three Route Handlers wrap the three existing Supabase edge functions (claude-proxy, circle-proxy, waterfall-analyzer). API keys live only in server environment variables, never reaching the client. |

**Pattern for each proxy:**
```
/api/claude     → POST → calls Supabase edge fn claude-proxy
/api/circle     → POST → calls Supabase edge fn circle-proxy
/api/waterfall  → POST → calls Supabase edge fn waterfall-analyzer
```

The edge functions themselves are unchanged (Deno/TypeScript, already deployed). The Route Handlers add auth validation and move API keys server-side.

### Development & Build

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Turbopack | built-in (Next.js 15) | Dev bundler | Use `next dev --turbopack` for faster HMR during migration. Do not use for production builds on 15.x (still experimental in prod until 16). |
| ESLint | 9.x | Linting | Ships with Next.js. Note: Next.js 16 removed `next lint` command — on 15 it still works. |
| `tsx` / native TS | Node 20+ | Config/scripts | Use `.ts` config files where supported. |

### Deployment

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Vercel | current | Hosting | First-class Next.js support, zero-config deployment, automatic edge network. Environment variables set in Vercel dashboard (not committed to repo). Free tier sufficient for this app's user scale. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework version | Next.js 15.2.4 | Next.js 16 | Next.js 16 has breaking changes (`proxy.ts`, fully async cookies/params, Turbopack default) that add risk to brownfield migration. Revisit post-stabilization. |
| State management | React Context | Zustand / Jotai | Overkill for 3 shared state slices. Adds a dependency. Project constraints call out Context explicitly. |
| Component library | shadcn/ui | Headless UI / Radix directly | shadcn is Radix-under-the-hood with opinionated styling baked in, faster to scaffold. No bundle penalty since components are copied, not installed. |
| Validation | Zod v4 | Yup / Valibot | Zod v4 is dramatically faster than v3 and now the ecosystem standard. Valibot is smaller but Zod has better RHF integration and more tutorials. |
| Auth | Supabase magic link | Supabase password | Magic link matches existing UX. Lower friction for course students. No password reset flow needed. |
| Forms | react-hook-form | Native Server Actions only | Server Actions alone work for simple forms but provide no debounced auto-save without significant custom code. RHF handles complex form state and watched fields cleanly. |
| Styling | Tailwind v4 | Tailwind v3 | v4 is faster and CSS-first. Already the standard for new Next.js 15 projects. Upgrade tool handles migration. |
| Deployment | Vercel | Railway / Fly.io | Vercel is the obvious choice for Next.js: zero-config, edge network, environment variable management. Existing codebase references Vercel. |

---

## Installation

```bash
# Bootstrap
npx create-next-app@latest brand-launch-playbook --typescript --tailwind --eslint --app --src-dir

# Supabase
npm install @supabase/supabase-js@2.101.1 @supabase/ssr@0.10.0

# Forms & validation
npm install react-hook-form zod @hookform/resolvers

# shadcn/ui (interactive — run separately)
npx shadcn@latest init

# Add individual shadcn components as needed
npx shadcn@latest add input textarea select button progress separator scroll-area
```

**Environment variables (`.env.local`, never committed):**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # server-only, for admin routes
ANTHROPIC_API_KEY=...           # server-only, if ever moved to Next.js directly
```

---

## Confidence Assessment

| Decision | Confidence | Source | Notes |
|----------|------------|--------|-------|
| Next.js 15.2.4 as target | HIGH | Official GitHub releases, multiple sources confirm 15.2.4 as latest stable March 2026 | Next.js 16 released but stable 15.x is correct for brownfield migration |
| @supabase/supabase-js 2.101.1 | HIGH | Direct GitHub releases page, latest confirmed March 31, 2026 | |
| @supabase/ssr 0.10.0 | HIGH | Direct GitHub releases page, latest confirmed March 30, 2026 | |
| @supabase/ssr over auth-helpers | HIGH | Official Supabase docs explicitly mark auth-helpers deprecated | |
| Tailwind v4 CSS-first approach | HIGH | Official Tailwind docs, released January 2025 | Breaking config change — v3 config syntax does not work |
| shadcn/ui for component primitives | MEDIUM | WebSearch + official docs; widely adopted for Next.js projects | shadcn evolves quickly; always use latest CLI |
| react-hook-form 7.72.0 | HIGH | npm registry confirmed latest | |
| Zod 4.3.6 | HIGH | npm registry + official zod.dev confirmed | Import from `zod/v4` subpath |
| React Context (not Zustand) | HIGH | Project constraints explicitly mandate this; scale appropriate | |
| Vercel deployment | HIGH | Official Vercel/Next.js alignment, existing project context | |
| proxy.ts avoid (stay on middleware.ts) | HIGH | Official Next.js 16 blog: middleware.ts deprecated only in v16, fully works in v15 | |

---

## Sources

- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) — breaking changes, version requirements
- [Next.js 15.2.4 Current Stable (March 2026)](https://www.abhs.in/blog/nextjs-current-version-march-2026-stable-release-whats-new)
- [Setting up Server-Side Auth for Next.js | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Creating a Supabase client for SSR | Supabase Docs](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [@supabase/supabase-js GitHub Releases](https://github.com/supabase/supabase-js/releases) — v2.101.1 latest
- [@supabase/ssr GitHub Releases](https://github.com/supabase/ssr/releases) — v0.10.0 latest
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first configuration
- [Tailwind v4 — shadcn/ui docs](https://ui.shadcn.com/docs/tailwind-v4)
- [Zod v4 Release Notes](https://zod.dev/v4) — v4.3.6 latest
- [react-hook-form npm](https://www.npmjs.com/package/react-hook-form) — v7.72.0 latest
- [Supabase + Next.js App Router — Vercel Template](https://vercel.com/templates/next.js/supabase)
- [Next.js Upgrade Guide v16](https://nextjs.org/docs/app/guides/upgrading/version-16) — migration details
