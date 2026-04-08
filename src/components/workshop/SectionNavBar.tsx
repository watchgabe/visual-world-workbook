'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MODULES, MODULE_SECTIONS } from '@/lib/modules'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import { saveField } from '@/lib/saveField'
import type { ModuleSlug } from '@/types/database'

interface SectionNavBarProps {
  moduleSlug: ModuleSlug
  currentSectionSlug: string
}

export function SectionNavBar({ moduleSlug, currentSectionSlug }: SectionNavBarProps) {
  const sections = MODULE_SECTIONS[moduleSlug]
  const { user } = useAuth()
  const { refreshProgress } = useProgress()
  const router = useRouter()
  if (!sections) return null

  // Filter out overview — it's not a workshop section
  const workshopSections = sections.filter(s => s.slug !== 'overview')
  const currentIndex = workshopSections.findIndex(s => s.slug === currentSectionSlug)

  if (currentIndex === -1) return null

  const prevSection = currentIndex > 0 ? workshopSections[currentIndex - 1] : null
  const nextSection = currentIndex < workshopSections.length - 1 ? workshopSections[currentIndex + 1] : null
  const moduleIndex = MODULES.findIndex(m => m.slug === moduleSlug)
  const nextModule = moduleIndex !== -1 ? MODULES[moduleIndex + 1] : null
  const finishHref = nextModule ? `/modules/${nextModule.slug}` : `/modules/playbook`
  const overviewHref = `/modules/${moduleSlug}`
  const sectionLabel = `${currentIndex + 1}/${workshopSections.length}`
  const currentSection = workshopSections[currentIndex]
  const hasNoFields = currentSection.fields.length === 0

  async function handleSaveAndContinue(href: string) {
    if (hasNoFields && user) {
      await saveField(user.id, moduleSlug, `_${currentSectionSlug}_viewed`, 'true')
      await refreshProgress(moduleSlug)
    }
    router.push(href)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '2rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Back button */}
      {prevSection ? (
        <Link
          href={`/modules/${moduleSlug}/${prevSection.slug}`}
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12.5px',
            cursor: 'pointer',
            border: '1px solid var(--border2)',
            background: 'transparent',
            color: 'var(--text)',
            fontFamily: 'var(--font)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          &#8592; Back
        </Link>
      ) : (
        <Link
          href={overviewHref}
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12.5px',
            cursor: 'pointer',
            border: '1px solid var(--border2)',
            background: 'transparent',
            color: 'var(--text)',
            fontFamily: 'var(--font)',
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          &#8592; Back
        </Link>
      )}

      {/* Section index */}
      <span
        style={{
          fontSize: '12px',
          color: 'var(--dimmer)',
          fontWeight: 500,
        }}
      >
        {sectionLabel}
      </span>

      {/* Save & Continue button */}
      {nextSection ? (
        hasNoFields ? (
          <button
            type="button"
            onClick={() => handleSaveAndContinue(`/modules/${moduleSlug}/${nextSection.slug}`)}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12.5px',
              cursor: 'pointer',
              background: 'var(--orange)',
              color: '#fff',
              border: '1px solid var(--orange)',
              fontFamily: 'var(--font)',
              fontWeight: 600,
            }}
          >
            Save &amp; Continue &#8594;
          </button>
        ) : (
          <Link
            href={`/modules/${moduleSlug}/${nextSection.slug}`}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12.5px',
              cursor: 'pointer',
              background: 'var(--orange)',
              color: '#fff',
              border: '1px solid var(--orange)',
              fontFamily: 'var(--font)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Save &amp; Continue &#8594;
          </Link>
        )
      ) : (
        hasNoFields ? (
          <button
            type="button"
            onClick={() => handleSaveAndContinue(finishHref)}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12.5px',
              cursor: 'pointer',
              background: 'var(--orange)',
              color: '#fff',
              border: '1px solid var(--orange)',
              fontFamily: 'var(--font)',
              fontWeight: 600,
            }}
          >
            {finishHref === '/modules/playbook' ? 'View Your Playbook →' : 'Finish Module ✓'}
          </button>
        ) : (
          <Link
            href={finishHref}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12.5px',
              cursor: 'pointer',
              background: 'var(--orange)',
              color: '#fff',
              border: '1px solid var(--orange)',
              fontFamily: 'var(--font)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
          {finishHref === '/modules/playbook' ? 'View Your Playbook →' : 'Finish Module ✓'}
        </Link>
        )
      )}
    </div>
  )
}
