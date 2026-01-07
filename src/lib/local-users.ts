/**
 * Local User Management System
 * Manages user data in localStorage for the simplified app
 */

export interface LocalUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  country: string;
  is_verified: boolean;
  is_blocked: boolean;
  is_admin: boolean;
  kyc_status:
    | "not_started"
    | "initiated"
    | "pending"
    | "verified"
    | "declined"
    | "retry_pending"
    | "cancelled"
    | "error";
  created_at: string;
  updated_at: string;
  kyc_data?: any; // Shufti Pro response data
}

export interface UserList {
  users: LocalUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UserStatistics {
  total_users: number;
  verified_users: number;
  unverified_users: number;
  blocked_users: number;
  admin_users: number;
  recent_registrations: number; // Last 7 days
}

export interface UserSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  filter?: "all" | "verified" | "unverified" | "blocked" | "admin";
  sort_by?: "created_at" | "first_name" | "last_name" | "email";
  sort_order?: "asc" | "desc";
}

// Storage key
const USERS_STORAGE_KEY = "swaphubu_users";

/**
 * Initialize with sample users if none exist
 */
export function initializeUsers(): void {
  if (typeof window === "undefined") return;

  const existingUsers = localStorage.getItem(USERS_STORAGE_KEY);
  if (!existingUsers) {
    const sampleUsers: LocalUser[] = [
      {
        id: "user-001",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone_number: "+1234567890",
        country: "US",
        is_verified: true,
        is_blocked: false,
        is_admin: false,
        kyc_status: "verified",
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days ago
        updated_at: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(), // 5 days ago
      },
      {
        id: "user-002",
        first_name: "Jane",
        last_name: "Smith",
        email: "jane.smith@example.com",
        phone_number: "+1234567891",
        country: "CA",
        is_verified: false,
        is_blocked: false,
        is_admin: false,
        kyc_status: "pending",
        created_at: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(), // 10 days ago
        updated_at: new Date(
          Date.now() - 8 * 24 * 60 * 60 * 1000
        ).toISOString(), // 8 days ago
      },
      {
        id: "user-003",
        first_name: "Bob",
        last_name: "Johnson",
        email: "bob.johnson@example.com",
        phone_number: "+1234567892",
        country: "UK",
        is_verified: false,
        is_blocked: true,
        is_admin: false,
        kyc_status: "declined",
        created_at: new Date(
          Date.now() - 15 * 24 * 60 * 60 * 1000
        ).toISOString(), // 15 days ago
        updated_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days ago
      },
      {
        id: "user-004",
        first_name: "Alice",
        last_name: "Brown",
        email: "alice.brown@example.com",
        phone_number: "+1234567893",
        country: "AU",
        is_verified: false,
        is_blocked: false,
        is_admin: false,
        kyc_status: "not_started",
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(), // 2 days ago
        updated_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 day ago
      },
      {
        id: "user-005",
        first_name: "Charlie",
        last_name: "Wilson",
        email: "charlie.wilson@example.com",
        phone_number: "+1234567894",
        country: "DE",
        is_verified: false,
        is_blocked: false,
        is_admin: false,
        kyc_status: "pending",
        created_at: new Date(
          Date.now() - 12 * 24 * 60 * 60 * 1000
        ).toISOString(), // 12 days ago
        updated_at: new Date(
          Date.now() - 9 * 24 * 60 * 60 * 1000
        ).toISOString(), // 9 days ago
      },
    ];

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(sampleUsers));
  }
}

/**
 * Get all users from localStorage
 */
export function getAllUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];

  try {
    initializeUsers();
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
}

/**
 * Save users to localStorage
 */
export function saveUsers(users: LocalUser[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users:", error);
  }
}

/**
 * Get user by ID
 */
export function getUserById(id: string): LocalUser | null {
  const users = getAllUsers();
  return users.find((user) => user.id === id) || null;
}

/**
 * Add a new user
 */
export function addUser(
  userData: Omit<LocalUser, "id" | "created_at" | "updated_at">
): LocalUser {
  const users = getAllUsers();
  const newUser: LocalUser = {
    ...userData,
    id: `user-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

/**
 * Update user
 */
export function updateUser(
  id: string,
  updates: Partial<LocalUser>
): LocalUser | null {
  const users = getAllUsers();
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) return null;

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  saveUsers(users);
  return users[userIndex];
}

/**
 * Block/unblock user
 */
export function toggleUserBlock(id: string): LocalUser | null {
  const users = getAllUsers();
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex === -1) return null;

  users[userIndex].is_blocked = !users[userIndex].is_blocked;
  users[userIndex].updated_at = new Date().toISOString();

  saveUsers(users);
  return users[userIndex];
}

/**
 * Get users with pagination and filtering
 */
export function getUsers(params: UserSearchParams = {}): UserList {
  const {
    page = 1,
    limit = 20,
    search = "",
    filter = "all",
    sort_by = "created_at",
    sort_order = "desc",
  } = params;

  let users = getAllUsers();

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    users = users.filter(
      (user) =>
        user.first_name.toLowerCase().includes(searchLower) ||
        user.last_name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }

  // Apply status filter
  switch (filter) {
    case "verified":
      users = users.filter((user) => user.is_verified);
      break;
    case "unverified":
      users = users.filter((user) => !user.is_verified);
      break;
    case "blocked":
      users = users.filter((user) => user.is_blocked);
      break;
    case "admin":
      users = users.filter((user) => user.is_admin);
      break;
    // "all" - no additional filtering
  }

  // Apply sorting
  users.sort((a, b) => {
    let aValue: any = a[sort_by as keyof LocalUser];
    let bValue: any = b[sort_by as keyof LocalUser];

    // Handle date sorting
    if (sort_by === "created_at" || sort_by === "updated_at") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle string sorting
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sort_order === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Apply pagination
  const total = users.length;
  const total_pages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = users.slice(startIndex, endIndex);

  return {
    users: paginatedUsers,
    total,
    page,
    limit,
    total_pages,
  };
}

/**
 * Get user statistics
 */
export function getUserStatistics(): UserStatistics {
  const users = getAllUsers();
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    total_users: users.length,
    verified_users: users.filter((user) => user.is_verified).length,
    unverified_users: users.filter((user) => !user.is_verified).length,
    blocked_users: users.filter((user) => user.is_blocked).length,
    admin_users: users.filter((user) => user.is_admin).length,
    recent_registrations: users.filter(
      (user) => new Date(user.created_at) > sevenDaysAgo
    ).length,
  };
}

/**
 * Get unverified users (for admin dashboard alerts)
 */
export function getUnverifiedUsers(
  daysOld: number = 7,
  page: number = 1,
  limit: number = 5
): UserList {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  let users = getAllUsers().filter(
    (user) => !user.is_verified && new Date(user.created_at) < cutoffDate
  );

  // Sort by creation date (oldest first)
  users.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const total = users.length;
  const total_pages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = users.slice(startIndex, endIndex);

  return {
    users: paginatedUsers,
    total,
    page,
    limit,
    total_pages,
  };
}

/**
 * Get blocked users
 */
export function getBlockedUsers(page: number = 1, limit: number = 5): UserList {
  let users = getAllUsers().filter((user) => user.is_blocked);

  // Sort by update date (most recent first)
  users.sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const total = users.length;
  const total_pages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = users.slice(startIndex, endIndex);

  return {
    users: paginatedUsers,
    total,
    page,
    limit,
    total_pages,
  };
}
