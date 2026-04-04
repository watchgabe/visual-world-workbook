'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  redirectPath: string
  errorParam: string | null
}

const AUTH_ERRORS: Record<string, string> = {
  unknown: "Something went wrong. Please try again.",
  rate_limit: "Too many requests. Please wait a minute before trying again.",
  invalid_credentials: "Invalid email or password.",
  user_exists: "An account with this email already exists. Try signing in.",
}

export function LoginForm({ redirectPath, errorParam }: LoginFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // On mount, set error from URL param if present
  useEffect(() => {
    if (errorParam) {
      setErrorMessage(AUTH_ERRORS[errorParam] ?? AUTH_ERRORS.unknown)
    }
  }, [errorParam])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return

    setLoading(true)
    setErrorMessage(null)

    const supabase = createClient()

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: name.trim() ? { full_name: name.trim() } : undefined,
        },
      })

      setLoading(false)

      if (error) {
        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
          setErrorMessage(AUTH_ERRORS.rate_limit)
        } else if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already exists') ||
          error.message.toLowerCase().includes('user already')
        ) {
          setErrorMessage(AUTH_ERRORS.user_exists)
        } else {
          setErrorMessage(AUTH_ERRORS.unknown)
        }
        return
      }

      window.location.href = redirectPath
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      setLoading(false)

      if (error) {
        if (error.message.toLowerCase().includes('rate limit') || error.message.toLowerCase().includes('too many')) {
          setErrorMessage(AUTH_ERRORS.rate_limit)
        } else if (
          error.message.toLowerCase().includes('invalid login') ||
          error.message.toLowerCase().includes('invalid credentials') ||
          error.message.toLowerCase().includes('wrong password') ||
          error.message.toLowerCase().includes('email not confirmed')
        ) {
          setErrorMessage(AUTH_ERRORS.invalid_credentials)
        } else {
          setErrorMessage(AUTH_ERRORS.unknown)
        }
        return
      }

      window.location.href = redirectPath
    }
  }

  const isDisabled = loading || !email.trim() || !password

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

      {/* Name input — signup only */}
      {mode === 'signup' && (
        <div style={{ marginBottom: '0.875rem' }}>
          <label
            htmlFor="name"
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
            Your name <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name (optional)"
            autoComplete="name"
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

      {/* Password input */}
      <div style={{ marginBottom: '0.875rem' }}>
        <label
          htmlFor="password"
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
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          required
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          minLength={6}
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
        disabled={isDisabled}
        style={{
          width: '100%',
          background: isDisabled ? 'var(--border2)' : 'var(--orange)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          fontSize: '15px',
          fontWeight: 600,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background .15s',
        }}
        onMouseEnter={e => {
          if (!isDisabled) {
            e.currentTarget.style.background = 'var(--orange-hover)'
          }
        }}
        onMouseLeave={e => {
          if (!isDisabled) {
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
        {loading ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') : (mode === 'signup' ? 'Sign up' : 'Sign in')}
      </button>

      {/* Mode toggle */}
      <p
        style={{
          textAlign: 'center',
          fontSize: '14px',
          color: 'var(--dim)',
          marginTop: '1rem',
          marginBottom: 0,
        }}
      >
        {mode === 'signin' ? (
          <>
            Don&apos;t have an account?{' '}
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null) }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--orange)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null) }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--orange)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  )
}
