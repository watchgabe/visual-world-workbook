// dynamic is imported when Plans 02-05 populate the registry below.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import dynamic from 'next/dynamic'
import { notFound } from 'next/navigation'
import { MODULES, MODULE_SECTIONS } from '@/lib/modules'
import type { ModuleSlug } from '@/types/database'

interface SectionPageProps {
  params: Promise<{ slug: string; section: string }>
}

// Static component registry — each entry maps a "slug/section" key to a lazy-loaded component.
// Plans 02-05 add entries here when creating section components.
// Usage: import dynamic from 'next/dynamic' then add:
//   'brand-foundation/overview': dynamic(() => import('@/components/sections/brand-foundation/overview'))
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SECTION_REGISTRY: Record<string, React.ComponentType<any>> = {
  // Brand Foundation sections — populated by Plan 02

  // Visual World sections — populated by Plan 03

  // Content sections — populated by Plan 04

  // Launch sections — populated by Plan 05
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { slug, section } = await params

  // Validate slug exists
  const mod = MODULES.find(m => m.slug === slug)
  if (!mod) notFound()

  // Validate section exists for this module
  const sections = MODULE_SECTIONS[slug as ModuleSlug]
  if (!sections?.find(s => s.slug === section)) notFound()

  // Look up component in registry
  const key = `${slug}/${section}`
  const Component = SECTION_REGISTRY[key]
  if (!Component) notFound()

  return <Component />
}
