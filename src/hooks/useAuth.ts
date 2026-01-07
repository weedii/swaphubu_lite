/**
 * Authentication Hook
 * Manages authentication state and provides auth-related functions
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  setUser,
  logoutUser,
  selectIsAuthenticated,
  selectUser,
  selectIsAdmin,
} from "@/redux/slices/userSlice";
import {
  getCurrentUser,
  initializeAdminUsers,
  clearAuthData,
  isAuthenticated as checkAuth,
  isAdmin as checkAdmin,
} from "@/lib/local-auth";

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isAdmin = useAppSelector(selectIsAdmin);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAdminUsers();

    const currentUser = getCurrentUser();
    if (currentUser) {
      dispatch(setUser({ user: currentUser }));
    }
  }, [dispatch]);

  // Auth functions
  const logout = () => {
    clearAuthData();
    dispatch(logoutUser());
    router.push("/signin");
  };

  const checkAuthStatus = () => {
    const currentUser = getCurrentUser();
    if (!currentUser && isAuthenticated) {
      // User was logged out externally, update state
      dispatch(logoutUser());
      return false;
    }
    return !!currentUser;
  };

  const requireAuth = (redirectTo: string = "/signin") => {
    if (!checkAuthStatus()) {
      router.push(redirectTo);
      return false;
    }
    return true;
  };

  const requireAdmin = (redirectTo: string = "/signin") => {
    if (!checkAuthStatus()) {
      router.push(redirectTo);
      return false;
    }

    if (!checkAdmin()) {
      router.push("/"); // Redirect to home if not admin
      return false;
    }

    return true;
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    logout,
    checkAuthStatus,
    requireAuth,
    requireAdmin,
  };
}
