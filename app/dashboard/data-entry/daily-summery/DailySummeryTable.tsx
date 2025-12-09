"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Clock } from "lucide-react";
import SummaryDataTableSkeleton from "./SummaryDataTableSkeleton";
import { getDailySummary } from "@/app/actions/daily-summary";
import { utcToHour } from "@/lib/utils";

/* ---------------------------------------------------------
    ✔ TYPE DEFINITIONS (Correct With Your API Structure)
--------------------------------------------------------- */

interface MeteorologicalEntry {
  id: string;
  stationLevelPressure: string;
  correctedSeaLevelPressure: string;
  dryBulbAsRead: string;
  wetBulbAsRead: string;
  maxMinTempAsRead: string;
  Td: string;
  relativeHumidity: string;
  horizontalVisibility: string;
}

interface FirstCardRow {
  id: string;
  utcTime: string;
  localTime: string;
  station: {
    stationId: string;
    stationName: string;
  };
  MeteorologicalEntry: MeteorologicalEntry[];
}

interface WeatherObservation {
  id: string;
  windSpeed: string;
  windDirection: string;
  totalCloudAmount: string;
  rainfallLast24Hours: string;
  rainfallTimeStart: string;
  rainfallTimeEnd: string;
}

interface SecondCardRow {
  id: string;
  WeatherObservation: WeatherObservation[];
}

