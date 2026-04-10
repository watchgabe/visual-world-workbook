'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        window.location.href = '/login'
      }
    })
  }, [])

  const passwordTooWeak =
    password.length > 0 &&
    (password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))

  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || passwordTooWeak || password !== confirmPassword) return

    setLoading(true)
    setErrorMessage(null)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      setErrorMessage('Something went wrong. Please try again.')
      return
    }

    setSuccess(true)
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }

  const isDisabled = loading || !password || !confirmPassword || passwordTooWeak || passwordMismatch

  const inputStyle: React.CSSProperties = {
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
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--dim)',
    marginBottom: '6px',
    letterSpacing: '0.03em',
    textTransform: 'uppercase',
  }

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
      <div style={{ maxWidth: '420px', width: '100%' }}>
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

          {/* Heading */}
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
              {success ? 'Password updated' : 'Set new password'}
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--dim)',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {success
                ? 'Redirecting you to the app...'
                : 'Enter your new password below.'}
            </p>
          </div>

          {!success && (
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

              {/* New password */}
              <div style={{ marginBottom: '0.875rem' }}>
                <label htmlFor="password" style={labelStyle}>
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="New password"
                  required
                  autoComplete="new-password"
                  autoFocus
                  minLength={6}
                  style={inputStyle}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--orange-border)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                />
                <p
                  style={{
                    margin: '6px 0 0',
                    fontSize: '12px',
                    color: passwordTooWeak ? 'var(--orange-dark)' : 'var(--dim)',
                    lineHeight: 1.4,
                  }}
                >
                  At least 6 characters, one letter and one number.
                </p>
              </div>

              {/* Confirm password */}
              <div style={{ marginBottom: '0.875rem' }}>
                <label htmlFor="confirmPassword" style={labelStyle}>
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  autoComplete="new-password"
                  minLength={6}
                  style={inputStyle}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--orange-border)'
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                />
                {passwordMismatch && (
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: '12px',
                      color: 'var(--orange-dark)',
                      lineHeight: 1.4,
                    }}
                  >
                    Passwords do not match.
                  </p>
                )}
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
                {loading ? 'Updating password...' : 'Update password'}
              </button>

              <style>{`
                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
