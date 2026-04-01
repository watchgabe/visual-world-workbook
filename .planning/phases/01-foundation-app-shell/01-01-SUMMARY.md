---
phase: 01-foundation-app-shell
plan: 01
subsystem: infra
tags: [nextjs, supabase, tailwind, typescript, css-tokens]

# Dependency graph
requires: []
provides:
  - Next.js 15.2.4 project scaffold with TypeScript strict mode
  - Supabase browser client (createBrowserClient) typed against Database interface
  - Supabase server client (createServerClient) with async cookies() for Next.js 15
  - Database TypeScript types: Database, BlpResponse, ModuleSlug
  - blp_responses SQL schema with RLS policies and JSONB responses column
  - CSS design token system (20+ tokens, dark/light themes) matching old app
  - Cookie-backed theme system via blp-theme cookie, default dark
  - MODULES const array with 6 module slugs and titles
affects:
  - 01-02 (app shell and routing — uses all of the above)
  - all subsequent phases

# Tech tracking
tech-stack:
  added:
    - next@15.2.4
    - react@19.x (bundled)
    - typescript@5.x (bundled)
    - tailwindcss@4.x (bundled)
    - "@supabase/supabase-js@2.101.1"
    - "@supabase/ssr@0.10.0"
  patterns:
    - Supabase browser client: createBrowserClient<Database>() in 'use client' module
    - Supabase server client: async createClient() with await cookies() for Next.js 15
    - CSS design tokens via CSS custom properties on :root and [data-theme="light"]
    - Tailwind v4 dark variant via @custom-variant pointing at data-theme attribute
    - Theme applied server-side from blp-theme cookie with dark as default

key-files:
  created:
    - src/lib/supabase/client.ts
    - src/lib/supabase/server.ts
    - src/types/database.ts
    - src/lib/modules.ts
    - supabase/schema.sql
    - .env.example
  modified:
    - src/app/globals.css
    - src/app/layout.tsx
    - .gitignore
    - tsconfig.json

key-decisions:
  - "Excluded old/ directory from TypeScript compilation to avoid Deno type errors in edge function files"
  - "Used .env.local gitignore pattern (not .env*) to allow .env.example to be committed"
  - "npm ci used after node_modules copy failed (cp -r converts symlinks to files, breaking Next.js .bin/next)"
  - "Google Fonts <link> tag used (not next/font) to match old app approach — expected ESLint warning is non-blocking"

patterns-established:
  - "Pattern 1: All supabase clients imported from @/lib/supabase/client or @/lib/supabase/server"
  - "Pattern 2: Cookie name for theme is blp-theme"
  - "Pattern 3: CSS variables use --bg, --text, --surface naming (not Tailwind semantic names)"

requirements-completed: [DATA-01, DATA-02, DEPLOY-02]

# Metrics
duration: 35min
completed: 2026-04-01
---

# Phase 01 Plan 01: Foundation Scaffold Summary

**Next.js 15.2.4 project with Supabase SSR clients, typed blp_responses schema, Tailwind v4 design token system, and cookie-backed dark/light theme**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-04-01T20:30:00Z
- **Completed:** 2026-04-01T21:05:00Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- Scaffolded Next.js 15.2.4 with TypeScript strict mode, Tailwind v4, ESLint — build passes cleanly
- Installed @supabase/supabase-js@2.101.1 and @supabase/ssr@0.10.0; created typed browser and async server clients
- Created blp_responses SQL schema with JSONB responses, RLS policies, and updated_at trigger
- Ported exact CSS token values from old/index.html into Tailwind v4 design token architecture (20+ tokens, dark + light variants, grain overlay)
- Root layout reads blp-theme cookie server-side, defaults to dark, sets data-theme on html element

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Next.js 15.2.4 project and install dependencies** - `64e45a9` (feat)
2. **Task 2: Create Supabase clients, TypeScript types, module defs, and DB schema** - `46201d4` (feat)
3. **Task 3: CSS design token architecture and cookie-backed theme layout** - `8e149dd` (feat)

