import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  AdminError,
  LoadingState,
  AdminActionResult,
  executeAdminAction,
  LoadingStateManager,
  AdminToast,
  handleAdminError,
  createLoadingState,
  updateLoadingState,
} from "@/lib/admin-error-handler";

// --- Hook Types ---

export interface UseAdminErrorOptions {
  key?: string;
  showToast?: boolean;
  autoRetry?: boolean;
  maxRetries?: number;
}

export interface UseAdminErrorReturn {
  loading: LoadingState;
  setLoading: (isLoading: boolean) => void;
  setError: (error: AdminError | null) => void;
  clearError: () => void;
  executeAction: <T>(
    action: () => Promise<AdminActionResult<T>>,
    options?: {
      loadingMessage?: string;
      successMessage?: string;
      errorContext?: string;
    }
  ) => Promise<AdminActionResult<T>>;
  handleError: (error: any, context?: string) => AdminError;
  isLoading: boolean;
  error: AdminError | null;
  hasError: boolean;
}

// --- Main Hook ---

export function useAdminError(
  options: UseAdminErrorOptions = {}
): UseAdminErrorReturn {
  const { key, showToast = true, autoRetry = false, maxRetries = 3 } = options;

  const [loading, setLoadingState] = useState<LoadingState>(
    createLoadingState()
  );
  const retryCountRef = useRef<number>(0);
  const keyRef = useRef<string>(
    key || `admin-error-${Date.now()}-${Math.random()}`
  );

  // Store options in refs to avoid recreating functions
  const optionsRef = useRef({ showToast, autoRetry, maxRetries });
  optionsRef.current = { showToast, autoRetry, maxRetries };

  // Sync with global loading state manager if key is provided
  useEffect(() => {
    if (keyRef.current) {
      const globalState = LoadingStateManager.getState(keyRef.current);
      if (globalState.lastUpdated) {
        setLoadingState((prevState) => {
          // Only update if the global state is newer
          if (
            !prevState.lastUpdated ||
            globalState.lastUpdated! > prevState.lastUpdated
          ) {
            return globalState;
          }
          return prevState;
        });
      }
    }
  }, []); // Empty dependency array - only run once on mount

  const setLoading = useCallback(
    (isLoading: boolean) => {
      setLoadingState((prevState) => {
        const newState = updateLoadingState(prevState, {
          isLoading,
          error: null,
        });

        if (keyRef.current) {
          LoadingStateManager.setLoading(keyRef.current, isLoading, null);
        }

        return newState;
      });
    },
    [] // No dependencies - use keyRef for stable function
  );

  const setError = useCallback(
    (error: AdminError | null) => {
      setLoadingState((prevState) => {
        const newState = updateLoadingState(prevState, {
          isLoading: false,
          error,
        });

        if (keyRef.current && error) {
          LoadingStateManager.setError(keyRef.current, error);
        } else if (keyRef.current && !error) {
          LoadingStateManager.clearError(keyRef.current);
        }

        return newState;
      });
    },
    [] // No dependencies - use keyRef for stable function
  );

  const clearError = useCallback(() => {
    setError(null);
    retryCountRef.current = 0;
  }, [setError]);

  const handleError = useCallback(
    (error: any, context?: string): AdminError => {
      const adminError = handleAdminError(error, context);
      setError(adminError);
      return adminError;
    },
    [setError]
  );

  const executeAction = useCallback(
    async <T>(
      action: () => Promise<AdminActionResult<T>>,
      actionOptions: {
        loadingMessage?: string;
        successMessage?: string;
        errorContext?: string;
      } = {}
    ): Promise<AdminActionResult<T>> => {
      const { loadingMessage, successMessage, errorContext } = actionOptions;
      const { showToast, autoRetry, maxRetries } = optionsRef.current;

      return executeAdminAction(action, {
        loadingKey: keyRef.current,
        loadingMessage,
        successMessage,
        errorContext,
        showToast,
        retry: autoRetry
          ? {
              maxAttempts: maxRetries,
              retryCondition: (error) => {
                const classified = handleAdminError(error);
                return (
                  classified.isRetryable && retryCountRef.current < maxRetries
                );
              },
            }
          : undefined,
      });
    },
    [] // No dependencies - use refs for stable function
  );

  return useMemo(
    () => ({
      loading,
      setLoading,
      setError,
      clearError,
      executeAction,
      handleError,
      isLoading: loading.isLoading,
      error: loading.error,
      hasError: !!loading.error,
    }),
    [loading, setLoading, setError, clearError, executeAction, handleError]
  );
}

