"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function getLogs({
  limit = 10,
  offset = 0,
  search = "",
  action = "",
  role = "",
  module = "",
  startDate,
  endDate,
}: {
  limit?: number;
  offset?: number;
  search?: string;
  action?: string;
  role?: string;
  module?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  try {
    const session = await getSession();

    if (!session) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }

    let whereCondition: any;

    if (session.user.role === "root_admin") {
     
      whereCondition = {};
    } else if (session.user.role === "super_admin") {
     
      whereCondition = {
        NOT: { role: "root_admin" },
      };
    } else if (session.user.role === "station_admin") {
    
      const stationPk = session.user.station?.id;
      const stationCode = session.user.station?.stationId;

      whereCondition = {
        OR: [
          {
            AND: [
              { role: "observer" },
              {
                OR: [
                  stationPk ? { targetUser: { stationId: stationPk } } : undefined,
                  stationCode ? { targetUser: { stationId: stationCode } } : undefined,
                ].filter(Boolean),
              },
            ],
          },
          {
            actor: { id: session.user.id },
          },
          {
            AND: [
              { role: "observer" },
              {
                OR: [
                  stationPk ? { actor: { stationId: stationPk } } : undefined,
                  stationCode ? { actor: { stationId: stationCode } } : undefined,
                ].filter(Boolean),
              },
            ],
          },
        ],
      };
    } else {
      whereCondition = {
        AND: [{ role: "observer" }],
      };
    }
    const searchFilters: any[] = [];

    if (search && search.trim()) {
      searchFilters.push({
        OR: [
          { actorEmail: { contains: search, mode: "insensitive" } },
          { targetEmail: { contains: search, mode: "insensitive" } },
          { actionText: { contains: search, mode: "insensitive" } },
          { actor: { name: { contains: search, mode: "insensitive" } } },
          { targetUser: { name: { contains: search, mode: "insensitive" } } },
        ],
      });
    }

    if (action && action.trim()) {
      searchFilters.push({ action: { equals: action, mode: "insensitive" } });
    }

    if (role && role.trim()) {
      searchFilters.push({ role: { equals: role, mode: "insensitive" } });
    }

    if (module && module.trim()) {
      searchFilters.push({ module: { contains: module, mode: "insensitive" } });
    }

    if (startDate) {
      searchFilters.push({ createdAt: { gte: startDate } });
    }

    if (endDate) {
      searchFilters.push({ createdAt: { lte: endDate } });
    }

    // Combine role-based condition with search filters
    if (searchFilters.length > 0) {
      whereCondition = {
        AND: [whereCondition, ...searchFilters],
      };
    }

    const [logs, total] = await Promise.all([
      prisma.logs.findMany({
        where: whereCondition,
        orderBy: {
          createdAt: "desc",
        },
        skip: offset,
        take: limit,
        include: {
          actor: true,
          targetUser: true,
        },
      }),
      prisma.logs.count({
        where: whereCondition,
      }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error("Error fetching logs:", error);
    return {
      error: `Failed to fetch logs: ${error}`,
      status: 500,
    };
  }
}
