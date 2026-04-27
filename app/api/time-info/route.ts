import { NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import prisma from "@/lib/prisma";
import { TimeInfo } from "@/lib/data-type";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { message: "Date parameter is required" },
        { status: 400 }
      );
    }

    const stationId = session.user.station?.id;
    if (!stationId) {
      return NextResponse.json(
        { message: "Station ID is required" },
        { status: 400 }
      );
    }

    // Create UTC date range for the selected date
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

    const observingTimes = await prisma.observingTime.findMany({
      where: {
        AND: [
          { utcTime: { gte: startOfDay, lte: endOfDay } },
          { stationId },
        ],
      },
      include: {
        _count: {
          select: {
            MeteorologicalEntry: true,
            WeatherObservation: true,
            SynopticCode: true,
            DailySummary: true,
          },
        },
      },
      orderBy: { utcTime: "asc" },
    });

    const timeInfo: TimeInfo[] = observingTimes.map((ot) => ({
      id: ot.id,
      userId: ot.userId,
      stationId: ot.stationId,
      utcTime: ot.utcTime,
      localTime: ot.localTime,
      createdAt: ot.createdAt,
      updatedAt: ot.updatedAt,
      hasMeteorologicalEntry: ot._count.MeteorologicalEntry > 0,
      hasWeatherObservation: ot._count.WeatherObservation > 0,
      hasSynopticCode: ot._count.SynopticCode > 0,
      hasDailySummary: ot._count.DailySummary > 0,
    }));

    return NextResponse.json({ timeInfo }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching time info:", error);
    return NextResponse.json(
      { message: "Failed to fetch time info", error: error.message },
      { status: 500 }
    );
  }
}
