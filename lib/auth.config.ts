//lib/auth.config.ts
import type { AuthOptions } from "next-auth";
import NextAuth from "next-auth";
import { SESSION_IDLE_TIMEOUT_SECONDS } from "@/lib/session-policy";

// ✅ NO Prisma imports here
export const authConfig: AuthOptions = {
  providers: [],

  session: {
    strategy: "jwt",
    maxAge: SESSION_IDLE_TIMEOUT_SECONDS,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

// middleware এ ব্যবহার করার জন্য শুধু auth export
export const { auth } = NextAuth(authConfig);
