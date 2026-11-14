import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'
import { canAccess, getDefaultRoute, type UserRole } from '@/lib/roles'

export async function updateSession(request: NextRequest) {
  const IS_PLACEHOLDER = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
  const IS_DEV_PREVIEW = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_BYPASS === 'true'
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
  const role = ((user?.user_metadata?.role as UserRole) ?? 'admin')

  // Tout est protégé sauf ces chemins publics (connexion, kiosque client, ping).
  const PUBLIC_PATHS = ['/login', '/kiosque', '/api/ping']
  const path = request.nextUrl.pathname
  const isPublic = PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'))
  const isProtected = !isPublic

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = getDefaultRoute(role)
    return NextResponse.redirect(url)
  }

  if (user && isProtected) {
    if (!canAccess(role, request.nextUrl.pathname)) {
      const url = request.nextUrl.clone()
      url.pathname = getDefaultRoute(role)
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
