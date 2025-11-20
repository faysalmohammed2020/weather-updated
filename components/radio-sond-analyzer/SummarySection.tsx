// components/radio-sond-analyzer/SummarySection.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Thermometer, Wind, Droplets } from "lucide-react"
import type { DecodedData } from "./useRadiosondeAnalyzer"

interface SummarySectionProps {
  decodedData: DecodedData
  formatValue: (value: number | null, unit?: string, decimals?: number) => string
}

export function SummarySection({ decodedData, formatValue }: SummarySectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Station Info</CardTitle>
          <Badge variant="outline" className="bg-blue-200 text-blue-800 border-blue-300">
            {decodedData.station}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">Day {decodedData.date}</div>
          <p className="text-xs text-blue-700">
            {String(decodedData.time).padStart(2, "0")}:00 UTC
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-800">Surface Pressure</CardTitle>
          <Thermometer className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-900">
            {decodedData.surfacePressure} mb
          </div>
          <p className="text-xs text-red-700">
            Temperature: {formatValue(decodedData.surfaceTemperature, "°C")}
          </p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Surface Wind</CardTitle>
          <Wind className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {decodedData.surfaceWindDirection}°
          </div>
          <p className="text-xs text-green-700">{decodedData.surfaceWindSpeed} knots</p>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-cyan-100 border-l-4 border-l-cyan-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-cyan-800">Humidity</CardTitle>
          <Droplets className="h-4 w-4 text-cyan-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-900">
            {formatValue(decodedData.surfaceDewpointDepression, "°C")}
          </div>
          <p className="text-xs text-cyan-700">Dewpoint depression</p>
        </CardContent>
      </Card>
    </div>
  )
}
