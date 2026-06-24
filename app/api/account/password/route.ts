import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { LogAction, LogActionType, LogModule } from "@/lib/log";
import {
  PASSWORD_REQUIREMENTS,
  USER_ROLES,
  type UserRole,
} from "@/lib/constants/user-management";

function verifyLegacyScryptPassword(plain: string, stored: string) {
  if (!stored.includes(":")) return false;

  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(keyHex, "hex");
  const rCandidates = [8, 16];
  const pCandidates = [1, 2];

  for (let ln = 10; ln <= 18; ln++) {
    const N = 2 ** ln;

    for (const r of rCandidates) {
      for (const p of pCandidates) {
        try {
          const derived = crypto.scryptSync(plain, salt, expected.length, {
            N,
            r,
            p,
            maxmem: 1024 * 1024 * 512,
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

async function verifyStoredPassword(plain: string, stored: string) {
  if (
    stored.startsWith("$2a$") ||
    stored.startsWith("$2b$") ||
    stored.startsWith("$2y$")
  ) {
    return bcrypt.compare(plain, stored);
  }

  if (stored.includes(":") && /^[0-9a-fA-F:]+$/.test(stored)) {
    return verifyLegacyScryptPassword(plain, stored);
  }

  return plain === stored;
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = String(body?.currentPassword || "");
    const newPassword = String(body?.newPassword || "");

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const role = ((user.role as UserRole | null) ?? USER_ROLES.OBSERVER) as UserRole;
    const minLength = PASSWORD_REQUIREMENTS[role];

    if (newPassword.length < minLength) {
      return NextResponse.json(
        {
          error: `Password must be at least ${minLength} characters for ${role} role`,
        },
        { status: 400 }
      );
    }

    const account =
      (await prisma.accounts.findFirst({
        where: {
          userId: user.id,
          password: { not: null },
          providerId: { in: ["credential", "credentials"] },
        },
        orderBy: { updatedAt: "desc" },
        select: { id: true, password: true },
      })) ??
      (await prisma.accounts.findFirst({
        where: { userId: user.id, password: { not: null } },
        orderBy: { updatedAt: "desc" },
        select: { id: true, password: true },
      }));

    if (!account?.password) {
      return NextResponse.json(
        { error: "No password account found for this user" },
        { status: 400 }
      );
    }

    const isCurrentPasswordValid = await verifyStoredPassword(
      currentPassword,
      account.password
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      await tx.accounts.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
          providerId: "credentials",
          updatedAt: new Date(),
        },
      });

      await LogAction({
        init: tx,
        action: LogActionType.UPDATE,
        actionText: "Password Changed",
        role,
        actorId: user.id,
        targetId: user.id,
        actorEmail: user.email,
        targetEmail: user.email,
        module: LogModule.AUTH,
        details: {
          changedFields: ["password"],
          selfService: true,
        },
      });
    });

    revalidateTag("logs");

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
