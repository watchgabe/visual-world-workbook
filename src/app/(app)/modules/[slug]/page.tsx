import { notFound } from 'next/navigation'
import { MODULES } from '@/lib/modules'

interface ModulePageProps {
  params: Promise<{ slug: string }>
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { slug } = await params
  const mod = MODULES.find(m => m.slug === slug)

  if (!mod) {
    notFound()
  }

  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font)',
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--text)',
          marginBottom: '8px',
        }}
      >
        Module {mod.number}: {mod.title}
      </h1>
      <p style={{ color: 'var(--dim)', fontSize: '14px' }}>
        Content will be added in Phase 5.
      </p>
    </div>
  )
}

export async function generateStaticParams() {
  return MODULES.map((mod) => ({
    slug: mod.slug,
  }))
}
