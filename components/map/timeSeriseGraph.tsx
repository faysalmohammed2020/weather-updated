"use client"

import { useEffect, useMemo, useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { differenceInDays, format } from "date-fns"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface Station {
  id: string
  stationId: string
  name: string
  latitude: number
  longitude: number
  securityCode: string
  createdAt: string
  updatedAt: string
}

interface MeteorologicalData {
  id: string
  utcTime: string
  localTime: string
  station: Station
  MeteorologicalEntry: Array<{
    id: string
    maxMinTempCorrected: string
    relativeHumidity: string
    horizontalVisibility: string
    createdAt: string
  }>
  WeatherObservation: Array<{
    id: string
    rainfallLast24Hours: string
    windSpeed: string
    createdAt: string
  }>
}

type ChartPoint = { time: string; value: number }

interface TimeSeriesData {
  temperature: ChartPoint[]
  humidity: ChartPoint[]
  visibility: ChartPoint[]
  rainfall: ChartPoint[]
  windSpeed: ChartPoint[]
}

interface TimeSeriesGraphProps {
  selectedStationId: string | null
}

type MetricKey = keyof TimeSeriesData
type MetricConfig = {
  key: MetricKey
  title: string
  unit: string
  color: string
  gradientId: string
  description: string
  chartType?: "area" | "bar"
}

const palette = {
  primary: "#2F80ED",
  secondary: "#27AE60",
  accent: "#F2C94C",
  danger: "#EB5757",
  grid: "#E0E0E0",
  background: "#FAFAFA",
  purple: "#7C3AED",
}

const metricConfigs: MetricConfig[] = [
  {
    key: "temperature",
    title: "Temperature",
    unit: "°C",
    color: palette.danger,
    gradientId: "temperatureGradient",
    description: "Smoothed temperature trend",
  },
  {
    key: "humidity",
    title: "Relative Humidity",
    unit: "%",
    color: palette.primary,
    gradientId: "humidityGradient",
    description: "Moisture levels over time",
  },
  {
    key: "visibility",
    title: "Visibility",
    unit: "km",
    color: palette.secondary,
    gradientId: "visibilityGradient",
    description: "Horizontal visibility changes",
  },
  {
    key: "rainfall",
    title: "Rainfall",
    unit: "mm",
    color: palette.accent,
    gradientId: "rainfallGradient",
    description: "24h rainfall accumulation",
    chartType: "bar",
  },
  {
    key: "windSpeed",
    title: "Wind Speed",
    unit: "KTS",
    color: palette.purple,
    gradientId: "windGradient",
    description: "Wind intensity trend",
  },
]

const EMPTY_SERIES: TimeSeriesData = {
  temperature: [],
  humidity: [],
  visibility: [],
  rainfall: [],
  windSpeed: [],
}

export default function TimeSeriesGraph({ selectedStationId }: TimeSeriesGraphProps) {
  const { data: session } = useSession()
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>(EMPTY_SERIES)
  const [loading, setLoading] = useState(false)
  const [stations, setStations] = useState<Station[]>([])
  const today = format(new Date(), "yyyy-MM-dd")
  const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
  const [startDate, setStartDate] = useState(sevenDaysAgo)
  const [endDate, setEndDate] = useState(today)
  const [dateError, setDateError] = useState<string | null>(null)

  // Fetch stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch("/api/stations")
        if (!response.ok) throw new Error("Failed to fetch stations")
        const stationsData = await response.json()
        setStations(stationsData)
      } catch (error) {
        console.error("Error fetching stations:", error)
        toast.error("Failed to fetch stations")
      }
    }

    if (session) {
      fetchStations()
    }
  }, [session])

  // Fetch meteorological data
  const fetchData = async () => {
    if (!selectedStationId) {
      toast.error("Please select a station")
      return
    }

    setLoading(true)
    try {
      const [firstCardResponse, secondCardResponse] = await Promise.all([
        fetch(`/api/first-card-data?startDate=${startDate}&endDate=${endDate}&stationId=${selectedStationId}`),
        fetch(`/api/save-observation?startDate=${startDate}&endDate=${endDate}&stationId=${selectedStationId}`),
      ])

      if (!firstCardResponse.ok || !secondCardResponse.ok) {
        throw new Error("Failed to fetch data")
      }

      const firstCardData = await firstCardResponse.json()
      const secondCardData = await secondCardResponse.json()

      const combinedData = firstCardData.entries.map((entry: any) => {
        const matchingSecondCard = secondCardData.data?.find(
          (secondEntry: any) => secondEntry.utcTime === entry.utcTime,
        )
        return {
          ...entry,
          WeatherObservation: matchingSecondCard?.WeatherObservation || [],
        }
      })

      processTimeSeriesData(combinedData)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch meteorological data")
    } finally {
      setLoading(false)
    }
  }

  // Process data for time series visualization
  const processTimeSeriesData = (rawData: MeteorologicalData[]) => {
    const processedData: TimeSeriesData = {
      temperature: [],
      humidity: [],
      visibility: [],
      rainfall: [],
      windSpeed: [],
    }

    rawData.forEach((entry) => {
      const timestamp = new Date(entry.utcTime).toISOString()

      entry.MeteorologicalEntry.forEach((metEntry) => {
        if (metEntry.maxMinTempCorrected && !isNaN(Number(metEntry.maxMinTempCorrected))) {
          processedData.temperature.push({
            time: timestamp,
            value: Number(metEntry.maxMinTempCorrected),
          })
        }

        if (metEntry.relativeHumidity && !isNaN(Number(metEntry.relativeHumidity))) {
          processedData.humidity.push({
            time: timestamp,
            value: Number(metEntry.relativeHumidity),
          })
        }

        if (metEntry.horizontalVisibility && !isNaN(Number(metEntry.horizontalVisibility))) {
          processedData.visibility.push({
            time: timestamp,
            value: Number(metEntry.horizontalVisibility),
          })
        }
      })

      entry.WeatherObservation.forEach((weatherEntry) => {
        if (weatherEntry.rainfallLast24Hours && !isNaN(Number(weatherEntry.rainfallLast24Hours))) {
          processedData.rainfall.push({
            time: timestamp,
            value: Number(weatherEntry.rainfallLast24Hours),
          })
        }

        if (weatherEntry.windSpeed && !isNaN(Number(weatherEntry.windSpeed))) {
          processedData.windSpeed.push({
            time: timestamp,
            value: Number(weatherEntry.windSpeed),
          })
        }
      })
    })

    const sortedSeries = (series: ChartPoint[]) =>
      [...series].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())

    setTimeSeriesData({
      temperature: sortedSeries(processedData.temperature),
      humidity: sortedSeries(processedData.humidity),
      visibility: sortedSeries(processedData.visibility),
      rainfall: sortedSeries(processedData.rainfall),
      windSpeed: sortedSeries(processedData.windSpeed),
    })
  }

  // Auto-fetch data when dependencies change
  useEffect(() => {
    if (selectedStationId && startDate && endDate) {
      fetchData()
    }
  }, [selectedStationId, startDate, endDate])

  // Date navigation functions
  const goToPreviousPeriod = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysInRange = differenceInDays(end, start)

    const newStart = new Date(start)
    newStart.setDate(start.getDate() - (daysInRange + 1))
    const newEnd = new Date(start)
    newEnd.setDate(start.getDate() - 1)

    setStartDate(format(newStart, "yyyy-MM-dd"))
    setEndDate(format(newEnd, "yyyy-MM-dd"))
    setDateError(null)
  }

  const goToNextPeriod = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysInRange = differenceInDays(end, start)

    const newStart = new Date(start)
    newStart.setDate(start.getDate() + (daysInRange + 1))
    const newEnd = new Date(newStart)
    newEnd.setDate(newStart.getDate() + daysInRange)

    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)

    if (newEnd > todayDate) {
      if (end >= todayDate) return
      const adjustedEnd = new Date(todayDate)
      const adjustedStart = new Date(adjustedEnd)
      adjustedStart.setDate(adjustedEnd.getDate() - daysInRange)

      setStartDate(format(adjustedStart, "yyyy-MM-dd"))
      setEndDate(format(adjustedEnd, "yyyy-MM-dd"))
    } else {
      setStartDate(format(newStart, "yyyy-MM-dd"))
      setEndDate(format(newEnd, "yyyy-MM-dd"))
    }

    setDateError(null)
  }

  const handleDateChange = (type: "start" | "end", newDate: string) => {
    const date = new Date(newDate)
    const otherDate = type === "start" ? new Date(endDate) : new Date(startDate)

    if (isNaN(date.getTime())) {
      setDateError("Invalid date format")
      return
    }

    setDateError(null)

    if (type === "start") {
      if (date > otherDate) {
        setDateError("Start date cannot be after end date")
        return
      }
      setStartDate(newDate)
    } else {
      if (date < otherDate) {
        setDateError("End date cannot be before start date")
        return
      }
      setEndDate(newDate)
    }
  }

  const getStationName = (stationId: string): string => {
    const station = stations.find((s) => s.id === stationId)
    return station ? `${station.name} (${station.stationId})` : stationId
  }

  const formattedStation = useMemo(
    () => (selectedStationId ? getStationName(selectedStationId) : "No station selected"),
    [selectedStationId, stations],
  )

  const hasAnyData = useMemo(
    () => metricConfigs.some((config) => timeSeriesData[config.key].length > 0),
    [timeSeriesData],
  )

  const buildChartConfig = (metric: MetricConfig): ChartConfig => ({
    value: { label: `${metric.title} (${metric.unit})`, color: metric.color },
  })

  const formatTimestamp = (value: string) => format(new Date(value), "MMM d, HH:mm")

  const renderMetricCard = (metric: MetricConfig) => {
    const data = timeSeriesData[metric.key]
    const chartConfig = buildChartConfig(metric)
    return (
      <Card
        key={metric.key}
        className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">{metric.title}</CardTitle>
              <p className="text-xs uppercase tracking-wide text-slate-500">{metric.description}</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: `${metric.color}1a`, color: metric.color }}
            >
              {metric.unit}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-64">
            <ChartContainer
              config={chartConfig}
              className="h-full w-full [&_.recharts-cartesian-grid_line]:stroke-dashed [&_.recharts-cartesian-grid_line]:stroke-[#E0E0E0]"
            >
              {metric.chartType === "bar" ? (
                <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.grid} />
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatTimestamp}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={18}
                    tickMargin={10}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    width={48}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        labelFormatter={(value) => format(new Date(value as string), "EEE, MMM d - HH:mm")}
                        formatter={(val) => [`${Number(val).toFixed(1)} ${metric.unit}`, metric.title]}
                        className="bg-white shadow-lg rounded-lg border border-slate-100"
                      />
                    }
                    cursor={{
                      stroke: palette.grid,
                      strokeWidth: 1,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill={metric.color}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              ) : (
                <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                  <defs>
                    <linearGradient id={metric.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metric.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={metric.color} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.grid} />
                  <XAxis
                    dataKey="time"
                    tickFormatter={formatTimestamp}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={18}
                    tickMargin={10}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    width={48}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        labelFormatter={(value) => format(new Date(value as string), "EEE, MMM d - HH:mm")}
                        formatter={(val) => [`${Number(val).toFixed(1)} ${metric.unit}`, metric.title]}
                        className="bg-white shadow-lg rounded-lg border border-slate-100"
                      />
                    }
                    cursor={{
                      stroke: palette.grid,
                      strokeWidth: 1,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={metric.color}
                    fill={`url(#${metric.gradientId})`}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 1, stroke: "#fff" }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              )}
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 rounded-2xl bg-[#f7f9fc] p-6 shadow-sm border border-gray-100">
      <Card className="border-none shadow-sm bg-white">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:items-center">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-slate-500">Date Range</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousPeriod}
                  className="hover:bg-slate-50 bg-white shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1 text-sm">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange("start", e.target.value)}
                    max={endDate}
                    className="text-xs"
                  />
                  <span className="text-slate-500 text-xs">to</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange("end", e.target.value)}
                    min={startDate}
                    max={format(new Date(), "yyyy-MM-dd")}
                    className="text-xs"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPeriod}
                  className="hover:bg-slate-50 bg-white shadow-sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {dateError && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {dateError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-slate-500">Current Station</Label>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-inner">
                <span className="truncate">{formattedStation}</span>
                <span className="ml-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                  {startDate} - {endDate}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="border-none shadow-sm">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <p className="text-gray-600">Loading meteorological data...</p>
            </div>
          </CardContent>
        </Card>
      ) : !hasAnyData ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none bg-white">
          <CardContent className="py-12 text-center space-y-2">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto" />
            <p className="text-slate-700 font-medium">No data available for this range.</p>
            <p className="text-sm text-slate-500">Try selecting a different date window or station.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {metricConfigs.map(renderMetricCard)}
        </div>
      )}
    </div>
  )
}
