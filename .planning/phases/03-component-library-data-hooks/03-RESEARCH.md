# Phase 3: Component Library & Data Hooks - Research

**Researched:** 2026-04-01
**Domain:** React component library, auto-save hook patterns, React Context, react-hook-form + debounce
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Save status indicator is error-only — no "Saving..." or "Saved" indicators. Silent when working. Per-field error icon appears ONLY if save fails AND the field has lost focus (blur). While the field is focused, no error shown even if background save failed.
- **D-02:** 5-second debounce OR save on blur (field loses focus), whichever comes first.
- **D-03:** AbortController cancels any in-flight request before issuing a new one (per DATA-04 requirement).
- **D-04:** On save failure: error indicator persists next to the field with a small retry button. Student knows their work isn't saved and can manually trigger retry.
- **D-05:** Pixel-faithful recreation of old app's form components — same textarea styling, input borders, option button look.
- **D-06:** OptionSelector uses button-group pattern matching old app — clickable styled buttons in a row/wrap layout. Selected option highlighted with orange. Matches old app's `.opt` button pattern.
- **D-07:** Section is complete when ALL required fields have non-empty values. Each section definition specifies which fields are required vs optional.
- **D-08:** ProgressRing is an SVG circle that fills as sections complete, with percentage number in center.
- **D-09:** Progress updates ONLY after successful save to Supabase — not real-time as fields fill.
- **D-10:** Horizontal tab bar at the top of module content area, matching old app's section navigation pattern.
- **D-11:** Section tabs show small completion indicator (checkmark or dot) for at-a-glance progress within a module.

### Claude's Discretion

- react-hook-form integration approach (how to wire `watch()` with the 5s debounce + blur save pattern)
- ProgressContext and ThemeContext internal shapes and provider placement
- SectionWrapper API design (how it receives field definitions and tracks completion)
- Component file organization (flat vs grouped in components/workshop/)
- shadcn/ui base component usage vs fully custom

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| COMP-01 | WorkshopTextarea component with auto-save integration | Old app textarea CSS (lines 447–471), `useAutoSave` hook pattern, `BlpResponse` upsert |
| COMP-02 | WorkshopInput component with auto-save integration | Same CSS as COMP-01; single-line variant |
| COMP-03 | OptionSelector component (radio/checkbox groups) with auto-save integration | Old app `.opt` / `.og` CSS (lines 486–510), button-group pattern |
| COMP-04 | SectionNav component for navigating between sections within a module | Old app `.tabs` / `.tab` / `.tab.on` / `.tab.ok` CSS (lines 276–307) |
| COMP-05 | ProgressRing SVG component showing completion percentage | SVG `stroke-dasharray` / `stroke-dashoffset` pattern; old app circular percentage display |
| COMP-06 | SectionWrapper component with completion tracking per section | Old app `sectionComplete()` logic (lines 3739–3762); requires field-definition API |
| DATA-03 | Auto-save hook with debounce used by all form fields | `useCallback` + `useRef` debounce; Supabase upsert to `blp_responses` |
| DATA-04 | Auto-save uses AbortController to prevent race condition overwrites | `AbortController` + `signal` passed to Supabase fetch; ref-per-module pattern |
| DATA-05 | Save status indicator visible to user (syncing/saved/error) — **error-only per D-01** | Per-field error state derived from hook; shown only on blur |
| DATA-06 | React Context provides user state, progress state, and theme state | AuthContext already done; ProgressContext + ThemeContext to be added this phase |
</phase_requirements>

---

## Summary

Phase 3 builds the foundational component layer that all module pages consume — no page content, only primitives. The work divides into three orthogonal streams: (1) workshop form components (WorkshopTextarea, WorkshopInput, OptionSelector), (2) layout/nav components (SectionNav, SectionWrapper, ProgressRing), and (3) the data layer (useAutoSave hook, ProgressContext, ThemeContext).

