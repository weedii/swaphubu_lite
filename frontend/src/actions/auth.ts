import { authenticateAdmin, signOut as localSignOut } from "@/lib/local-auth";

// Types for authentication
export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  country: string; // ISO 3166-1 alpha-2 country code
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    is_admin: boolean;
    country: string; // ISO 3166-1 alpha-2 country code
  };
}

export interface SignOutResponse {
  success: boolean;
  message: string;
}

/**
 * Sign in a user with email and password (Local Authentication)
 */
export async function signIn(
  credentials: SignInCredentials
): Promise<AuthResponse> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result = authenticateAdmin(credentials.email, credentials.password);

  return {
    success: result.success,
    message: result.message,
    user: result.user,
    token: result.token,
  };
}

/**
 * Sign up a new user (Disabled for admin-only system)
 */
export async function signUp(userData: SignUpData): Promise<AuthResponse> {
  // For now, disable signup since we only need admin authentication
  return {
    success: false,
    message:
      "User registration is currently disabled. Please contact an administrator.",
  };
}

export async function signOut(): Promise<SignOutResponse> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  const result = localSignOut();

  return {
    success: result.success,
    message: result.message,
  };
}

/**
 * Send a password reset email (Disabled for local auth)
 */
export async function forgotPassword(email: string): Promise<AuthResponse> {
  return {
    success: false,
    message:
      "Password reset is not available. Please contact an administrator.",
  };
}

/**
 * Verify reset code (Disabled for local auth)
 */
export async function verifyResetCode(
  email: string,
  code: string
): Promise<AuthResponse> {
  return {
    success: false,
    message:
      "Password reset is not available. Please contact an administrator.",
  };
}

/**
 * Reset password after code verification (Disabled for local auth)
 */
export async function resetPassword(
  email: string,
  newPassword: string,
  confirmPassword: string
): Promise<AuthResponse> {
  return {
    success: false,
    message:
      "Password reset is not available. Please contact an administrator.",
  };
}
