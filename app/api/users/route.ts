import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/getSession";
import { diff } from "deep-object-diff";
import { revalidateTag } from "next/cache";
import { LogAction, LogActionType, LogModule } from "@/lib/log";

// ✅ NextAuth server session
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // <-- তোমার authOptions export থাকতে হবে

// ✅ BetterAuth admin.revokeUserSessions replacement
async function revokeUserSessions(userId: string) {
  await prisma.sessions.deleteMany({
    where: { userId },
  });
}

/* ----------------------------- GET USERS ----------------------------- */
export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    const isSuper = session.user.role === "super_admin";

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where: isSuper
          ? undefined
          : {
              role: "observer",
              stationId: session.user.station?.id,
            },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.users.count({
        where: isSuper
          ? undefined
          : {
              role: "observer",
              stationId: session.user.station?.id,
            },
      }),
    ]);

    return NextResponse.json({ users, total, limit, offset }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/* ----------------------------- UPDATE USER ----------------------------- */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, password, ...rest } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.users.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Authorization checks (same as before)
    if (
      existingUser.role === "super_admin" &&
      session.user.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    if (
      existingUser.role === "station_admin" &&
      session.user.role === "station_admin"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    if (
      existingUser.role !== "super_admin" &&
      rest.role === "super_admin" &&
      session.user.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "Only super admins can promote users to super admin role" },
        { status: 403 }
      );
    }

    // ✅ bcrypt hash
    let hashedPassword: string | undefined;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.users.update({
        where: { id },
        data: rest,
      });

      if (hashedPassword) {
        const existingAccount = await tx.accounts.findFirst({
          where: { userId: id, providerId: "credential" },
        });

        if (existingAccount) {
          await tx.accounts.update({
            where: { id: existingAccount.id },
            data: { password: hashedPassword },
          });
        } else {
          await tx.accounts.create({
            data: {
              accountId: id,
              providerId: "credential",
              userId: id,
              password: hashedPassword,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
        }

        // ✅ revoke sessions (NextAuth style)
        await revokeUserSessions(existingUser.id);
      }

      const diffData = diff(existingUser, user);

      await LogAction({
        init: tx,
        action: LogActionType.UPDATE,
        actionText: "User Updated",
        role: session.user.role!,
        actorId: session.user.id!,
        targetId: id,
        actorEmail: session.user.email!,
        targetEmail: existingUser.email,
        module: LogModule.USER,
        details: diffData,
      });

      return user;
    });

    revalidateTag("logs");

    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

/* ----------------------------- CREATE USER ----------------------------- */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      division,
      district,
      upazila,
      stationId,
    } = body;

    if (!email || !password || !role || !division || !district || !upazila) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const passwordMinLength = {
      super_admin: 12,
      station_admin: 11,
      observer: 10,
    };

    if (!["super_admin", "station_admin", "observer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const requiredLength =
      passwordMinLength[role as keyof typeof passwordMinLength];

    if (password.length < requiredLength) {
      return NextResponse.json(
        {
          error: `Password must be at least ${requiredLength} characters for ${role} role`,
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // ✅ bcrypt hash
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          name: name || null,
          email,
          role: role || null,
          division,
          district,
          upazila,
          stationId: stationId || null,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
          banned: false,
          banReason: null,
          banExpires: null,
          twoFactorEnabled: false,
        },
      });

      await tx.accounts.create({
        data: {
          accountId: newUser.id,
          providerId: "credential",
          userId: newUser.id,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await LogAction({
        init: tx,
        action: LogActionType.CREATE,
        actionText: "User Created",
        actorEmail: session.user.email!,
        targetEmail: newUser.email,
        role: session.user.role!,
        actorId: session.user.id!,
        targetId: newUser.id,
        module: LogModule.USER,
      });

      return newUser;
    });

    revalidateTag("logs");

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

/* ----------------------------- DELETE USER ----------------------------- */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "super_admin") {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (session.user.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 403 }
      );
    }

    const userToDelete = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userToDelete.role === "super_admin") {
      return NextResponse.json(
        { error: "Super admin accounts cannot be deleted" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await revokeUserSessions(userToDelete.id);

      await LogAction({
        init: tx,
        action: LogActionType.DELETE,
        actionText: "User Deleted",
        role: session.user.role!,
        actorId: session.user.id!,
        targetId: userToDelete.id,
        actorEmail: session.user.email!,
        targetEmail: userToDelete.email,
        module: LogModule.USER,
        details: userToDelete,
      });

      await tx.users.delete({ where: { id: userId } });
    });

    revalidateTag("logs");

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
