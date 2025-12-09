import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/constants/user-management";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: UserRole;
      stationId?: string;
      division?: string;
      district?: string;
      upazila?: string;
      twoFactorEnabled?: boolean;
      station?: {
        id?: string;
        stationId?: string;
        name?: string;
        [key: string]: any;
      } | null;
      isImpersonating?: boolean;
      originalUser?: {
        id?: string;
        email?: string;
        name?: string;
        [key: string]: any;
      } | null;
    } & DefaultSession["user"];
  }

  interface JWT {
    id?: string;
    role?: UserRole;
    stationId?: string;
    division?: string;
    district?: string;
    upazila?: string;
    twoFactorEnabled?: boolean;
    station?: {
      id?: string;
      stationId?: string;
      name?: string;
      [key: string]: any;
    } | null;
    isImpersonating?: boolean;
    originalUser?: {
      id?: string;
      email?: string;
      name?: string;
      [key: string]: any;
    } | null;
  }
}