// --- Specialized Hooks ---

export function useAdminUserActions() {
  const errorHandler = useAdminError({
    key: "admin-user-actions",
    showToast: true,
  });

  const blockUser = useCallback(
    async (userId: string, userName?: string) => {
      return errorHandler.executeAction(
        async () => {
          const { blockUser: blockUserAction } = await import(
            "@/actions/admin"
          );
          const result = await blockUserAction(userId);
          return result;
        },
        {
          loadingMessage: `Blocking user${userName ? ` ${userName}` : ""}...`,
          successMessage: `User${
            userName ? ` ${userName}` : ""
          } blocked successfully`,
          errorContext: "block user",
        }
      );
    },
    [errorHandler]
  );

  const unblockUser = useCallback(
    async (userId: string, userName?: string) => {
      return errorHandler.executeAction(
        async () => {
          const { unblockUser: unblockUserAction } = await import(
            "@/actions/admin"
          );
          const result = await unblockUserAction(userId);
          return result;
        },
        {
          loadingMessage: `Unblocking user${userName ? ` ${userName}` : ""}...`,
          successMessage: `User${
            userName ? ` ${userName}` : ""
          } unblocked successfully`,
          errorContext: "unblock user",
        }
      );
    },
    [errorHandler]
  );

  const updateUser = useCallback(
    async (userId: string, updateData: any, userName?: string) => {
      return errorHandler.executeAction(
        async () => {
          const { updateUserAdminFields } = await import("@/actions/admin");
          const result = await updateUserAdminFields(userId, updateData);
          // Result already has correct format
          return {
            success: result.success,
            data: result.data,
            message: result.message,
          };
        },
        {
          loadingMessage: `Updating user${userName ? ` ${userName}` : ""}...`,
          successMessage: `User${
            userName ? ` ${userName}` : ""
          } updated successfully`,
          errorContext: "update user",
        }
      );
    },
    [errorHandler]
  );

  return {
    ...errorHandler,
    blockUser,
    unblockUser,
    updateUser,
  };
}

export function useAdminDataLoader<T>(
  key: string,
  loadFunction: () => Promise<AdminActionResult<T>>,
  dependencies: any[] = []
) {
  const errorHandler = useAdminError({ key, showToast: false });
  const [data, setData] = useState<T | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadData = useCallback(
    async (showLoadingToast = false) => {
      const result = await errorHandler.executeAction(loadFunction, {
        loadingMessage: showLoadingToast ? "Loading data..." : undefined,
        errorContext: `load ${key}`,
      });

      if (result.success && result.data) {
        setData(result.data);
      }

      if (isInitialLoad) {
        setIsInitialLoad(false);
      }

      return result;
    },
    [errorHandler, loadFunction, key, isInitialLoad]
  );

  const refreshData = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  // Auto-load on mount and dependency changes
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadData, ...dependencies]);

  return {
    data,
    loading: errorHandler.loading,
    isLoading: errorHandler.isLoading,
    error: errorHandler.error,
    hasError: errorHandler.hasError,
    isInitialLoad,
    loadData,
    refreshData,
    clearError: errorHandler.clearError,
  };
}

// --- Toast Utilities Hook ---

export function useAdminToast() {
  const showSuccess = useCallback((message: string) => {
    AdminToast.success(message);
  }, []);

  const showError = useCallback((message: string) => {
    AdminToast.error(message);
  }, []);

  const showLoading = useCallback((message: string) => {
    return AdminToast.loading(message);
  }, []);

  const showUserActionSuccess = useCallback(
    (action: string, userName?: string) => {
      AdminToast.userActionSuccess(action, userName);
    },
    []
  );

  const showUserActionError = useCallback(
    (action: string, error: AdminError) => {
      AdminToast.userActionError(action, error);
    },
    []
  );

  const showDataLoadError = useCallback(
    (dataType: string, error: AdminError) => {
      AdminToast.dataLoadError(dataType, error);
    },
    []
  );

  const dismiss = useCallback((toastId?: string) => {
    AdminToast.dismiss(toastId);
  }, []);

  return {
    showSuccess,
    showError,
    showLoading,
    showUserActionSuccess,
    showUserActionError,
    showDataLoadError,
    dismiss,
  };
}
