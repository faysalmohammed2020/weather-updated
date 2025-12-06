// lib/server/user-management-data.ts
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import type { User, Station } from "@prisma/client";

/**
 * Users fetch (server-only, build-safe)
 * Mirrors your /api/users logic but without HTTP.
 */
export async function getUsersForSession(params: {
  limit: number;
  offset: number;
}): Promise<{ users: any[]; total: number }> {
  const session = await getSession();

  // যদি আপনার সিস্টেমে public users দেখা যাবে না,
  // তাহলে এখানে empty return করতে পারেন।
  if (!session?.user) {
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        skip: params.offset,
        take: params.limit,
        orderBy: { createdAt: "desc" },
        include: {
          Station: {
            select: { id: true, name: true, securityCode: true },
          },
        },
      }),
      prisma.users.count(),
    ]);
    return { users, total };
  }

  // আপনার আগের প্যাটার্ন ফলো করে:
  if (session.user.role !== "super_admin") {
    // non-super admin দের জন্য আপনি যা চান সেটা দিন:
    // এখানে আমি নিরাপদভাবে নিজের user-ই দিচ্ছি।
    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where: { id: session.user.id },
        include: {
          Station: {
            select: { id: true, name: true, securityCode: true },
          },
        },
      }),
      prisma.users.count({ where: { id: session.user.id } }),
    ]);
    return { users, total };
  }

  // super_admin → all users
  const [users, total] = await Promise.all([
    prisma.users.findMany({
      skip: params.offset,
      take: params.limit,
      orderBy: { createdAt: "desc" },
      include: {
        Station: {
          select: { id: true, name: true, securityCode: true },
        },
      },
    }),
    prisma.users.count(),
  ]);

  return { users, total };
}

/**
 * Stations fetch (server-only, build-safe)
 * Mirrors your /api/stations logic but without HTTP.
 */
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