## Files Created/Modified

- `package.json` - Next.js 15.2.4, Supabase packages, TypeScript, Tailwind v4
- `tsconfig.json` - TypeScript strict mode, excludes old/ directory
- `next.config.ts` - Default Next.js config
- `postcss.config.mjs` - Tailwind v4 PostCSS plugin
- `eslint.config.mjs` - ESLint 9 flat config
- `.gitignore` - Added Next.js patterns, .env.local excluded, .env.example tracked
- `.env.example` - Template with both Supabase env var keys
- `src/lib/supabase/client.ts` - Browser client with createBrowserClient<Database>
- `src/lib/supabase/server.ts` - Async server client with await cookies()
- `src/types/database.ts` - Database, BlpResponse, ModuleSlug types
- `src/lib/modules.ts` - MODULES const with 6 module slugs and titles
- `supabase/schema.sql` - blp_responses table, RLS, index, updated_at trigger
- `src/app/globals.css` - Full design token system, @custom-variant dark, grain overlay
- `src/app/layout.tsx` - Async layout with cookie-backed theme, Barlow Condensed font

## Decisions Made

- Excluded `old/` from TypeScript compilation — Deno edge function files in old/supabase/ use `Deno.serve()` which TypeScript cannot type-check
- Used `.env.local`-specific gitignore pattern (not `.env*`) to allow `.env.example` to be tracked in git
- Google Fonts `<link>` tag kept in layout `<head>` (per plan notes — matches old app approach); the resulting ESLint warning is non-blocking

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed node_modules symlinks broken by cp -r**
- **Found during:** Task 1 (scaffold verification via npm run build)
- **Issue:** create-next-app scaffolded into a temp dir then files were copied with `cp -r`. This converts `.bin/` symlinks to regular files. When `.bin/next` is a regular file (not a symlink to `../next/dist/bin/next`), the `require('../server/require-hook')` inside it resolves incorrectly and Next.js fails to start.
- **Fix:** Ran `npm ci` which removes and reinstalls node_modules, restoring proper symlinks
- **Files modified:** node_modules (not committed)
- **Verification:** `npm run build` exits 0 after npm ci
- **Committed in:** 64e45a9 (Task 1 commit)

**2. [Rule 3 - Blocking] Excluded old/ directory from TypeScript compilation**
- **Found during:** Task 1 (first npm run build attempt)
- **Issue:** TypeScript compiler picked up `old/supabase/functions/circle-proxy/index.ts` which uses Deno APIs (`Deno.serve()`), causing `Cannot find name 'Deno'` type error
- **Fix:** Added `"old"` to tsconfig.json `exclude` array
- **Files modified:** tsconfig.json
- **Verification:** Build passes with no type errors
- **Committed in:** 64e45a9 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 — blocking issues)
**Impact on plan:** Both fixes were necessary to get the build passing. No scope creep.

## Issues Encountered

- `create-next-app` cannot run in a directory with existing files — scaffolded to temp dir and copied files manually. This is a known limitation when the project already has planning files, CLAUDE.md, and old/ code.

## User Setup Required

Environment variables require manual configuration before app can connect to Supabase:

1. Copy `.env.example` to `.env.local`
2. Set `NEXT_PUBLIC_SUPABASE_URL` to your Supabase project URL
3. Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Supabase anon key
4. Run the SQL in `supabase/schema.sql` in your Supabase project's SQL editor

## Next Phase Readiness

- All foundational infrastructure is in place for Plan 02 (app shell: middleware, auth pages, layout shell)
- Supabase clients are typed and importable
- CSS token system is complete — no design token changes needed in subsequent plans
- Module definitions are canonical — sidebar and routing can reference `MODULES` directly

---
*Phase: 01-foundation-app-shell*
*Completed: 2026-04-01*
