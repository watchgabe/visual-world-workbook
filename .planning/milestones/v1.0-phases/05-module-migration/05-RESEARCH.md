# Phase 5: Module Migration - Research

**Researched:** 2026-04-01
**Domain:** Next.js App Router nested routing, content migration, React state management, AI integration, print-friendly views
**Confidence:** HIGH

## Summary

Phase 5 is the largest implementation phase in the project. It wires together every piece built in Phases 1-4 by migrating six course module pages from standalone HTML files to Next.js route pages with URL-addressable sections, per-field auto-save, and module-level progress tracking.

The good news: all infrastructure is in place. `useAutoSave`, all six `WorkshopX` components, `ProgressContext`, `SectionWrapper`, `SectionNav`, and the `/api/claude` route are production-ready. The work in Phase 5 is content migration and route wiring, not infrastructure-building.

The two critical complexity areas are: (1) Next.js nested dynamic route structure — specifically how `[slug]/[section]/page.tsx` integrates with the existing `[slug]/page.tsx` placeholder, and (2) the ProgressContext's current `refreshProgress` design, which recalculates progress from a flat `responses` object. Phase 5 section pages must coordinate their field keys so the denominator (total fields) used by `refreshProgress` is stable and accurate.

**Primary recommendation:** Use `src/app/(app)/modules/[slug]/[section]/page.tsx` for section pages with a module-level `layout.tsx` that mounts SectionNav. Each section page is a standalone client component with hardcoded content and `useAutoSave` per field. The `[slug]/page.tsx` becomes a redirect to the first section.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Nested routes per section — each section gets its own URL (e.g., `/modules/brand-foundation/core-values`). SectionNav tabs switch between section routes. Browser back/forward works naturally. Deep-linking to any section is supported.
- **D-02:** Sidebar shows module-level navigation only — 6 modules with progress rings. Section navigation lives in the SectionNav tab bar at the top of the content area, matching old app pattern.
- **D-03:** Content (questions, descriptions, instructions) hardcoded directly in JSX section page components. No separate data layer, no MDX. Each section is a standalone page file with its questions and form fields inline. Matches the 1:1 migration goal — content is ported from old HTML to JSX.
- **D-05:** Inline generation with loading state — "Generate" button next to the target field. Click shows spinner + "Generating..." text, response populates the field when complete. Matches old app behavior. No streaming.
- **D-06:** AI-generated content auto-saves after generation via the normal auto-save flow (5s debounce or blur). Student can edit before save triggers. No separate "accept" step.
- **D-07:** Real-time query on page load — Playbook page fetches all user responses from Supabase when loaded. One query per module from blp_responses table. Always shows latest data.

### Claude's Discretion
- D-04: Field definition structure (per-section config vs inline props)
- D-08: Print-friendly view approach (CSS @media print vs dedicated route)
- Route file organization within `src/app/(app)/modules/`
- How SectionWrapper integrates with nested section routes
- How ProgressContext refreshes when sections are completed
- Waterfall analyzer integration in the Content module (if applicable to a section)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MOD-01 | Module 00 — Welcome page (static overview/landing for logged-in users) | Welcome page is 151 lines of static HTML — simplest migration. No form fields, no auto-save. Port layout and content 1:1. |
| MOD-02 | Module 01 — Brand Foundation: 7 sections, ~45 form fields, all content migrated 1:1 | 7 workshops in HTML (s1–s7) mapped to 7 section route pages. Largest module. Sections: Brand Journey, Avatar, Core Mission, Core Values, Content Pillars, Origin Story, Brand Vision. |
| MOD-03 | Module 02 — Visual World: 6 sections including mood board, color picker, font uploader | 5 content workshops (s1–s5) plus s6 compiled Visual World document. Complex interactive components (color picker, mood board image handling) need special treatment. |
| MOD-04 | Module 03 — Content: 5 sections including Claude AI content generation integration | 10 parts in HTML but grouped into fewer section routes by decision. AI generation integrated per old content.html pattern via `/api/claude`. |
| MOD-05 | Module 04 — Launch: 6 sections for bio, funnel, lead magnet, goals | 6 workshops directly in HTML (s1–s6). Straightforward migration. |
| MOD-06 | Module 05 — Compiled Playbook: read-only view aggregating all module data | Fetches all blp_responses on load, renders organized read-only document. No form fields. |
| MOD-07 | Print-friendly playbook view preserved | Old HTML used `@media print` CSS. Same approach works in Next.js — no separate route needed. |
| NAV-03 | Each module section is URL-addressable (e.g., /modules/brand-foundation/core-values) | Implemented via `[slug]/[section]/page.tsx` nested dynamic route. |
| NAV-04 | Sidebar shows module list with per-module completion status | Sidebar already reads `moduleProgress` from ProgressContext. Needs `refreshProgress` called after each field save — already happens via useAutoSave's `onSaveSuccess`. |

