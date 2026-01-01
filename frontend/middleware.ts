import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";

export function middleware(request: NextRequest) {
  // Start Sentry transaction for performance monitoring
  const transaction = Sentry.startSpan(
    {
      name: `${request.method} ${request.nextUrl.pathname}`,
      op: "http.server",
    },
    () => {
      // Add security headers
      const response = NextResponse.next();

      response.headers.set("X-DNS-Prefetch-Control", "on");
      response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
      response.headers.set("X-Frame-Options", "SAMEORIGIN");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("X-XSS-Protection", "1; mode=block");
      response.headers.set("Referrer-Policy", "origin-when-cross-origin");

      // Add request ID for tracing
      const requestId = crypto.randomUUID();
      response.headers.set("X-Request-ID", requestId);

      return response;
    }
  );

  return transaction as NextResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};



