// lib/server/stations.ts
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import type { Station } from "@prisma/client";

export async function getStationsForSession(): Promise<Station[]> {
  const session = await getSession();

  // ✅ No session → (recommended: return [] to avoid leaking)
  // যদি তুমি সত্যিই public access চাও, তাহলে findMany() রাখো.
  if (!session?.user) {
    return prisma.station.findMany();
  }

  const role = session.user.role;

  // ✅ root_admin + super_admin => all stations
  if (role === "super_admin" || role === "root_admin") {
    return prisma.station.findMany();
  }

  // ✅ station_admin / observer => only their station
  if (role === "station_admin" || role === "observer") {
    const userStationId = session.user.stationId;
    if (!userStationId) return [];

    // ✅ support both DB id and business stationId (safe)
    return prisma.station.findMany({
      where: {
        OR: [{ id: userStationId }, { stationId: userStationId }],
      },
    });
  }

  return [];
}
