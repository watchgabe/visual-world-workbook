export const MODULES = [
  { slug: 'welcome',          number: '00', title: 'Welcome' },
  { slug: 'brand-foundation', number: '01', title: 'Brand Foundation' },
  { slug: 'visual-world',     number: '02', title: 'Visual World' },
  { slug: 'content',          number: '03', title: 'Create Content' },
  { slug: 'launch',           number: '04', title: 'Launch' },
  { slug: 'playbook',         number: '05', title: 'The Playbook' },
] as const

export type ModuleSlug = typeof MODULES[number]['slug']

export interface SectionDef {
  slug: string
  name: string
  fields: { key: string; required: boolean }[]
}

// MODULE_SECTIONS defines section slugs and names for all workshop modules.
// Field arrays are populated by each module plan (02-05) when section components are built.
// welcome and playbook are excluded — they have no sub-sections.
export const MODULE_SECTIONS: Partial<Record<ModuleSlug, SectionDef[]>> = {
  'brand-foundation': [
    { slug: 'overview',        name: 'Overview',        fields: [] },
    { slug: 'brand-journey',   name: 'Brand Journey',   fields: [] },
    { slug: 'avatar',          name: 'Avatar',          fields: [] },
    { slug: 'core-mission',    name: 'Core Mission',    fields: [] },
    { slug: 'core-values',     name: 'Core Values',     fields: [] },
    { slug: 'content-pillars', name: 'Content Pillars', fields: [] },
    { slug: 'origin-story',    name: 'Origin Story',    fields: [] },
    { slug: 'brand-vision',    name: 'Brand Vision',    fields: [] },
  ],
  'visual-world': [
    { slug: 'overview',         name: 'Overview',         fields: [] },
    { slug: 'creator-analysis', name: 'Creator Analysis', fields: [] },
    { slug: 'color-palette',    name: 'Color Palette',    fields: [] },
    { slug: 'typography',       name: 'Typography',       fields: [] },
    { slug: 'shot-system',      name: 'Shot System',      fields: [] },
    { slug: 'visual-world-doc', name: 'Visual World Doc', fields: [] },
  ],
  'content': [
    { slug: 'overview',          name: 'Overview',          fields: [] },
    { slug: 'content-strategy',  name: 'Content Strategy',  fields: [] },
    { slug: 'sustainability',    name: 'Sustainability',     fields: [] },
    { slug: 'formats',           name: 'Formats',           fields: [] },
    { slug: 'content-system',    name: 'Content System',    fields: [] },
    { slug: 'trust-and-money',   name: 'Trust & Money',     fields: [] },
  ],
  'launch': [
    { slug: 'overview',        name: 'Overview',        fields: [] },
    { slug: 'funnel',          name: 'Funnel',          fields: [] },
    { slug: 'manychat',        name: 'ManyChat',        fields: [] },
    { slug: 'lead-magnet',     name: 'Lead Magnet',     fields: [] },
    { slug: 'bio',             name: 'Bio',             fields: [] },
    { slug: 'launch-content',  name: 'Launch Content',  fields: [] },
    { slug: 'goals',           name: 'Goals',           fields: [] },
  ],
}