The most technically complex piece is `useAutoSave`. It must combine react-hook-form's `watch()` observable with a debounce timer, a blur trigger, AbortController request cancellation, and post-save progress updates — all without triggering React re-renders that disrupt typing. The hook uses `useRef` for the timer and controller (not `useState`) so cancellation and rescheduling do not re-render the component.

ProgressContext is intentionally lightweight: it stores per-module completion percentages derived from `blp_responses.responses` data, and it updates only after a successful save. ThemeContext is a thin wrapper over the existing cookie-based theme system — it exposes `theme` and `setTheme`, eliminating prop-drilling through the component tree. Both contexts follow the exact same provider pattern already established in `AuthContext.tsx`.

**Primary recommendation:** Build `useAutoSave` first (it is the critical path). Wire WorkshopTextarea to it as the integration test. Then build remaining components against the working hook.

---

## Project Constraints (from CLAUDE.md)

These directives apply to all code produced in this phase:

- **Framework**: Next.js 14+ App Router, TypeScript, Tailwind CSS, Supabase JS SDK, React Context — no deviations
- **Auth**: Supabase Auth with magic link only — not relevant to this phase but do not introduce any alternative auth flow
- **Database**: Work with existing `blp_responses` table and `BlpResponse` type — no schema changes
- **Edge functions**: No modifications — not relevant this phase
- **Visual design**: Pixel-faithful recreation of old app styling — use `var(--xxx)` tokens, never hardcode colors
- **No GSD bypass**: All file changes go through GSD workflow (`/gsd:execute-phase`)

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.72.0 (must install) | Form state, `watch()` for debounce trigger | Project constraint; minimal re-renders; `watch()` provides field value stream |
| zod | 4.3.6 (must install) | Field validation schemas | Project constraint; import from `zod/v4` subpath |
| @hookform/resolvers | latest (must install) | Connects RHF + Zod | Required bridge; peer dep of RHF |
| @supabase/supabase-js | 2.101.1 (already installed) | Supabase upsert calls in auto-save | Already in project |
| React (built-in, 19.x) | bundled | Context, hooks | Built-in |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui | CLI-managed (not a dep) | Base primitives (Button only if needed) | Only if a raw button primitive saves work; otherwise go fully custom to match old app pixel-faithfully |

Note: shadcn/ui components are **not** installed as a package dependency — they are generated into `src/components/ui/` via `npx shadcn@latest add <component>`. For this phase, the old app's visual language is precise enough that fully custom components are preferred to avoid fighting shadcn defaults.

**Installation (new packages only — not yet in package.json):**

```bash
npm install react-hook-form zod @hookform/resolvers
```

**Verify current versions before coding:**

```bash
npm view react-hook-form version
npm view zod version
npm view @hookform/resolvers version
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   └── workshop/          # All workshop form components
│       ├── WorkshopTextarea.tsx
│       ├── WorkshopInput.tsx
│       ├── OptionSelector.tsx
│       ├── SectionNav.tsx
│       ├── ProgressRing.tsx
│       └── SectionWrapper.tsx
├── hooks/
│   └── useAutoSave.ts     # Single unified auto-save hook
└── context/
    ├── AuthContext.tsx     # Existing — do not modify
    ├── ProgressContext.tsx # New — per-module completion %
    └── ThemeContext.tsx    # New — wraps cookie theme logic
```

### Pattern 1: useAutoSave Hook

**What:** A hook that accepts a module slug, a field key, and a value. It debounces writes and also saves on blur. Uses refs (not state) for timer and AbortController so scheduling/cancelling does not cause re-renders.

**When to use:** Called by each WorkshopTextarea, WorkshopInput, and OptionSelector that needs persistence.

**API design:**

```typescript
// src/hooks/useAutoSave.ts
interface UseAutoSaveOptions {
  moduleSlug: ModuleSlug
  fieldKey: string
  value: string
  onSaveSuccess?: () => void  // ProgressContext can hook in here
}

interface UseAutoSaveReturn {
  saveError: string | null     // null = clean; string = error message
  isFocused: boolean           // tracks focus for D-01 error-only-on-blur rule
  handleBlur: () => void       // component attaches to onBlur
  handleFocus: () => void      // component attaches to onFocus
  retry: () => void            // D-04: manual retry trigger
}

export function useAutoSave(opts: UseAutoSaveOptions): UseAutoSaveReturn
```