</phase_requirements>

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js App Router | 15.2.4 | Nested dynamic routes `[slug]/[section]` | Decision locked; already in project |
| react-hook-form | 7.72.0 | Module-level form state with `watch()` for reactive field values | Already installed; provides `getValues()` for full-response upsert |
| `@supabase/supabase-js` | 2.101.1 | Supabase client for Playbook queries | Already installed |
| `useAutoSave` hook | project | Debounced per-field save to `blp_responses` | Phase 3 deliverable — use as-is |
| `WorkshopTextarea`, `WorkshopInput`, `OptionSelector` | project | Per-field auto-save form components | Phase 3 deliverables |
| `SectionWrapper`, `SectionNav`, `ProgressRing` | project | Section completion tracking and navigation | Phase 3 deliverables |
| `ProgressContext` | project | Per-module progress percentages | Phase 3 deliverable — `refreshProgress(slug)` called inside useAutoSave |

### No New Dependencies Required
Phase 5 introduces zero new npm dependencies. Everything needed is already in the project.

## Architecture Patterns

### Recommended Project Structure

```
src/app/(app)/modules/
├── [slug]/
│   ├── layout.tsx              # Module layout: loads responses, mounts SectionNav
│   ├── page.tsx                # Redirect to first section (replace placeholder)
│   └── [section]/
│       └── page.tsx            # Section content page
├── welcome/
│   └── page.tsx                # Static welcome page (MOD-01)
└── playbook/
    └── page.tsx                # Read-only compiled view (MOD-06)

src/lib/
├── modules.ts                  # Extend with SECTIONS per module
└── module-fields.ts            # (optional) per-section field definitions for SectionWrapper
```

### Module Slug → Section Slug Mapping (canonical)

| Module | Slug | Sections (URL segments) |
|--------|------|------------------------|
| Welcome | `welcome` | (static, no sections) |
| Brand Foundation | `brand-foundation` | `overview`, `brand-journey`, `avatar`, `core-mission`, `core-values`, `content-pillars`, `origin-story`, `brand-vision` |
| Visual World | `visual-world` | `overview`, `creator-analysis`, `color-palette`, `typography`, `shot-system`, `visual-world-doc` |
| Create Content | `content` | `overview`, `content-strategy`, `sustainability`, `formats`, `content-system`, `trust-and-money` (grouped from 10 HTML parts per decision) |
| Launch | `launch` | `overview`, `funnel`, `manychat`, `lead-magnet`, `bio`, `launch-content`, `goals` |
| Playbook | `playbook` | (single compiled view, no section routes) |

> Note: Section slug names are a Claude's Discretion item (D-01 only locks URL-addressable pattern, not specific slugs). The above mapping is a recommendation. Planner should finalize these by reading the HTML files.

### Pattern 1: Module Layout with SectionNav

The `[slug]/layout.tsx` is the right place to:
1. Fetch the user's saved responses for this module (server component or client effect)
2. Render `SectionNav` above the content area
3. Pass responses down to section pages (or provide via URL params + client fetch)

However, since `SectionNav` must know completion state per section, and completion depends on responses, the layout will need to be a client component that loads responses on mount — matching the existing `useAutoSave` pattern of client-side state.

