import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Control auth state via this object so tests can toggle it
const authState = { user: { id: 'test-user' } as { id: string } | null }

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

describe('POST /api/claude', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset auth to logged-in state
    authState.user = { id: 'test-user' }
    // Mock global fetch to intercept edge function calls
    mockFetch = vi.fn()
    global.fetch = mockFetch
    // Stub environment variables
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 401 JSON when no auth session', async () => {
    authState.user = null

    const { POST } = await import('@/app/api/claude/route')
    const request = new NextRequest('http://localhost:3000/api/claude', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toEqual({ error: 'Unauthorized' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns 400 JSON when body is invalid JSON', async () => {
    const { POST } = await import('@/app/api/claude/route')
    const request = new NextRequest('http://localhost:3000/api/claude', {
      method: 'POST',
      body: 'this is not json',
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toEqual({ error: 'Invalid JSON body' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns 413 JSON when body exceeds 50,000 chars', async () => {
    const { POST } = await import('@/app/api/claude/route')
    const request = new NextRequest('http://localhost:3000/api/claude', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'x'.repeat(50_001) }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(413)
    expect(data).toEqual({ error: 'Request body too large' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('forwards request to claude-proxy edge function and returns response', async () => {
    const edgeResponse = { text: 'Generated content from Claude' }
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(edgeResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const { POST } = await import('@/app/api/claude/route')
    const request = new NextRequest('http://localhost:3000/api/claude', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test prompt' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(edgeResponse)

    // Verify fetch was called with correct URL and auth header
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toMatch(/\/functions\/v1\/claude-proxy$/)
    expect(options.headers['Authorization']).toBe(
      'Bearer test-service-role-key'
    )
  })

  it('returns 502 JSON when edge function fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network failure'))

    const { POST } = await import('@/app/api/claude/route')
    const request = new NextRequest('http://localhost:3000/api/claude', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'test' }),
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(502)
    expect(data).toEqual({ error: 'Service unavailable' })
  })
})