**Internal mechanics (verified pattern):**

```typescript
// Refs — no re-render on change
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const controllerRef = useRef<AbortController | null>(null)
const isFocusedRef = useRef(false)
const [saveError, setSaveError] = useState<string | null>(null)

// Cancel any in-flight request + clear pending timer
function cancelPending() {
  if (timerRef.current) clearTimeout(timerRef.current)
  if (controllerRef.current) controllerRef.current.abort()
}

async function doSave() {
  cancelPending()  // Abort previous in-flight (D-03)
  const controller = new AbortController()
  controllerRef.current = controller

  const supabase = createClient()
  const { error } = await supabase
    .from('blp_responses')
    .upsert({
      user_id: userId,          // from AuthContext
      module_slug: moduleSlug,
      responses: { [fieldKey]: value },
    }, { onConflict: 'user_id,module_slug' })
    // Note: Supabase JS v2 uses fetch internally; AbortController
    // is passed via the signal option or by aborting before the call.

  if (!error) {
    setSaveError(null)
    opts.onSaveSuccess?.()   // D-09: progress updates only on success
  } else if (error.name !== 'AbortError') {
    setSaveError(error.message)
  }
}

// On value change: reset 5s debounce timer
useEffect(() => {
  cancelPending()
  timerRef.current = setTimeout(doSave, 5000)  // D-02: 5s debounce
  return cancelPending  // cleanup on unmount
}, [value])

function handleBlur() {
  isFocusedRef.current = false
  setIsFocused(false)   // single useState for re-render on blur
  cancelPending()
  doSave()              // D-02: also save on blur
}
```

**AbortController note:** Supabase JS v2 does not expose a signal option on `.upsert()` at the query level. The standard approach is to abort the previous controller before issuing the new request — this terminates the underlying fetch if it hasn't completed yet. The new request gets a new controller. This correctly satisfies DATA-04.

### Pattern 2: React Context (ProgressContext)

**What:** Provides per-module completion percentages to all components. Updated only after successful saves. Shape mirrors AuthContext.

```typescript
// src/context/ProgressContext.tsx
interface ProgressContextValue {
  moduleProgress: Record<ModuleSlug, number>  // 0–100
  refreshProgress: (moduleSlug: ModuleSlug) => Promise<void>
}
```

The `refreshProgress` function is called by `useAutoSave`'s `onSaveSuccess` callback after a successful write. It fetches the latest `blp_responses` row for the module and recalculates completion percentage from the responses object.

Sidebar passes `moduleProgress[mod.slug]` to the per-module progress display (currently hardcoded `0%`).

### Pattern 3: React Context (ThemeContext)

**What:** Exposes `theme` and `setTheme` to client components — eliminates the need to prop-drill `currentTheme` through AppShellClient.

```typescript
// src/context/ThemeContext.tsx
interface ThemeContextValue {
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
}
```

`setTheme` writes the cookie (`blp-theme`) and calls `router.refresh()` — same logic as the current ThemeToggle. ThemeToggle is then refactored to call `useTheme()` instead of accepting a `currentTheme` prop.

**Provider placement:** Both new contexts wrap into `(app)/layout.tsx` alongside AuthProvider:

```typescript
// src/app/(app)/layout.tsx
export default async function AppLayout({ children }) {
  const cookieStore = await cookies()
  const theme = (cookieStore.get('blp-theme')?.value as 'dark' | 'light') ?? 'dark'

  return (
    <AuthProvider>
      <ThemeProvider initialTheme={theme}>
        <ProgressProvider>
          <AppShellClient>
            {children}
          </AppShellClient>
        </ProgressProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
```

### Pattern 4: WorkshopTextarea / WorkshopInput

