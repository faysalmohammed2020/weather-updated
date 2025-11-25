// src/lib/auth.ts
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter"; // v4 adapter
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
            console.log("✅ scrypt params matched:", { ln, r, p });
            return true;
          }
        } catch {
          // try next params
          continue;
        }
      }
    }
  }

  return false;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 15,
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
      },

      async authorize(credentials) {
  try {
    console.log("CREDENTIALS IN:", credentials);

    if (!credentials?.email || !credentials?.password) {
      console.log("❌ missing email/password");
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
      console.log("❌ user not found:", email);
      return null;
    }

    console.log("✅ user found:", user.id, "role:", user.role, "stationId(id):", user.stationId);
    console.log("✅ user station code:", user.Station?.stationId);

    // 2) Account lookup: pick latest password account, prefer credential provider
    const account = await prisma.accounts.findFirst({
      where: {
        userId: user.id,
        password: { not: null },
        // providerId অনেক সময় "credential" থাকে তোমার লগে
        providerId: { in: ["credential", "credentials"] },
        
      },
      orderBy: { updatedAt: "desc" },
      select: { id: true, password: true, providerId: true },
    }) ?? await prisma.accounts.findFirst({
      where: { userId: user.id, password: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: { id: true, password: true, providerId: true },
    });

    if (!account?.password) {
      console.log("❌ no password account found for user:", user.id);
      return null;
    }

    console.log("✅ account found:", account.id, "providerId:", account.providerId);
    console.log("✅ stored password prefix:", account.password.slice(0, 10));

    // 3) Password compare (bcrypt OR legacy scrypt -> then rehash to bcrypt)
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
  console.log("❌ password mismatch for user:", user.id);
  return null;
}

// ✅ match হলে bcrypt migrate
if (needsBcryptUpgrade) {
  const newHash = await bcrypt.hash(plainPassword, 10);
  await prisma.accounts.update({
    where: { id: account.id },
    data: { password: newHash, providerId: "credentials" },
  });
  console.log("✅ password upgraded to bcrypt for account:", account.id);
}
    // 4) Role / Station code checks (safer)
    const role = (credentials as any).role as string | undefined;
    const stationCode = (credentials as any).stationId as string | undefined;

    // role null হলে observer ধরে allow করো
    if (role && (user.role ?? "observer") !== role) {
      console.log("❌ role mismatch:", role, user.role);
      return null;
    }

    if (stationCode && user.Station?.stationId !== stationCode) {
      console.log("❌ station code mismatch:", stationCode, user.Station?.stationId);
      return null;
    }

    // 5) Lazy upgrade to bcrypt
    if (needsBcryptUpgrade) {
      const newHash = await bcrypt.hash(plainPassword, 10);
      await prisma.accounts.update({
        where: { id: account.id },
        data: { password: newHash, providerId: "credentials" },
      });
      console.log("✅ password upgraded to bcrypt for account:", account.id);
    }

    // 6) Success user object
   // 6) Success user object
console.log("✅ authorize success for:", user.id);

const stationSafe = user.Station
  ? {
      id: user.Station.id,
      stationId: user.Station.stationId, // code like "41923"
      name: user.Station.name,
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

  // ✅ JSON-safe
  station: stationSafe,
} as any;

  } catch (e) {
    console.error("AUTHORIZE_ERROR:", e);
    return null;
  }
}

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
      token.division = (user as any).division;
      token.district = (user as any).district;
      token.upazila = (user as any).upazila;

      // ✅ IMPORTANT
      token.station = (user as any).station;
    }
    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      (session.user as any).id = token.id;
      (session.user as any).role = token.role;
      (session.user as any).stationId = token.stationId;
      (session.user as any).division = token.division;
      (session.user as any).district = token.district;
      (session.user as any).upazila = token.upazila;

      // ✅ IMPORTANT
      (session.user as any).station = (token as any).station ?? null;
    }
    return session;
  },
},

};

// v4 App Router handler
export default NextAuth(authOptions);
