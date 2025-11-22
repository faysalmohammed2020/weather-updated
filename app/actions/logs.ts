"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";

export async function getLogs({
  limit = 10,
  offset = 0,
}: {
  limit?: number;
  offset?: number;
} = {}) {
  try {
    const session = await getSession();

    if (!session) {
      return {
        error: "Unauthorized",
        status: 401,
      };
    }

    // For super_admin: show all logs
    // For station_admin: show observer logs + impersonation logs for their station users
    // For observer: not allowed to view logs (blocked in page.tsx)
    let whereCondition;

    if (session.user.role === "super_admin") {
      // Super admin sees all logs
      whereCondition = {};
    } else if (session.user.role === "station_admin") {
      // Station admin sees:
      // 1. Observer logs in their station
      // 2. Impersonation logs where they impersonated observers in their station
      whereCondition = {
        OR: [
          // Observer logs in their station
          {
            AND: [
              { role: "observer" },
              {
                actor: {
                  stationId: session.user.station?.id,
                },
              },
            ],
          },
          // Impersonation logs where station_admin impersonated someone in their station
          {
            AND: [
              { actionText: "User Impersonation Started" },
              {
                actor: {
                  id: session.user.id, // The station_admin who did the impersonation
                },
              },
            ],
          },
          // Stop impersonation logs
          {
            AND: [
              { actionText: "User Impersonation Stopped" },
              {
                actor: {
                  id: session.user.id, // The station_admin who stopped the impersonation
                },
              },
            ],
          },
        ],
      };
    } else {
      // Observer role - shouldn't reach here but just in case
      whereCondition = {
        AND: [{ role: "observer" }],
      };
    }

    // Get logs with pagination
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
