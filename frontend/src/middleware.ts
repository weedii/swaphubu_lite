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
const publicRoutes: string[] = ["/"];

// Define admin routes that require admin authentication
const adminRoutes: string[] = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token");

  // Check if the user is authenticated
  const isAuthenticated = !!accessToken;

  // Check if the route is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // If pathname is an auth route and user is authenticated, redirect to "/home"
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If pathname is "/" and user is authenticated, redirect to "/home"
  if (pathname === "/" && isAuthenticated) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If accessing admin routes without authentication, redirect to signin
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  // If pathname is not a private route and user is not authenticated, redirect to "/signin"
  if (
    !publicRoutes.includes(pathname) &&
    !authRoutes.includes(pathname) &&
    !isAdminRoute &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

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
