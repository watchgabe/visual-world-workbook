'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { MODULE_SECTIONS } from '@/lib/modules'
import { SectionNav } from '@/components/workshop/SectionNav'
import type { ModuleSlug } from '@/types/database'

export default function ModuleLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()

  const slug = params.slug as ModuleSlug
  const sections = MODULE_SECTIONS[slug]

  if (!sections || sections.length === 0) {
    return <>{children}</>
  }

  const activeIndex = sections.findIndex(s => pathname.endsWith(`/${s.slug}`))

  const handleSectionChange = (index: number) => {
    router.push(`/modules/${slug}/${sections[index].slug}`)
  }

  return (
    <div>
      <SectionNav
        sections={sections.map(s => ({ name: s.name, complete: false }))}
        activeIndex={activeIndex >= 0 ? activeIndex : 0}
        onSectionChange={handleSectionChange}
      />
      {children}
    </div>
  )
}