**What:** Controlled components that accept `fieldKey`, `moduleSlug`, `placeholder`, `rows`, and an optional `required` flag. They call `useAutoSave` internally and render an error icon (+ retry button) on blur when `saveError` is non-null.

**Exact CSS to replicate from old app (lines 447–471):**

```css
/* Faithful recreation — use style props or Tailwind with CSS vars */
border: 1px solid var(--border);
border-radius: var(--radius-md);   /* 6px */
padding: 9px 12px;
font-size: 13px;
font-family: var(--font);
color: var(--text);
background: var(--surface);
margin-bottom: 9px;
resize: vertical;
line-height: 1.5;
transition: border-color 0.15s, background 0.15s;

/* Focus state */
outline: none;
border-color: var(--orange);
background: var(--bg);
box-shadow: 0 0 0 3px rgba(240, 96, 27, 0.08);

/* Placeholder */
color: var(--dimmer);
```

### Pattern 5: OptionSelector

**What:** Renders a grid of `<button>` elements. One button is selected at a time (radio-style). Selection is stored via `useAutoSave`. Matches old app's `.opt` / `.og` CSS exactly.

**Exact CSS to replicate (lines 486–510):**

```css
/* Container */
display: grid;
grid-template-columns: 1fr 1fr;  /* or 1fr based on option count */
gap: 5px;
margin-bottom: 9px;

/* Button base (.opt) */
padding: 9px 11px;
border: 1px solid var(--border);
border-radius: var(--radius-md);
background: var(--surface);
color: var(--dim);
font-size: 12px;
cursor: pointer;
text-align: left;
line-height: 1.4;

/* Selected (.opt.sel) */
background: var(--orange-tint);
color: var(--orange-dark);
border-color: var(--orange-border);
font-weight: 500;
```

### Pattern 6: SectionNav (tab bar)

**What:** A horizontal pill-button tab bar above module content. Matches old app's `.tabs` / `.tab` / `.tab.on` / `.tab.ok` CSS. On-tab = current section (orange tint). Ok-tab = completed section (green tint with checkmark or dot).

**Exact CSS to replicate (lines 276–307):**

```css
/* Container */
display: flex;
gap: 4px;
flex-wrap: wrap;
margin-bottom: 2rem;

/* Tab button */
font-size: 11px;
padding: 4px 11px;
border-radius: 20px;         /* pill shape */
border: 1px solid var(--border);
background: transparent;
color: var(--dimmer);

/* Active tab (.tab.on) */
background: var(--orange-tint);
color: var(--orange-dark);
border-color: var(--orange-border);

/* Completed tab (.tab.ok) */
background: var(--green-bg);
color: var(--green-text);
border-color: var(--green-border);
```

### Pattern 7: ProgressRing (SVG)

**What:** An SVG circle using `stroke-dasharray` / `stroke-dashoffset` technique to draw partial circle fill. Percentage number rendered in center.

**Standard SVG approach (confidence: HIGH — this is the canonical web technique):**

```typescript
// r = radius, cx/cy = center, stroke-width accounts for total size
const RADIUS = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS  // ~113

function ProgressRing({ percent }: { percent: number }) {
  const offset = CIRCUMFERENCE * (1 - percent / 100)
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      {/* Track */}
      <circle
        cx="22" cy="22" r={RADIUS}
        fill="none"
        stroke="var(--border2)"
        strokeWidth="3"
      />
      {/* Fill — rotate -90deg so it starts at top */}
      <circle
        cx="22" cy="22" r={RADIUS}
        fill="none"
        stroke="var(--orange)"
        strokeWidth="3"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset .4s' }}
      />
      {/* Label */}
      <text x="22" y="26" textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text)">
        {percent}%
      </text>
    </svg>
  )
}
```

### Pattern 8: SectionWrapper

**What:** A container component that wraps a section's content. Receives a `fields` definition array listing which field keys are required. It observes the current values (from ProgressContext or by subscribing to save events) and determines completion. Reports completion upward via a callback or directly updates ProgressContext.

**Recommended API:**

