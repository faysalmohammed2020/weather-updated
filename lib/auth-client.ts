"use client";

import { signIn as naSignIn, signOut as naSignOut, useSession as naUseSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ---- main hooks ----
export const useSession = naUseSession;

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
  return naSignOut({ redirect: true, callbackUrl: "/login" });
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
  role?: "super_admin" | "station_admin" | "observer";
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
// BetterAuth adminClient() এর কাজ সাধারণত role check / admin actions।
export function useAdminGuard(allowedRoles: Array<"super_admin" | "station_admin"> = ["super_admin"]) {
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
