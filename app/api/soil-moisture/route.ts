// app/api/soil-moisture/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ authOptions export থাকতে হবে

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();

    const user = session.user as any;

    // ✅ station id resolve (JWT/session callback এ যে নামেই রাখো)
    const stationId =
      user?.station?.id || user?.stationId || user?.station?.stationId;

    if (!stationId) {
      return NextResponse.json(
        { message: "Station ID is required" },
        { status: 400 }
      );
    }

    const date = new Date(data.date);
    const depth = parseInt(data.depth);

    if (!data.date || Number.isNaN(depth)) {
      return NextResponse.json(
        { message: "Invalid date/depth" },
        { status: 400 }
      );
    }

    // ✅ Duplicate check
    const existing = await prisma.soilMoistureData.findFirst({
      where: {
        date,
        depth,
        stationId,
      },
      select: { id: true },
    });

    let record;

    if (existing) {
      // ✅ Update existing
      record = await prisma.soilMoistureData.update({
        where: { id: existing.id },
        data: {
          w1: parseFloat(data.w1),
          w2: parseFloat(data.w2),
          w3: parseFloat(data.w3),
          Ws: parseFloat(data.Ws),
          Ds: parseFloat(data.Ds),
          Sm: parseFloat(data.Sm),
          userId: user.id,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json(
        { message: "Data updated successfully", data: record },
        { status: 200 }
      );
    }

    // ✅ Create new
    record = await prisma.soilMoistureData.create({
      data: {
        date,
        depth,
        w1: parseFloat(data.w1),
        w2: parseFloat(data.w2),
        w3: parseFloat(data.w3),
        Ws: parseFloat(data.Ws),
        Ds: parseFloat(data.Ds),
        Sm: parseFloat(data.Sm),
        stationId,
        userId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      { message: "Data saved successfully", data: record },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving soil moisture data:", error);
    return NextResponse.json(
      { message: "Failed to save data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = session.user as any;
    const stationId =
      user?.station?.id || user?.stationId || user?.station?.stationId;

    if (!stationId) {
      return NextResponse.json(
        { message: "Station ID is required" },
        { status: 400 }
      );
    }

    const data = await prisma.soilMoistureData.findMany({
      where: { stationId },
      orderBy: { date: "desc" },
      include: {
        station: { select: { id: true, name: true, stationId: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching soil moisture data:", error);
    return NextResponse.json(
      { message: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
