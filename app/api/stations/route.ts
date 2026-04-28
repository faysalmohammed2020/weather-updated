import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { LogAction, LogActionType, LogModule } from "@/lib/log";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET stations based on role
export async function GET() {
  try {
    const session = await getSession();

    let stations;

    if (!session?.user) {
      // If no session, return all stations (public access)
      stations = await prisma.station.findMany({
        orderBy: {
          name: 'asc'
        }
      });
      return NextResponse.json(stations, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }

    // Filter stations based on user role
    if (session.user.role === "super_admin" || session.user.role === "root_admin") {
      // Super admin can see all stations
      stations = await prisma.station.findMany({
        orderBy: {
          name: 'asc'
        }
      });
    } else if (
      session.user.role === "station_admin" ||
      session.user.role === "observer"
    ) {
      // Station admin and observer can only see their assigned station
      if (!session.user.stationId) {
        return NextResponse.json(
          { error: "No station assigned to user" },
          { status: 404 }
        );
      }

      stations = await prisma.station.findMany({
        where: {
          id: session.user.stationId,
        },
        orderBy: {
          name: 'asc'
        }
      });
    } else {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    return NextResponse.json(stations, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { message: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}

// POST create new station
export async function POST(request: Request) {
  try {
    const session = await getSession();
    const { name, stationId, securityCode, latitude, longitude } =
      await request.json();

    // Validate required fields
    if (!name || !stationId || !securityCode) {
      return NextResponse.json(
        { error: "Name, stationId, and securityCode are required" },
        { status: 400 }
      );
    }

    const station = await prisma.station.create({
      data: {
        name,
        stationId,
        securityCode,
        latitude: latitude ? Number.parseFloat(latitude) : 23.685, // Default latitude if not provided
        longitude: longitude ? Number.parseFloat(longitude) : 90.3563, // Default longitude if not provided
      },
    });

    if (session?.user?.id) {
      await LogAction({
        init: prisma,
        action: LogActionType.CREATE,
        actionText: "Station Created",
        role: session.user.role ?? "observer",
        actorId: session.user.id!,
        actorEmail: session.user.email ?? undefined,
        module: LogModule.STATION,
        details: {
          id: station.id,
          stationId: station.stationId,
          name: station.name,
        },
      });
    }

    return NextResponse.json(station);
  } catch (error) {
    console.error("Error creating station:", error);
    return NextResponse.json(
      { error: "Failed to create station" },
      { status: 500 }
    );
  }
}
