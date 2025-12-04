import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      password,
      stationId,
      division,
      district,
      upazila,
      role, // optional
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const existed = await prisma.users.findUnique({ where: { email } });
    if (existed) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // password validation (same rule as before)
    const passwordMinLength = {
      super_admin: 12,
      station_admin: 11,
      observer: 10,
    } as const;

    const finalRole =
      role && ["super_admin", "station_admin", "observer"].includes(role)
        ? role
        : "super_admin"; // ✅ public signup default role

    const requiredLength =
      passwordMinLength[finalRole as keyof typeof passwordMinLength];

    if (password.length < requiredLength) {
      return NextResponse.json(
        {
          error: `Password must be at least ${requiredLength} characters for ${finalRole} role`,
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          name: name || null,
          email,
          role: finalRole,
          division: division || "default-division",
          district: district || "default-district",
          upazila: upazila || "default-upazila",
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

      return newUser;
    });

    return NextResponse.json(
      { message: "Registration successful", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Failed to register" },
      { status: 500 }
    );
  }
}
