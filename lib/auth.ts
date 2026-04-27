// src/lib/auth.ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // v4 adapter
import prisma from "@/lib/prisma";
import { LogAction, LogActionType, LogModule } from "@/lib/log";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { authenticator } from "otplib";

// Single source of truth for signing/decoding NextAuth JWTs
export const authSecret =
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;

/**
 * BetterAuth legacy scrypt hash verify
 * Format usually: scrypt$ln=16,r=8,p=1$saltBase64$hashBase64
 */
function verifyBetterAuthScryptColon(plain: string, stored: string) {
  if (!stored.includes(":")) return false;

  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");

  // Common BetterAuth / scrypt params candidates
  const rCandidates = [8, 16];
  const pCandidates = [1, 2];

  // ln range -> N = 2^ln
  for (let ln = 10; ln <= 18; ln++) {
    const N = 2 ** ln;

    for (const r of rCandidates) {
      for (const p of pCandidates) {
        try {
          const derived = crypto.scryptSync(plain, salt, expected.length, {
            N,
            r,
            p,
            maxmem: 1024 * 1024 * 512, // 512MB allow
          });

          if (crypto.timingSafeEqual(derived, expected)) {
            return true;
          }
        } catch {
          continue;
        }
      }
    }
  }

  return false;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: authSecret,
  session: {
    strategy: "jwt",
    maxAge: 60 * 15, // 15 minutes
    updateAge: 0,
  },

  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        // extra fields from client:
        role: { label: "Role", type: "text" },
        stationId: { label: "StationId", type: "text" },
        otp: { label: "One-time code", type: "text" },
      },

      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const email = String(credentials.email).toLowerCase().trim();
          const plainPassword = String(credentials.password);

          // 1) User lookup
          const user = await prisma.users.findUnique({
            where: { email },
            include: { Station: true },
          });

          if (!user) {
            return null;
          }

          if (user.banned) {
            throw new Error("ACCOUNT_BANNED");
          }
          // 2) Account lookup: pick latest password account, prefer credential provider
          const account =
            (await prisma.accounts.findFirst({
              where: {
                userId: user.id,
                password: { not: null },
                providerId: { in: ["credential", "credentials"] },
              },
              orderBy: { updatedAt: "desc" },
              select: { id: true, password: true, providerId: true },
            })) ??
            (await prisma.accounts.findFirst({
              where: { userId: user.id, password: { not: null } },
              orderBy: { updatedAt: "desc" },
              select: { id: true, password: true, providerId: true },
            }));

          if (!account?.password) {
            return null;
          }

          // 3) Password compare (bcrypt OR BetterAuth scrypt formats)
          let ok = false;
          let needsBcryptUpgrade = false;

          const stored = account.password;

          // bcrypt হলে
          if (
            stored.startsWith("$2a$") ||
            stored.startsWith("$2b$") ||
            stored.startsWith("$2y$")
          ) {
            ok = await bcrypt.compare(plainPassword, stored);
          }

          // saltHex:keyHex scrypt হলে
          else if (stored.includes(":") && /^[0-9a-fA-F:]+$/.test(stored)) {
            ok = verifyBetterAuthScryptColon(plainPassword, stored);
            needsBcryptUpgrade = ok;
          }

          // fallback plain (dev)
          else {
            ok = plainPassword === stored;
            needsBcryptUpgrade = ok;
          }

          if (!ok) {
            return null;
          }

          // ✅ match হলে bcrypt migrate
          if (needsBcryptUpgrade) {
            const newHash = await bcrypt.hash(plainPassword, 10);
            await prisma.accounts.update({
              where: { id: account.id },
              data: { password: newHash, providerId: "credentials" },
            });
          }

          // 4) Role / Station code checks (safer)
          const role = (credentials as any).role as string | undefined;
          const stationCode = (credentials as any).stationId as
            | string
            | undefined;

          // role null হলে observer ধরে allow করো
          if (role && (user.role ?? "observer") !== role) {
            throw new Error("ROLE_MISMATCH");
          }

          if (stationCode && user.Station?.stationId !== stationCode) {
            throw new Error("STATION_MISMATCH");
          }

          // 5) Lazy upgrade to bcrypt (already handled above, kept same)
          if (needsBcryptUpgrade) {
            const newHash = await bcrypt.hash(plainPassword, 10);
            await prisma.accounts.update({
              where: { id: account.id },
              data: { password: newHash, providerId: "credentials" },
            });
          }

          // 6) Enforce two-factor authentication if enabled
          const requiresTwoFactor = Boolean(user.twoFactorEnabled);
          const otp =
            typeof (credentials as any).otp === "string"
              ? (credentials as any).otp.trim()
              : "";

          if (requiresTwoFactor) {
            if (!otp) {
              throw new Error("OTP_REQUIRED");
            }

            const record = await prisma.twoFactor.findFirst({
              where: { userId: user.id },
              select: { id: true, secret: true, backupCodes: true },
            });

            let otpValid = false;
            let backupUsed = false;

            if (record?.secret) {
              otpValid = authenticator.verify({
                token: otp,
                secret: record.secret,
              });
            }

            if (!otpValid && record?.backupCodes) {
              const codes: string[] = JSON.parse(record.backupCodes || "[]");
              const index = codes.findIndex((c) => c === otp);

              if (index !== -1) {
                otpValid = true;
                backupUsed = true;
                codes.splice(index, 1);

                await prisma.twoFactor.update({
                  where: { id: record.id },
                  data: { backupCodes: JSON.stringify(codes) },
                });
              }
            }

            if (!otpValid) {
              throw new Error("OTP_REQUIRED");
            }

            if (backupUsed) {
              (credentials as any).otp = "";
            }
          }

          // 7) Success user object
          const stationSafe = user.Station
            ? {
                id: user.Station.id,
                stationId: user.Station.stationId, // code like "41923"
                name: user.Station.name,
                latitude: user.Station.latitude,
                longitude: user.Station.longitude,
              }
            : null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role ?? "observer",
            division: user.division,
            district: user.district,
            upazila: user.upazila,
            stationId: user.stationId,

            // JSON-safe (now includes lat/lon)
            station: stationSafe,
            twoFactorEnabled: Boolean(user.twoFactorEnabled),
          } as any;
        } catch (e) {
          console.error("AUTHORIZE_ERROR:", e);
          if (
            e instanceof Error &&
            ["ACCOUNT_BANNED", "OTP_REQUIRED", "ROLE_MISMATCH", "STATION_MISMATCH"].includes(
              e.message
            )
          ) {
            throw e;
          }
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "observer";
        token.stationId = (user as any).stationId;
        token.email = (user as any).email ?? token.email;
        token.division = (user as any).division;
        token.district = (user as any).district;
        token.upazila = (user as any).upazila;
        token.twoFactorEnabled = Boolean((user as any).twoFactorEnabled);

        token.station = (user as any).station;
      }
      token.isImpersonating = (token as any).isImpersonating ?? false;
      token.originalUser = (token as any).originalUser ?? null;
      return token;
    },

    async session({ session, token }) {
      // Keep two-factor flag in sync with the DB so toggles reflect immediately
      let latestTwoFactorEnabled: boolean | null | undefined = (token as any)?.twoFactorEnabled;
      if (token?.id) {
        const dbUser = await prisma.users.findUnique({
          where: { id: token.id as string },
          select: { twoFactorEnabled: true },
        });
        latestTwoFactorEnabled = dbUser?.twoFactorEnabled ?? false;
        (token as any).twoFactorEnabled = latestTwoFactorEnabled;
      }

      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).stationId = token.stationId;
        (session.user as any).division = token.division;
        (session.user as any).district = token.district;
        (session.user as any).upazila = token.upazila;
        (session.user as any).twoFactorEnabled = Boolean(latestTwoFactorEnabled);

        // IMPORTANT
        (session.user as any).station = (token as any).station ?? null;
        (session.user as any).isImpersonating = Boolean(
          (token as any).isImpersonating
        );
        (session.user as any).originalUser =
          (token as any).originalUser ?? null;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      try {
        if (!user?.id) return;

        await LogAction({
          init: prisma,
          action: LogActionType.CREATE,
          actionText: "User Logged In",
          role: (user as any).role ?? "observer",
          actorId: (user as any).id,
          actorEmail: (user as any).email ?? undefined,
          module: LogModule.AUTH,
          details: {
            provider: account?.provider,
            isNewUser: Boolean(isNewUser),
          },
        });
      } catch (error) {
        console.error("AUTH_SIGNIN_LOG_ERROR:", error);
      }
    },
    async signOut(message) {
      try {
        const token = (message as any)?.token;
        const session = (message as any)?.session;

        const actorId = token?.id ?? token?.sub ?? session?.user?.id;
        if (!actorId) return;

        await LogAction({
          init: prisma,
          action: LogActionType.DELETE,
          actionText: "User Logged Out",
          role: token?.role ?? session?.user?.role ?? "observer",
          actorId,
          actorEmail: token?.email ?? session?.user?.email ?? undefined,
          module: LogModule.AUTH,
        });
      } catch (error) {
        console.error("AUTH_SIGNOUT_LOG_ERROR:", error);
      }
    },
  },
};

// v4 App Router handler
export default NextAuth(authOptions);
