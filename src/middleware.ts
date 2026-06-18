import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'zenspa_session'
const PROTECTED = ['/dashboard', '/clients', '/appointments', '/services']

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  const session = request.cookies.get(SESSION_COOKIE)?.value
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))

  // Route protégée sans session -> login
  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Déjà connecté et sur /login -> dashboard
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/clients/:path*', '/appointments/:path*', '/services/:path*', '/login'],
}
