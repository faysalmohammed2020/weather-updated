"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

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

interface TimeSeriesData {
    temperature: { x: string[]; y: number[] }
    humidity: { x: string[]; y: number[] }
    visibility: { x: string[]; y: number[] }
    rainfall: { x: string[]; y: number[] }
    windSpeed: { x: string[]; y: number[] }
}

interface TimeSeriesGraphProps {
    selectedStationId: string | null // Changed from selectedStation to selectedStationId
}

export default function TimeSeriesGraph({ selectedStationId }: TimeSeriesGraphProps) {
    const { data: session } = useSession()
    const [data, setData] = useState<MeteorologicalData[]>([])
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({
        temperature: { x: [], y: [] },
        humidity: { x: [], y: [] },
        visibility: { x: [], y: [] },
        rainfall: { x: [], y: [] },
        windSpeed: { x: [], y: [] },
    })
    const [loading, setLoading] = useState(false)
    const [stations, setStations] = useState<Station[]>([])

    // Date range state - Initialize with last 7 days
    const today = format(new Date(), "yyyy-MM-dd")
    const sevenDaysAgo = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
    const [startDate, setStartDate] = useState(sevenDaysAgo)
    const [endDate, setEndDate] = useState(today)
    const [dateError, setDateError] = useState<string | null>(null)

    const isSuperAdmin = session?.user?.role === "super_admin"

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
    }, [session, isSuperAdmin])

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

            setData(combinedData)
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
            temperature: { x: [], y: [] },
            humidity: { x: [], y: [] },
            visibility: { x: [], y: [] },
            rainfall: { x: [], y: [] },
            windSpeed: { x: [], y: [] },
        }

        rawData.forEach((entry) => {
            const timestamp = format(new Date(entry.utcTime), "yyyy-MM-dd HH:mm")

            // Process first card data
            entry.MeteorologicalEntry.forEach((metEntry) => {
                if (metEntry.maxMinTempCorrected && !isNaN(Number(metEntry.maxMinTempCorrected))) {
                    processedData.temperature.x.push(timestamp)
                    processedData.temperature.y.push(Number(metEntry.maxMinTempCorrected))
                }

                if (metEntry.relativeHumidity && !isNaN(Number(metEntry.relativeHumidity))) {
                    processedData.humidity.x.push(timestamp)
                    processedData.humidity.y.push(Number(metEntry.relativeHumidity))
                }

                if (metEntry.horizontalVisibility && !isNaN(Number(metEntry.horizontalVisibility))) {
                    processedData.visibility.x.push(timestamp)
                    processedData.visibility.y.push(Number(metEntry.horizontalVisibility))
                }
            })

            // Process second card data
            entry.WeatherObservation.forEach((weatherEntry) => {
                if (weatherEntry.rainfallLast24Hours && !isNaN(Number(weatherEntry.rainfallLast24Hours))) {
                    processedData.rainfall.x.push(timestamp)
                    processedData.rainfall.y.push(Number(weatherEntry.rainfallLast24Hours))
                }

                if (weatherEntry.windSpeed && !isNaN(Number(weatherEntry.windSpeed))) {
                    processedData.windSpeed.x.push(timestamp)
                    processedData.windSpeed.y.push(Number(weatherEntry.windSpeed))
                }
            })
        })

        setTimeSeriesData(processedData)
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

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (newEnd > today) {
            if (end >= today) return
            const adjustedEnd = new Date(today)
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

    // Plotly configuration
    const plotConfig = {
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ["pan2d", "lasso2d", "select2d"],
        responsive: true,
    }

    const commonLayout = {
        font: { size: 12 },
        margin: { l: 60, r: 40, t: 40, b: 60 },
        showlegend: false,
        xaxis: {
            title: "Time",
            type: "date" as const,
            tickangle: -45,
        },
        hovermode: "x unified" as const,
    }

    return (
        <div className="space-y-6 p-6">
            {/* Controls */}
            <Card>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Date Range Controls */}
                        <div className="space-y-2">
                            <Label>Date Range</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={goToPreviousPeriod}
                                    className="hover:bg-gray-100 bg-transparent"
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
                                    <span>to</span>
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
                                    className="hover:bg-gray-100 bg-transparent"
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

                        {/* Current Station Display */}
                        {selectedStationId && (
                            <div className="space-y-2">
                                <Label>Current Station</Label>
                                <div className="p-2 border rounded-md bg-gray-50 text-sm">
                                    {getStationName(selectedStationId)}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Time Series Graphs */}
            {loading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                            <p className="text-gray-600">Loading meteorological data...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Temperature */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-red-600">Temperature (°C)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Plot
                                data={[
                                    {
                                        x: timeSeriesData.temperature.x,
                                        y: timeSeriesData.temperature.y,
                                        type: "scatter",
                                        mode: "lines+markers",
                                        line: { color: "#dc2626", width: 2 },
                                        marker: { size: 4 },
                                        name: "Temperature",
                                    },
                                ]}
                                layout={{
                                    ...commonLayout,
                                    yaxis: { title: "Temperature (°C)" },
                                    title: "Temperature Over Time",
                                }}
                                config={plotConfig}
                                style={{ width: "100%", height: "300px" }}
                            />
                        </CardContent>
                    </Card>

                    {/* Humidity */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-blue-600">Relative Humidity (%)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Plot
                                data={[
                                    {
                                        x: timeSeriesData.humidity.x,
                                        y: timeSeriesData.humidity.y,
                                        type: "scatter",
                                        mode: "lines+markers",
                                        line: { color: "#2563eb", width: 2 },
                                        marker: { size: 4 },
                                        name: "Humidity",
                                    },
                                ]}
                                layout={{
                                    ...commonLayout,
                                    yaxis: { title: "Relative Humidity (%)" },
                                    title: "Humidity Over Time",
                                }}
                                config={plotConfig}
                                style={{ width: "100%", height: "300px" }}
                            />
                        </CardContent>
                    </Card>

                    {/* Visibility */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-green-600">Visibility (km)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Plot
                                data={[
                                    {
                                        x: timeSeriesData.visibility.x,
                                        y: timeSeriesData.visibility.y,
                                        type: "scatter",
                                        mode: "lines+markers",
                                        line: { color: "#16a34a", width: 2 },
                                        marker: { size: 4 },
                                        name: "Visibility",
                                    },
                                ]}
                                layout={{
                                    ...commonLayout,
                                    yaxis: { title: "Visibility (km)" },
                                    title: "Visibility Over Time",
                                }}
                                config={plotConfig}
                                style={{ width: "100%", height: "300px" }}
                            />
                        </CardContent>
                    </Card>

                    {/* Rainfall */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg text-cyan-600">Rainfall (mm)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Plot
                                data={[
                                    {
                                        x: timeSeriesData.rainfall.x,
                                        y: timeSeriesData.rainfall.y,
                                        type: "scatter",
                                        mode: "lines+markers",
                                        line: { color: "#0891b2", width: 2 },
                                        marker: { size: 4 },
                                        name: "Rainfall",
                                    },
                                ]}
                                layout={{
                                    ...commonLayout,
                                    yaxis: { title: "Rainfall (mm)" },
                                    title: "Rainfall Over Time",
                                }}
                                config={plotConfig}
                                style={{ width: "100%", height: "300px" }}
                            />
                        </CardContent>
                    </Card>

                    {/* Wind Speed */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg text-purple-600">Wind Speed (KTS)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Plot
                                data={[
                                    {
                                        x: timeSeriesData.windSpeed.x,
                                        y: timeSeriesData.windSpeed.y,
                                        type: "scatter",
                                        mode: "lines+markers",
                                        line: { color: "#7c3aed", width: 2 },
                                        marker: { size: 4 },
                                        name: "Wind Speed",
                                    },
                                ]}
                                layout={{
                                    ...commonLayout,
                                    yaxis: { title: "Wind Speed (KTS)" },
                                    title: "Wind Speed Over Time",
                                }}
                                config={plotConfig}
                                style={{ width: "100%", height: "300px" }}
                            />
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
