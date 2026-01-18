"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/utils";

// Public routes that don't require authentication
const publicRoutes = [
  "/signin",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/landing-page",
];

interface AuthCheckProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Component that checks authentication status and redirects accordingly
 * @param requireAuth - If true, redirects to signin if not authenticated
 *                    - If false, redirects to home if authenticated
 */
export function AuthCheck({ children, requireAuth = false }: AuthCheckProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuth = isAuthenticated();

  useEffect(() => {
    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuth) {
      router.push(`/signin?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // If user is authenticated but on a public route
    if (isAuth && publicRoutes.includes(pathname)) {
      router.push("/");
      return;
    }
  }, [isAuth, pathname, requireAuth, router]);

  return <>{children}</>;
}
