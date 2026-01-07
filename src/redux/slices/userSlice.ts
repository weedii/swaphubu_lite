import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// --- Enums and Types ---
export type KYCStatus =
  | "not_started"
  | "initiated"
  | "pending"
  | "verified"
  | "declined"
  | "retry_pending"
  | "cancelled"
  | "error";

// User profile interface based on backend schema
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  is_admin: boolean;
  country: string; // ISO 3166-1 alpha-2 country code
  kyc_status?: KYCStatus;
}

// Auth state interface
export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// User slice with only synchronous reducers
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set user
    setUser: (state, action: PayloadAction<{ user: UserProfile }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      // Initialize kyc_status, it will be fetched later
      if (state.user) {
        state.user.kyc_status = state.user.is_verified
          ? "verified"
          : "not_started";
      }
    },

    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Update KYC status
    updateKycStatus: (state, action: PayloadAction<KYCStatus>) => {
      if (state.user) {
        state.user.kyc_status = action.payload;
        // Also update the primary is_verified flag based on the detailed status
        if (action.payload === "verified") {
          state.user.is_verified = true;
        } else if (action.payload === "declined") {
          state.user.is_verified = false;
        }
      }
    },

    // Logout user
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },

    // Reset auth state
    resetAuthState: () => initialState,
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setUser,
  updateUserProfile,
  updateKycStatus,
  logoutUser,
  resetAuthState,
} = userSlice.actions;

// Export selectors
export const selectUser = (state: { user: AuthState }) => state.user.user;
export const selectIsAuthenticated = (state: { user: AuthState }) =>
  state.user.isAuthenticated;
export const selectIsLoading = (state: { user: AuthState }) =>
  state.user.isLoading;
export const selectError = (state: { user: AuthState }) => state.user.error;
export const selectKycStatus = (state: { user: AuthState }) =>
  state.user.user?.kyc_status;
export const selectIsAdmin = (state: { user: AuthState }) =>
  state.user.user?.is_admin || false;

// Export reducer
export default userSlice.reducer;
