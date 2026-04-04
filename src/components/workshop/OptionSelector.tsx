'use client'

import type { ModuleSlug } from '@/types/database'
import { useAutoSave } from '@/hooks/useAutoSave'

interface OptionItem {
  label: string
  value: string
}

interface OptionSelectorProps {
  moduleSlug: ModuleSlug
  fieldKey: string
  value: string
  onChange: (value: string) => void
  options: OptionItem[]
  columns?: number
  label?: string
  getFullResponses?: () => Record<string, string>
}

export function OptionSelector({
  moduleSlug,
  fieldKey,
  value,
  onChange,
  options,
  columns = 2,
  label,
  getFullResponses,
}: OptionSelectorProps) {
  const { saveError, isFocused, handleBlur, handleFocus, retry } = useAutoSave({
    moduleSlug,
    fieldKey,
    value,
    getFullResponses,
  })

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: '5px',
    marginBottom: '9px',
  }

  const baseButtonStyle: React.CSSProperties = {
    padding: '9px 11px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface)',
    color: 'var(--dim)',
    fontSize: '12px',
    cursor: 'pointer',
    textAlign: 'left' as const,
    lineHeight: 1.4,
    fontFamily: 'var(--font)',
    transition: 'all 0.15s',
  }

  const selectedButtonStyle: React.CSSProperties = {
    background: 'var(--orange-tint)',
    color: 'var(--orange-dark)',
    borderColor: 'var(--orange-border)',
    fontWeight: 500,
  }

  return (
    <div>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text)',
            marginBottom: '6px',
          }}
        >
          {label}
        </label>
      )}
      <div className="grid-form" style={gridStyle} onFocus={handleFocus}>
        {options.map(option => {
          const isSelected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                handleBlur()
              }}
              style={{
                ...baseButtonStyle,
                ...(isSelected ? selectedButtonStyle : {}),
              }}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {saveError && !isFocused && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '4px',
          }}
        >
          <span style={{ color: '#ef4444', fontSize: '11px' }} title={saveError}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
              <line
                x1="7"
                y1="4"
                x2="7"
                y2="7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="7" cy="9.5" r="0.75" fill="currentColor" />
            </svg>
          </span>
          <button
            type="button"
            onClick={retry}
            aria-label="retry"
            style={{
              fontSize: '10px',
              color: '#ef4444',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontFamily: 'var(--font)',
            }}
          >
            retry
          </button>
        </div>
      )}
    </div>
  )
}
