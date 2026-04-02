'use client'

import type { ModuleSlug } from '@/types/database'
import { useAutoSave } from '@/hooks/useAutoSave'

interface WorkshopTextareaProps {
  moduleSlug: ModuleSlug
  fieldKey: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
  label?: string
}

const baseStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: '9px 12px',
  fontSize: '13px',
  fontFamily: 'var(--font)',
  color: 'var(--text)',
  background: 'var(--surface)',
  resize: 'vertical' as const,
  lineHeight: 1.5,
  transition: 'border-color 0.15s, background 0.15s',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const focusStyle: React.CSSProperties = {
  borderColor: 'var(--orange)',
  background: 'var(--bg)',
  boxShadow: '0 0 0 3px rgba(240, 96, 27, 0.08)',
}

export function WorkshopTextarea({
  moduleSlug,
  fieldKey,
  value,
  onChange,
  placeholder,
  rows = 4,
  label,
}: WorkshopTextareaProps) {
  const { saveError, isFocused, handleBlur, handleFocus, retry } = useAutoSave({
    moduleSlug,
    fieldKey,
    value,
  })

  return (
    <div style={{ position: 'relative', marginBottom: '9px' }}>
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
      <textarea
        className="workshop-field"
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        rows={rows}
        style={{ ...baseStyle, ...(isFocused ? focusStyle : {}) }}
      />
      {saveError && !isFocused && (
        <div
          style={{
            position: 'absolute',
            top: label ? '32px' : '8px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
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
