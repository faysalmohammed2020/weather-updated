// app/dashboard/data-entry/agroclimatological/page.tsx
import AgroclimatologicalDataTable from "./agroclimatological-data-table"
import { getSession } from "@/lib/getSession"
import prisma from "@/lib/prisma"

interface Station {
  id: string
  name: string
}

interface AgroclimatologicalData {
  id: string
  createdAt: string
  updatedAt: string
  elevation: number | null
  date: string
  utcTime: string
  solarRadiation: number | null
  sunShineHour: number | null
  airTempDry05m: number | null
  airTempWet05m: number | null
  airTempDry12m: number | null
  airTempWet12m: number | null
  airTempDry22m: number | null
  airTempWet22m: number | null
  minTemp: number | null
  maxTemp: number | null
  meanTemp: number | null
  grassMinTemp: number | null
  soilTemp5cm: number | null
  soilTemp10cm: number | null
  soilTemp20cm: number | null
  soilTemp30cm: number | null
  soilTemp50cm: number | null
  soilMoisture0to20cm: number | null
  soilMoisture20to50cm: number | null
  panWaterEvap: number | null
  relativeHumidity: number | null
  evaporation: number | null
  dewPoint: number | null
  windSpeed: number | null
  duration: number | null
  rainfall: number | null
  userId: string | null;
  stationId: string
  user: {
    id: string
    name: string | null
    email: string
  } | null
  station: {
    id: string
    name: string
  }
}

interface ApiResponse {
  success: boolean
  data: AgroclimatologicalData[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

async function getStations(): Promise<Station[]> {
  try {
    const stations = await prisma.station.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
    return stations
  } catch (error) {
    console.error("Error fetching stations:", error)
    return []
  }
}

async function getAgroclimatologicalData(): Promise<ApiResponse> {
  const session = await getSession()
  
  if (!session?.user) {
    return { success: false, data: [], pagination: { total: 0, limit: 50, offset: 0, hasMore: false } }
  }

  try {
    const today = new Date().toISOString().split('T')[0]
    
    const where: any = {
      date: {
        gte: new Date(today),
        lte: new Date(today)
      }
    }

    if (session.user.role !== "super_admin" && session.user.station?.id) {
      where.stationId = session.user.station.id
    }

    const [data, total] = await Promise.all([
      prisma.agroclimatologicalData.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          elevation: true,
          date: true,
          utcTime: true,
          solarRadiation: true,
          sunShineHour: true,
          airTempDry05m: true,
          airTempWet05m: true,
          airTempDry12m: true,
          airTempWet12m: true,
          airTempDry22m: true,
          airTempWet22m: true,
          minTemp: true,
          maxTemp: true,
          meanTemp: true,
          grassMinTemp: true,
          soilTemp5cm: true,
          soilTemp10cm: true,
          soilTemp20cm: true,
          soilTemp30cm: true,
          soilTemp50cm: true,
          soilMoisture0to20cm: true,
          soilMoisture20to50cm: true,
          panWaterEvap: true,
          relativeHumidity: true,
          evaporation: true,
          dewPoint: true,
          windSpeed: true,
          duration: true,
          rainfall: true,
          userId: true,
          stationId: true,
          user: { select: { id: true, name: true, email: true } },
          station: { select: { id: true, name: true } },
        },
        orderBy: [{ date: "desc" }, { utcTime: "desc" }],
        take: 50,
      }),
      prisma.agroclimatologicalData.count({ where }),
    ])

    // Convert Date objects to ISO strings for consistent serialization
    const serializedData = data.map(record => ({
      ...record,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      date: record.date.toISOString(),
    }))

    return {
      success: true,
      data: serializedData,
      pagination: { total, limit: 50, offset: 0, hasMore: total > 50 },
    }
  } catch (error) {
    console.error("Error fetching agroclimatological data:", error)
    return { success: false, data: [], pagination: { total: 0, limit: 50, offset: 0, hasMore: false } }
  }
}

export default async function AgroclimatologicalDataTablePage() {
  const [initialData, stations] = await Promise.all([
    getAgroclimatologicalData(),
    getStations()
  ])

  return (
    <div className="p-6">
      <AgroclimatologicalDataTable 
      initialData={initialData}
      initialStations={stations}
    />
    </div>
  )
}