import prisma from "@/lib/prisma";
import { hourToUtc } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/getSession";
import moment from "moment";

const SLOT_HOURS = [0, 3, 6, 9, 12, 15, 18, 21] as const;

const formatUtcSlot = (date: Date) =>
  `${date.toISOString().slice(0, 10)} ${String(date.getUTCHours()).padStart(2, "0")} UTC`;

const getPreviousSlotUtc = (target: Date): Date | null => {
  const hour = target.getUTCHours();
  const index = SLOT_HOURS.indexOf(hour as (typeof SLOT_HOURS)[number]);
  if (index <= 0) return null;

  return new Date(
    Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      target.getUTCDate(),
      SLOT_HOURS[index - 1],
      0,
      0,
      0
    )
  );
};

// Check if observing time exist or not and return each data count
export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { hour } = body;

  try {
    const formattedUtcTime = hourToUtc(hour);
    const targetUtcTime = new Date(formattedUtcTime);
    if (!SLOT_HOURS.includes(targetUtcTime.getUTCHours() as (typeof SLOT_HOURS)[number])) {
      return NextResponse.json(
        {
          allowFirstCard: false,
          allowSecondCard: false,
          message: "Invalid observing slot. Use 00, 03, 06, 09, 12, 15, 18, or 21 UTC.",
        },
        { status: 400 }
      );
    }

    const yesterDayUtcTime = moment(formattedUtcTime)
      .subtract(1, "day")
      .toDate();

    // Get selected slot, yesterday slot, and latest completed slot with pending synoptic
    const [observingTime, yesterdayObservingTime, pendingSynopticSlot] =
      await prisma.$transaction([
      prisma.observingTime.findFirst({
        where: {
          AND: [
            {
              utcTime: formattedUtcTime,
            },
            {
              stationId: session.user.station?.id,
            },
          ],
        },
        orderBy: {
          utcTime: "desc",
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
      }),
      prisma.observingTime.findFirst({
        where: {
          AND: [
            {
              utcTime: yesterDayUtcTime,
            },
            {
              stationId: session.user.station?.id,
            },
          ],
        },
        include: {
          MeteorologicalEntry: true,
        },
        orderBy: {
          utcTime: "desc",
        },
      }),
      prisma.observingTime.findFirst({
        where: {
          stationId: session.user.station?.id,
          MeteorologicalEntry: { some: {} },
          WeatherObservation: { some: {} },
          SynopticCode: { none: {} },
        },
        select: {
          utcTime: true,
        },
        orderBy: {
          utcTime: "desc",
        },
      }),
      ]);

    if (
      pendingSynopticSlot &&
      pendingSynopticSlot.utcTime.getTime() < targetUtcTime.getTime()
    ) {
      return NextResponse.json(
        {
          allowFirstCard: false,
          allowSecondCard: false,
          message: `Synoptic pending for ${formatUtcSlot(
            pendingSynopticSlot.utcTime
          )}. Submit it before entering a newer slot.`,
          pendingSynopticUtc: pendingSynopticSlot.utcTime,
          yesterday: {
            meteorologicalEntry: yesterdayObservingTime
              ? yesterdayObservingTime.MeteorologicalEntry
              : [],
          },
        },
        { status: 409 }
      );
    }

    if (!observingTime) {
      const previousSlotUtc = getPreviousSlotUtc(targetUtcTime);
      if (previousSlotUtc) {
        const previousSlotEntry = await prisma.observingTime.findFirst({
          where: {
            stationId: session.user.station?.id,
            utcTime: previousSlotUtc,
            MeteorologicalEntry: { some: {} },
          },
          select: { utcTime: true },
        });

        if (!previousSlotEntry) {
          return NextResponse.json(
            {
              allowFirstCard: false,
              allowSecondCard: false,
              message: `Serial entry required. Submit first card for ${formatUtcSlot(
                previousSlotUtc
              )} before ${formatUtcSlot(targetUtcTime)}.`,
              missingPreviousUtc: previousSlotUtc,
              yesterday: {
                meteorologicalEntry: yesterdayObservingTime
                  ? yesterdayObservingTime.MeteorologicalEntry
                  : [],
              },
            },
            { status: 409 }
          );
        }
      }

      return NextResponse.json(
        {
          allowFirstCard: true,
          allowSecondCard: false,
          message: "First card data not found!",
          yesterday: {
            meteorologicalEntry: yesterdayObservingTime
              ? yesterdayObservingTime.MeteorologicalEntry
              : [],
          },
        },
        { status: 400 }
      );
    }

    if (observingTime && observingTime._count.WeatherObservation > 0) {
      return NextResponse.json(
        {
          allowFirstCard: false,
          allowSecondCard: false,
          message: "Observing time already exists!",
          yesterday: {
            meteorologicalEntry: yesterdayObservingTime
              ? yesterdayObservingTime.MeteorologicalEntry
              : [],
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      allowFirstCard: false,
      allowSecondCard: true,
      message: "Observing time already exists!",
      time: observingTime.utcTime,
      yesterday: {
        meteorologicalEntry: yesterdayObservingTime
          ? yesterdayObservingTime.MeteorologicalEntry
          : [],
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: true,
        message: "Failed to check time",
      },
      { status: 500 }
    );
  }
}


