'use client'

interface SectionNavProps {
  sections: { name: string; complete: boolean }[]
  activeIndex: number
  onSectionChange: (index: number) => void
}

function CheckmarkIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
    >
      <path
        d="M2 5l2.5 2.5L8 3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SectionNav({ sections, activeIndex, onSectionChange }: SectionNavProps) {
  return (
    <nav
      style={{
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        marginBottom: '2rem',
      }}
    >
      {sections.map((section, index) => {
        const isActive = index === activeIndex
        const isComplete = section.complete && !isActive

        let background = 'transparent'
        let color = 'var(--dimmer)'
        let borderColor = 'var(--border)'

        if (isActive) {
          background = 'var(--orange-tint)'
          color = 'var(--orange-dark)'
          borderColor = 'var(--orange-border)'
        } else if (isComplete) {
          background = 'var(--green-bg)'
          color = 'var(--green-text)'
          borderColor = 'var(--green-border)'
        }

        return (
          <button
            key={index}
            type="button"
            onClick={() => onSectionChange(index)}
            style={{
              fontSize: '11px',
              padding: '4px 11px',
              borderRadius: '20px',
              border: `1px solid ${borderColor}`,
              background,
              color,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {section.complete && <CheckmarkIcon />}
            {section.name}
          </button>
        )
      })}
    </nav>
  )
}
