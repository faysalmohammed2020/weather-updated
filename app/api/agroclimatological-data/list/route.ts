import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const stationId = searchParams.get("stationId");

    const limit = Math.min(Number(searchParams.get("limit") || "50"), 100);
    const offset = Number(searchParams.get("offset") || "0");

    const where: any = {};

    // Date Range
    if (startDateParam && endDateParam) {
      const start = new Date(startDateParam);
      const end = new Date(endDateParam);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    // Station
    if (stationId && stationId !== "all") {
      where.stationId = stationId;
    } else if (session.user.role !== "super_admin") {
      where.stationId = session.user.station?.id;
    }

    // Non-super admin access restriction
    if (session.user.role !== "super_admin") {
      where.OR = [
        { userId: session.user.id },
        { stationId: session.user.station?.id },
      ].filter(Boolean);
    }

    const [rows, total] = await Promise.all([
      prisma.agroclimatologicalData.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          station: { select: { id: true, name: true } },
        },
        orderBy: [{ date: "desc" }, { utcTime: "desc" }],
        skip: offset,
        take: limit,
      }),
      prisma.agroclimatologicalData.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error("List Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch data",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
