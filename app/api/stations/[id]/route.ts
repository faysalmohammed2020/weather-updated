import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { LogAction, LogActionType, LogModule } from "@/lib/log";

type Ctx = { params: Promise<{ id: string }> };

// PUT update station
export async function PUT(
  request: Request,
  { params }: Ctx
) {
  try {
    const { id } = await params; // ✅ await params
    const session = await getSession();

    const { name, stationId, securityCode, latitude, longitude } =
      await request.json();

    const existingStation = await prisma.station.findUnique({
      where: { id },
    });

    const updatedStation = await prisma.station.update({
      where: { id },
      data: {
        name,
        stationId,
        securityCode,
        ...(latitude !== undefined && {
          latitude: Number.parseFloat(latitude),
        }),
        ...(longitude !== undefined && {
          longitude: Number.parseFloat(longitude),
        }),
      },
    });

    if (session?.user?.id) {
      const safeBefore = existingStation
        ? {
            id: existingStation.id,
            stationId: existingStation.stationId,
            name: existingStation.name,
            latitude: existingStation.latitude,
            longitude: existingStation.longitude,
          }
        : null;
      const safeAfter = {
        id: updatedStation.id,
        stationId: updatedStation.stationId,
        name: updatedStation.name,
        latitude: updatedStation.latitude,
        longitude: updatedStation.longitude,
      };

      await LogAction({
        init: prisma,
        action: LogActionType.UPDATE,
        actionText: "Station Updated",
        role: session.user.role ?? "observer",
        actorId: session.user.id!,
        actorEmail: session.user.email ?? undefined,
        module: LogModule.STATION,
        details: {
          before: safeBefore,
          after: safeAfter,
          securityCodeChanged: existingStation
            ? existingStation.securityCode !== updatedStation.securityCode
            : undefined,
        },
      });
    }

    return NextResponse.json(updatedStation);
  } catch (error) {
    console.error("Error updating station:", error);
    return NextResponse.json(
      { error: "Failed to update station" },
      { status: 500 }
    );
  }
}

// DELETE station
export async function DELETE(
  request: Request,
  { params }: Ctx
) {
  try {
    const { id } = await params; // ✅ await params
    const session = await getSession();

    const existingStation = await prisma.station.findUnique({
      where: { id },
    });

    await prisma.station.delete({
      where: { id },
    });

    if (session?.user?.id) {
      const safeDetails = existingStation
        ? {
            id: existingStation.id,
            stationId: existingStation.stationId,
            name: existingStation.name,
            latitude: existingStation.latitude,
            longitude: existingStation.longitude,
          }
        : { id };

      await LogAction({
        init: prisma,
        action: LogActionType.DELETE,
        actionText: "Station Deleted",
        role: session.user.role ?? "observer",
        actorId: session.user.id!,
        actorEmail: session.user.email ?? undefined,
        module: LogModule.STATION,
        details: safeDetails,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting station:", error);
    return NextResponse.json(
      { error: "Failed to delete station" },
      { status: 500 }
    );
  }
}
