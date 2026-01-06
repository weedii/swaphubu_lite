import toast from "react-hot-toast";
import { AxiosError } from "axios";

// --- Error Types ---

export interface AdminError {
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

export interface LoadingState {
  isLoading: boolean;
  error: AdminError | null;
  lastUpdated?: Date;
}

export interface AdminActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: AdminError;
}

// --- Error Classification ---

export enum ErrorType {
  NETWORK = "NETWORK",
  AUTHENTICATION = "AUTHENTICATION",
  AUTHORIZATION = "AUTHORIZATION",
  VALIDATION = "VALIDATION",
  SERVER = "SERVER",
  UNKNOWN = "UNKNOWN",
}

export interface ClassifiedError extends AdminError {
  type: ErrorType;
  isRetryable: boolean;
}

// --- Error Classification Function ---

export function classifyError(error: any): ClassifiedError {
  const timestamp = new Date();

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const message = error.response?.data?.detail || error.message;

    switch (status) {
      case 401:
        return {
          type: ErrorType.AUTHENTICATION,
          message: "Authentication required. Please log in again.",
          code: "AUTH_REQUIRED",
          isRetryable: false,
          timestamp,
        };

      case 403:
        return {
          type: ErrorType.AUTHORIZATION,
          message: "You don't have permission to perform this action.",
          code: "INSUFFICIENT_PERMISSIONS",
          isRetryable: false,
          timestamp,
        };

      case 422:
        return {
          type: ErrorType.VALIDATION,
          message: message || "Invalid data provided.",
          code: "VALIDATION_ERROR",
          details: error.response?.data?.errors,
          isRetryable: false,
          timestamp,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          type: ErrorType.SERVER,
          message: "Server error occurred. Please try again later.",
          code: "SERVER_ERROR",
          isRetryable: true,
          timestamp,
        };

      default:
        if (!status) {
          return {
            type: ErrorType.NETWORK,
            message: "Network error. Please check your connection.",
            code: "NETWORK_ERROR",
            isRetryable: true,
            timestamp,
          };
        }

        return {
          type: ErrorType.UNKNOWN,
          message: message || "An unexpected error occurred.",
          code: "UNKNOWN_ERROR",
          isRetryable: true,
          timestamp,
        };
    }
  }

  return {
    type: ErrorType.UNKNOWN,
    message: error?.message || "An unexpected error occurred.",
    code: "UNKNOWN_ERROR",
    isRetryable: false,
    timestamp,
  };
}

// --- Toast Notification System ---

export class AdminToast {
  private static toastOptions = {
    duration: 4000,
    position: "top-right" as const,
  };

  static success(message: string, options?: any) {
    return toast.success(message, {
      ...this.toastOptions,
      ...options,
      icon: "✅",
    });
  }

  static error(message: string, options?: any) {
    return toast.error(message, {
      ...this.toastOptions,
      duration: 6000, // Longer duration for errors
      ...options,
      icon: "❌",
    });
  }

  static loading(message: string, options?: any) {
    return toast.loading(message, {
      ...this.toastOptions,
      ...options,
    });
  }

  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: any
  ) {
    return toast.promise(promise, messages, {
      ...this.toastOptions,
      ...options,
    });
  }

  static dismiss(toastId?: string) {
    return toast.dismiss(toastId);
  }

  static remove(toastId: string) {
    return toast.remove(toastId);
  }

  // Admin-specific toast methods
  static userActionSuccess(action: string, userName?: string) {
    const message = userName
      ? `${action} completed for ${userName}`
      : `${action} completed successfully`;
    return this.success(message);
  }

  static userActionError(action: string, error: AdminError) {
    const message = `Failed to ${action.toLowerCase()}: ${error.message}`;
    return this.error(message);
  }

  static dataLoadError(dataType: string, error: AdminError) {
    const message = `Failed to load ${dataType}: ${error.message}`;
    return this.error(message);
  }

  static networkError() {
    return this.error(
      "Network error. Please check your connection and try again."
    );
  }

  static authError() {
    return this.error("Authentication required. Please log in again.");
  }

  static permissionError() {
    return this.error("You don't have permission to perform this action.");
  }
}

// --- Loading State Management ---

export class LoadingStateManager {
  private static states = new Map<string, LoadingState>();

  static setLoading(
    key: string,
    isLoading: boolean,
    error?: AdminError | null
  ) {
    const currentState = this.states.get(key) || {
      isLoading: false,
      error: null,
    };

    this.states.set(key, {
      ...currentState,
      isLoading,
      error: error !== undefined ? error : currentState.error,
      lastUpdated: new Date(),
    });
  }

