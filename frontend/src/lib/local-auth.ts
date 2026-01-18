/**
 * Local Authentication System
 * Replaces backend authentication with localStorage-based system
 */

import { UserProfile } from "@/redux/slices/userSlice";

// Default admin credentials
const DEFAULT_ADMIN = {
  id: "admin-001",
  email: "admin@swaphubu.com",
  password: "admin123", // In production, this should be hashed
  first_name: "Admin",
  last_name: "User",
  is_verified: true,
  is_admin: true,
  country: "US",
};

// Storage keys
const STORAGE_KEYS = {
  ADMIN_USERS: "swaphubu_admin_users",
  CURRENT_USER: "swaphubu_current_user",
  AUTH_TOKEN: "swaphubu_auth_token",
} as const;

// Types
export interface AdminUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  is_admin: boolean;
  country: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: UserProfile;
  token?: string;
}

/**
 * Initialize admin users in localStorage if not exists
 */
export function initializeAdminUsers(): void {
  if (typeof window === "undefined") return;

  const existingUsers = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
  if (!existingUsers) {
    const adminUsers = [
      {
        ...DEFAULT_ADMIN,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(adminUsers));
  }
}

/**
 * Get all admin users from localStorage
 */
export function getAdminUsers(): AdminUser[] {
  if (typeof window === "undefined") return [];

  try {
    const users = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error("Error reading admin users:", error);
    return [];
  }
}

/**
 * Find admin user by email
 */
export function findAdminByEmail(email: string): AdminUser | null {
  const users = getAdminUsers();
  return (
    users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ||
    null
  );
}

/**
 * Authenticate admin user
 */
export function authenticateAdmin(email: string, password: string): AuthResult {
  try {
    initializeAdminUsers();

    const user = findAdminByEmail(email);

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Simple password check (in production, use proper hashing)
    if (user.password !== password) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    if (!user.is_admin) {
      return {
        success: false,
        message: "Access denied. Admin privileges required.",
      };
    }

    // Generate a simple token (in production, use JWT or similar)
    const token = generateAuthToken(user.id);

    // Store current user and token
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      is_verified: user.is_verified,
      is_admin: user.is_admin,
      country: user.country,
      kyc_status: user.is_verified ? "verified" : "not_started",
    };

    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify(userProfile)
    );
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

    return {
      success: true,
      message: "Authentication successful",
      user: userProfile,
      token,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      message: "An error occurred during authentication",
    };
  }
}

/**
 * Generate a simple auth token
 */
function generateAuthToken(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${userId}_${timestamp}_${random}`;
}

/**
 * Validate auth token
 */
export function validateAuthToken(token: string): boolean {
  if (!token) return false;

  // Simple validation - check if token has correct format
  const parts = token.split("_");
  if (parts.length !== 3) return false;

  // Check if token is not too old (24 hours)
  const timestamp = parseInt(parts[1]);
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  return now - timestamp < maxAge;
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;

  try {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token || !validateAuthToken(token)) {
      clearAuthData();
      return null;
    }

    const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error getting current user:", error);
    clearAuthData();
    return null;
  }
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return token && validateAuthToken(token) ? token : null;
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Sign out user
 */
export function signOut(): AuthResult {
  clearAuthData();
  return {
    success: true,
    message: "Signed out successfully",
  };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.is_admin === true;
}

/**
 * Add a new admin user (for future use)
 */
export function addAdminUser(
  userData: Omit<AdminUser, "id" | "created_at" | "updated_at">
): AuthResult {
  try {
    const users = getAdminUsers();

    // Check if user already exists
    if (findAdminByEmail(userData.email)) {
      return {
        success: false,
        message: "User with this email already exists",
      };
    }

    const newUser: AdminUser = {
      ...userData,
      id: `admin-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(users));

    return {
      success: true,
      message: "Admin user created successfully",
    };
  } catch (error) {
    console.error("Error adding admin user:", error);
    return {
      success: false,
      message: "Failed to create admin user",
    };
  }
}
