import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  getAuthToken as getLocalAuthToken,
  isAuthenticated as checkLocalAuth,
  isAdmin as checkLocalAdmin,
} from "@/lib/local-auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Authentication utilities (Updated for local auth)
export const getAuthToken = (): string | null => {
  return getLocalAuthToken();
};

export const setAuthToken = (token: string, expires: number = 7): void => {
  // For local auth, token is managed in localStorage
  // This function is kept for compatibility but doesn't use cookies
  console.log("Token management is handled by local auth system");
};

export const removeAuthToken = (): void => {
  // For local auth, token removal is handled by clearAuthData
  console.log("Token removal is handled by local auth system");
};

export const isAuthenticated = (): boolean => {
  return checkLocalAuth();
};

// Admin role utilities
export const isUserAdmin = (user: any): boolean => {
  if (user?.is_admin === true) return true;
  // Also check current local auth state
  return checkLocalAdmin();
};
