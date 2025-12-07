import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const revalidate = 0;

type NullableString = string | null;

const formatTemperature = (value: NullableString) => {
  const numeric = value !== null ? Number(value) : NaN;
  if (!Number.isFinite(numeric)) return null;
  // Temperatures are stored in tenths - align with other daily summary endpoints
  return Number((numeric / 10).toFixed(1));
};

const formatNumber = (value: NullableString, precision = 1) => {
  const numeric = value !== null ? Number(value) : NaN;
  if (!Number.isFinite(numeric)) return null;
  return Number(numeric.toFixed(precision));
};

export async function GET() {
  try {
    const latest = await prisma.dailySummary.findFirst({
      orderBy: {
        ObservingTime: {
          utcTime: "desc",
        },
      },
      select: {
        id: true,
        maxTemperature: true,
        minTemperature: true,
        totalPrecipitation: true,
        windSpeed: true,
        avRelativeHumidity: true,
        ObservingTime: {
          select: {
            utcTime: true,
            station: {
              select: {
                id: true,
                stationId: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!latest) {
      return NextResponse.json(
        { success: false, message: "No weather data found" },
        { status: 404 }
      );
    }

    const responsePayload = {
      station: latest.ObservingTime?.station || null,
      observedAt: latest.ObservingTime?.utcTime?.toISOString() || null,
      maxTemperature: formatTemperature(latest.maxTemperature),
      minTemperature: formatTemperature(latest.minTemperature),
      totalPrecipitation: formatNumber(latest.totalPrecipitation),
      windSpeed: formatNumber(latest.windSpeed),
      avRelativeHumidity: formatNumber(latest.avRelativeHumidity),
    };

    return NextResponse.json({ success: true, data: responsePayload });
  } catch (error) {
    console.error("Error loading home weather data:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load weather data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
