import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const errorParam = searchParams.get('error')

  // Handle Supabase auth errors (expired/used/invalid link)
  if (errorParam) {
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'link_expired')
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(new URL(next, origin))
    }

    // Exchange failed (expired, already used)
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', 'link_expired')
    return NextResponse.redirect(loginUrl)
  }

  // No code and no error — malformed callback URL
  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('error', 'unknown')
  return NextResponse.redirect(loginUrl)
}
