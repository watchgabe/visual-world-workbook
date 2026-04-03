import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Control auth state via these objects
const authState = {
  user: null as {
    id: string
    app_metadata?: { role?: string }
  } | null,
}

const deleteUserMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: {
        getUser: vi.fn(() =>
          Promise.resolve({ data: { user: authState.user } })
        ),
      },
    })
  ),
}))

vi.mock('@/lib/admin/service-client', () => ({
  createServiceClient: vi.fn(() => ({
    auth: {
      admin: {
        deleteUser: deleteUserMock,
      },
    },
  })),
}))

describe('POST /api/admin/delete-user', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: logged-in admin
    authState.user = { id: 'admin-user', app_metadata: { role: 'admin' } }
    deleteUserMock.mockResolvedValue({ error: null })
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key')
  })

  it('returns 401 when no auth session', async () => {
    authState.user = null

    const { POST } = await import('@/app/api/admin/delete-user/route')
    const request = new NextRequest(
      'http://localhost:3000/api/admin/delete-user',
      {
        method: 'POST',
        body: JSON.stringify({ userId: 'some-user-id' }),
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 403 when authenticated user is not admin', async () => {
    authState.user = { id: 'regular-user', app_metadata: { role: 'user' } }

    const { POST } = await import('@/app/api/admin/delete-user/route')
    const request = new NextRequest(
      'http://localhost:3000/api/admin/delete-user',
      {
        method: 'POST',
        body: JSON.stringify({ userId: 'some-user-id' }),
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(403)
    expect(data).toEqual({ error: 'Forbidden' })
  })

  it('calls deleteUser and returns { ok: true } for admin with valid userId', async () => {
    const { POST } = await import('@/app/api/admin/delete-user/route')
    const request = new NextRequest(
      'http://localhost:3000/api/admin/delete-user',
      {
        method: 'POST',
        body: JSON.stringify({ userId: 'target-user-id' }),
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true })
    expect(deleteUserMock).toHaveBeenCalledWith('target-user-id')
  })

  it('returns 400 when userId is missing from body', async () => {
    const { POST } = await import('@/app/api/admin/delete-user/route')
    const request = new NextRequest(
      'http://localhost:3000/api/admin/delete-user',
      {
        method: 'POST',
        body: JSON.stringify({}),
        headers: { 'Content-Type': 'application/json' },
      }
    )

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'userId required' })
  })
})
