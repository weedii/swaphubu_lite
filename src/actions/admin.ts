import {
  getAllUsers as getLocalUsers,
  getUsers as searchLocalUsers,
  getUserById as getLocalUserById,
  toggleUserBlock,
  getUserStatistics as getLocalUserStatistics,
  getUnverifiedUsers as getLocalUnverifiedUsers,
  getBlockedUsers as getLocalBlockedUsers,
  LocalUser,
  UserList as LocalUserList,
  UserStatistics as LocalUserStatistics,
  UserSearchParams as LocalUserSearchParams,
} from "@/lib/local-users";

// Re-export types for compatibility
export type User = LocalUser;
export type UserList = LocalUserList;
export type UserStatistics = LocalUserStatistics;
export type UserSearchParams = LocalUserSearchParams;

// Additional types for compatibility
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

export interface SystemReports {
  user_growth: Array<{ date: string; count: number }>;
  verification_rate: number;
  countries_distribution: { [key: string]: number };
  daily_active_users: number;
  monthly_active_users: number;
}

// Response wrapper type
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Get all users with pagination and sorting (Local)
 */
export async function getAllUsers(
  params: UserListParams = {}
): Promise<ApiResponse<UserList>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const result = searchLocalUsers({
      page: params.page || 1,
      limit: params.limit || 20,
      sort_by: (params.sort_by as any) || "created_at",
      sort_order: params.sort_order || "desc",
    });

    return {
      success: true,
      message: "Users retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error getting users:", error);
    return {
      success: false,
      message: "Failed to retrieve users",
    };
  }
}

/**
 * Search users with filters (Local)
 */
export async function searchUsers(
  params: UserSearchParams
): Promise<ApiResponse<UserList>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const result = searchLocalUsers(params);

    return {
      success: true,
      message: "Search completed successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error searching users:", error);
    return {
      success: false,
      message: "Search failed",
    };
  }
}

/**
 * Get user by ID (Local)
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    const user = getLocalUserById(id);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    return {
      success: true,
      message: "User retrieved successfully",
      data: user,
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return {
      success: false,
      message: "Failed to retrieve user",
    };
  }
}

/**
 * Update user admin fields (Local - Placeholder)
 */
export async function updateUserAdminFields(
  userId: string,
  updateData: UserUpdateData
): Promise<ApiResponse<User>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 300));

  // For now, return a placeholder response
  // This can be implemented later when needed
  return {
    success: false,
    message: "User editing functionality will be implemented soon",
  };
}

/**
 * Block a user (Local)
 */
export async function blockUser(id: string): Promise<ApiResponse<User>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const user = getLocalUserById(id);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (user.is_blocked) {
      return {
        success: false,
        message: "User is already blocked",
      };
    }

    const updatedUser = toggleUserBlock(id);

    if (!updatedUser) {
      return {
        success: false,
        message: "Failed to block user",
      };
    }

    return {
      success: true,
      message: "User blocked successfully",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error blocking user:", error);
    return {
      success: false,
      message: "Failed to block user",
    };
  }
}

/**
 * Unblock a user (Local)
 */
export async function unblockUser(id: string): Promise<ApiResponse<User>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const user = getLocalUserById(id);

    if (!user) {
      return {
        success: false,
        message: "User not found",
      };
    }

    if (!user.is_blocked) {
      return {
        success: false,
        message: "User is not blocked",
      };
    }

    const updatedUser = toggleUserBlock(id);

    if (!updatedUser) {
      return {
        success: false,
        message: "Failed to unblock user",
      };
    }

    return {
      success: true,
      message: "User unblocked successfully",
      data: updatedUser,
    };
  } catch (error) {
    console.error("Error unblocking user:", error);
    return {
      success: false,
      message: "Failed to unblock user",
    };
  }
}

/**
 * Get user statistics (Local)
 */
export async function getUserStatistics(): Promise<
  ApiResponse<UserStatistics>
> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const stats = getLocalUserStatistics();

    return {
      success: true,
      message: "Statistics retrieved successfully",
      data: stats,
    };
  } catch (error) {
    console.error("Error getting statistics:", error);
    return {
      success: false,
      message: "Failed to retrieve statistics",
    };
  }
}

/**
 * Get system reports (Local - Placeholder)
 */
export async function getSystemReports(
  days: number = 30
): Promise<ApiResponse<SystemReports>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Return placeholder data for now
  return {
    success: true,
    message: "Reports retrieved successfully",
    data: {
      user_growth: [],
      verification_rate: 0,
      countries_distribution: {},
      daily_active_users: 0,
      monthly_active_users: 0,
    },
  };
}

/**
 * Get unverified users (Local)
 */
export async function getUnverifiedUsers(
  daysOld: number = 7,
  page: number = 1,
  limit: number = 5
): Promise<ApiResponse<UserList>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const result = getLocalUnverifiedUsers(daysOld, page, limit);

    return {
      success: true,
      message: "Unverified users retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error getting unverified users:", error);
    return {
      success: false,
      message: "Failed to retrieve unverified users",
    };
  }
}

/**
 * Get blocked users (Local)
 */
export async function getBlockedUsers(
  page: number = 1,
  limit: number = 5
): Promise<ApiResponse<UserList>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const result = getLocalBlockedUsers(page, limit);

    return {
      success: true,
      message: "Blocked users retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error getting blocked users:", error);
    return {
      success: false,
      message: "Failed to retrieve blocked users",
    };
  }
}

/**
 * Get admin users (Local - Placeholder)
 */
export async function getAdminUsers(
  page: number = 1,
  limit: number = 20
): Promise<ApiResponse<UserList>> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const result = searchLocalUsers({
      page,
      limit,
      filter: "admin",
      sort_by: "created_at",
      sort_order: "desc",
    });

    return {
      success: true,
      message: "Admin users retrieved successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error getting admin users:", error);
    return {
      success: false,
      message: "Failed to retrieve admin users",
    };
  }
}