**Recommended approach:** Module layout as a server component that passes initial response data as props to a client wrapper. Client wrapper holds form state via `react-hook-form`, passes form values to both `SectionNav` (for completion badges) and child section pages (via Context or prop drilling through layout).

**Simpler alternative (recommended for this phase):** Each section page is fully self-contained. It fetches its own responses via `useEffect` + Supabase client on mount. `SectionNav` in the layout fetches module responses independently. Avoids complex layout-to-page data passing. Trades a second query for simplicity.

### Pattern 2: Section Page Structure

Each section page is a client component (`'use client'`) containing:
1. `useForm` from react-hook-form for local field state
2. `useEffect` to load saved responses from Supabase on mount (populate form defaults)
3. `WorkshopTextarea` / `WorkshopInput` / `OptionSelector` components with `watch(fieldKey)` values
4. `SectionWrapper` wrapping each logical section with field definitions for completion tracking

```typescript
// Source: established pattern from Phase 3 components
'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { WorkshopTextarea } from '@/components/workshop/WorkshopTextarea'
import { SectionWrapper } from '@/components/workshop/SectionWrapper'
import type { ModuleSlug } from '@/types/database'

const MODULE_SLUG: ModuleSlug = 'brand-foundation'

export default function BrandJourneyPage() {
  const { user } = useAuth()
  const { watch, setValue } = useForm({
    defaultValues: {
      'bf_outcome': '',
      'bf_outcome_why': '',
      // ... all field keys for this section
    }
  })

  // Load saved responses on mount
  useEffect(() => {
    if (!user) return
    const supabase = createClient()
    supabase
      .from('blp_responses')
      .select('responses')
      .eq('user_id', user.id)
      .eq('module_slug', MODULE_SLUG)
      .single()
      .then(({ data }) => {
        if (!data?.responses) return
        const responses = data.responses as Record<string, string>
        Object.entries(responses).forEach(([key, val]) => {
          setValue(key, val)
        })
      })
  }, [user, setValue])

  const responses = watch()

  return (
    <SectionWrapper
      moduleSlug={MODULE_SLUG}
      sectionIndex={1}
      fields={[
        { key: 'bf_outcome', required: true },
        { key: 'bf_outcome_why', required: false },
      ]}
      responses={responses}
    >
      <div className="pl">Workshop 1</div>
      <h1>Brand Journey Framework</h1>
      {/* ... content ... */}
      <WorkshopTextarea
        moduleSlug={MODULE_SLUG}
        fieldKey="bf_outcome"
        value={watch('bf_outcome')}
        onChange={val => setValue('bf_outcome', val)}
        placeholder="e.g. I want to sign 5 high-ticket clients..."
        rows={3}
      />
    </SectionWrapper>
  )
}
```

### Pattern 3: Field Key Naming Convention

**Critical for ProgressContext accuracy.** `refreshProgress` in ProgressContext calculates completion as `filledFields / totalKeys` across all keys in the `responses` JSONB. Field keys from ALL sections of a module live in the same `blp_responses` row (one row per user per module). Keys must be globally unique within a module.

Recommended convention: `{module_abbrev}_{section_abbrev}_{field_name}`

Examples:
- `bf_journey_outcome` (brand-foundation / brand-journey / outcome)
- `bf_avatar_demographics` (brand-foundation / avatar / demographics)
- `vw_color_primary` (visual-world / color / primary)
- `ct_strategy_goal` (content / strategy / goal)

This ensures no key collisions across sections within a module.

### Pattern 4: SectionNav in Module Layout

`SectionNav` currently takes `{ sections: { name: string; complete: boolean }[], activeIndex, onSectionChange }`. For URL-based routing, `onSectionChange` should call `router.push()` to the section URL, and `activeIndex` is derived from the current pathname.

```typescript
// In module layout client component
const pathname = usePathname()
const router = useRouter()

const sectionList = MODULE_SECTIONS[slug] // array of { name, path }
const activeIndex = sectionList.findIndex(s => pathname.endsWith(s.path))

const sections = sectionList.map(s => ({
  name: s.name,
  complete: checkSectionComplete(s.fields, responses),
}))

// SectionNav's onSectionChange becomes:
const handleSectionChange = (index: number) => {
  router.push(`/modules/${slug}/${sectionList[index].path}`)
}
```

