import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// PUT update station
export async function PUT(
  request: Request,
  { params }: Ctx
) {
  try {
    const { id } = await params; // ✅ await params

    const { name, stationId, securityCode, latitude, longitude } =
      await request.json();

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

    await prisma.station.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting station:", error);
    return NextResponse.json(
      { error: "Failed to delete station" },
      { status: 500 }
    );
  }
}
