# External Agent Guide — Brand Launch Playbook™

This document is for any AI tool (Perplexity Computer, Cursor, Windsurf, etc.) that needs to make changes to this codebase. It explains exactly how the project is wired together, what the deployment pipeline looks like, and the fastest way to make changes safely.

---

## The Three Systems That Run This App

```
GitHub (source of truth)
    ↓  push to main
Vercel (auto-deploys in ~60s)
    ↓  reads env vars from Vercel dashboard
Supabase (database + auth + storage)
```

You only ever touch GitHub. Vercel and Supabase handle the rest automatically.

---

## Repository

**GitHub repo:** `https://github.com/watchgabe/visual-world-workbook`  
**Branch:** `main` (the only branch — every push here goes live)  
**Local path:** `/Volumes/SSD 2026/000 Claude/Visual World Workbook/`

### Workflow to make a change

```bash
# 1. Make your edits to files in src/
# 2. Build to verify no TypeScript errors
npm run build

# 3. Stage and commit
git add src/path/to/changed-file.tsx
git commit -m "Short description of what changed"

# 4. Push — Vercel picks this up automatically
git push origin main
```

That's it. Vercel detects the push, runs `npm run build`, and deploys in about 60 seconds. The live site at **brandplaybook.vercel.app** updates automatically.

> **Critical:** Always run `npm run build` before pushing. A TypeScript error or broken import will fail the Vercel build and the old version stays live.

---

## Project Structure (what to know, what to leave alone)

```
src/
  app/
    (app)/modules/           ← The course modules (authenticated)
      [slug]/[section]/      ← Individual section pages
      playbook/              ← Compiled brand playbook
    api/                     ← API routes (Claude AI, avatar upload, mood board, etc.)
    globals.css              ← ALL design tokens and global styles
    layout.tsx               ← Root HTML shell
  components/
    sections/                ← One file per course section — THIS IS WHERE CONTENT LIVES
      brand-foundation/
      visual-world/
      content/
      launch/
    workshop/                ← Shared form components (WorkshopInput, WorkshopTextarea, etc.)
    layout/                  ← Sidebar, topbar, AppShellClient
    auth/                    ← Login, UserModal
  context/                   ← AuthContext, ProgressContext, ThemeContext
  lib/
    modules.ts               ← Module/section registry and field definitions
    saveField.ts             ← How field data gets written to Supabase
  middleware.ts              ← Auth protection for /modules/* and /admin/*
```

### Files you can safely edit
- `src/components/sections/**/*.tsx` — section content, labels, prompts, UI
- `src/app/globals.css` — colors, spacing, print styles
- `src/app/(app)/modules/playbook/page.tsx` — the compiled playbook page
- `src/app/api/**/*.ts` — API route logic

### Files to be careful with (changes cascade everywhere)
- `src/lib/modules.ts` — changing field keys breaks saved user data
- `src/components/workshop/**` — shared by every section; a bug here breaks all modules
- `src/context/**` — global state providers
- `src/middleware.ts` — auth gate for the entire app

---

## Environment Variables

The app needs three environment variables. They are set in **Vercel's dashboard** (not in code). Locally they live in `.env.local` (not committed to GitHub).

| Variable | Where used |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server — Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side — safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only API routes — never expose to browser |

If you're running locally and `.env.local` is missing, copy `.env.example` and fill in the values from the Supabase dashboard under **Settings → API**.

---

## Vercel Configuration

- **Project:** connected to `github.com/watchgabe/visual-world-workbook`
- **Production branch:** `main`
- **Build command:** `npm run build` (auto-detected by Vercel)
- **Output:** Next.js (auto-detected)
- **Deploy trigger:** every push to `main`

To check deploy status: go to **vercel.com/dashboard**, find the project, and click the latest deployment. Logs show any build errors.

You do **not** need to touch Vercel settings to make normal code changes.

---

## Supabase

The database is **read-only from a code-change perspective** — the schema already exists and must not be altered.

Key tables:
- `blp_responses` — stores all user workshop answers as a JSONB `responses` column (one row per user)
- `blp_config` — app configuration

Storage buckets:
- `avatars` — user profile photos
- `mood-board` — mood board images uploaded by users

Auth: email/password only via Supabase Auth.

> **Never rename a field key.** Every string like `bf_core_mission` or `vw_cp_primary` maps directly to a key inside the `responses` JSONB column. If you rename one, all existing user data for that field becomes invisible. Add new keys; never change old ones.

---

## How Sections Work (the pattern every section file follows)

Every file in `src/components/sections/` follows this exact structure:

```tsx
'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { MODULE_SECTIONS } from '@/lib/modules'
import SectionWrapper from '@/components/workshop/SectionWrapper'
import WorkshopInput from '@/components/workshop/WorkshopInput'
import WorkshopTextarea from '@/components/workshop/WorkshopTextarea'

const MODULE_SLUG = 'brand-foundation'   // hardcoded
const SECTION_INDEX = 3                  // 0-based index in MODULE_SECTIONS
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function MySection() {
  const { user } = useAuth()
  const { watch, setValue } = useForm({
    defaultValues: Object.fromEntries(SECTION_DEF.fields.map(f => [f.key, '']))
  })

  useEffect(() => {
    if (!user) return
    createClient().from('blp_responses')
      .select('responses').eq('user_id', user.id).single()
      .then(({ data }) => {
        if (!data?.responses) return
        SECTION_DEF.fields.forEach(f => {
          if (data.responses[f.key]) setValue(f.key, data.responses[f.key])
        })
      })
  }, [user, setValue])

  return (
    <SectionWrapper moduleSlug={MODULE_SLUG} sectionIndex={SECTION_INDEX}
      fields={SECTION_DEF.fields} responses={watch()}>
      <WorkshopInput
        moduleSlug={MODULE_SLUG}
        fieldKey="bf_some_field"
        value={watch('bf_some_field')}
        onChange={val => setValue('bf_some_field', val)}
        label="My Label"
        placeholder="Enter something..."
      />
    </SectionWrapper>
  )
}
```

`WorkshopInput` and `WorkshopTextarea` handle auto-save internally. You never call save logic manually.

---

## Adding a New Section (all 3 steps required)

**Step 1** — Create the component file:
```
src/components/sections/{module-slug}/{section-slug}.tsx
```

**Step 2** — Register it in `src/lib/modules.ts` inside `MODULE_SECTIONS`:
```ts
{
  slug: 'my-section',
  name: 'My Section Name',
  fields: [
    { key: 'vw_my_field', label: 'My Field' },
  ]
}
```

**Step 3** — Add a lazy import to `src/app/(app)/modules/[slug]/[section]/page.tsx`:
```ts
'my-section': lazy(() => import('@/components/sections/visual-world/my-section')),
```

Missing any one of these three steps causes a crash or a section that never appears.

---

## Design System (colors and CSS variables)

All colors are CSS variables defined in `src/app/globals.css`. Never hardcode hex colors.

| Variable | Value (dark mode) | Use |
|---|---|---|
| `--bg` | `#0a0a0a` | Page background |
| `--surface` | `#111111` | Cards, panels |
| `--card` | `#161616` | Inner cards |
| `--border` | `#1f1f1f` | Dividers |
| `--text` | `#ffffff` | Body text |
| `--dim` | `#b0b0b0` | Secondary text |
| `--dimmer` | `#555555` | Placeholder text |
| `--orange` | `#f0601b` | Brand accent |
| `--orange-hover` | `#ff6d28` | Hover state |

Light mode overrides live in `[data-theme='light']` in the same file and must be kept in sync.

---

## Common Tasks — Quick Reference

| Task | Where to look |
|---|---|
| Edit section content / labels / prompts | `src/components/sections/{module}/{section}.tsx` |
| Change a color or spacing token | `src/app/globals.css` → `:root` and `[data-theme='light']` |
| Change what shows in the Brand Playbook | `src/app/(app)/modules/playbook/page.tsx` |
| Change print/PDF styling | `src/app/globals.css` → `@media print` block |
| Change sidebar or topbar | `src/components/layout/` |
| Add or modify an API endpoint | `src/app/api/{name}/route.ts` |
| Change auth behavior | `src/middleware.ts` (be careful) |
| Change module/section order or fields | `src/lib/modules.ts` (be careful — don't rename field keys) |

---

## Local Dev Setup

```bash
# Clone
git clone https://github.com/watchgabe/visual-world-workbook.git
cd visual-world-workbook

# Install
npm install

# Set up env
cp .env.example .env.local
# Fill in the three Supabase values from Supabase Dashboard > Settings > API

# Run dev server
npm run dev
# → http://localhost:3000

# Before pushing
npm run build
```

---

## What NOT to Do

- **Don't rename `fieldKey` values** — breaks all saved user data for that field
- **Don't change field keys in `modules.ts`** — breaks progress tracking
- **Don't create shared state between section files** — sections are isolated by design
- **Don't modify `WorkshopInput`, `WorkshopTextarea`, `SectionWrapper`** unless you understand every section that uses them
- **Don't push without running `npm run build`** — a broken build means the site won't update
- **Don't hardcode secrets** — all API keys live in `.env.local` and Vercel dashboard only
- **Don't push to any branch other than `main`** — Vercel only deploys from `main`
