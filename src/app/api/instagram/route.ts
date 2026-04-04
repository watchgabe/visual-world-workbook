import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ''
const RAPIDAPI_HOST = 'instagram-scraper-stable-api.p.rapidapi.com'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, handle } = (await request.json()) as { action: string; handle: string }
    if (!handle || typeof handle !== 'string') {
      return NextResponse.json({ error: 'handle required' }, { status: 400 })
    }

    if (!RAPIDAPI_KEY) {
      return NextResponse.json({ error: 'Instagram API not configured' }, { status: 503 })
    }

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY,
    }

    if (action === 'profile') {
      const res = await fetch(
        `https://${RAPIDAPI_HOST}/ig_get_fb_profile_v3.php`,
        {
          method: 'POST',
          headers,
          body: `username_or_url=${encodeURIComponent('https://www.instagram.com/' + handle.replace(/^@/, '') + '/')}`,
        }
      )
      const data = await res.json()
      return NextResponse.json(data)
    }

    if (action === 'feed') {
      const res = await fetch(
        `https://${RAPIDAPI_HOST}/get_ig_user_posts.php`,
        {
          method: 'POST',
          headers,
          body: `username_or_url=${encodeURIComponent('https://www.instagram.com/' + handle.replace(/^@/, '') + '/')}&amount=12`,
        }
      )
      const data = await res.json()
      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('[/api/instagram] error:', err)
    return NextResponse.json({ error: 'Service unavailable' }, { status: 502 })
  }
}
