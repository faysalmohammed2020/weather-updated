"use client";

import { SessionProvider } from "next-auth/react";
import SessionActivityManager from "@/components/auth/SessionActivityManager";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <SessionActivityManager />
      {children}
    </SessionProvider>
  );
}
