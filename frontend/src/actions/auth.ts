import { apiClient, AxiosError } from "@/lib/api-client";

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
 * Sign in a user with email and password
 */
export async function signIn(
  credentials: SignInCredentials
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post("/auth/login", credentials);

    return {
      success: true,
      message: "Signed in successfully",
      user: response.data,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to sign in",
      };
    }

    return {
      success: false,
      message: "An error occurred during sign in",
    };
  }
}

/**
 * Sign up a new user
 */
export async function signUp(userData: SignUpData): Promise<AuthResponse> {
  try {
    // Transform frontend field names to backend field names
    const backendData = {
      email: userData.email,
      password: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone_number: userData.phoneNumber,
      country: userData.country,
    };

    const response = await apiClient.post("/auth/register", backendData);

    return {
      success: true,
      message: "Account created successfully",
      user: response.data,
    };
  } catch (error) {
    console.error("Sign up error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to create account",
      };
    }

    return {
      success: false,
      message: "An error occurred during sign up",
    };
  }
}

export async function signOut(): Promise<SignOutResponse> {
  try {
    const response = await apiClient.get("/auth/logout");

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      success: false,
      message: "An error occurred while signing out",
    };
  }
}

/**
 * Send a password reset email
 */
export async function forgotPassword(email: string): Promise<AuthResponse> {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });

    return {
      success: true,
      message:
        response.data.message || "Password reset email sent successfully",
    };
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to send reset email",
      };
    }

    return {
      success: false,
      message: "An error occurred while sending reset email",
    };
  }
}

/**
 * Verify reset code
 */
export async function verifyResetCode(
  email: string,
  code: string
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post("/auth/verify-reset-code", {
      email,
      code,
    });

    return {
      success: true,
      message: response.data.message || "Reset code verified successfully",
    };
  } catch (error) {
    console.error("Verify reset code error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Invalid or expired code",
      };
    }

    return {
      success: false,
      message: "An error occurred while verifying code",
    };
  }
}

/**
 * Reset password after code verification
 */
export async function resetPassword(
  email: string,
  newPassword: string,
  confirmPassword: string
): Promise<AuthResponse> {
  try {
    const response = await apiClient.post("/auth/reset-password", {
      email,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });

    return {
      success: true,
      message: response.data.message || "Password reset successfully",
    };
  } catch (error) {
    console.error("Reset password error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to reset password",
      };
    }

    return {
      success: false,
      message: "An error occurred while resetting password",
    };
  }
}