interface DailySummaryType {
  id: string;
  dataType: string | null;
  avStationPressure: string | null;
  avSeaLevelPressure: string | null;
  avDryBulbTemperature: string | null;
  avWetBulbTemperature: string | null;
  maxTemperature: string | null;
  minTemperature: string | null;
  totalPrecipitation: string | null;
  avDewPointTemperature: string | null;
  avRelativeHumidity: string | null;
  windSpeed: string | null;
  windDirectionCode: string | null;
  maxWindSpeed: string | null;
  maxWindDirection: string | null;
  avTotalCloud: string | null;
  lowestVisibility: string | null;
  totalRainDuration: string | null;
  ObservingTime: {
    id: string;
    userId: string;
    stationId: string;
    utcTime: Date;
    localTime: Date;
    createdAt: Date;
    updatedAt: Date;
    station: {
      id: string;
      stationId: string;
      name: string;
      securityCode: string;
      latitude: number;
      longitude: number;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}

type ObservationState = {
  firstCardData: FirstCardRow[];
  secondCardData: SecondCardRow[];
  dailySummary: DailySummaryType | null;
};

/* ---------------------------------------------------------
    ✔ COLUMN DEFINITIONS (Fully Typed)
--------------------------------------------------------- */

interface ColumnDefinition {
  key: string;
  label: string;
  category: string;
  width: string;
  sticky?: boolean;
  unit?: string;
  range?: string;
}

const columnDefinitions: ColumnDefinition[] = [
  { key: "time", label: "Time (UTC)", category: "time", width: "w-24", sticky: true },
  { key: "avStationPressure", label: "Av. Station Pressure", unit: "hPa", category: "pressure", width: "w-32", range: "14-18" },
  { key: "avSeaLevelPressure", label: "Av. Sea-Level Pressure", unit: "hPa", category: "pressure", width: "w-32", range: "19-23" },
  { key: "avDryBulbTemperature", label: "Av. Dry-Bulb Temperature", unit: "°C", category: "temperature", width: "w-32", range: "24-26" },
  { key: "avWetBulbTemperature", label: "Av. Wet Bulb Temperature", unit: "°C", category: "temperature", width: "w-32", range: "27-29" },
  { key: "maxTemperature", label: "Max. Temperature", unit: "°C", category: "temperature", width: "w-28", range: "30-32" },
  { key: "minTemperature", label: "Min Temperature", unit: "°C", category: "temperature", width: "w-28", range: "33-35" },
  { key: "totalPrecipitation", label: "Total Precipitation", unit: "mm", category: "precipitation", width: "w-32", range: "36-39" },
  { key: "avDewPointTemperature", label: "Av. Dew Point Temperature", unit: "°C", category: "temperature", width: "w-32", range: "40-42" },
  { key: "avRelativeHumidity", label: "Av. Rel Humidity", unit: "%", category: "humidity", width: "w-28", range: "43-45" },
  { key: "avWindSpeed", label: "Av. Wind Speed", unit: "m/s", category: "wind", width: "w-28", range: "46-48" },
  { key: "prevailingWindDirection", label: "Prevailing Wind Direction", unit: "16Pts", category: "wind", width: "w-32", range: "49-50" },
  { key: "maxWindSpeed", label: "Max Wind Speed", unit: "m/s", category: "wind", width: "w-28", range: "51-53" },
  { key: "directionOfMaxWind", label: "Direction of Max Wind", unit: "16Pts", category: "wind", width: "w-32", range: "54-55" },
  { key: "avTotalCloud", label: "Av. Total Cloud", unit: "octas", category: "cloud", width: "w-28", range: "56" },
  { key: "lowestVisibility", label: "Lowest visibility", unit: "km", category: "visibility", width: "w-28", range: "57-59" },
  { key: "totalDurationOfRain", label: "Total Duration of Rain", unit: "H-M", category: "precipitation", width: "w-32", range: "60-63" },
];

const categoryColors: Record<string, string> = {
  time: "bg-slate-50 text-slate-700 border-slate-200",
  pressure: "bg-blue-50 text-blue-700 border-blue-200",
  temperature: "bg-amber-50 text-amber-700 border-amber-200",
  precipitation: "bg-cyan-50 text-cyan-700 border-cyan-200",
  humidity: "bg-indigo-50 text-indigo-700 border-indigo-200",
  wind: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cloud: "bg-slate-50 text-slate-700 border-slate-200",
  visibility: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

/* ---------------------------------------------------------
    ✔ MAIN COMPONENT (Zero Errors)
--------------------------------------------------------- */

export function WeatherDataTable() {
  const [observations, setObservations] = useState<ObservationState>({
    firstCardData: [],
    secondCardData: [],
    dailySummary: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate] = useState<string>(new Date().toISOString().split("T")[0]);

  /* ---------------------------------------------------------
      ✔ Format numbers safely
  --------------------------------------------------------- */
  const formatValue = useCallback(
    (value: string | null | undefined, unit?: string) => {
      if (!value || value === "" || value === "null") return "--";
      const num = Number(value);
      if (isNaN(num)) return value;
      const formatted = Number.isInteger(num) ? num.toString() : num.toFixed(1);
      return `${formatted}${unit ? ` ${unit}` : ""}`;
    },
    []
  );

  /* ---------------------------------------------------------
      ✔ Fetch API data (Correct Types)
  --------------------------------------------------------- */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [firstRes, secondRes] = await Promise.all([
        fetch("/api/first-card-data"),
        fetch("/api/second-card-data"),
      ]);

      const firstJSON = await firstRes.json();
      const secondJSON = await secondRes.json();
      const summaryJSON = await getDailySummary(selectedDate);

      setObservations({
        firstCardData: firstJSON.entries ?? [],
        secondCardData: secondJSON ?? [],
        dailySummary: summaryJSON?.data ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---------------------------------------------------------
      ✔ Determine max table rows
  --------------------------------------------------------- */
  const maxRows = useMemo(
    () =>
      Math.max(
        observations.firstCardData.length,
        observations.secondCardData.length
      ),
    [observations.firstCardData.length, observations.secondCardData.length]
  );

  /* ---------------------------------------------------------
      ✔ Skeleton
  --------------------------------------------------------- */
  if (loading) return <SummaryDataTableSkeleton />;

  /* ---------------------------------------------------------
      ✔ Error Display
  --------------------------------------------------------- */
  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-red-600">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
          <Button onClick={fetchData} className="mt-4" variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ---------------------------------------------------------
      ✔ MAIN TABLE RENDER
  --------------------------------------------------------- */
  return (
    <div className="space-y-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-gray-50">
          <CardTitle className="text-sm font-medium text-gray-700 flex items-center">
            <Clock className="mr-2 h-4 w-4" />
            Hourly Weather Observations
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  {columnDefinitions.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-3 text-center font-medium text-xs uppercase ${
                        categoryColors[col.category]
                      } ${col.width} ${col.sticky ? "sticky left-0 z-10" : ""}`}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span>{col.label}</span>
                        {col.unit && <span className="opacity-75 text-xs">({col.unit})</span>}
                        {col.range && (
                          <span className="text-xs bg-white bg-opacity-50 rounded px-1">
                            {col.range}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {Array.from({ length: maxRows }).map((_, index) => {
                  const first = observations.firstCardData[index];
                  const second = observations.secondCardData[index];

                  const met = first?.MeteorologicalEntry?.[0];
                  const obs = second?.WeatherObservation?.[0];

                  return (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      {/* TIME */}
                      <td className="px-3 py-3 text-center sticky left-0 bg-white border-r z-10">
                        {first ? utcToHour(first.utcTime) : "--"}
                      </td>

                      {/* Now all values are 100% safe and valid */}
                      <td className="px-3 py-3 text-center">{formatValue(met?.stationLevelPressure)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(met?.correctedSeaLevelPressure)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(met?.dryBulbAsRead)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(met?.wetBulbAsRead)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(met?.maxMinTempAsRead)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(met?.maxMinTempAsRead)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(obs?.rainfallLast24Hours)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(met?.Td)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(met?.relativeHumidity)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(obs?.windSpeed)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(obs?.windDirection)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(obs?.windSpeed)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(obs?.windDirection)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(obs?.totalCloudAmount)}</td>
                      <td className="px-3 py-3 text-center">{formatValue(met?.horizontalVisibility)}</td>

                      {/* Duration of rain */}
                      <td className="px-3 py-3 text-center">
                        {obs?.rainfallTimeStart && obs?.rainfallTimeEnd
                          ? (() => {
                              const start = new Date(obs.rainfallTimeStart);
                              const end = new Date(obs.rainfallTimeEnd);
                              const diff = end.getTime() - start.getTime();
                              const h = Math.floor(diff / (1000 * 60 * 60));
                              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                              return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
                            })()
                          : "--"}
                      </td>
                    </tr>
                  );
                })}

                {/* DAILY SUMMARY ROW */}
                {observations.dailySummary && (
                  <tr className="bg-blue-50 font-medium border-t">
                    <td className="px-3 py-4 text-center sticky left-0 bg-blue-50 border-r z-10">
                      Daily Summary
                    </td>

                    {([
                      "avStationPressure",
                      "avSeaLevelPressure",
                      "avDryBulbTemperature",
                      "avWetBulbTemperature",
                      "maxTemperature",
                      "minTemperature",
                      "totalPrecipitation",
                      "avDewPointTemperature",
                      "avRelativeHumidity",
                      "windSpeed",
                      "windDirectionCode",
                      "maxWindSpeed",
                      "maxWindDirection",
                      "avTotalCloud",
                      "lowestVisibility",
                      "totalRainDuration",
                    ] as const).map((key) => (
                      <td key={key} className="px-3 py-4 text-center text-blue-800">
                        {formatValue(observations.dailySummary?.[key])}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* NO DATA MESSAGE */}
      {observations.firstCardData.length === 0 &&
        observations.secondCardData.length === 0 &&
        !observations.dailySummary && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800">No Data Available</h3>
              <p className="text-yellow-700">
                No weather observations or daily summary found for {selectedDate}.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