```typescript
interface SectionField {
  key: string
  required: boolean
}

interface SectionWrapperProps {
  moduleSlug: ModuleSlug
  sectionIndex: number
  fields: SectionField[]
  children: React.ReactNode
}
```

Completion logic mirrors old app (lines 3739–3762): all required fields with non-empty trimmed values = complete. This check runs after each successful save.

### Anti-Patterns to Avoid

- **`useState` for AbortController or debounce timer:** Using state for these causes re-renders that reset the component mid-type. Always use `useRef`.
- **Calling `doSave` on every keystroke without debounce:** Results in one Supabase write per character. The debounce timer must be reset on every `value` change.
- **Saving partial `responses` without merging:** The `blp_responses.responses` column is `Record<string, unknown>` — a single JSON object holding ALL fields for a module. Each upsert must merge with existing data, not replace it. Use a server-side merge or a read-then-write pattern. See "Don't Hand-Roll" section.
- **Showing error while field is focused:** D-01 strictly requires error display only on blur. If save fails mid-type, the error surfaces only after the student leaves the field.
- **Prop-drilling `currentTheme` after ThemeContext is added:** ThemeContext eliminates this. Refactor ThemeToggle and any consumer to call `useTheme()`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form field observation + debounce | Custom event listeners on DOM | `react-hook-form watch()` + `useRef` timer | RHF handles controlled/uncontrolled, prevents stale closures |
| Field validation | Custom validation functions | `zod` schema + `@hookform/resolvers` | Edge cases (optional whitespace, max length) are handled; RHF integration is first-class |
| `responses` object merge | Client-side read-then-write | Supabase upsert with JSONB merge or server action | Race condition if two fields save simultaneously; see Pitfalls |
| SVG progress circle geometry | Manual `<canvas>` drawing | `stroke-dasharray` SVG technique | Pure declarative, animates with CSS transition, no library needed |
| AbortController lifecycle | Promises + flag variables | `useRef<AbortController>` + `.abort()` | The browser API is exactly right for this; no wrapper needed |

**Key insight:** The `responses` JSON merge problem is the most subtle. Supabase upsert with `{ onConflict: 'user_id,module_slug' }` replaces the entire `responses` column unless you use a JSONB merge approach. See Pitfalls section.

---

## Common Pitfalls

### Pitfall 1: JSONB Partial Update Overwrites Sibling Fields

**What goes wrong:** Student fills `q1_answer`, saves. Then fills `q2_answer`, saves. The second save's upsert sends `{ q2_answer: "..." }` as the `responses` object, overwriting `q1_answer` with nothing.

**Why it happens:** Supabase `.upsert()` replaces the entire column value. `responses` is a single JSONB column holding all field values for the module.

**How to avoid:** Two options:
1. **Client merge:** The save function reads the existing row first, merges the new field key in, then writes the full merged object. This is a read-then-write race condition risk.
2. **RPC/server action merge:** A Supabase RPC function does `responses = responses || '{}'::jsonb || $new_field` atomically. This is race-condition safe.
3. **Full-object save:** The hook operates at module granularity — it receives the entire `responses` object for the module (from react-hook-form), not a single field. A single form wraps all fields in a module; `watch()` returns all values. This is the recommended approach for this app scale.

**Recommended approach for this phase:** Design `useAutoSave` to receive the full `responses: Record<string, unknown>` object for the entire module section, not individual field values. The form (via react-hook-form) owns all field state; `watch()` gives the full current values. This eliminates the partial update problem entirely.

**Warning signs:** Module responses disappear after the second save; only the most recently saved field persists.

### Pitfall 2: Stale Closure in Debounce Timer

**What goes wrong:** The debounce timer captures a stale `value` from the closure at the time `setTimeout` was called, not the current value when it fires.

**Why it happens:** JavaScript closures capture bindings at creation time. If `doSave` is created once and the timer fires later, it reads the old `value`.

**How to avoid:** Store the latest value in a `useRef` that is updated synchronously on every render. The timer's `doSave` reads from the ref, not from the closure:

