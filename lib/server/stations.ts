// lib/server/stations.ts
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import type { Station } from "@prisma/client"; // আপনার Station টাইপ যেটা

export async function getStationsForSession(): Promise<Station[]> {
  const session = await getSession();

  // No session → public access → all stations
  if (!session?.user) {
    return prisma.station.findMany();
  }

  const role = session.user.role;

  if (role === "super_admin") {
    return prisma.station.findMany();
  }

  if (role === "station_admin" || role === "observer") {
    if (!session.user.stationId) return [];
    return prisma.station.findMany({
      where: { id: session.user.stationId },
    });
  }

  return [];
}
