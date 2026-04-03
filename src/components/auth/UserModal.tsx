'use client'

interface UserModalProps {
  email: string
  name?: string
  onSignOut: () => void
  onClose: () => void
}

export function UserModal({ email, name, onSignOut, onClose }: UserModalProps) {
  return (
    <>
      {/* Full-screen overlay — click outside to close */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 290,
        }}
        aria-hidden="true"
      />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="User account"
        style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          marginBottom: '8px',
          minWidth: '220px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          zIndex: 300,
        }}
      >
        {/* User identity */}
        {name ? (
          <>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={name}
            >
              {name}
            </p>
            <p
              style={{
                fontSize: '12px',
                color: 'var(--dim)',
                margin: '2px 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={email}
            >
              {email}
            </p>
          </>
        ) : (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={email}
          >
            {email}
          </p>
        )}

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--border)',
            margin: '0.5rem 0',
          }}
        />

        {/* Sign out button */}
        <button
          type="button"
          onClick={onSignOut}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            padding: '8px',
            color: 'var(--orange)',
            fontSize: '13px',
            fontWeight: 600,
            background: 'transparent',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            fontFamily: 'var(--font)',
            transition: 'background .12s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--orange-tint)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          Sign out
        </button>
      </div>
    </>
  )
}