### Pattern 5: AI Generation (Content Module)

The Content module's AI generation calls `/api/claude` POST. Old HTML sent `{ prompt, maxTokens: 600 }`. The new implementation:

1. User clicks "Generate" button
2. Set `isGenerating = true` state, show spinner
3. POST to `/api/claude` with constructed prompt (built from form field values)
4. On response, call `setValue(targetFieldKey, generatedText)` 
5. Set `isGenerating = false`
6. Auto-save fires naturally (5s debounce or on blur)

```typescript
async function handleGenerate() {
  setIsGenerating(true)
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: buildPrompt(watch()), maxTokens: 600 }),
    })
    const data = await res.json()
    if (data.content) {
      setValue('target_field_key', data.content)
    }
  } finally {
    setIsGenerating(false)
  }
}
```

### Pattern 6: Playbook Page

The Playbook page (MOD-06) fetches all module responses on load and renders a read-only compiled view. It is a client component that:

1. Calls `supabase.from('blp_responses').select('*').eq('user_id', user.id)` — returns up to 6 rows (one per module)
2. Builds a keyed map: `{ [moduleSlug]: Record<string, unknown> }`
3. Renders the structured playbook using field values with `|| 'Not yet completed'` fallbacks

For print (MOD-07): CSS `@media print` hides sidebar, topbar, and print button — same approach as old HTML. No separate route needed.

```css
/* In globals.css or a playbook-specific CSS module */
@media print {
  .sidebar, .topbar, .print-btn { display: none !important; }
  body { background: #fff; color: #000; }
}
```

### Anti-Patterns to Avoid

- **Fetching responses inside each WorkshopTextarea/WorkshopInput:** These components call `useAutoSave` for saving only. Initial value loading belongs in the section page.
- **Using `sectionIndex` as a persistence key:** The `sectionIndex` in `SectionWrapper` is for UI completion state only — field keys in `blp_responses` are module-scoped.
- **Having `[slug]/page.tsx` render content:** The placeholder module page should redirect to the module's first section. Render content only in `[slug]/[section]/page.tsx`.
- **Global field key namespace (across modules):** Each module has its own `blp_responses` row. Keys only need to be unique within a module.
- **Skipping `refreshProgress` after AI generation:** `useAutoSave` calls `refreshProgress` automatically. But for AI-generated fields that bypass the normal save flow, explicitly call `refreshProgress(MODULE_SLUG)` after the Supabase upsert.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Debounced field saves | Custom debounce + Supabase upsert | `useAutoSave(moduleSlug, fieldKey, value)` | Already handles AbortController, error state, retry, progress refresh |
| Form field state | `useState` per field | `useForm()` from react-hook-form + `watch(fieldKey)` | Avoids N useState hooks per section; `getValues()` gives all fields for upsert |
| Section completion tracking | Custom logic per page | `SectionWrapper` + `checkSectionComplete()` | Already implements required-field logic |
| Tab navigation component | Custom tab bar | `SectionNav` with `router.push()` | Already handles active/complete states, checkmark icons |
| Progress percentage | Manual calculation | `refreshProgress(slug)` from ProgressContext | Already queries blp_responses and updates moduleProgress |

**Key insight:** Phase 5 is a content migration and wiring exercise, not infrastructure-building. All hooks, components, and context are production-ready. Resist any temptation to refactor them during this phase.

## Common Pitfalls

### Pitfall 1: Stale `responses` in SectionWrapper after navigation
**What goes wrong:** User navigates between sections via SectionNav. The new section page mounts, but the `useEffect` that loads responses fires asynchronously. Until the fetch completes, `SectionWrapper` receives empty responses, showing all sections as incomplete in SectionNav.
**Why it happens:** Async data loading on mount creates a flash of "not loaded" state.
**How to avoid:** Initialize form with `defaultValues` from a synchronous source if possible. A loading skeleton or brief opacity fade can mask the flash. The SectionNav completion state is cosmetic — it doesn't block access.
**Warning signs:** Progress rings flickering to 0% on navigation.

