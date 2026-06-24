import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'

const IS_PLACEHOLDER = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
const IS_DEV_PREVIEW = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'

export async function updateSession(request: NextRequest) {
  // Skip auth enforcement when running without real Supabase credentials or in dev preview
  if (IS_PLACEHOLDER || IS_DEV_PREVIEW) return NextResponse.next({ request })

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isProtected = request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/clients') ||
    request.nextUrl.pathname.startsWith('/appointments') ||
    request.nextUrl.pathname.startsWith('/services') ||
    request.nextUrl.pathname.startsWith('/staff') ||
    request.nextUrl.pathname.startsWith('/planning') ||
    request.nextUrl.pathname.startsWith('/inventory') ||
    request.nextUrl.pathname.startsWith('/suppliers') ||
    request.nextUrl.pathname.startsWith('/cash') ||
    request.nextUrl.pathname.startsWith('/accounting') ||
    request.nextUrl.pathname.startsWith('/marketing') ||
    request.nextUrl.pathname.startsWith('/reports') ||
    request.nextUrl.pathname.startsWith('/subscriptions') ||
    request.nextUrl.pathname.startsWith('/settings')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
