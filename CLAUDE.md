## Project

**Brand Launch Playbook** — A course platform guiding entrepreneurs through 5 modules (Brand Foundation, Visual World, Content, Launch, and a compiled Playbook) with an admin dashboard for managing users and tracking progress.

Deployed on Vercel. Auth via Supabase email/password. Data stored in Supabase.

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Auth**: Supabase Auth (email/password) via `@supabase/ssr`
- **Database**: Supabase (existing tables — no schema changes)
- **Styling**: Tailwind CSS v4 (CSS-first config, no `tailwind.config.js`)
- **Components**: shadcn/ui (copied into project, not installed as dependency)
- **Forms**: react-hook-form + zod v4 (`zod/v4` subpath) + `@hookform/resolvers`
- **State**: React Context — `AuthContext`, `ProgressContext`, `ThemeContext`
- **Testing**: Vitest + Testing Library
- **Deployment**: Vercel

## Architecture

```
src/
  app/
    (app)/              # Authenticated app shell (sidebar + topbar)
      modules/
        [slug]/[section]/  # Individual module sections
        [slug]/print/      # Print view per module
        playbook/          # Compiled playbook
        welcome/           # Welcome/landing page
    admin/              # Admin dashboard (role-gated)
    api/                # Route handlers proxying Supabase edge functions
      claude/           # Claude AI proxy
      circle/           # Circle community proxy
      instagram/        # Instagram embed proxy
      admin/            # Admin actions (toggle-role, delete-user, circle-config)
    login/              # Magic link login
  components/
    workshop/           # Reusable form components (WorkshopInput, WorkshopTextarea, OptionSelector, ProgressRing, etc.)
    sections/           # Module section content components (brand-foundation/, visual-world/, etc.)
    layout/             # Sidebar, topbar, navigation
    admin/              # Admin-specific components
    auth/               # Auth-related components
  context/              # AuthContext, ProgressContext, ThemeContext
  hooks/                # useAutoSave
  lib/
    supabase/           # Supabase client helpers (browser + server)
    modules.ts          # Module/section definitions and routing
    saveField.ts        # Field persistence logic
    admin/              # Admin utilities
  types/                # TypeScript types (database.ts)
  middleware.ts         # Auth route protection (/modules/*, /admin/*)
```

## Constraints

- **No schema changes** — must work with existing Supabase tables and data format
- **Edge functions unchanged** — existing Supabase edge functions are wrapped via Next.js API routes
- **Email/password auth** — no magic links or OAuth
- **Preserve visual design** — existing color system, layout patterns, and responsive behavior

## Conventions

- Module section content lives in `src/components/sections/{module-slug}/` — one file per section
- Workshop form fields use `WorkshopInput` / `WorkshopTextarea` / `OptionSelector` components, not raw HTML inputs
- Auto-save is handled by `useAutoSave` hook — fields persist to Supabase on change
- API routes proxy external services so secrets stay server-side
- Supabase clients: use `createBrowserClient` in client components, `createServerClient` in server/middleware
- Tailwind v4: theme config goes in `globals.css` via `@theme`, not in a JS config file