### Pitfall 2: ProgressContext denominator drift
**What goes wrong:** `refreshProgress` counts `Object.keys(responses)` as the denominator. If section pages save different sets of keys across sessions (e.g., some optional fields never written), the denominator changes and percentages are inconsistent.
**Why it happens:** The `blp_responses.responses` JSONB only contains keys that have been saved. A field that was never touched has no key.
**How to avoid:** Always initialize all expected field keys with empty strings on first load if they don't exist. Or, define the total field count as a constant per module (not derived from saved data).
**Warning signs:** A module shows 100% after filling only half the fields.

### Pitfall 3: Wrong conflict key in upsert
**What goes wrong:** `useAutoSave` uses `{ onConflict: 'user_id,module_slug' }`. If the `blp_responses` table doesn't have a unique constraint on `(user_id, module_slug)`, the upsert creates duplicate rows instead of updating.
**Why it happens:** Schema mismatch between assumed and actual table definition.
**How to avoid:** Verify the unique constraint exists in Supabase before Phase 5 implementation. Phase 1 (DATA-02) should have created this — check with a quick `SELECT` query.
**Warning signs:** Multiple rows for the same user+module in blp_responses.

### Pitfall 4: Partial overwrite in upsert
**What goes wrong:** `useAutoSave` currently sends `{ responses: { [fieldKey]: value } }`. Supabase's `upsert` on JSONB does a full column replacement, not a deep merge. A single-field save can overwrite all other fields in the `responses` object.
**Why it happens:** The existing `useAutoSave` implementation (confirmed in source) sends only the changed field's key-value pair. Supabase JSONB upsert replaces the entire column.
**How to avoid:** Use Supabase's `jsonb_set` via an RPC call, or pass the full responses object (via `getValues()` from react-hook-form) to every save. The source code comment in `useAutoSave.ts` line 69 says "Caller should ideally pass full module responses to avoid partial overwrites. Phase 5 module pages use react-hook-form getValues() for this." This is the confirmed approach.
**Implementation:** Section pages must pass a callback to `useAutoSave` (or a wrapper around it) that provides `getValues()` result as the full responses payload.

> **This is a critical finding.** The `useAutoSave` hook as currently written sends only `{ [fieldKey]: value }` in the upsert payload, which will overwrite other fields. The Phase 5 plan MUST address this by either (a) extending `useAutoSave` to accept a `getFullResponses` callback, or (b) using a module-level save hook that always sends all field values.

### Pitfall 5: SectionNav re-render loop
**What goes wrong:** Module layout fetches responses and passes them to `SectionNav`. If the fetch result causes a state update that re-renders the layout, and the layout's render triggers another effect, an infinite loop can occur.
**Why it happens:** Incorrect `useEffect` dependencies in the layout's response-loading code.
**How to avoid:** Use a `useRef` or `useCallback` stable reference for the fetch function. Only update responses state when data actually changes (deep equality check or response hash).

