import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Create a new headers object
  const newHeaders = new Headers(request.headers);
  
  // Remove the vulnerable header if present
  newHeaders.delete('x-middleware-subrequest');
  
  // Continue with your existing middleware logic
  // ...

  // For now, just proceed with the request
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 