import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 1. Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      if (request.cookies.has('admin_session')) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return NextResponse.next()
    }

    // Check for session cookie
    if (!request.cookies.has('admin_session')) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // 2. Protect API routes (POST/DELETE/PUT) under /api/icons
  if (pathname.startsWith('/api/icons')) {
    if (['POST', 'DELETE', 'PUT'].includes(request.method)) {
      if (!request.cookies.has('admin_session')) {
        return new NextResponse(
          JSON.stringify({ success: false, message: 'Unauthorized' }),
          { status: 401, headers: { 'content-type': 'application/json' } }
        )
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/icons/:path*',
  ],
}
