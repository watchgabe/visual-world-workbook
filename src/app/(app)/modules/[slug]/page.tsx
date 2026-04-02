import { redirect, notFound } from 'next/navigation'
import { MODULES, MODULE_SECTIONS } from '@/lib/modules'
import type { ModuleSlug } from '@/types/database'

interface ModulePageProps {
  params: Promise<{ slug: string }>
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params
  const mod = MODULES.find(m => m.slug === slug)
  if (!mod) notFound()

  const sections = MODULE_SECTIONS[slug as ModuleSlug]
  if (sections && sections.length > 0) {
    redirect(`/modules/${slug}/${sections[0].slug}`)
  }

  // Modules without sections (welcome, playbook) fall through to their dedicated routes
  return null
}

export async function generateStaticParams() {
  return MODULES.map((mod) => ({ slug: mod.slug }))
}