### Pitfall 6: Visual World special components
**What goes wrong:** The Visual World module (MOD-03) in the HTML has a mood board (image inputs), color picker (hex inputs with swatches), and font uploader. These are more complex than textarea/input and don't map directly to existing workshop components.
**Why it happens:** These components were custom-built for the old app.
**How to avoid:** Research the specific HTML implementations in `visual-world.html` before planning those sections. Likely approach: mood board uses `WorkshopInput` for image URLs; color picker uses `WorkshopInput` for hex values; font uploader may need a custom component or deferred to a simpler input-based approach (matches "1:1 content fidelity" requirement but doesn't mandate identical UX mechanics if old UX used browser file picker).

## Code Examples

### Loading Saved Responses on Mount

```typescript
// Source: established pattern; adapts Phase 3 useAutoSave architecture
useEffect(() => {
  if (!user) return
  let cancelled = false
  const supabase = createClient()
  supabase
    .from('blp_responses')
    .select('responses')
    .eq('user_id', user.id)
    .eq('module_slug', MODULE_SLUG)
    .single()
    .then(({ data }) => {
      if (cancelled || !data?.responses) return
      const saved = data.responses as Record<string, string>
      Object.entries(saved).forEach(([key, val]) => {
        if (typeof val === 'string') setValue(key, val)
      })
    })
  return () => { cancelled = true }
}, [user, setValue])
```

### Module-Level useForm with getValues for Full-Responses Upsert

```typescript
// All field keys for the module initialized here
const { watch, setValue, getValues } = useForm({
  defaultValues: {
    bf_journey_outcome: '',
    bf_journey_why: '',
    bf_journey_3year: '',
    // ... all ~45 fields for brand-foundation
  }
})
```

### SectionNav + URL Routing

```typescript
// In module [slug]/layout.tsx client wrapper
const router = useRouter()
const pathname = usePathname()
const sections = MODULE_SECTION_DEFS[slug as ModuleSlug]
const activeIndex = sections.findIndex(s => pathname.includes(s.slug))

<SectionNav
  sections={sections.map((s, i) => ({
    name: s.name,
    complete: i < activeIndex, // simplified; use checkSectionComplete with responses for accuracy
  }))}
  activeIndex={activeIndex}
  onSectionChange={(i) => router.push(`/modules/${slug}/${sections[i].slug}`)}
/>
```

### Playbook Multi-Module Fetch

```typescript
// In playbook/page.tsx
const { data } = await supabase
  .from('blp_responses')
  .select('module_slug, responses')
  .eq('user_id', user.id)

const responsesByModule = Object.fromEntries(
  (data ?? []).map(row => [row.module_slug, row.responses as Record<string, unknown>])
)
```

### AI Generation Pattern

```typescript
// In Content module section page
const [isGenerating, setIsGenerating] = useState(false)

async function handleGenerate(targetField: string, prompt: string) {
  setIsGenerating(true)
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, maxTokens: 600 }),
    })
    const { content } = await res.json()
    if (content) setValue(targetField, content)
  } catch {
    // Show error state
  } finally {
    setIsGenerating(false)
  }
}
```

## Module Content Inventory (from HTML source reading)

| Module | HTML File | Lines | Sections | Form Fields (approx) | Complexity |
|--------|-----------|-------|----------|----------------------|------------|
| Welcome | welcome.html | 151 | 0 (static) | 0 | Very Low |
| Brand Foundation | brand-foundation.html | 4,524 | 7 workshops (s1–s7) | ~45 | High — largest |
| Visual World | visual-world.html | 3,572 | 5 workshops + compiled doc (s1–s6) | ~30 + color/font pickers | High — special components |
| Create Content | content.html | 1,993 | 10 parts (s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11) | ~24 + AI generation | Medium — AI integration |
| Launch | launch.html | 951 | 6 workshops (s1–s6) | ~20 | Low-Medium |
| Playbook | playbook.html | 533 | 1 (compiled view) | 0 (read-only) | Medium — fetch all modules |

**Brand Foundation sections confirmed from HTML:**
- s0: Overview/Roadmap (static intro)
- s1: Brand Journey Framework (4 questions)
- s2: Avatar Profile (demographics, psychographics, pain points)
- s3: Core Mission (Ikigai framework)
- s4: Core Values (5 values with descriptions)
- s5: Content Pillars (3 pillars)
- s6: Origin Story
- s7: Brand Vision

**Visual World sections confirmed from HTML:**
- s0: Overview (static intro)
- s1: Creator Analysis
- s2: Color Palette (hex inputs, named colors)
- s3: Typography (font selections)
- s4: Shot System (image/style inputs)
- s5: Visual World Document (compiled from above)

**Content module parts confirmed from HTML:**
- s0: Overview (10 parts listed)
- Parts 1–10 map to: Content Strategy, Sustainability, Batching System, Formats, Content System (Waterfall), Trust & Money, Idea Generation, Storytelling, Starter Kit, Cinematic Content
- AI "Generate angles with AI" feature present in Idea Generation section

**Launch sections confirmed from HTML:**
- s0: Overview
- s1: Funnel
- s2: ManyChat & Newsletter
- s3: Lead Magnet
- s4: Bio
- s5: Launch Content
- s6: Calendar & Goals

## Critical Finding: useAutoSave Partial Overwrite Risk

Reading `src/hooks/useAutoSave.ts` (line 69–82), the current upsert sends:

```typescript
{
  user_id: user.id,
  module_slug: opts.moduleSlug,
  responses: { [opts.fieldKey]: currentValue },
}
```

With `onConflict: 'user_id,module_slug'`, Supabase replaces the entire `responses` column on conflict. If a module has 45 fields and a user saves field 2, all other 44 fields are wiped.

The comment at line 69 explicitly notes: "Phase 5 module pages use react-hook-form getValues() for this." This means the Phase 5 plan must include a mechanism to pass full responses to the upsert. Options:

1. **Extend `useAutoSave` signature** to accept `getFullResponses: () => Record<string, string>` callback. When saving, use `getFullResponses()` result as the responses payload instead of `{ [fieldKey]: value }`.
2. **Module-level save wrapper** — a `useModuleSave(moduleSlug, getValues)` hook that wraps `useAutoSave` and always saves all fields.

Option 1 is lower-risk and keeps the component API stable.

> This is the most important technical decision for Phase 5. The plan must explicitly address this or the implementation will produce silent data loss.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `localStorage` for saving responses | Supabase `blp_responses` table | Phase 1/3 | Cross-device sync, no data loss on browser clear |
| `postMessage` iframe navigation | Next.js `router.push()` nested routes | Phase 1 | Deep links, browser back/forward, no iframe overhead |
| Global `sections` JS array + `go(n)` function | `SectionNav` + URL routing | Phase 5 | Bookmarkable sections, type-safe navigation |
| Direct Supabase fetch with anon key | `/api/claude` proxy route | Phase 4 | API key never exposed to browser |

## Open Questions

1. **useAutoSave full-responses extension**
   - What we know: Current implementation sends partial responses, comment says Phase 5 uses react-hook-form getValues()
   - What's unclear: Whether to extend `useAutoSave` signature or create a new module-level hook
   - Recommendation: Extend `useAutoSave` with optional `getFullResponses` callback; plan should include a Wave 0 task to modify the hook signature before section pages are built

2. **Visual World mood board and color picker specifics**
   - What we know: visual-world.html has custom color picker and image inputs
   - What's unclear: Exact HTML structure and whether `WorkshopInput` is sufficient or custom components are needed
   - Recommendation: The plan for Visual World sections should include a "read HTML, identify components" task before implementation

3. **Content module section grouping**
   - What we know: 10 HTML "parts" exist; decision says 5 sections in the route structure
   - What's unclear: Which of the 10 HTML parts map to which 5 section routes
   - Recommendation: Plan should include a mapping task — read content.html and assign each of the 10 parts to one of the 5 section routes before implementing

4. **ProgressContext denominator**
   - What we know: Current logic uses `Object.keys(responses)` as denominator
   - What's unclear: Whether to initialize all field keys on first visit or use a hardcoded total-field constant
   - Recommendation: Initialize all field keys with empty strings on module first-load; this ensures denominator stability

5. **SectionNav current props vs URL routing**
   - What we know: SectionNav currently takes `activeIndex` and `onSectionChange` — works for in-page state
   - What's unclear: Module layout needs to determine `activeIndex` from pathname
   - Recommendation: Module layout derives `activeIndex` from `usePathname()` by matching section slug

## Environment Availability

Step 2.6: SKIPPED — Phase 5 is a pure code migration. No new external tools, services, or CLIs are required beyond what the project already uses (Node.js, npm, Supabase already configured).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.2 + React Testing Library 16.3.2 |
| Config file | `vitest.config.ts` (project root) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOD-01 | Welcome page renders static content | smoke | `npx vitest run tests/modules/welcome.test.tsx` | ❌ Wave 0 |
| MOD-02 | Brand Foundation section loads, displays fields | unit | `npx vitest run tests/modules/brand-foundation.test.tsx` | ❌ Wave 0 |
| MOD-03 | Visual World section loads, color inputs present | unit | `npx vitest run tests/modules/visual-world.test.tsx` | ❌ Wave 0 |
| MOD-04 | Content section AI generation button present | unit | `npx vitest run tests/modules/content.test.tsx` | ❌ Wave 0 |
| MOD-05 | Launch section loads, form fields present | unit | `npx vitest run tests/modules/launch.test.tsx` | ❌ Wave 0 |
| MOD-06 | Playbook fetches all modules, renders read-only | unit | `npx vitest run tests/modules/playbook.test.tsx` | ❌ Wave 0 |
| MOD-07 | Print CSS hides sidebar/topbar | manual | N/A (CSS media query) | manual-only |
| NAV-03 | Section URL routing resolves correct content | unit | `npx vitest run tests/modules/section-routing.test.tsx` | ❌ Wave 0 |
| NAV-04 | Sidebar moduleProgress updates after field save | unit | `npx vitest run tests/contexts.test.tsx` | ✅ (extend) |

### Sampling Rate
- **Per task commit:** `npx vitest run tests/modules/` (module-specific tests only)
- **Per wave merge:** `npx vitest run` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/modules/` directory — create before module implementation begins
- [ ] `tests/modules/welcome.test.tsx` — covers MOD-01
- [ ] `tests/modules/brand-foundation.test.tsx` — covers MOD-02
- [ ] `tests/modules/visual-world.test.tsx` — covers MOD-03
- [ ] `tests/modules/content.test.tsx` — covers MOD-04 (mock `/api/claude`)
- [ ] `tests/modules/launch.test.tsx` — covers MOD-05
- [ ] `tests/modules/playbook.test.tsx` — covers MOD-06 (mock Supabase query)
- [ ] `tests/modules/section-routing.test.tsx` — covers NAV-03

## Project Constraints (from CLAUDE.md)

- **Framework:** Next.js 15.2.4 (App Router), TypeScript, Tailwind CSS v4, Supabase JS SDK, React Context
- **Auth:** Supabase Auth with magic link only
- **Database:** Must work with existing Supabase tables and data format — no schema changes
- **Edge functions:** Keep existing edge functions unchanged; wrap via Next.js API routes (already done in Phase 4)
- **Visual design:** Preserve existing color system (`var(--xxx)` CSS tokens), layout patterns, and responsive behavior
- **Content:** All course content must be migrated 1:1 from old HTML files
- **Forms:** react-hook-form 7.72.0 + Zod 4.3.6 (import from `zod/v4`)
- **Components:** shadcn/ui via CLI (not installed as npm dep)
- **State:** React Context only — no Zustand/Jotai
- **Routing:** middleware.ts (not proxy.ts — that's Next.js 16 only)

## Sources

### Primary (HIGH confidence)
- `src/hooks/useAutoSave.ts` — partial-overwrite risk confirmed from source; getValues() approach documented in comment at line 69
- `src/context/ProgressContext.tsx` — `refreshProgress` logic confirmed; denominator derived from response keys
- `src/components/workshop/SectionWrapper.tsx` — completion logic confirmed; uses fields array + responses
- `src/components/workshop/SectionNav.tsx` — currently index-based; needs pathname-based active detection
- `old/modules/brand-foundation.html` — 7 workshops (s1-s7) confirmed from source; section names read
- `old/modules/visual-world.html` — 5 workshops + compiled view confirmed
- `old/modules/content.html` — 10 parts confirmed; AI generation via direct Supabase edge function call (now replaced by `/api/claude`)
- `old/modules/launch.html` — 6 workshops confirmed
- `old/modules/playbook.html` — `@media print` CSS confirmed; JS-rendered from localStorage (now replaces with Supabase queries)
- `src/app/api/claude/route.ts` — POST accepts `{ prompt, maxTokens }`, returns `{ content }` or error

### Secondary (MEDIUM confidence)
- Next.js App Router docs on nested dynamic routes (`[slug]/[section]` pattern) — standard pattern

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already installed and confirmed
- Architecture: HIGH — patterns derived from reading actual source files
- Pitfalls: HIGH (partial overwrite confirmed from source); MEDIUM (others)
- Content inventory: HIGH — section counts confirmed by reading HTML files

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable — no external dependencies changing)
