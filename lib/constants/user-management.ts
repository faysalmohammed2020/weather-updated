/**
 * User Management Constants
 * Centralized configuration for user roles, password requirements, and UI settings
 */

export const USER_ROLES = {
  ROOT_ADMIN: "root_admin",
  SUPER_ADMIN: "super_admin",
  STATION_ADMIN: "station_admin",
  OBSERVER: "observer",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/**
 * Password requirements per role
 * Ensures consistent validation across the application
 */
export const PASSWORD_REQUIREMENTS: Record<UserRole, number> = {
  [USER_ROLES.ROOT_ADMIN]: 12,
  [USER_ROLES.SUPER_ADMIN]: 12,
  [USER_ROLES.STATION_ADMIN]: 11,
  [USER_ROLES.OBSERVER]: 10,
};

/**
 * Pagination settings
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  INITIAL_PAGE_INDEX: 0,
} as const;

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  USERS: "/api/users",
  STATIONS: "/api/stations",
  IMPERSONATE: "/api/impersonate",
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  FAILED_FETCH_USERS: "Failed to fetch users",
  FAILED_FETCH_STATIONS: "Failed to load stations",
  FAILED_CREATE_USER: "Failed to create user",
  FAILED_UPDATE_USER: "Failed to update user",
  FAILED_DELETE_USER: "Failed to delete user",
  FAILED_IMPERSONATE: "Failed to start impersonation",

  INVALID_PASSWORD_LENGTH: (length: number, role: UserRole) =>
    `Password must be at least ${length} characters for ${role} role`,

  CANNOT_DELETE_SELF: "You cannot delete your own account",

  // ✅ Root admin protections
  CANNOT_DELETE_ROOT_ADMIN: "Root admin accounts cannot be deleted",
  CANNOT_IMPERSONATE_ROOT_ADMIN: "Cannot impersonate root admin users",
  CANNOT_MODIFY_ROOT_ADMIN: "Root admin roles cannot be modified",

  // ✅ Super admin protections
  CANNOT_DELETE_SUPER_ADMIN: "Super admin accounts cannot be deleted",
  CANNOT_IMPERSONATE_SUPER_ADMIN: "Cannot impersonate super admin users",
  CANNOT_MODIFY_SUPER_ADMIN: "Super admin roles cannot be modified",

  CANNOT_IMPERSONATE_SELF: "You cannot impersonate yourself",
  ROLE_NOT_SELECTED: "Please select a role first",
  FILL_REQUIRED_FIELDS: "Please fill all required fields",
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  USER_CREATED: "User created successfully",
  USER_UPDATED: "User updated successfully",
  USER_DELETED: "User deleted successfully",
  IMPERSONATION_STARTED: (name: string, role: string) =>
    `Now impersonating ${name} (${role}). Redirecting...`,
} as const;

/**
 * Toast duration in milliseconds
 */
export const TOAST_DURATION = {
  SHORT: 2000,
  MEDIUM: 3000,
  LONG: 5000,
} as const;
