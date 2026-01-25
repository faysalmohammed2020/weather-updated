/**
 * Server-side data fetching functions for User Management
 * These functions are designed to run in Server Components
 * Build-safe (no internal HTTP fetch)
 */

import {
  getUsersForSession,
  getStationsForSession,
} from "@/lib/server/user-management-data";

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
  latitude?: number;
  longitude?: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

/**
 * Fetch users with pagination - Server Side (build-safe)
 */
export async function getUsersServer(
  pageIndex: number = 0,
  pageSize: number = 10,
  status: "active" | "banned" | "all" = "active"
): Promise<UsersResponse> {
  try {
    const { users, total } = await getUsersForSession({
      limit: pageSize,
      offset: pageIndex * pageSize,
      status,
    });

    return {
      users: (users as User[]) || [],
      total: total || 0,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { users: [], total: 0 };
  }
}

/**
 * Fetch all stations - Server Side (build-safe)
 */
export async function getStationsServer(): Promise<Station[]> {
  try {
    const stations = await getStationsForSession();
    return (stations as Station[]) || [];
  } catch (error) {
    console.error("Error fetching stations:", error);
    return [];
  }
}