  static setError(key: string, error: AdminError) {
    const currentState = this.states.get(key) || {
      isLoading: false,
      error: null,
    };

    this.states.set(key, {
      ...currentState,
      isLoading: false,
      error,
      lastUpdated: new Date(),
    });
  }

  static clearError(key: string) {
    const currentState = this.states.get(key);
    if (currentState) {
      this.states.set(key, {
        ...currentState,
        error: null,
        lastUpdated: new Date(),
      });
    }
  }

  static getState(key: string): LoadingState {
    return this.states.get(key) || { isLoading: false, error: null };
  }

  static clear(key: string) {
    this.states.delete(key);
  }

  static clearAll() {
    this.states.clear();
  }
}

// --- Error Handler Functions ---

export function handleAdminError(
  error: any,
  context?: string
): ClassifiedError {
  const classifiedError = classifyError(error);

  // Log error for debugging
  console.error(`Admin Error${context ? ` (${context})` : ""}:`, {
    type: classifiedError.type,
    message: classifiedError.message,
    code: classifiedError.code,
    details: classifiedError.details,
    originalError: error,
  });

  return classifiedError;
}

export function handleApiError(error: any, action: string): AdminError {
  const classifiedError = handleAdminError(error, action);

  // Show appropriate toast notification
  switch (classifiedError.type) {
    case ErrorType.AUTHENTICATION:
      AdminToast.authError();
      break;
    case ErrorType.AUTHORIZATION:
      AdminToast.permissionError();
      break;
    case ErrorType.NETWORK:
      AdminToast.networkError();
      break;
    default:
      AdminToast.error(classifiedError.message);
  }

  return classifiedError;
}

// --- Retry Logic ---

export interface RetryOptions {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  retryCondition?: (error: any) => boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 2,
    retryCondition = (error) => classifyError(error).isRetryable,
  } = options;

  let lastError: any;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxAttempts || !retryCondition(error)) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= backoffMultiplier;
    }
  }

  throw lastError;
}

// --- Admin Action Wrapper ---

export async function executeAdminAction<T>(
  action: () => Promise<AdminActionResult<T>>,
  options: {
    loadingKey?: string;
    loadingMessage?: string;
    successMessage?: string;
    errorContext?: string;
    showToast?: boolean;
    retry?: Partial<RetryOptions>;
  } = {}
): Promise<AdminActionResult<T>> {
  const {
    loadingKey,
    loadingMessage,
    successMessage,
    errorContext,
    showToast = true,
    retry,
  } = options;

  // Set loading state
  if (loadingKey) {
    LoadingStateManager.setLoading(loadingKey, true, null);
  }

  // Show loading toast
  let loadingToast: string | undefined;
  if (showToast && loadingMessage) {
    loadingToast = AdminToast.loading(loadingMessage);
  }

  try {
    const operation = retry ? () => withRetry(action, retry) : action;
    const result = await operation();

    // Clear loading state
    if (loadingKey) {
      LoadingStateManager.setLoading(loadingKey, false, null);
    }

    // Dismiss loading toast
    if (loadingToast) {
      AdminToast.dismiss(loadingToast);
    }

    // Show success toast
    if (showToast && result.success && successMessage) {
      AdminToast.success(successMessage);
    }

    return result;
  } catch (error) {
    const adminError = handleAdminError(error, errorContext);

    // Set error state
    if (loadingKey) {
      LoadingStateManager.setError(loadingKey, adminError);
    }

    // Dismiss loading toast
    if (loadingToast) {
      AdminToast.dismiss(loadingToast);
    }

    // Show error toast
    if (showToast) {
      AdminToast.error(adminError.message);
    }

    return {
      success: false,
      error: adminError,
    };
  }
}

// --- Utility Functions ---

export function isNetworkError(error: any): boolean {
  return classifyError(error).type === ErrorType.NETWORK;
}

export function isAuthError(error: any): boolean {
  const type = classifyError(error).type;
  return type === ErrorType.AUTHENTICATION || type === ErrorType.AUTHORIZATION;
}

export function isRetryableError(error: any): boolean {
  return classifyError(error).isRetryable;
}

export function getErrorMessage(error: any): string {
  return classifyError(error).message;
}

// --- React Hook Utilities ---

export function createLoadingState(): LoadingState {
  return { isLoading: false, error: null };
}

export function updateLoadingState(
  state: LoadingState,
  updates: Partial<LoadingState>
): LoadingState {
  return {
    ...state,
    ...updates,
    lastUpdated: new Date(),
  };
}
