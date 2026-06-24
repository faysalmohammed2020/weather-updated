import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { LogAction, LogActionType, LogModule } from "@/lib/log";
import {
  appendPasswordHistory,
  findLatestPasswordAccount,
  hasRecentPasswordReuse,
  PASSWORD_REUSE_ERROR,
  verifyStoredPassword,
} from "@/lib/password-history";
import {
  PASSWORD_REQUIREMENTS,
  USER_ROLES,
  type UserRole,
} from "@/lib/constants/user-management";

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

    const account = await findLatestPasswordAccount(prisma, user.id);

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

    const isRecentReuse = await hasRecentPasswordReuse(
      prisma,
      user.id,
      newPassword,
      account.password
    );

    if (isRecentReuse) {
      return NextResponse.json(
        { error: PASSWORD_REUSE_ERROR },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction(async (tx) => {
      await appendPasswordHistory(tx, user.id, account.password!);

      await tx.accounts.update({
        where: { id: account.id },
        data: {
          password: hashedPassword,
          providerId: "credentials",
          passwordChangedAt: new Date(),
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
