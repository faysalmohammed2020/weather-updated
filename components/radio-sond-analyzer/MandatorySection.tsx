// components/radio-sond-analyzer/MandatorySection.tsx
"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Cloud, Download, FileDown, FileSpreadsheet, FileType, Thermometer, Wind } from "lucide-react"
import type { DecodedData } from "./useRadiosondeAnalyzer"
import { ExportButton } from "./ExportButton"

interface MandatorySectionProps {
  decodedData: DecodedData
  formatValue: (value: number | null, unit?: string, decimals?: number) => string
  exportMandatoryAsPdf: () => void
  exportMandatoryAsCsv: () => void
  exportMandatoryAsTxt: () => void
}

export function MandatorySection({
  decodedData,
  formatValue,
  exportMandatoryAsPdf,
  exportMandatoryAsCsv,
  exportMandatoryAsTxt,
}: MandatorySectionProps) {
  const filteredMandatory = decodedData.mandatoryLevels.filter((level) => level.pressure >= 100)
  const filteredOut = decodedData.mandatoryLevels.filter((level) => level.pressure < 100)

  return (
    <div>
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-8">
        <CardHeader className="bg-linear-to-r from-green-500 to-teal-600 text-white rounded-t-lg flex justify-between items-center p-4">
          <div>
            <CardTitle className="text-xl">Mandatory Pressure Levels</CardTitle>
            <CardDescription className="text-green-100">
              Standard isobaric levels (1000mb to 100mb)
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
                  onExport={exportMandatoryAsPdf}
                  icon={FileDown}
                  color="bg-red-500"
                  description="Professional report format"
                />

                <ExportButton
                  type="CSV"
                  onExport={exportMandatoryAsCsv}
                  icon={FileSpreadsheet}
                  color="bg-green-500"
                  description="Spreadsheet compatible"
                />

                <ExportButton
                  type="TXT"
                  onExport={exportMandatoryAsTxt}
                  icon={FileType}
                  color="bg-blue-500"
                  description="Formatted text report"
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-green-200 bg-linear-to-r from-green-50 to-teal-50">
                  <th className="text-left p-3 font-semibold text-green-800">Pressure (mb)</th>
                  <th className="text-left p-3 font-semibold text-green-800">Height (m)</th>
                  <th className="text-left p-3 font-semibold text-green-800">Temperature (°C)</th>
                  <th className="text-left p-3 font-semibold text-green-800">Dewpoint (°C)</th>
                  <th className="text-left p-3 font-semibold text-green-800">Wind Dir (°)</th>
                  <th className="text-left p-3 font-semibold text-green-800">Wind Speed (kt)</th>
                </tr>
              </thead>
              <tbody>
                {filteredMandatory.map((level, index) => (
                  <tr
                    key={index}
                    className={`border-b hover:bg-green-50 transition-colors ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="p-3 font-bold text-green-700">{level.pressure}</td>
                    <td className="p-3">{formatValue(level.height, "", 0)}</td>
                    <td className="p-3">{formatValue(level.temperature, "")}</td>
                    <td className="p-3">{formatValue(level.dewpoint, "")}</td>
                    <td className="p-3">{formatValue(level.windDirection, "", 0)}</td>
                    <td className="p-3">{formatValue(level.windSpeed, "", 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                Showing {filteredMandatory.length} mandatory levels (≥100 mb pressure)
              </span>
            </div>
            {filteredOut.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-gray-500">
                  {filteredOut.length} levels below 100 mb filtered out
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Tropopause Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-100 border-l-4 border-l-emerald-500">
          <CardHeader className="bg-linear-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Cloud className="h-6 w-6" />
              Tropopause Level
            </CardTitle>
            <CardDescription className="text-emerald-100">
              Boundary between troposphere and stratosphere
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {decodedData.tropopause ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-3 rounded-lg border border-blue-300">
                    <div className="text-xs font-medium text-blue-700 mb-1">Pressure</div>
                    <div className="text-lg font-bold text-blue-800">
                      {decodedData.tropopause.pressure}
                    </div>
                    <div className="text-xs text-blue-600">mb</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-100 to-red-200 p-3 rounded-lg border border-red-300">
                    <div className="text-xs font-medium text-red-700 mb-1">Temperature</div>
                    <div className="text-lg font-bold text-red-800">
                      {formatValue(decodedData.tropopause.temperature, "")}
                    </div>
                    <div className="text-xs text-red-600">°C</div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 p-3 rounded-lg border border-cyan-300">
                    <div className="text-xs font-medium text-cyan-700 mb-1">Dewpoint</div>
                    <div className="text-lg font-bold text-cyan-800">
                      {formatValue(decodedData.tropopause.dewpoint, "")}
                    </div>
                    <div className="text-xs text-cyan-600">°C</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-lg border border-purple-300">
                    <div className="text-xs font-medium text-purple-700 mb-1">Altitude</div>
                    <div className="text-lg font-bold text-purple-800">
                      ~
                      {Math.round(
                        44330 *
                          (1 -
                            Math.pow(decodedData.tropopause.pressure / 1013.25, 0.1903)),
                      )}
                    </div>
                    <div className="text-xs text-purple-600">m</div>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-lg border border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Wind className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-800">Wind Information</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Direction:</span>
                        <span className="font-medium text-green-800">
                          {decodedData.tropopause.windDirection}°
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Speed:</span>
                        <span className="font-medium text-green-800">
                          {decodedData.tropopause.windSpeed} knots
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-100 to-amber-200 p-4 rounded-lg border border-amber-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-800">Thermal Data</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-amber-700">Depression:</span>
                        <span className="font-medium text-amber-800">
                          {formatValue(
                            (decodedData.tropopause.temperature || 0) -
                              (decodedData.tropopause.dewpoint || 0),
                            "°C",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-700">Format:</span>
                        <span className="font-mono text-xs text-amber-800 bg-amber-300 px-2 py-1 rounded">
                          88
                          {decodedData.tropopause.pressure.toString().padStart(3, "0")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No tropopause data available</p>
                <p className="text-sm text-gray-500 mt-1">
                  Look for 88PmPmPm format in TTAA data
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Max Wind Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-l-blue-500">
          <CardHeader className="bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wind className="h-6 w-6" />
              Maximum Wind Level
            </CardTitle>
            <CardDescription className="text-blue-100">
              Strongest wind observed in the atmospheric sounding
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {decodedData.maxWind ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg border border-purple-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-700">
                        Pressure Level
                      </span>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <div className="text-2xl font-bold text-purple-800">
                      {decodedData.maxWind.pressure}
                    </div>
                    <div className="text-xs text-purple-600">hPa (mb)</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-emerald-200 p-4 rounded-lg border border-green-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">
                        Wind Direction
                      </span>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-2xl font-bold text-green-800">
                      {decodedData.maxWind.windDirection}°
                    </div>
                    <div className="text-xs text-green-600">
                      {decodedData.maxWind.windDirection >= 337.5 ||
                      decodedData.maxWind.windDirection < 22.5
                        ? "from N"
                        : decodedData.maxWind.windDirection >= 22.5 &&
                            decodedData.maxWind.windDirection < 67.5
                          ? "from NE"
                          : decodedData.maxWind.windDirection >= 67.5 &&
                              decodedData.maxWind.windDirection < 112.5
                            ? "from E"
                            : decodedData.maxWind.windDirection >= 112.5 &&
                                decodedData.maxWind.windDirection < 157.5
                              ? "from SE"
                              : decodedData.maxWind.windDirection >= 157.5 &&
                                  decodedData.maxWind.windDirection < 202.5
                                ? "from S"
                                : decodedData.maxWind.windDirection >= 202.5 &&
                                    decodedData.maxWind.windDirection < 247.5
                                  ? "from SW"
                                  : decodedData.maxWind.windDirection >= 247.5 &&
                                      decodedData.maxWind.windDirection < 292.5
                                    ? "from W"
                                    : "from NW"}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-100 to-red-200 p-4 rounded-lg border border-orange-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-700">
                        Wind Speed
                      </span>
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    </div>
                    <div className="text-2xl font-bold text-orange-800">
                      {decodedData.maxWind.windSpeed}
                    </div>
                    <div className="text-xs text-orange-600">knots</div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="bg-linear-to-r from-slate-100 to-gray-200 p-4 rounded-lg border border-slate-300">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    Decoding Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Cluster Format:</span>
                        <span className="font-mono text-slate-800 bg-slate-300 px-2 py-1 rounded">
                          77
                          {decodedData.maxWind.pressure.toString().padStart(3, "0")}{" "}
                          {decodedData.maxWind.windDirection.toString().padStart(3, "0")}
                          {decodedData.maxWind.windSpeed.toString().padStart(2, "0")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Group 1:</span>
                        <span className="font-mono text-blue-700 bg-blue-200 px-2 py-1 rounded">
                          77
                          {decodedData.maxWind.pressure.toString().padStart(3, "0")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Group 2:</span>
                        <span className="font-mono text-green-700 bg-green-200 px-2 py-1 rounded">
                          {decodedData.maxWind.windDirection.toString().padStart(3, "0")}
                          {decodedData.maxWind.windSpeed.toString().padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">77 →</span>
                        <span className="text-blue-800 font-medium">
                          Max wind indicator
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          {decodedData.maxWind.pressure.toString().padStart(3, "0")} →
                        </span>
                        <span className="text-purple-800 font-medium">Pressure level</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          {decodedData.maxWind.windDirection.toString().padStart(3, "0")} →
                        </span>
                        <span className="text-green-800 font-medium">Wind direction</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">
                          {decodedData.maxWind.windSpeed.toString().padStart(2, "0")} →
                        </span>
                        <span className="text-orange-800 font-medium">Wind speed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Wind className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">No maximum wind data available</p>
                <p className="text-sm text-gray-500 mt-1">
                  Look for 77PmPmPm dddff format in TTAA data
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
