export const MODULES = [
  { slug: 'welcome',          number: '00', title: 'Welcome' },
  { slug: 'brand-foundation', number: '01', title: 'Brand Foundation' },
  { slug: 'visual-world',     number: '02', title: 'Visual World' },
  { slug: 'content',          number: '03', title: 'Create Content' },
  { slug: 'launch',           number: '04', title: 'Launch' },
  { slug: 'playbook',         number: '05', title: 'The Playbook' },
] as const

export type ModuleSlug = typeof MODULES[number]['slug']
