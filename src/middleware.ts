import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define auth routes (signin, signup, etc.)
const authRoutes: string[] = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

// Define public routes that don't require authentication
// const publicRoutes: string[] = ["/", "/landing-page"];
const publicRoutes: string[] = ["/"];

// Define admin routes that require admin authentication
const adminRoutes: string[] = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Force redirect to "/" for any route that's not "/"
  if (pathname !== "/") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // For local auth, we'll check authentication on the client side
  // Middleware will only handle basic routing logic

  // Allow access to public routes
  // if (
  //   publicRoutes.some(
  //     (route) => pathname === route || pathname.startsWith(route)
  //   )
  // ) {
  //   return NextResponse.next();
  // }

  // Allow access to auth routes
  // if (
  //   authRoutes.some((route) => pathname === route || pathname.startsWith(route))
  // ) {
  //   return NextResponse.next();
  // }

  // Allow access to admin routes (authentication will be checked client-side)
  // if (adminRoutes.some((route) => pathname.startsWith(route))) {
  //   return NextResponse.next();
  // }

  return NextResponse.next();
}

// Configure matcher for the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - static assets (images, videos, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|mov|avi|mkv|wmv|flv|m4v|3gp|ogv)$).*)",
  ],
};
