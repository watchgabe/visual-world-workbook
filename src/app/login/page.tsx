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
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--orange)',
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              FSCreative&#8482;
            </div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text)',
                lineHeight: 1.35,
                marginBottom: '10px',
              }}
            >
              The Brand Launch Playbook&#8482;
            </div>
            <div
              style={{
                height: '2px',
                background: 'var(--orange)',
                borderRadius: '1px',
                opacity: 0.7,
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
              Enter your email to receive a magic link and sign in.
            </p>
          </div>

          {/* Login form */}
          <LoginForm redirectPath={redirectPath} errorParam={errorParam} />
        </div>

        {/* Footer credit */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--dimmer)',
            marginTop: '1.25rem',
          }}
        >
          Secured by Supabase Auth
        </p>
      </div>
    </main>
  )
}
