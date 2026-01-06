import { apiClient, AxiosError } from "@/lib/api-client";

// --- Request and Response Types ---

export interface KYCStartRequest {
  userId: string;
}

export interface KYCStartResponse {
  success: boolean;
  message: string;
  data?: {
    verification_id: string;
    reference: string;
    verification_url?: string;
  };
}

export interface KYCStatusResponse {
  success: boolean;
  message: string;
  data?: {
    verification_id: string;
    status: string;
    submitted_at?: string;
    reviewed_at?: string;
    is_completed: boolean;
    verification_url?: string;
    decline_reasons?: string;
    verification_details?: any;
    message?: string;
  };
}

export interface KYCHealthResponse {
  success: boolean;
  message: string;
  data?: {
    status: string;
    environment: string;
    timestamp: string;
  };
}

export interface KYCRetryResponse {
  success: boolean;
  message: string;
  data?: {
    verification_id: string;
    reference: string;
    verification_url?: string;
  };
}

// --- API Action Functions ---

/**
 * Start KYC verification process for a given user ID.
 * @param {KYCStartRequest} requestData - The user ID to start verification for.
 */
export async function startKYC(
  requestData: KYCStartRequest
): Promise<KYCStartResponse> {
  try {
    const backendData = {
      user_id: requestData.userId,
    };
    const response = await apiClient.post("/kyc/start", backendData);
    console.log("Start KYC verification response:", response);

    return {
      success: true,
      message:
        response.data.message || "KYC verification started successfully.",
      data: response.data,
    };
  } catch (error) {
    console.error("Start KYC verification error:", error);
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.detail || "Failed to start KYC verification."
        : "An unexpected error occurred.";
    return { success: false, message: errorMessage };
  }
}

/**
 * Get the latest KYC verification status for a user.
 * @param {string} userId - The ID of the user to check.
 */
export async function getKYCStatus(userId: string): Promise<KYCStatusResponse> {
  try {
    const response = await apiClient.get(`/kyc/status/${userId}`);

    return {
      success: true,
      message: "KYC status retrieved successfully.",
      data: response.data,
    };
  } catch (error) {
    console.error("Get KYC status error:", error);
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.detail || "Failed to retrieve KYC status."
        : "An unexpected error occurred.";
    return { success: false, message: errorMessage };
  }
}

/**
 * Start retry KYC verification for a user with retry_pending status.
 * @param {string} userId - The ID of the user to retry verification for.
 */
export async function retryKYC(userId: string): Promise<KYCRetryResponse> {
  try {
    const response = await apiClient.post(`/kyc/retry/${userId}`);
    console.log("Retry KYC verification response:", response);

    return {
      success: true,
      message: response.data.message || "KYC retry started successfully.",
      data: response.data.data,
    };
  } catch (error) {
    console.error("Retry KYC verification error:", error);
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.detail || "Failed to start KYC retry."
        : "An unexpected error occurred.";
    return { success: false, message: errorMessage };
  }
}

/**
 * Check the health of the KYC service.
 */
export async function getKYCHealth(): Promise<KYCHealthResponse> {
  try {
    const response = await apiClient.get("/kyc/health");

    return {
      success: true,
      message: "KYC health status retrieved successfully.",
      data: response.data,
    };
  } catch (error) {
    console.error("Get KYC health error:", error);
    const errorMessage =
      error instanceof AxiosError
        ? error.response?.data?.detail || "Failed to check KYC health."
        : "An unexpected error occurred.";
    return { success: false, message: errorMessage };
  }
}