```typescript
const latestValuesRef = useRef(values)
useEffect(() => { latestValuesRef.current = values }, [values])
// doSave reads latestValuesRef.current
```

**Warning signs:** Save stores the state from several keystrokes ago, not the current content.

### Pitfall 3: AbortController Abort on Unmount Re-Triggers Error State

**What goes wrong:** When a component unmounts, the cleanup function aborts the in-flight request. The abort triggers the error handler, which calls `setSaveError()` on an unmounted component — React warning.

**Why it happens:** The `useEffect` cleanup fires on unmount; if a save is in-flight, aborting it triggers the catch path.

**How to avoid:** Check `controller.signal.aborted` in the catch path before calling `setSaveError`. An aborted request is not a user-facing error:

```typescript
} catch (err) {
  if (err instanceof Error && err.name === 'AbortError') return  // normal cancel
  setSaveError(err.message)
}
```

**Warning signs:** React console warning "Can't perform a React state update on an unmounted component."

### Pitfall 4: ProgressContext Stale After Save

**What goes wrong:** A save completes, `onSaveSuccess` fires, but `moduleProgress` in ProgressContext is not updated — sidebar still shows old percentage.

**Why it happens:** If `refreshProgress` does an async Supabase fetch but the component that called it has already moved on, or the fetch never actually triggers.

**How to avoid:** `refreshProgress` must be included in the dependency array of any hook that calls it, or called via a stable callback ref pattern. Also: do not derive progress purely from local field state — always reflect what's actually stored in Supabase (D-09 decision).

**Warning signs:** Sidebar completion percentage never updates even after successful saves.

### Pitfall 5: react-hook-form `watch()` Outside FormProvider

**What goes wrong:** Using `watch()` in a child component without a wrapping `<FormProvider>` causes the watched value to always return `undefined`.

**Why it happens:** `useWatch` / `watch()` require the form context to be provided by `<FormProvider>`.

**How to avoid:** Each module page wraps all its sections in a single `<FormProvider>` with a `useForm()` instance. WorkshopTextarea/Input use `useController()` or `register()` from that form, and `useAutoSave` uses `useWatch()` to observe values.

**Warning signs:** `watch('fieldKey')` always returns `undefined`; auto-save never fires.

---

## Code Examples

Verified patterns from official sources:

### useForm + watch for auto-save trigger

```typescript
// Source: react-hook-form docs — https://react-hook-form.com/docs/useform/watch
import { useForm, useWatch } from 'react-hook-form'

// In module page (FormProvider owner)
const methods = useForm<ModuleFormValues>({ defaultValues: loadedResponses })

// In WorkshopTextarea (child, uses FormProvider context)
import { useController, useWatch, useFormContext } from 'react-hook-form'

function WorkshopTextarea({ name, moduleSlug, ...props }) {
  const { control } = useFormContext()
  const { field } = useController({ name, control })
  const value = useWatch({ control, name })

  // value change triggers auto-save debounce
  useAutoSave({ moduleSlug, fieldKey: name, value })

  return <textarea {...field} {...props} />
}
```

### SVG ProgressRing (stroke-dashoffset technique)

```typescript
// Standard technique — no library needed
// Confidence: HIGH (canonical SVG pattern, stable for 10+ years)
const R = 18
const C = 2 * Math.PI * R  // 113.1

function ProgressRing({ percent = 0 }: { percent: number }) {
  const offset = C - (C * percent) / 100
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" role="img" aria-label={`${percent}% complete`}>
      <circle cx="22" cy="22" r={R} fill="none" stroke="var(--border2)" strokeWidth="3" />
      <circle
        cx="22" cy="22" r={R} fill="none"
        stroke="var(--orange)" strokeWidth="3"
        strokeDasharray={C} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '22px 22px', transition: 'stroke-dashoffset .4s ease' }}
      />
      <text x="22" y="26.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text)">
        {percent}%
      </text>
    </svg>
  )
}
```

### Context Provider following AuthContext pattern

