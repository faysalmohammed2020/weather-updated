// app/api/rainfallcalculation/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function GET() {
  const session = await getSession();

  if (!session || !session.user?.station?.id) {
    return NextResponse.json(
      { error: "Unauthorized or station not found" },
      { status: 401 }
    );
  }

  const stationId = session.user.station.id;

  const data = await prisma.weatherObservation.findMany({
    where: {
      rainfallSincePrevious: { not: null },
      ObservingTime: {
        stationId: stationId,
      },
    },
    select: {
      rainfallSincePrevious: true,
      ObservingTime: {
        select: {
          utcTime: true,
        },
      },
    },
    orderBy: {
      ObservingTime: {
        utcTime: "desc",
      },
    },
  });

  return NextResponse.json(
    data.map((item) => ({
      utcTime: item.ObservingTime.utcTime,
      rainfallSincePrevious: item.rainfallSincePrevious,
    }))
  );
}
