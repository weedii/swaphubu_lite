import { apiClient, AxiosError } from "@/lib/api-client";

// --- Request and Response Types ---

export interface UpdateUserProfileRequest {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  country?: string; // ISO 3166-1 alpha-2 country code
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    is_verified: boolean;
    role: string;
    country: string; // ISO 3166-1 alpha-2 country code
  };
}

export interface DeleteUserAccountResponse {
  success: boolean;
  message: string;
}

// --- API Action Functions ---

/**
 * Update user profile information
 * @param {UpdateUserProfileRequest} userData - The user data to update
 */
export async function updateUserProfile(
  userData: UpdateUserProfileRequest
): Promise<UpdateUserProfileResponse> {
  try {
    const response = await apiClient.put("/users/update", userData);

    return {
      success: true,
      message: "Profile updated successfully",
      user: response.data,
    };
  } catch (error) {
    console.error("Update user profile error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to update profile",
      };
    }

    return {
      success: false,
      message: "An error occurred while updating profile",
    };
  }
}

/**
 * Delete user account (soft delete)
 */
export async function deleteUserAccount(): Promise<DeleteUserAccountResponse> {
  try {
    const response = await apiClient.delete("/users/delete");

    return {
      success: true,
      message: response.data.message || "Account deleted successfully",
    };
  } catch (error) {
    console.error("Delete user account error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to delete account",
      };
    }

    return {
      success: false,
      message: "An error occurred while deleting account",
    };
  }
}
