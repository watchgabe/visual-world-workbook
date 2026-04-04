---
phase: quick
plan: 260404-meo
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/modules.ts
  - src/components/sections/visual-world/mood-board.tsx
  - src/components/sections/visual-world/color-palette.tsx
  - src/components/sections/visual-world/typography.tsx
  - src/components/sections/visual-world/shot-system.tsx
  - src/app/(app)/modules/[slug]/[section]/page.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Mood Board appears as its own section in the Visual World sidebar (index 2)"
    - "Color Palette appears as a separate section after Mood Board (index 3)"
    - "Mood board form fields (vw_mb_*) load and save correctly in the mood-board section"
    - "Color palette form fields (vw_color_*) load and save correctly in the color-palette section"
    - "Typography and Shot System sections still load and save at their new indices (4, 5)"
  artifacts:
    - path: "src/components/sections/visual-world/mood-board.tsx"
      provides: "Mood board component extracted from color-palette"
    - path: "src/lib/modules.ts"
      provides: "Split section definitions with mood-board at index 2, color-palette at index 3"
  key_links:
    - from: "src/lib/modules.ts"
      to: "src/components/sections/visual-world/mood-board.tsx"
      via: "MODULE_SECTIONS['visual-world'][2] slug match"
      pattern: "slug: 'mood-board'"
    - from: "src/app/(app)/modules/[slug]/[section]/page.tsx"
      to: "src/components/sections/visual-world/mood-board.tsx"
      via: "SECTION_REGISTRY dynamic import"
      pattern: "visual-world/mood-board"
---

<objective>
Separate mood board from color palette into its own section in the Visual World module to restore the old app structure where mood board (Workshop 2) and color palette (Workshop 3) were distinct sections.

Purpose: The old app had these as separate workshops (s2 and s3). They were merged during migration (Phase 05 decision) but should be split for proper navigation, progress tracking, and content organization.
Output: Two independent section components — mood-board.tsx and a trimmed color-palette.tsx — with updated module definitions and routing.
</objective>

<execution_context>
@/Users/joao/.claude/get-shit-done/workflows/execute-plan.md
@/Users/joao/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/modules.ts
@src/components/sections/visual-world/color-palette.tsx
@src/app/(app)/modules/[slug]/[section]/page.tsx
@src/components/sections/visual-world/typography.tsx
@src/components/sections/visual-world/shot-system.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Split modules.ts definition and update SECTION_REGISTRY + downstream indices</name>
  <files>src/lib/modules.ts, src/app/(app)/modules/[slug]/[section]/page.tsx, src/components/sections/visual-world/typography.tsx, src/components/sections/visual-world/shot-system.tsx</files>
  <action>
1. In src/lib/modules.ts, replace the single color-palette entry (lines 148-164) with two entries:
   - Index 2: `{ slug: 'mood-board', name: 'Mood Board', fields: [{ key: 'vw_mb_link', required: false }, { key: 'vw_mb_colors', required: false }, { key: 'vw_mb_lighting', required: false }, { key: 'vw_mb_mood', required: false }, { key: 'vw_mb_textures', required: false }, { key: 'vw_mb_movie', required: false }, { key: 'vw_mb_time', required: false }, { key: 'vw_mb_place', required: false }] }`
   - Index 3: `{ slug: 'color-palette', name: 'Color Palette', fields: [{ key: 'vw_color_primary', required: false }, { key: 'vw_color_secondary', required: false }, { key: 'vw_color_accent', required: false }, { key: 'vw_color_neutral', required: false }, { key: 'vw_color_name', required: false }] }`
   This bumps typography to index 4, shot-system to index 5, visual-world-doc to index 6.

2. In src/app/(app)/modules/[slug]/[section]/page.tsx, add SECTION_REGISTRY entry BEFORE the color-palette entry:
   `'visual-world/mood-board': dynamic(() => import('@/components/sections/visual-world/mood-board'), { loading: () => <SectionSkeleton /> }),`

3. In src/components/sections/visual-world/typography.tsx line 13, change `SECTION_INDEX = 3` to `SECTION_INDEX = 4`.

4. In src/components/sections/visual-world/shot-system.tsx line 14, change `SECTION_INDEX = 4` to `SECTION_INDEX = 5`.

Note: visual-world-doc.tsx does NOT use SECTION_INDEX — it fetches data independently. No change needed there.
  </action>
  <verify>
    <automated>cd /Users/joao/projects/visual-world-workbook; npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>modules.ts has 7 visual-world sections (overview, creator-analysis, mood-board, color-palette, typography, shot-system, visual-world-doc). SECTION_REGISTRY includes mood-board entry. Typography SECTION_INDEX=4, shot-system SECTION_INDEX=5.</done>
