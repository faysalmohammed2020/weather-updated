import { betterAuth } from "better-auth";
import { admin, twoFactor, customSession } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: ["http://localhost:7999", "http://localhost:3000"],
  user: {
    modelName: "users",
    additionalFields: {
      division: {
        required: true,
        type: "string",
      },
      district: {
        required: true,
        type: "string",
      },
      upazila: {
        nullable: true,
        required: false,
        type: "string",
      },
      stationId: {
        required: true,
        type: "string",
      },
      role: {
        required: true,
        type: "string",
        enum: ["super_admin", "station_admin", "observer"],
      },
    },
  },
  session: {
    cookieCache: {
      enabled: false,
    },
    modelName: "sessions",
    expiresIn: 60 * 15, // 15 minutes,
    updateAge: 0,
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
  },
  appName: "BD Weather",
  plugins: [
    admin({
      defaultRole: "observer",
      adminRoles: ["super_admin"],
    }),
    twoFactor(),
    customSession(async ({ user, session }) => {
      // Get the session from database to check for impersonation
      const dbSession = await prisma.sessions.findUnique({
        where: {
          id: session.id,
        },
      });

      const authUser = await prisma.users.findUnique({
        where: {
          id: session.userId,
        },
        include: {
          Station: true,
        },
      });

      // If this session is impersonating someone, get the original user info
      let originalUser = null;
      if (dbSession?.impersonatedBy) {
        originalUser = await prisma.users.findUnique({
          where: {
            id: dbSession.impersonatedBy,
          },
        });
      }

      return {
        session: {
          ...session,
          impersonatedBy: dbSession?.impersonatedBy,
        },
        user: {
          ...user,
          role: authUser?.role,
          station: authUser?.Station,
          division: authUser?.division,
          district: authUser?.district,
          upazila: authUser?.upazila,
          isImpersonating: !!dbSession?.impersonatedBy,
          originalUser: originalUser ? {
            id: originalUser.id,
            name: originalUser.name,
            email: originalUser.email,
            role: originalUser.role,
          } : null,
        },
      };
    }),
    nextCookies(),
  ],
});
