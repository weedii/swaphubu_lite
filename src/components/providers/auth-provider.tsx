"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { initializeUsers } from "@/lib/local-users";

/**
 * Auth Provider Component
 * Initializes authentication system and user data
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    // Initialize the authentication system and sample data
    initializeUsers();

    // Check current auth status
    checkAuthStatus();
  }, [checkAuthStatus]);

  return <>{children}</>;
}
