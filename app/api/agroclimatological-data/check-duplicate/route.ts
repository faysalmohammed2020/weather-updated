import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/getSession"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const session = await getSession()

  if (!session?.user) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const dateParam = searchParams.get("date")
    const utcHourParam = searchParams.get("utcHour")

    if (!dateParam || !utcHourParam) {
      return NextResponse.json({ success: false, message: "Date and UTC hour are required" }, { status: 400 })
    }

    // Parse the date
    const date = new Date(dateParam)
    if (isNaN(date.getTime())) {
      return NextResponse.json({ success: false, message: "Invalid date format" }, { status: 400 })
    }

    // Convert UTC hour to string format
    const utcTime = utcHourParam.padStart(2, "0")

    // Set date to start of day for comparison
    date.setHours(0, 0, 0, 0)
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    // Check for existing data
    const existingData = await prisma.agroclimatologicalData.findFirst({
      where: {
        stationId: session.user.station?.id,
        date: {
          gte: date,
          lt: nextDay,
        },
        utcTime: utcTime,
      },
      include: {
        station: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      success: true,
      exists: !!existingData,
      data: existingData,
    })
  } catch (error: any) {
    console.error("Error checking for duplicate data:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check for duplicate data",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
