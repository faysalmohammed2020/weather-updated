/**
 * User Management Utilities
 * Helper functions for validation, formatting, and common operations
 */

import {
  UserRole,
  PASSWORD_REQUIREMENTS,
  ERROR_MESSAGES,
} from "@/lib/constants/user-management";

/**
 * Validate password strength based on role
 * @param password - The password to validate
 * @param role - The user role
 * @returns Object with isValid flag and error message if invalid
 */
export const validatePassword = (
  password: string,
  role: UserRole
): { isValid: boolean; error?: string } => {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "Password is required" };
  }

  const minLength = PASSWORD_REQUIREMENTS[role];
  if (password.length < minLength) {
    return {
      isValid: false,
      error: ERROR_MESSAGES.INVALID_PASSWORD_LENGTH(minLength, role),
    };
  }

  return { isValid: true };
};

/**
 * Validate user form data
 * @param formData - The form data to validate
 * @param isEdit - Whether this is an edit operation
 * @returns Object with isValid flag and error message if invalid
 */
export const validateUserForm = (
  formData: {
    email: string;
    password: string;
    role: UserRole | null;
    division: string;
    district: string;
    upazila: string;
  },
  isEdit: boolean = false
): { isValid: boolean; error?: string } => {
  // Validate role
  if (!formData.role) {
    return { isValid: false, error: ERROR_MESSAGES.ROLE_NOT_SELECTED };
  }

  // Validate required fields
  if (
    !formData.email ||
    !formData.division ||
    !formData.district ||
    !formData.upazila
  ) {
    return { isValid: false, error: ERROR_MESSAGES.FILL_REQUIRED_FIELDS };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return { isValid: false, error: "Invalid email format" };
  }

  // Validate password for new users or when password is provided
  if (!isEdit && formData.password) {
    const passwordValidation = validatePassword(
      formData.password,
      formData.role
    );
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }
  } else if (isEdit && formData.password && formData.password.trim() !== "") {
    const passwordValidation = validatePassword(
      formData.password,
      formData.role
    );
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }
  }

  return { isValid: true };
};

/**
 * Format date for display
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
};

/**
 * Extract error message from various error types
 * @param error - The error object
 * @returns User-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};

/**
 * Build API request body for user update
 * @param user - The user object
 * @param formData - The form data
 * @returns Request body ready for API
 */
export const buildUserUpdatePayload = (
  user: { id: string },
  formData: {
    name: string;
    email: string;
    password: string;
    role: UserRole | null;
    division: string;
    district: string;
    upazila: string;
    stationId: string;
  }
) => {
  const payload: Record<string, any> = {
    id: user.id,
    name: formData.name || "",
    email: formData.email,
    role: formData.role,
    division: formData.division,
    district: formData.district,
    upazila: formData.upazila,
    stationId: formData.stationId,
  };

  // Only include password if provided and not empty
  if (formData.password && formData.password.trim() !== "") {
    payload.password = formData.password;
  }

  return payload;
};

/**
 * Check if user can be impersonated
 * @param currentUserId - Current user ID
 * @param targetUserId - Target user ID
 * @param targetUserRole - Target user role
 * @returns Object with canImpersonate flag and error message if cannot
 */
export const canImpersonate = (
  currentUserId: string,
  targetUserId: string,
  targetUserRole: string | null
): { canImpersonate: boolean; error?: string } => {
  if (targetUserRole === "super_admin") {
    return {
      canImpersonate: false,
      error: ERROR_MESSAGES.CANNOT_IMPERSONATE_SUPER_ADMIN,
    };
  }

  if (currentUserId === targetUserId) {
    return {
      canImpersonate: false,
      error: ERROR_MESSAGES.CANNOT_IMPERSONATE_SELF,
    };
  }

  return { canImpersonate: true };
};

/**
 * Check if user can be deleted
 * @param currentUserId - Current user ID
 * @param targetUserId - Target user ID
 * @param targetUserRole - Target user role
 * @returns Object with canDelete flag and error message if cannot
 */
export const canDeleteUser = (
  currentUserId: string,
  targetUserId: string,
  targetUserRole: string | null
): { canDelete: boolean; error?: string } => {
  if (currentUserId === targetUserId) {
    return { canDelete: false, error: ERROR_MESSAGES.CANNOT_DELETE_SELF };
  }

  if (targetUserRole === "super_admin") {
    return {
      canDelete: false,
      error: ERROR_MESSAGES.CANNOT_DELETE_SUPER_ADMIN,
    };
  }

  return { canDelete: true };
};