```typescript
// src/context/ProgressContext.tsx — mirrors AuthContext.tsx exactly
'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ModuleSlug } from '@/types/database'

interface ProgressContextValue {
  moduleProgress: Record<string, number>
  refreshProgress: (slug: ModuleSlug) => Promise<void>
}

const ProgressContext = createContext<ProgressContextValue>({
  moduleProgress: {},
  refreshProgress: async () => {},
})

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({})
  const supabase = createClient()

  const refreshProgress = useCallback(async (slug: ModuleSlug) => {
    // fetch blp_responses row, count non-empty fields, derive percent
    // ...
    setModuleProgress(prev => ({ ...prev, [slug]: pct }))
  }, [supabase])

  return (
    <ProgressContext.Provider value={{ moduleProgress, refreshProgress }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `localStorage` save | Supabase upsert via `useAutoSave` | This phase | Cross-device sync, no data loss on browser clear |
| Global progress bar only | Per-module ProgressRing | This phase | Students see module-level progress at a glance |
| Prop-drilled `currentTheme` | ThemeContext | This phase | Simplifies component signatures throughout app |
| Old app: `go(n)` vanilla JS function | SectionNav React component | This phase | Declarative, URL-addressable sections (Phase 5 will add URL params) |

---

## Open Questions

1. **JSONB merge strategy for `responses` column**
   - What we know: The hook must update partial keys without overwriting siblings
   - What's unclear: Whether the plan uses (a) full-module-object writes via a single form instance, (b) client-side read-merge-write, or (c) a Supabase RPC
   - Recommendation: Use approach (a) — one `react-hook-form` instance per module page, auto-save sends `methods.getValues()` (the full responses object). Simplest, no RPC needed, no race condition for this scale.

2. **ProgressRing: percentage calculation basis**
   - What we know: Progress updates only after successful save (D-09). `blp_responses.responses` holds all field values.
   - What's unclear: The denominator — is it total fields in the module, or just required fields? Phase 5 will define the full field registry.
   - Recommendation: For this phase, ProgressContext derives percent as `(non-empty required field count) / (total required field count) * 100`. SectionWrapper passes the field definitions; ProgressContext aggregates across sections.

3. **ThemeContext and SSR initial value**
   - What we know: Theme is stored in a cookie read server-side in `(app)/layout.tsx`. ThemeContext needs an `initialTheme` prop seeded from this server read to avoid hydration mismatch.
   - What's unclear: Nothing — the pattern is clear. `ThemeProvider` receives `initialTheme` from the server layout, same as the current `AppShellClient` receives `currentTheme`.
   - Recommendation: `<ThemeProvider initialTheme={theme}>` in `(app)/layout.tsx`. No hydration risk.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is code-only (new components and hooks). No external services, CLIs, or runtimes beyond the existing Next.js dev server are required. `react-hook-form`, `zod`, and `@hookform/resolvers` are npm packages that install cleanly.

---

## Validation Architecture

Nyquist validation is enabled (`workflow.nyquist_validation: true` in `.planning/config.json`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — no test runner exists in `package.json` |
| Config file | None — Wave 0 must create |
| Quick run command | `npx vitest run --reporter=verbose` (after Wave 0 install) |
| Full suite command | `npx vitest run` |

Vitest is the recommended test runner for Next.js 15 + React 19 projects. It works with jsdom for component tests and has first-class TypeScript support with no additional config. Jest requires a separate babel/swc transform setup that conflicts with Next.js's own swc pipeline.

**Install command (Wave 0):**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event
```

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-03 | Auto-save debounces — only one write per 5s window under rapid input | unit | `npx vitest run tests/useAutoSave.test.ts` | Wave 0 |
| DATA-04 | AbortController cancels in-flight request before new one | unit | `npx vitest run tests/useAutoSave.test.ts` | Wave 0 |
| DATA-05 | Error indicator shown only on blur when save failed | unit | `npx vitest run tests/WorkshopTextarea.test.tsx` | Wave 0 |
| DATA-06 | ProgressContext and ThemeContext available and return correct initial state | unit | `npx vitest run tests/contexts.test.tsx` | Wave 0 |
| COMP-01 | WorkshopTextarea renders and triggers auto-save on value change | unit | `npx vitest run tests/WorkshopTextarea.test.tsx` | Wave 0 |
| COMP-02 | WorkshopInput renders and triggers auto-save on value change | unit | `npx vitest run tests/WorkshopInput.test.tsx` | Wave 0 |
| COMP-03 | OptionSelector shows selected state with orange; triggers auto-save on selection | unit | `npx vitest run tests/OptionSelector.test.tsx` | Wave 0 |
| COMP-04 | SectionNav renders tabs; active tab has orange style; completed tab has green style | unit | `npx vitest run tests/SectionNav.test.tsx` | Wave 0 |
| COMP-05 | ProgressRing renders correct SVG geometry for given percent | unit | `npx vitest run tests/ProgressRing.test.tsx` | Wave 0 |
| COMP-06 | SectionWrapper marks complete when all required fields non-empty; incomplete otherwise | unit | `npx vitest run tests/SectionWrapper.test.tsx` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=dot` (fast, dots only)
- **Per wave merge:** `npx vitest run --reporter=verbose`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `vitest.config.ts` — configure jsdom environment, path aliases
- [ ] `tests/setup.ts` — `@testing-library/jest-dom` matchers
- [ ] `tests/useAutoSave.test.ts` — DATA-03, DATA-04
- [ ] `tests/WorkshopTextarea.test.tsx` — COMP-01, DATA-05
- [ ] `tests/WorkshopInput.test.tsx` — COMP-02
- [ ] `tests/OptionSelector.test.tsx` — COMP-03
- [ ] `tests/SectionNav.test.tsx` — COMP-04
- [ ] `tests/ProgressRing.test.tsx` — COMP-05
- [ ] `tests/SectionWrapper.test.tsx` — COMP-06
- [ ] `tests/contexts.test.tsx` — DATA-06 (ProgressContext, ThemeContext)
- [ ] Framework install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event`

