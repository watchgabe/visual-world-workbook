'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  redirectPath: string
  errorParam: string | null
}

const AUTH_ERRORS: Record<string, string> = {
  link_expired: "Hmm, that link has expired. Enter your email to get a new one.",
  unknown: "Something went wrong. Please try again.",
  rate_limit: "Too many requests. Please wait a minute before trying again.",
}

export function LoginForm({ redirectPath, errorParam }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(30)
  const [showResend, setShowResend] = useState(false)

  // On mount, set error from URL param if present
  useEffect(() => {
    if (errorParam) {
      setErrorMessage(AUTH_ERRORS[errorParam] ?? AUTH_ERRORS.unknown)
    }
  }, [errorParam])

  // 30-second countdown before showing resend button
  useEffect(() => {
    if (!sent) return
    setSecondsLeft(30)
    setShowResend(false)
    const interval = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(interval)
          setShowResend(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [sent])

  async function handleSend(emailToSend: string) {
    setLoading(true)
    setErrorMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: emailToSend,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
    })

    setLoading(false)

    if (error) {
      if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
        setErrorMessage(AUTH_ERRORS.rate_limit)
      } else {
        setErrorMessage(AUTH_ERRORS.unknown)
      }
      return
    }

    setSent(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    await handleSend(email.trim())
  }

  async function handleResend() {
    setSent(false)
    setShowResend(false)
    setSecondsLeft(30)
    await handleSend(email.trim())
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        {/* Envelope icon */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--orange)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 7l10 7 10-7" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '0.5rem',
          }}
        >
          Check your email
        </h2>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--dim)',
            lineHeight: 1.6,
            marginBottom: '1.5rem',
          }}
        >
          We sent a magic link to <strong style={{ color: 'var(--text)' }}>{email}</strong>.{' '}
          Click the link in the email to sign in.
        </p>

        {showResend ? (
          <button
            type="button"
            onClick={handleResend}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--orange)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '4px 0',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Resend magic link
          </button>
        ) : (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--dimmer)',
            }}
          >
            Resend available in {secondsLeft}s
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Error message */}
      {errorMessage && (
        <div
          style={{
            background: 'var(--orange-tint)',
            border: '1px solid var(--orange-border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '1rem',
            fontSize: '13px',
            color: 'var(--orange-dark)',
            lineHeight: 1.5,
          }}
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {/* Email input */}
      <div style={{ marginBottom: '0.875rem' }}>
        <label
          htmlFor="email"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--dim)',
            marginBottom: '6px',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          autoFocus
          style={{
            width: '100%',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text)',
            padding: '12px 16px',
            fontSize: '15px',
            fontFamily: 'var(--font)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = 'var(--orange-border)'
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || !email.trim()}
        style={{
          width: '100%',
          background: loading || !email.trim() ? 'var(--border2)' : 'var(--orange)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background .15s',
        }}
        onMouseEnter={e => {
          if (!loading && email.trim()) {
            e.currentTarget.style.background = 'var(--orange-hover)'
          }
        }}
        onMouseLeave={e => {
          if (!loading && email.trim()) {
            e.currentTarget.style.background = 'var(--orange)'
          }
        }}
      >
        {loading && (
          <span
            style={{
              display: 'inline-block',
              width: '16px',
              height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
        )}
        {loading ? 'Sending...' : 'Send magic link'}
      </button>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  )
}
