import { apiClient, AxiosError } from "@/lib/api-client";

// --- Types for Admin API ---

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  country?: string;
  is_verified: boolean;
  is_blocked: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserList {
  users: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UserSearchParams {
  search_term?: string;
  country?: string;
  is_verified?: boolean;
  is_blocked?: boolean;
  is_admin?: boolean;
  registration_start?: string;
  registration_end?: string;
  page?: number;
  limit?: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  country?: string;
  is_verified?: boolean;
  is_blocked?: boolean;
  is_admin?: boolean;
}

export interface UserStatistics {
  total_users: number;
  verified_users: number;
  unverified_users: number;
  blocked_users: number;
  admin_users: number;
  recent_registrations: number;
  users_by_country: { [key: string]: number };
  monthly_registrations: Array<{ month: string; count: number }>;
}

export interface SystemReports {
  user_growth: Array<{ date: string; count: number }>;
  verification_rate: number;
  countries_distribution: { [key: string]: number };
  daily_active_users: number;
  monthly_active_users: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

// --- API Action Functions ---

/**
 * Get all users with pagination and sorting
 */
export async function getAllUsers(
  params: UserListParams = {}
): Promise<ApiResponse<UserList>> {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await apiClient.get(
      `/admin/users?${queryParams.toString()}`
    );

    return {
      success: true,
      message: "Users fetched successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Get all users error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to fetch users",
      };
    }

    return {
      success: false,
      message: "An error occurred while fetching users",
    };
  }
}

/**
 * Search users with advanced filtering
 */
export async function searchUsers(
  params: UserSearchParams
): Promise<ApiResponse<UserList>> {
  try {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    const response = await apiClient.get(
      `/admin/users/search?${queryParams.toString()}`
    );

    return {
      success: true,
      message: "Search completed successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Search users error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to search users",
      };
    }

    return {
      success: false,
      message: "An error occurred while searching users",
    };
  }
}

/**
 * Get user details by ID
 */
export async function getUserById(userId: string): Promise<ApiResponse<User>> {
  try {
    const response = await apiClient.put("/admin/users/get-by-id", {
      user_id: userId,
    });

    return {
      success: true,
      message: "User details fetched successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Get user by ID error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to fetch user details",
      };
    }

    return {
      success: false,
      message: "An error occurred while fetching user details",
    };
  }
}

/**
 * Update user admin fields
 */
export async function updateUserAdminFields(
  userId: string,
  updateData: UserUpdateData
): Promise<ApiResponse<User>> {
  try {
    const response = await apiClient.put(`/admin/users/${userId}`, updateData);

    return {
      success: true,
      message: "User updated successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Update user error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to update user",
      };
    }

    return {
      success: false,
      message: "An error occurred while updating user",
    };
  }
}

/**
 * Block a user account
 */
export async function blockUser(userId: string): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.post("/admin/users/block", {
      user_id: userId,
    });

    return {
      success: true,
      message: response.data.message || "User blocked successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Block user error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to block user",
      };
    }

    return {
      success: false,
      message: "An error occurred while blocking user",
    };
  }
}

/**
 * Unblock a user account
 */
export async function unblockUser(userId: string): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.post("/admin/users/unblock", {
      user_id: userId,
    });

    return {
      success: true,
      message: response.data.message || "User unblocked successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Unblock user error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to unblock user",
      };
    }

    return {
      success: false,
      message: "An error occurred while unblocking user",
    };
  }
}

/**
 * Get user statistics
 */
export async function getUserStatistics(): Promise<
  ApiResponse<UserStatistics>
> {
  try {
    const response = await apiClient.get("/admin/statistics");

    return {
      success: true,
      message: "Statistics fetched successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Get statistics error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to fetch statistics",
      };
    }

    return {
      success: false,
      message: "An error occurred while fetching statistics",
    };
  }
}

/**
 * Get system reports
 */
export async function getSystemReports(
  days: number = 30
): Promise<ApiResponse<SystemReports>> {
  try {
    const response = await apiClient.get(`/admin/reports?days=${days}`);

    return {
      success: true,
      message: "Reports fetched successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Get reports error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to fetch reports",
      };
    }

    return {
      success: false,
      message: "An error occurred while fetching reports",
    };
  }
}

/**
 * Get unverified users
 */
export async function getUnverifiedUsers(
  daysOld: number = 7,
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<UserList>> {
  try {
    const response = await apiClient.get(
      `/admin/users/unverified?days_old=${daysOld}&page=${page}&limit=${limit}`
    );

    return {
      success: true,
      message: "Unverified users fetched successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Get unverified users error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message:
          error.response?.data?.detail || "Failed to fetch unverified users",
      };
    }

    return {
      success: false,
      message: "An error occurred while fetching unverified users",
    };
  }
}

/**
 * Get blocked users
 */
export async function getBlockedUsers(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<UserList>> {
  try {
    const response = await apiClient.get(
      `/admin/users/blocked?page=${page}&limit=${limit}`
    );

    return {
      success: true,
      message: "Blocked users fetched successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Get blocked users error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message:
          error.response?.data?.detail || "Failed to fetch blocked users",
      };
    }

    return {
      success: false,
      message: "An error occurred while fetching blocked users",
    };
  }
}

/**
 * Get admin users
 */
export async function getAdminUsers(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<UserList>> {
  try {
    const response = await apiClient.get(
      `/admin/users/admins?page=${page}&limit=${limit}`
    );

    return {
      success: true,
      message: "Admin users fetched successfully",
      data: response.data,
    };
  } catch (error) {
    console.error("Get admin users error:", error);

    if (error instanceof AxiosError) {
      return {
        success: false,
        message: error.response?.data?.detail || "Failed to fetch admin users",
      };
    }

    return {
      success: false,
      message: "An error occurred while fetching admin users",
    };
  }
}