</task>

<task type="auto">
  <name>Task 2: Extract mood-board.tsx and trim color-palette.tsx</name>
  <files>src/components/sections/visual-world/mood-board.tsx, src/components/sections/visual-world/color-palette.tsx</files>
  <action>
1. Create src/components/sections/visual-world/mood-board.tsx by extracting mood board functionality from color-palette.tsx:
   - Copy the entire color-palette.tsx as starting point
   - Set SECTION_INDEX = 2
   - SECTION_DEF = MODULE_SECTIONS['visual-world']![SECTION_INDEX]
   - Keep ONLY mood board state: mbImages, mbStorageFull, mbDragOver, mbFileInputRefs, MB_KEY, MB_CATS, MB_CAT_LABELS, LIGHTING_OPTIONS, TEXTURE_OPTIONS
   - Keep ONLY mood board effects: localStorage load/save for images, Pinterest embed script
   - Keep ONLY mood board handlers: addImages, handleMbDrop, removeImage, handleMbFileInput
   - defaultValues: only vw_mb_* fields from SECTION_DEF.fields
   - JSX: SectionWrapper with sectionIndex={SECTION_INDEX}, containing Workshop 2 heading ("Creator Mood Board"), Pinterest link input, mood board image gallery zones (6 categories), and "Identify Patterns / Mood Board Analysis" questions section with OptionSelectors and WorkshopInputs
   - Remove ALL color extraction state, handlers, and JSX (colorPhoto, extractedColors, isExtracting, colorPickerRefs, Workshop 3 content, color palette framework)
   - Keep all existing imports needed for mood board (useEffect, useRef, useState, useForm, createClient, useAuth, WorkshopInput, OptionSelector, SectionWrapper, MODULE_SECTIONS)
   - Export default function MoodBoard()

2. Trim color-palette.tsx to remove all mood board code:
   - Update SECTION_INDEX = 3
   - SECTION_DEF = MODULE_SECTIONS['visual-world']![SECTION_INDEX]
   - Remove mood board state: mbImages, mbStorageFull, mbDragOver, mbFileInputRefs, MB_KEY, MB_CATS, MB_CAT_LABELS, LIGHTING_OPTIONS, TEXTURE_OPTIONS
   - Remove mood board effects: localStorage load/save, Pinterest embed
   - Remove mood board handlers: addImages, handleMbDrop, removeImage, handleMbFileInput
   - Remove mood board JSX: everything from "Workshop 2" heading through "Identify Patterns" section (approximately lines 286-745 of current file)
   - defaultValues: only vw_color_* fields from SECTION_DEF.fields
   - Keep: color extraction photo state (colorPhoto, extractedColors, isExtracting), color extraction handlers (handlePhotoUpload, extractColors), color picker refs, Workshop 3 JSX, color palette framework JSX
   - Remove unused imports (e.g. if OptionSelector is only used in mood board section)
   - Rename function from ColorPalette to just ColorPalette (keep same name, just ensure export default)
  </action>
  <verify>
    <automated>cd /Users/joao/projects/visual-world-workbook; npx next build 2>&1 | tail -20</automated>
  </verify>
  <done>mood-board.tsx exists as standalone component with all mood board UI and state. color-palette.tsx contains only color extraction and palette framework. Both components build without errors. No mood board code remains in color-palette.tsx. No color palette code exists in mood-board.tsx.</done>
</task>

</tasks>

<verification>
1. `npx next build` completes without errors
2. Navigate to /modules/visual-world/mood-board — renders mood board with image zones and analysis questions
3. Navigate to /modules/visual-world/color-palette — renders only color extraction and palette framework
4. Visual World sidebar shows 7 sections in correct order: Overview, Creator Analysis, Mood Board, Color Palette, Typography, Your Perspective, Visual World Doc
5. Typography and Shot System sections load correctly at their new indices
</verification>

<success_criteria>
- Mood board is a separate navigable section at /modules/visual-world/mood-board
- Color palette section no longer contains mood board content
- All 7 Visual World sections render without errors
- Form data saves and loads correctly for both mood-board (vw_mb_*) and color-palette (vw_color_*) fields
- No regression in typography or shot-system sections
</success_criteria>

<output>
After completion, create `.planning/quick/260404-meo-separate-mood-board-from-color-palette-i/260404-meo-SUMMARY.md`
</output>
