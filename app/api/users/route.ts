import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/getSession";
import { diff } from "deep-object-diff";
import { revalidateTag } from "next/cache";
import { LogAction, LogActionType, LogModule } from "@/lib/log";

// ✅ NextAuth server session
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

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
    const search = (searchParams.get("search") || "").trim(); // ✅ NEW
    const roleFilter = searchParams.get("role") || "";
    const stationFilter = searchParams.get("station") || "";

    // ✅ root_admin + super_admin => see all users
    const isPrivileged =
      session.user.role === "super_admin" || session.user.role === "root_admin";

    // ✅ base filter
    const baseWhere = isPrivileged
      ? {}
      : {
          role: "observer",
          stationId: session.user.station?.id,
        };

    // ✅ Additional filters for super admin
    const additionalFilters: Record<string, string> = isPrivileged ? {} : {};
    if (isPrivileged && roleFilter && roleFilter !== "all") {
      additionalFilters.role = roleFilter;
    }
    if (isPrivileged && stationFilter && stationFilter !== "all") {
      additionalFilters.stationId = stationFilter;
    }

    // ✅ Combine all filters
    const allFilters = Object.keys(additionalFilters).length > 0 ? additionalFilters : {};

    // ✅ search filter add (name/email)
    const where = search
      ? {
          AND: [
            { ...baseWhere, ...allFilters },
            {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
              ],
            },
          ],
        }
      : { ...baseWhere, ...allFilters };

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.users.count({ where }),
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
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const existingUser = await prisma.users.findUnique({ where: { id } });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const actorRole = session.user.role;
    const isRoot = actorRole === "root_admin";
    const isSuper = actorRole === "super_admin";
    const isPrivileged = isRoot || isSuper;

    // ============================================================
    // ✅ HARD RULES (as per your requirement)
    // ============================================================

    // ✅ super_admin cannot edit root_admin
    if (isSuper && existingUser.role === "root_admin") {
      return NextResponse.json(
        { error: "Super admin cannot edit root admin accounts" },
        { status: 403 }
      );
    }

    // ✅ non-privileged cannot edit super_admin/root_admin
    if (!isPrivileged && (existingUser.role === "super_admin" || existingUser.role === "root_admin")) {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    // ✅ station_admin editing another station_admin blocked (keep old behavior)
    // privileged হলে এই restriction থাকবে না
    if (
      !isPrivileged &&
      actorRole === "station_admin" &&
      existingUser.role === "station_admin"
    ) {
      return NextResponse.json(
        { error: "You are not authorized to do this action" },
        { status: 403 }
      );
    }

    // ============================================================
    // ✅ ROLE PROMOTION RULES
    // ============================================================

    // ✅ Promote someone to super_admin:
    // - root_admin allowed
    // - super_admin allowed
    // - others not allowed
    if (rest.role === "super_admin" && !isPrivileged) {
      return NextResponse.json(
        { error: "Only super/root admins can promote users to super admin role" },
        { status: 403 }
      );
    }

    // ✅ Promote someone to root_admin:
    // - ONLY root_admin allowed (because super_admin cannot touch root_admin)
    if (rest.role === "root_admin" && !isRoot) {
      return NextResponse.json(
        { error: "Only root admin can promote users to root admin role" },
        { status: 403 }
      );
    }

    // ============================================================
    // ✅ PASSWORD UPDATE (bcrypt)
    // ============================================================

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
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}



/* ----------------------------- CREATE USER ----------------------------- */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ super_admin OR root_admin can create users
    const isPrivileged =
      session.user.role === "super_admin" || session.user.role === "root_admin";

    if (!isPrivileged) {
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

    // ✅ add root_admin + password rule
    const passwordMinLength = {
      root_admin: 12,
      super_admin: 12,
      station_admin: 11,
      observer: 10,
    } as const;

    if (
      !["root_admin", "super_admin", "station_admin", "observer"].includes(role)
    ) {
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

    const actorRole = session.user.role;

    // ✅ Only super_admin or root_admin can delete
    if (actorRole !== "super_admin" && actorRole !== "root_admin") {
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

    // ✅ cannot delete self
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

    // ✅ Rule: super_admin cannot delete root_admin
    if (actorRole === "super_admin" && userToDelete.role === "root_admin") {
      return NextResponse.json(
        { error: "Super admin cannot delete root admin accounts" },
        { status: 403 }
      );
    }

    // ✅ Rule: root_admin can delete anyone (including super_admin/root_admin)
    // so no extra blocks here

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

