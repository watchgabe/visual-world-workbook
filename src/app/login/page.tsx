import { LoginForm } from '@/components/auth/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>
}) {
  const params = await searchParams
  const redirectPath = params.redirect ?? '/'
  const errorParam = params.error ?? null

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
        }}
      >
        {/* Login card */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            border: '1px solid var(--border)',
          }}
        >
          {/* Brand header */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              {/* Orange icon */}
              <img
                src="https://res.cloudinary.com/dy0kchxh8/image/upload/v1778548956/Artwork5_bbba8026-9c77-4162-a796-822b2558fb9f_wfvsrh.png"
                alt="FSCreative"
                style={{ width: '30px', height: '30px', objectFit: 'contain', flexShrink: 0 }}
              />
              {/* Wordmark */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <span style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  lineHeight: 1,
                  fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                  letterSpacing: '-0.01em',
                }}>
                  FSCreative
                </span>
                <span style={{
                  fontSize: '8px',
                  fontWeight: 400,
                  color: 'var(--dimmer)',
                  letterSpacing: '.14em',
                  textTransform: 'uppercase',
                  fontFamily: "'Space Mono', monospace",
                  lineHeight: 1,
                }}>
                  Brand Playbook
                </span>
              </div>
            </div>
            <div
              style={{
                height: '1px',
                background: 'var(--border)',
                borderRadius: '1px',
              }}
            />
          </div>

          {/* Welcome message */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--text)',
                margin: '0 0 6px',
                lineHeight: 1.3,
              }}
            >
              Welcome back
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--dim)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Sign in or create an account to continue.
            </p>
          </div>

          {/* Login form */}
          <LoginForm redirectPath={redirectPath} errorParam={errorParam} />
        </div>

      </div>
    </main>
  )
}
