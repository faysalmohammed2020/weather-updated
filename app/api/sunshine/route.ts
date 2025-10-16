import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";

export async function POST(req: Request) {
  try {
    const { date, hours, total, stationId: bodyStationId } = await req.json();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = session.user.id;
    const stationId = bodyStationId ?? session.user.station?.id;

    // Validate date
    if (!date) return NextResponse.json({ error: "Missing date" }, { status: 400 });
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }

    // Validate hours array
    if (!Array.isArray(hours)) {
      return NextResponse.json({ error: "'hours' must be an array" }, { status: 400 });
    }
    if (hours.length !== 14) {
      return NextResponse.json({ error: "'hours' must contain 14 numeric entries (for 5-19)" }, { status: 400 });
    }
    if (!hours.every((h: unknown) => typeof h === "number" && h >= 0 && h <= 1)) {
      return NextResponse.json({ error: "Each hour value must be a number between 0 and 1" }, { status: 400 });
    }

    // Validate total and stationId
    if (typeof total !== "number" || total < 0) {
      return NextResponse.json({ error: "'total' must be a non-negative number" }, { status: 400 });
    }
    if (!stationId) {
      return NextResponse.json({ error: "Missing stationId" }, { status: 400 });
    }

    const existing = await prisma.sunshineData.findUnique({
      where: { date_stationId: { date: parsedDate, stationId } },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Sunshine entry already exists for this date" },
        { status: 409 }
      );
    }

    await prisma.sunshineData.create({
      data: { date: parsedDate, hours, total, stationId, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Sunshine POST error:", error);
    return NextResponse.json({ error: "Server error", message: error?.message ?? "" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const stationId = session.user.station?.id;

    const sunshineData = await prisma.sunshineData.findMany({
      where: { stationId: stationId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(sunshineData);
  } catch (error) {
    console.error("Sunshine GET error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
