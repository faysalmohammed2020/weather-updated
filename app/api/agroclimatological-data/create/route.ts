import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/getSession";
import { LogAction, LogActionType, LogModule } from "@/lib/log";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Please log in" },
      { status: 401 }
    );
  }

  // Ensure correct content-type
  if (!req.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      { success: false, message: "Content-Type must be application/json" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    // Safe number parser
    const n = (v: any) =>
      v === null || v === undefined || v === "" || isNaN(Number(v))
        ? null
        : Number(v);

    const result = await prisma.agroclimatologicalData.create({
      data: {
        elevation: n(body.stationInfo.elevation) ?? 0,
        date: new Date(body.date),
        utcTime: body.utcTime,

        solarRadiation: n(body.solarRadiation),
        sunShineHour: n(body.sunShineHour),

        airTempDry05m: n(body.airTemperature.dry05m),
        airTempWet05m: n(body.airTemperature.wet05m),
        airTempDry12m: n(body.airTemperature.dry12m),
        airTempWet12m: n(body.airTemperature.wet12m),
        airTempDry22m: n(body.airTemperature.dry22m),
        airTempWet22m: n(body.airTemperature.wet22m),

        minTemp: n(body.minTemp),
        maxTemp: n(body.maxTemp),
        meanTemp: n(body.meanTemp),
        grassMinTemp: n(body.grassMinTemp),

        soilTemp5cm: n(body.soilTemperature.depth5cm),
        soilTemp10cm: n(body.soilTemperature.depth10cm),
        soilTemp20cm: n(body.soilTemperature.depth20cm),
        soilTemp30cm: n(body.soilTemperature.depth30cm),
        soilTemp50cm: n(body.soilTemperature.depth50cm),

        soilMoisture0to20cm: n(body.soilMoisture.depth0to20cm),
        soilMoisture20to50cm: n(body.soilMoisture.depth20to50cm),

        panWaterEvap: n(body.panWaterEvap),
        relativeHumidity: n(body.relativeHumidity),
        evaporation: n(body.evaporation),
        dewPoint: n(body.dewPoint),

        windSpeed: n(body.windSpeed),
        duration: n(body.duration),
        rainfall: n(body.rainfall),

        userId: session.user.id,
        stationId: body.stationId,
      },
    });

    await LogAction({
      init: prisma,
      action: LogActionType.CREATE,
      actionText: "Agroclimatological Data Created",
      role: session.user.role ?? "observer",
      actorId: session.user.id!,
      actorEmail: session.user.email ?? undefined,
      module: LogModule.AGROCLIMATOLOGICAL_DATA,
      details: {
        id: result.id,
        stationId: result.stationId,
        date: result.date.toISOString(),
        utcTime: result.utcTime,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Agroclimatological data submitted successfully!",
      data: result,
    });
  } catch (error: any) {
    console.error("Create Error:", error);

    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Duplicate entry: data already exists for this date & time.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unexpected server error",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