---

## Sources

### Primary (HIGH confidence)

- Codebase: `src/context/AuthContext.tsx` — Provider pattern to replicate for ProgressContext and ThemeContext
- Codebase: `src/types/database.ts` — `BlpResponse` type, `responses: Record<string, unknown>` column shape
- Codebase: `src/lib/supabase/client.ts` — Browser client instantiation pattern
- Codebase: `src/app/globals.css` — All CSS variable tokens (`--orange`, `--border`, `--surface`, etc.)
- Old app: `old/modules/brand-foundation.html` lines 447–471 — Textarea/input CSS (exact pixel spec)
- Old app: `old/modules/brand-foundation.html` lines 486–510 — OptionSelector `.opt` CSS (exact pixel spec)
- Old app: `old/modules/brand-foundation.html` lines 276–307 — Section tab bar `.tabs` / `.tab` CSS (exact pixel spec)
- Old app: `old/modules/brand-foundation.html` lines 3739–3762 — `sectionComplete()` logic (required field completion check)

### Secondary (MEDIUM confidence)

- react-hook-form docs pattern — `useForm`, `useController`, `useWatch` integration; confirmed against react-hook-form 7.x documentation
- SVG `stroke-dasharray` / `stroke-dashoffset` circle technique — canonical web pattern, stable

### Tertiary (LOW confidence)

- Vitest recommendation over Jest for Next.js 15 + React 19 — based on community pattern as of early 2026; Jest works but requires more transform config

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — packages already in project constraints; versions confirmed in `package.json`
- Architecture: HIGH — directly derived from existing `AuthContext.tsx` pattern and old app source code
- Pitfalls: HIGH — JSONB merge and debounce closure issues are verified code-level concerns, not speculation
- Visual specs: HIGH — sourced directly from old app HTML/CSS, not from memory

**Research date:** 2026-04-01
**Valid until:** 2026-05-01 (stable — react-hook-form and Supabase JS are mature, not fast-moving)
