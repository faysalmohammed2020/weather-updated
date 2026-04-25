// components/radio-sond-analyzer/SignificantSection.tsx
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, FileDown, FileSpreadsheet, FileType, Thermometer, Wind } from "lucide-react"
import type { DecodedData } from "./useRadiosondeAnalyzer"
import { ExportButton } from "./ExportButton"

interface SignificantSectionProps {
  decodedData: DecodedData
  formatValue: (value: number | null, unit?: string, decimals?: number) => string
  exportSignificantAsPdf: () => void
  exportSignificantAsCsv: () => void
  exportSignificantAsTxt: () => void
}

export function SignificantSection({
  decodedData,
  formatValue,
  exportSignificantAsPdf,
  exportSignificantAsCsv,
  exportSignificantAsTxt,
}: SignificantSectionProps) {
  const hasSignificant = decodedData.significantLevels.length > 0

  return (
    <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
      <CardHeader className="bg-linear-to-r from-orange-500 to-red-600 text-white rounded-t-lg flex justify-between items-center p-4">
        <div>
          <CardTitle className="text-xl">Significant Pressure Levels</CardTitle>
          <CardDescription className="text-orange-100">
            Levels with significant temperature, humidity, and wind changes
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end">
              <DropdownMenuLabel className="text-sm font-semibold text-gray-700 px-3 py-2">
                Choose Export Format
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <ExportButton
                type="PDF"
                onExport={exportSignificantAsPdf}
                icon={FileDown}
                color="bg-red-500"
                description="Professional report format"
              />

              <ExportButton
                type="CSV"
                onExport={exportSignificantAsCsv}
                icon={FileSpreadsheet}
                color="bg-green-500"
                description="Spreadsheet compatible"
              />

              <ExportButton
                type="TXT"
                onExport={exportSignificantAsTxt}
                icon={FileType}
                color="bg-blue-500"
                description="Formatted text report"
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {hasSignificant ? (
          <Tabs defaultValue="temperature" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-orange-50 border border-orange-200">
              <TabsTrigger
                value="temperature"
                className="data-[state=active]:bg-linear-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
              >
                <Thermometer className="h-4 w-4 mr-2" />
                Temperature Data
              </TabsTrigger>
              <TabsTrigger
                value="wind"
                className="data-[state=active]:bg-linear-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
              >
                <Wind className="h-4 w-4 mr-2" />
                Wind Data
              </TabsTrigger>
            </TabsList>

            {/* Temperature Tab */}
            <TabsContent value="temperature" className="space-y-4">
              <div className="bg-linear-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <Thermometer className="h-5 w-5" />
                  Temperature & Humidity Levels
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-red-200 bg-linear-to-r from-red-100 to-orange-100">
                        <th className="text-left p-3 font-semibold text-red-800">Pressure (mb)</th>
                        <th className="text-left p-3 font-semibold text-red-800">Temperature (°C)</th>
                        <th className="text-left p-3 font-semibold text-red-800">Dewpoint (°C)</th>
                        <th className="text-left p-3 font-semibold text-red-800">Depression (°C)</th>
                        <th className="text-left p-3 font-semibold text-red-800">Data Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decodedData.significantLevels
                        .filter((level) => level.temperature !== null || level.dewpoint !== null)
                        .map((level, index) => (
                          <tr
                            key={index}
                            className={`border-b hover:bg-red-50 transition-colors ${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                          >
                            <td className="p-3 font-bold text-red-700">{level.pressure}</td>
                            <td className="p-3">{formatValue(level.temperature, "")}</td>
                            <td className="p-3">{formatValue(level.dewpoint, "")}</td>
                            <td className="p-3">
                              {formatValue(level.dewpointDepression, "")}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  level.pressure === decodedData.surfacePressure
                                    ? "bg-blue-100 text-blue-800 border-blue-300"
                                    : "bg-orange-100 text-orange-800 border-orange-300"
                                }`}
                              >
                                {level.pressure === decodedData.surfacePressure
                                  ? "Surface"
                                  : "Significant"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-sm text-gray-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>
                        Temperature levels:{" "}
                        {decodedData.significantLevels.filter(
                          (l) => l.temperature !== null,
                        ).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      <span>
                        Dewpoint levels:{" "}
                        {decodedData.significantLevels.filter(
                          (l) => l.dewpoint !== null,
                        ).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>
                        Surface included:{" "}
                        {decodedData.significantLevels.some(
                          (l) => l.pressure === decodedData.surfacePressure,
                        )
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Wind Tab */}
            <TabsContent value="wind" className="space-y-4">
              <div className="bg-linear-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Wind className="h-5 w-5" />
                  Wind Data Levels
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-blue-200 bg-linear-to-r from-blue-100 to-cyan-100">
                        <th className="text-left p-3 font-semibold text-blue-800">Pressure (mb)</th>
                        <th className="text-left p-3 font-semibold text-blue-800">
                          Wind Direction (°)
                        </th>
                        <th className="text-left p-3 font-semibold text-blue-800">Wind Speed (kt)</th>
                        <th className="text-left p-3 font-semibold text-blue-800">
                          Cardinal Direction
                        </th>
                        <th className="text-left p-3 font-semibold text-blue-800">Data Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {decodedData.significantLevels
                        .filter((level) => level.windDirection !== null || level.windSpeed !== null)
                        .map((level, index) => (
                          <tr
                            key={index}
                            className={`border-b hover:bg-blue-50 transition-colors ${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                          >
                            <td className="p-3 font-bold text-blue-700">{level.pressure}</td>
                            <td className="p-3">{formatValue(level.windDirection, "", 0)}</td>
                            <td className="p-3">{formatValue(level.windSpeed, "", 0)}</td>
                            <td className="p-3">
                              {level.windDirection !== null ? (
                                <span className="text-xs font-medium text-gray-600">
                                  {level.windDirection >= 337.5 || level.windDirection < 22.5
                                    ? "N"
                                    : level.windDirection >= 22.5 &&
                                        level.windDirection < 67.5
                                      ? "NE"
                                      : level.windDirection >= 67.5 &&
                                          level.windDirection < 112.5
                                        ? "E"
                                        : level.windDirection >= 112.5 &&
                                            level.windDirection < 157.5
                                          ? "SE"
                                          : level.windDirection >= 157.5 &&
                                              level.windDirection < 202.5
                                            ? "S"
                                            : level.windDirection >= 202.5 &&
                                                level.windDirection < 247.5
                                              ? "SW"
                                              : level.windDirection >= 247.5 &&
                                                  level.windDirection < 292.5
                                                ? "W"
                                                : "NW"}
                                </span>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="p-3">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  level.pressure === decodedData.surfacePressure
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : "bg-blue-100 text-blue-800 border-blue-300"
                                }`}
                              >
                                {level.pressure === decodedData.surfacePressure
                                  ? "Surface"
                                  : "Significant"}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>
                        Wind levels:{" "}
                        {decodedData.significantLevels.filter(
                          (l) => l.windSpeed !== null,
                        ).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>
                        Max speed:{" "}
                        {Math.max(
                          ...decodedData.significantLevels.map((l) => l.windSpeed || 0),
                        )}{" "}
                        kt
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>
                        Avg speed:{" "}
                        {Math.round(
                          decodedData.significantLevels
                            .filter((l) => l.windSpeed !== null)
                            .reduce((sum, l) => sum + (l.windSpeed || 0), 0) /
                            decodedData.significantLevels.filter(
                              (l) => l.windSpeed !== null,
                            ).length,
                        )}{" "}
                        kt
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>
                        Surface included:{" "}
                        {decodedData.significantLevels.some(
                          (l) =>
                            l.pressure === decodedData.surfacePressure &&
                            l.windSpeed !== null,
                        )
                          ? "Yes"
                          : "No"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-lg font-medium text-gray-700 mb-2">No TTBB data provided</p>
            <p className="text-sm text-gray-500">
              Upload a file containing TTBB data or enter it manually
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
