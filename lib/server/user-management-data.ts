// lib/server/user-management-data.ts
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import type { Station } from "@prisma/client";

/**
 * Users fetch (server-only, build-safe)
 * Mirrors your /api/users logic but without HTTP.
 */
export async function getUsersForSession(params: {
  limit: number;
  offset: number;
  status?: "active" | "banned" | "all";
}): Promise<{ users: any[]; total: number }> {
  const session = await getSession();

  const notBannedFilter = { banned: { not: true } };
  const statusFilterParam = params.status || "active";
  const statusFilter =
    statusFilterParam === "banned"
      ? { banned: true }
      : statusFilterParam === "all"
      ? {}
      : notBannedFilter;

  // No session (আপনার ইচ্ছামতো রাখুন)
  if (!session?.user) {
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where: notBannedFilter,
        skip: params.offset,
        take: params.limit,
        orderBy: { createdAt: "desc" },
        include: {
          Station: {
            select: { id: true, name: true, securityCode: true },
          },
        },
      }),
      prisma.users.count({ where: notBannedFilter }),
    ]);
    return { users, total };
  }

  const role = session.user.role;
  const isPrivileged = role === "super_admin" || role === "root_admin";

  // ✅ non-privileged: safe default (only self)
  if (!isPrivileged) {
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where: { id: session.user.id, ...notBannedFilter },
        include: {
          Station: {
            select: { id: true, name: true, securityCode: true },
          },
        },
      }),
      prisma.users.count({ where: { id: session.user.id, ...notBannedFilter } }),
    ]);
    return { users, total };
  }

  // ✅ super_admin/root_admin → all users
  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where: statusFilter,
      skip: params.offset,
      take: params.limit,
      orderBy: { createdAt: "desc" },
      include: {
        Station: {
          select: { id: true, name: true, securityCode: true },
        },
      },
    }),
    prisma.users.count({ where: statusFilter }),
  ]);

  return { users, total };
}

/**
 * Stations fetch (server-only, build-safe)
 * Mirrors your /api/stations logic but without HTTP.
 */
export async function getStationsForSession(): Promise<Station[]> {
  const session = await getSession();

  // No session → public access → all stations (আপনি চাইলে 401/[] করতে পারেন)
  if (!session?.user) {
    return prisma.station.findMany();
  }

  const role = session.user.role;
  const isPrivileged = role === "super_admin" || role === "root_admin";

  // ✅ super_admin/root_admin => all stations
  if (isPrivileged) {
    return prisma.station.findMany();
  }

  // ✅ station_admin/observer => only assigned station
  if (role === "station_admin" || role === "observer") {
    const userStationId = session.user.stationId;
    if (!userStationId) return [];

    // ✅ support both DB id and business stationId
    return prisma.station.findMany({
      where: {
        OR: [{ id: userStationId }, { stationId: userStationId }],
      },
    });
  }

  return [];
}
