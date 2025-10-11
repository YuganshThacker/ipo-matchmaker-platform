import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user is trying to access protected routes
  if (pathname.startsWith("/dashboard")) {
    // Since we're using localStorage for tokens, we can't check auth in middleware
    // The auth check will happen on the client side in the AuthProvider
    // For now, let the request through and let the client handle redirects
    return NextResponse.next()
  }

  // Don't redirect auth pages in middleware since we can't access localStorage
  // Let the client-side auth context handle the redirects
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
