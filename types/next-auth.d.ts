import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      stationId?: string;
      division?: string;
      district?: string;
      upazila?: string;
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
    role?: string;
    stationId?: string;
    division?: string;
    district?: string;
    upazila?: string;
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
