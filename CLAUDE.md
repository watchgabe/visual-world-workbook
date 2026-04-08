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
    login/              # Email/password login
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

### Data integrity (CRITICAL — breaking these loses user data)

- **No schema changes** — must work with existing Supabase tables (`blp_responses`, `blp_config`) and data format
- **Never rename or remove a `fieldKey`** — every `fieldKey` string (e.g., `bf_core_mission`, `vw_cp_primary`) maps directly to a key in the `responses` JSONB column in the database. Renaming or removing a key makes all existing saved data for that field invisible. If you need a "new" field, add a new key — never reuse or rename an old one.
- **Never change `field.key` values in `src/lib/modules.ts`** — these are the source of truth for progress calculation. Changing them breaks progress tracking for all users.
- **Field key prefix convention** — `bf_` (brand-foundation), `vw_` (visual-world), `ct_` (content), `la_` (launch). Always follow this prefix when adding new fields.

### Architecture (do not alter these systems)

- **Edge functions unchanged** — existing Supabase edge functions are wrapped via Next.js API routes in `src/app/api/`
- **Email/password auth only** — no magic links, no OAuth, no third-party auth providers
- **Middleware is the auth gate** — `src/middleware.ts` protects `/modules/*` and `/admin/*`. Do not add auth checks in individual pages; do not bypass or weaken middleware logic.
- **Context providers are global singletons** — `AuthContext`, `ProgressContext`, `ThemeContext` wrap the entire app shell. Do not create duplicate providers or split them.
- **Auto-save flow must not be altered** — the `useAutoSave` hook handles debounce (5s), blur-save, abort controller, pending-save tracking, and progress refresh. Do not implement alternative save mechanisms or bypass this hook.

### Stability (keep changes isolated)

- **One section = one file** — each section component in `src/components/sections/{module}/` is fully self-contained. A change to one section must never affect another section. Do not create shared state, shared refs, or cross-section dependencies between section files.
- **Do not modify shared components unless explicitly asked** — `WorkshopInput`, `WorkshopTextarea`, `OptionSelector`, `SectionWrapper`, `ProgressRing`, sidebar, topbar, and navigation are used across the entire app. A bug introduced in any of these breaks every module. If a change is needed, verify it doesn't regress other sections.
- **Do not modify context providers unless explicitly asked** — `AuthContext`, `ProgressContext`, and `ThemeContext` are load-bearing. Changes cascade to every page.
- **Do not modify `src/lib/modules.ts` unless explicitly asked** — this file defines the module/section registry, field definitions, and progress logic. Changes here affect navigation, progress bars, print views, and the playbook.
- **Do not modify `src/middleware.ts` unless explicitly asked** — this controls auth for the entire app.
- **Preserve visual design** — existing color system (CSS variables in `globals.css`), layout patterns, responsive breakpoints, and the grain overlay. Do not change design tokens unless asked.

### Deployment

- **Build must pass before pushing** — run `npm run build` to verify. TypeScript errors or import mistakes will break the Vercel deploy.
- **Environment variables are not in code** — secrets live in `.env.local` (local) and Vercel settings (production). Never hardcode keys or URLs.

## Conventions

### Section component pattern

Every section file follows this exact structure:

```tsx
'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { MODULE_SECTIONS } from '@/lib/modules'
import SectionWrapper from '@/components/workshop/SectionWrapper'
// + WorkshopInput, WorkshopTextarea, OptionSelector as needed

const MODULE_SLUG = 'brand-foundation'  // hardcoded per module
const SECTION_INDEX = 3                 // 0-based index in MODULE_SECTIONS
const SECTION_DEF = MODULE_SECTIONS[MODULE_SLUG]![SECTION_INDEX]

export default function SectionName() {
  const { user } = useAuth()
  const { watch, setValue, getValues } = useForm({
    defaultValues: Object.fromEntries(SECTION_DEF.fields.map(f => [f.key, '']))
  })

  // Load saved responses from Supabase on mount
  useEffect(() => { /* fetch blp_responses, setValue for each */ }, [user, setValue])

  return (
    <SectionWrapper
      moduleSlug={MODULE_SLUG}
      sectionIndex={SECTION_INDEX}
      fields={SECTION_DEF.fields}
      responses={watch()}
    >
      {/* Section content with WorkshopInput/WorkshopTextarea/OptionSelector */}
    </SectionWrapper>
  )
}
```

**When creating or editing sections, always follow this pattern.** Do not deviate from it.

### Workshop components (never use raw HTML inputs)

```tsx
// Text input
<WorkshopInput
  moduleSlug={MODULE_SLUG}
  fieldKey="bf_brand_name"
  value={watch('bf_brand_name')}
  onChange={val => setValue('bf_brand_name', val)}
  label="Brand Name"
  placeholder="Enter your brand name"
/>

// Multi-line textarea
<WorkshopTextarea
  moduleSlug={MODULE_SLUG}
  fieldKey="bf_origin_story"
  value={watch('bf_origin_story')}
  onChange={val => setValue('bf_origin_story', val)}
  label="Your Origin Story"
  placeholder="Tell your story..."
  rows={4}
/>

// Option selector (single choice)
<OptionSelector
  moduleSlug={MODULE_SLUG}
  fieldKey="bf_brand_tone"
  value={watch('bf_brand_tone')}
  onChange={val => setValue('bf_brand_tone', val)}
  options={[{ label: 'Bold', value: 'bold' }, { label: 'Calm', value: 'calm' }]}
  label="Brand Tone"
/>
```

All workshop components internally call `useAutoSave`. Never call `useAutoSave` directly in section content — let the workshop components handle it.

### Section registration

To add a new section:
1. Create the component file in `src/components/sections/{module-slug}/{section-slug}.tsx`
2. Add the section definition (slug, name, fields) to `MODULE_SECTIONS` in `src/lib/modules.ts`
3. Add a lazy import to `SECTION_REGISTRY` in `src/app/(app)/modules/[slug]/[section]/page.tsx`

All three steps are required. Missing any one will cause the section to not appear or crash.

### Imports

- **Always use aliased imports** — `@/lib/`, `@/components/`, `@/context/`, `@/hooks/`, `@/types/`
- **Never use relative imports** (no `../` or `./` except for files in the same directory)

### Styling

- **Use CSS variables for colors** — `var(--orange)`, `var(--text)`, `var(--surface)`, `var(--border)`, etc. Never hardcode hex colors.
- **Design tokens are defined in `src/app/globals.css`** under `:root` (dark) and `[data-theme='light']` (light). Both themes must be kept in sync.
- **Tailwind v4** — theme config goes in `globals.css` via `@theme`, not in a JS config file. No `tailwind.config.js` exists.
- **Responsive grid** — section content uses `.grid-form` class (2 columns desktop, 1 column mobile at 768px). Use this class for form layouts.

### API routes

- API routes in `src/app/api/` are thin proxies: validate auth via `supabase.auth.getUser()`, forward to Supabase edge function, return response. Keep them minimal.
- Use `SUPABASE_SERVICE_ROLE_KEY` (server-only) for admin operations, `NEXT_PUBLIC_SUPABASE_ANON_KEY` for user-context operations.

### General principles

- **Componentize** — if a piece of UI is used in more than one place, extract it into `src/components/`. Section-specific UI stays in the section file.
- **Keep sections independent** — each section must work in isolation. No section should import from, reference, or depend on another section.
- **Don't touch what you weren't asked to touch** — if asked to edit one section, only edit that section. Don't "clean up" adjacent files, refactor shared components, or reorganize imports.
- **Test the build** — run `npm run build` after any change. If it fails, fix it before considering the task done.
