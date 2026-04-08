# Editing Content

This guide explains what kinds of content changes you can ask Claude Code to make, and what to watch out for.

## Where Content Lives

All module content is in section component files:

```
src/components/sections/
├── brand-foundation/    # Module 1: Brand Foundation
│   ├── overview.tsx
│   ├── core-mission.tsx
│   ├── core-values.tsx
│   ├── brand-vision.tsx
│   ├── origin-story.tsx
│   ├── avatar.tsx
│   ├── content-pillars.tsx
│   └── brand-journey.tsx
├── visual-world/        # Module 2: Visual World
│   ├── overview.tsx
│   ├── creator-analysis.tsx
│   ├── mood-board.tsx
│   ├── color-palette.tsx
│   ├── typography.tsx
│   └── shot-system.tsx
├── content/             # Module 3: Content
│   ├── overview.tsx
│   ├── content-strategy.tsx
│   ├── storytelling.tsx
│   ├── cinematic-content.tsx
│   ├── content-system.tsx
│   ├── formats.tsx
│   ├── idea-generation.tsx
│   ├── batching.tsx
│   ├── starter-kit.tsx
│   ├── sustainability.tsx
│   └── trust-and-money.tsx
└── launch/              # Module 4: Launch
    ├── overview.tsx
    ├── goals.tsx
    ├── bio.tsx
    ├── lead-magnet.tsx
    ├── funnel.tsx
    ├── manychat.tsx
    └── launch-content.tsx
```

## What You Can Ask Claude Code to Change

These are safe content changes. Just describe what you want in plain English:

- **Headings and paragraphs** — "Change the heading in the core mission section from 'Your Core Mission' to 'Define Your Core Mission'"
- **Form labels** — "Change the label 'Target Audience' to 'Your Ideal Customer' in the avatar section"
- **Placeholder text** — "Change the placeholder in the origin story field to 'Share the journey that led you to start your brand...'"
- **Option text in selectors** — "Change the option 'Bold' to 'Confident' in the brand tone selector"
- **Tips and notes** — "Add a pro tip at the end of the core values section that says 'Think about what your customers value most'"

## What Must NEVER Be Changed

Tell Claude Code explicitly if you're unsure, but these are the critical things:

- **`fieldKey` values** — These are database keys like `bf_core_mission` or `vw_cp_primary`. If a fieldKey is renamed or removed, all existing users lose their saved answers for that field. There is no recovery.
- **`slug` values in `src/lib/modules.ts`** — These define the URLs. Changing them breaks bookmarks and links.
- **The visual styling** — Don't ask to change `className` values unless you want to intentionally change the look.

## Module and Section Configuration

The list of modules, sections, and their order is defined in `src/lib/modules.ts`. If you want to rename a section's display title, you can ask Claude Code to change the `name` field — but **never change the `slug` or field `key` values**.
