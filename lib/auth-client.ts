"use client";

import { signIn as naSignIn, signOut as naSignOut, useSession as naUseSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/lib/constants/user-management";
import { SIGN_IN_ROUTE } from "@/lib/session-policy";

// ---- main hooks ----
export function useSession() {
  const session = naUseSession();

  // Normalize shape so existing UI can read user/isPending
  return {
    ...session,
    user: session.data?.user ?? null,
    isPending: session.status === "loading",
  };
}

// ---- sign in ----
// BetterAuth signIn(...) -> NextAuth signIn("credentials", ...)
export async function signIn(params: { email: string; password: string; otp?: string }) {
  // credentials provider এ field name match করতে হবে
  const res = await naSignIn("credentials", {
    email: params.email,
    password: params.password,
    otp: params.otp,      // যদি 2FA use করো
    redirect: false,
  });

  return res; // { ok, error, url, status }
}

// ---- sign out ----
export function signOut() {
  return naSignOut({ redirect: true, callbackUrl: SIGN_IN_ROUTE });
}

// ---- sign up ----
// NextAuth এ built-in signup নাই, তাই custom API route লাগবে।
export async function signUp(data: {
  name?: string;
  email: string;
  password: string;
  division: string;
  district: string;
  upazila?: string | null;
  stationId: string;
  role?: UserRole;
}) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Signup failed");
  }

  return res.json();
}

// ---- admin helper ----
export function useAdminGuard(allowedRoles: UserRole[] = ["super_admin", "root_admin"]) {
  const { data, status } = naUseSession();
  const router = useRouter();

  const role = data?.user?.role;
  const isAllowed = !!role && allowedRoles.includes(role);

  // তুমি চাইলে এখানে auto-redirect করাতে পারো
  function requireAdmin(redirectTo = "/403") {
    if (status === "authenticated" && !isAllowed) {
      router.replace(redirectTo);
    }
  }

  return { role, isAllowed, requireAdmin };
}

// ---- two factor helper ----
// BetterAuth twoFactorClient({ onTwoFactorRedirect }) equivalent.
// idea: signIn() যদি backend থেকে "OTP_REQUIRED" error return করে,
// UI catch করে /2fa তে redirect করবে।
export function useTwoFactorRedirect() {
  const router = useRouter();

  function onOtpRequired() {
    router.replace("/2fa");
  }

  return { onOtpRequired };
}

// ---- two factor client ----
type TwoFactorResult<T = undefined> = Promise<{
  data?: T;
  error: { message: string } | null;
}>;

async function callTwoFactor<T>(
  action: "enable" | "verifyTotp" | "verifyBackupCode" | "disable",
  payload: Record<string, unknown>
): TwoFactorResult<T> {
  try {
    const res = await fetch("/api/two-factor", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });

    const body = await res.json().catch(() => ({}));
    const error = body?.error || (!res.ok ? { message: "Unable to process request" } : null);

    if (error) {
      return { error };
    }

    return { data: body?.data as T, error: null };
  } catch (err) {
    return {
      error: {
        message: err instanceof Error ? err.message : "Unexpected error",
      },
    };
  }
}

export const twoFactor = {
  enable: (params: { password: string }) =>
    callTwoFactor<{ totpURI: string; backupCodes: string[] }>("enable", params),
  verifyTotp: (params: { code: string }) =>
    callTwoFactor("verifyTotp", params),
  verifyBackupCode: (params: { code: string }) =>
    callTwoFactor("verifyBackupCode", params),
  disable: (params: { password: string }) => callTwoFactor("disable", params),
};

export async function changePassword(params: {
  currentPassword: string;
  newPassword: string;
}) {
  const res = await fetch("/api/account/password", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });

  const body = await res.json().catch(() => ({}));

  return {
    ok: res.ok,
    message: body?.message as string | undefined,
    error: body?.error as string | undefined,
  };
}
