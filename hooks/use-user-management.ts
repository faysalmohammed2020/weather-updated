/**
 * Custom Hooks for User Management
 * Encapsulate complex state and side-effect logic
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/lib/constants/user-management";
import { getErrorMessage } from "@/lib/utils/user-management";

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  emailVerified: boolean;
  image: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: number | null;
  division: string;
  district: string;
  upazila: string;
  stationId: string;
  twoFactorEnabled: boolean | null;
  createdAt: string;
  updatedAt: string;
  station?: {
    id: string;
    name: string;
    securityCode: string;
  } | null;
}

export interface Station {
  id: string;
  name: string;
  stationId: string;
  securityCode: string;
}

/**
 * Hook for fetching and managing users
 */
export const useUsers = (pageSize: number) => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (pageIndex: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.USERS}?limit=${pageSize}&offset=${pageIndex * pageSize}`
        );

        if (!response.ok) {
          throw new Error(ERROR_MESSAGES.FAILED_FETCH_USERS);
        }

        const data = await response.json();
        setUsers(data.users);
        setTotalUsers(data.total);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  return {
    users,
    totalUsers,
    isLoading,
    error,
    fetchUsers,
    setUsers,
  };
};

/**
 * Hook for fetching and managing stations
 */
export const useStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.STATIONS);

      if (!response.ok) {
        throw new Error(ERROR_MESSAGES.FAILED_FETCH_STATIONS);
      }

      const data = await response.json();
      setStations(data);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    stations,
    isLoading,
    error,
    fetchStations,
  };
};

/**
 * Hook for user CRUD operations
 */
export const useUserOperations = () => {
  const [isOperating, setIsOperating] = useState(false);

  const createUser = useCallback(async (userData: Record<string, any>) => {
    setIsOperating(true);
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || ERROR_MESSAGES.FAILED_CREATE_USER);
      }

      toast.success(SUCCESS_MESSAGES.USER_CREATED);
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsOperating(false);
    }
  }, []);

  const updateUser = useCallback(async (userData: Record<string, any>) => {
    setIsOperating(true);
    try {
      const response = await fetch(API_ENDPOINTS.USERS, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorData = {};
        try {
          errorData = responseText ? JSON.parse(responseText) : {};
        } catch {
          // Parsing failed, use responseText as is
        }
        const errorMessage =
          (errorData as any).error || ERROR_MESSAGES.FAILED_UPDATE_USER;
        throw new Error(errorMessage);
      }

      toast.success(SUCCESS_MESSAGES.USER_UPDATED);
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsOperating(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    setIsOperating(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.USERS}?id=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || ERROR_MESSAGES.FAILED_DELETE_USER);
      }

      toast.success(SUCCESS_MESSAGES.USER_DELETED);
      return { success: true };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsOperating(false);
    }
  }, []);

  const impersonateUser = useCallback(
    async (
      userId: string,
      userName: string | null,
      userRole: string | null
    ) => {
      setIsOperating(true);
      try {
        const response = await fetch(API_ENDPOINTS.IMPERSONATE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetUserId: userId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || ERROR_MESSAGES.FAILED_IMPERSONATE);
        }

        const data = await response.json();
        const displayName = userName || data.impersonatedUser?.email;

        toast.success("Impersonation Started", {
          description: SUCCESS_MESSAGES.IMPERSONATION_STARTED(
            displayName,
            userRole || "unknown"
          ),
          duration: 2000,
        });

        // Redirect after delay
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);

        return { success: true };
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        toast.error("Cannot Start Impersonation", {
          description: errorMessage,
          duration: 3000,
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsOperating(false);
      }
    },
    []
  );

  return {
    isOperating,
    createUser,
    updateUser,
    deleteUser,
    impersonateUser,
  };
};

/**
 * Hook for managing pagination state
 */
export const usePagination = (initialPageSize: number) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(initialPageSize);

  const nextPage = useCallback(
    (totalItems: number) => {
      if ((pageIndex + 1) * pageSize < totalItems) {
        setPageIndex((prev) => prev + 1);
      }
    },
    [pageIndex, pageSize]
  );

  const prevPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex((prev) => prev - 1);
    }
  }, [pageIndex]);

  const reset = useCallback(() => {
    setPageIndex(0);
  }, []);

  return {
    pageIndex,
    pageSize,
    nextPage,
    prevPage,
    reset,
  };
};
