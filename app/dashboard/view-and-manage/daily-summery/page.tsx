import DailySummaryView from "./DailySummaryView";
import type { DailySummaryViewHandle } from "./DailySummaryView";
import type { DailySummaryRecord, DailySummaryUser } from "@/lib/types/dailySummary";
import type { Station } from "@/lib/types/station";
import { getSession } from "@/lib/getSession";
import prisma from "@/lib/prisma";
import { todayISO } from "@/lib/utils/date-utils";
import { parseISO, isValid } from "date-fns";

interface DailySummaryPageProps {
  initialRecords: DailySummaryRecord[];
  initialStations: Station[];
}

async function getStations(): Promise<Station[]> {
  try {
    const stations = await prisma.station.findMany({
      select: { id: true, stationId: true, name: true },
      orderBy: { name: 'asc' }
    });
    return stations;
  } catch (error) {
    console.error("Error fetching stations:", error);
    return [];
  }
}

async function getDailySummaryRecords(): Promise<DailySummaryRecord[]> {
  const session = await getSession();
  
  if (!session?.user) {
    return [];
  }

  try {
    const today = todayISO();
    
    const where: any = {
      ObservingTime: {
        utcTime: {
          gte: new Date(today),
          lte: new Date(today)
        }
      }
    };

    // Only super admins can see all data, others see their station's data
    if (session.user.role !== "super_admin" && session.user.station?.id) {
      where.ObservingTime.stationId = session.user.station.id;
    }

    const rawSummaries = await prisma.dailySummary.findMany({
      where,
      select: {
        id: true,
        dataType: true,
        createdAt: true,
        avStationPressure: true,
        avSeaLevelPressure: true,
        avDryBulbTemperature: true,
        avWetBulbTemperature: true,
        maxTemperature: true,
        minTemperature: true,
        totalPrecipitation: true,
        avDewPointTemperature: true,
        avRelativeHumidity: true,
        windSpeed: true,
        windDirectionCode: true,
        maxWindSpeed: true,
        maxWindDirection: true,
        avTotalCloud: true,
        lowestVisibility: true,
        totalRainDuration: true,
        ObservingTime: {
          select: {
            utcTime: true,
            stationId: true,
            userId: true,
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
      orderBy: {
        ObservingTime: {
          utcTime: "desc",
        },
      },
    });

    // Group by stationId + date and calculate averages
    const grouped: Record<string, any[]> = {};

    for (const entry of rawSummaries) {
      const stationId = entry.ObservingTime.stationId;
      const dateKey = new Date(entry.ObservingTime.utcTime)
        .toISOString()
        .split("T")[0];
      const key = `${stationId}_${dateKey}`;

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    }

    const averagedSummaries = Object.values(grouped).map((entries) => {
      const first = entries[0];

      const averageField = (field: keyof typeof first, factor = 1) => {
        const values = entries
          .map((e) => parseFloat(e[field] as any))
          .filter((v) => !isNaN(v));
        if (values.length === 0) return null;
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return (avg / factor).toFixed(1);
      };

      return {
        ...first,
        maxTemperature: averageField("maxTemperature", 10),
        minTemperature: averageField("minTemperature", 10),
        totalPrecipitation: averageField("totalPrecipitation"),
        windSpeed: averageField("windSpeed"),
        avTotalCloud: averageField("avTotalCloud"),
        totalRainDuration: averageField("totalRainDuration"),
        avRelativeHumidity: averageField("avRelativeHumidity"),
        lowestVisibility: averageField("lowestVisibility"),
      };
    });

    // Convert Date objects to ISO strings for consistent serialization
    const serializedSummaries = averagedSummaries.map(summary => ({
      ...summary,
      createdAt: summary.createdAt ? summary.createdAt.toISOString() : null,
      ObservingTime: summary.ObservingTime ? {
        ...summary.ObservingTime,
        utcTime: summary.ObservingTime.utcTime.toISOString(),
      } : null,
    }));

    return serializedSummaries;
  } catch (error) {
    console.error("Error fetching daily summary data:", error);
    return [];
  }
}

export default async function DailySummeryPage() {
  const [initialRecords, initialStations] = await Promise.all([
    getDailySummaryRecords(),
    getStations()
  ]);

  return (
    <DailySummaryView 
      initialRecords={initialRecords}
      initialStations={initialStations}
    />
  );
}
