/**
 * Server-side data fetching functions for User Management
 * These functions are designed to run in Server Components
 */

import { API_ENDPOINTS } from "@/lib/constants/user-management";
import { headers } from "next/headers";

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
 * Fetch users with pagination - Server Side
 */
export async function getUsersServer(pageIndex: number = 0, pageSize: number = 10): Promise<UsersResponse> {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie');
    
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}${API_ENDPOINTS.USERS}?limit=${pageSize}&offset=${pageIndex * pageSize}`,
      {
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Content-Type': 'application/json',
          ...(cookie && { cookie }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      users: data.users || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      users: [],
      total: 0,
    };
  }
}

/**
 * Fetch all stations - Server Side
 */
export async function getStationsServer(): Promise<Station[]> {
  try {
    const headersList = await headers();
    const cookie = headersList.get('cookie');
    
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}${API_ENDPOINTS.STATIONS}`,
      {
        cache: 'no-store', // Ensure fresh data
        headers: {
          'Content-Type': 'application/json',
          ...(cookie && { cookie }),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch stations: ${response.statusText}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching stations:', error);
    return [];
  }
}
