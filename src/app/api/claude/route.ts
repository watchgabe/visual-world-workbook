import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const MAX_BODY_CHARS = 10_000_000

export async function POST(request: NextRequest) {
  try {
    // Auth guard — getUser() revalidates JWT (Phase 2 decision)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    // Size guard per D-05
    const bodyStr = JSON.stringify(body)
    if (bodyStr.length > MAX_BODY_CHARS) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      )
    }

    // Forward to edge function — thin proxy per D-04
    const edgeUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/claude-proxy`
    const edgeRes = await fetch(edgeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: bodyStr,
    })
    const data = await edgeRes.json()
    return NextResponse.json(data, { status: edgeRes.status })
  } catch (err) {
    console.error('[/api/claude] error:', err)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 502 })
  }
}
