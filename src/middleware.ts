import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname
  const loginUrl = new URL('/login', req.url)
  const dashboardUrl = new URL('/dashboard', req.url)

  if (!token) {
    return NextResponse.redirect(loginUrl)
  }

  const role = token.role as string

  if (path.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(dashboardUrl)
  }
  if (path.startsWith('/pimpinan') && role !== 'PIMPINAN' && role !== 'ADMIN') {
    return NextResponse.redirect(dashboardUrl)
  }
  if (path.startsWith('/staf') && role !== 'STAF') {
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/pimpinan/:path*',
    '/staf/:path*',
    '/dashboard/:path*',
    '/absensi/:path*',
  ],
}
