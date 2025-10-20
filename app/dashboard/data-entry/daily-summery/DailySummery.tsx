// app/dashboard/data-entry/daily-summery/DailySummery.tsx

"use client";

import { useFormikContext } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { AlertCircle, Loader2 } from "lucide-react";
import moment from "moment";

// Daily Summary Form Values Interface
interface DailySummaryFormValues {
  measurements: string[];
  dataType: string;
  stationNo: string;
  year: string;
  month: string;
  day: string;
}

// ----- helpers: units/rounding/dirs/UTC/rain-slots -----
const avg = (nums: number[]) =>
  nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
const safeNum = (v: any) => Number.parseFloat(v);
const round0 = (n: number) => Math.round(n);
const round1 = (n: number) => Math.round(n * 10) / 10;

// many DB fields (AsRead/Td) are tenths → convert to °C
const tenthsToC = (v: any) => {
  const n = Number.parseFloat(v);
  return isNaN(n) ? NaN : n / 10;
};

// wind: knots → m/s (UI unit: m/s). If your DB already stores m/s, remove this.
const knotsToMs = (k: any) => {
  const n = Number.parseFloat(k);
  return isNaN(n) ? NaN : n * 0.514444;
};

// 16-point compass index (0..15) from degrees (0=N, 11.25 step)
const degTo16PtIndex = (deg: any) => {
  const d = Number.parseFloat(deg);
  if (isNaN(d)) return null;
  const norm = ((d % 360) + 360) % 360;
  return Math.floor((norm + 11.25) / 22.5) % 16; // 0..15
};

// Sum rain duration from either timeSlots[] or legacy start/end
// observation day assumed UTC; safely handles crossing midnight.
const sumRainMinutes = (obs: any, utcDate: Date) => {
  let minutes = 0;

  // New format: rainfallTimeSlots: [{timeStart:"HH:mm", timeEnd:"HH:mm"}]
  if (Array.isArray(obs?.rainfallTimeSlots) && obs.rainfallTimeSlots.length) {
    for (const slot of obs.rainfallTimeSlots) {
      if (!slot?.timeStart || !slot?.timeEnd) continue;
      const [sh, sm] = slot.timeStart.split(":").map(Number);
      const [eh, em] = slot.timeEnd.split(":").map(Number);

      const start = new Date(
        Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate(),
          sh || 0,
          sm || 0,
          0,
          0
        )
      );
      let end = new Date(
        Date.UTC(
          utcDate.getUTCFullYear(),
          utcDate.getUTCMonth(),
          utcDate.getUTCDate(),
          eh || 0,
          em || 0,
          0,
          0
        )
      );

      // crossed midnight case
      if (end < start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);

      minutes += Math.max(
        0,
        Math.round((end.getTime() - start.getTime()) / 60000)
      );
    }
    return minutes;
  }

  // Legacy single interval: rainfallTimeStart / rainfallTimeEnd (ISO)
  if (obs?.rainfallTimeStart && obs?.rainfallTimeEnd) {
    const start = new Date(obs.rainfallTimeStart);
    let end = new Date(obs.rainfallTimeEnd);
    if (end < start) end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    minutes += Math.max(
      0,
      Math.round((end.getTime() - start.getTime()) / 60000)
    );
  }

  return minutes;
};

// UTC-only yyyy-mm-dd (so local TZ shiftে ভুল হবে না)
const ymdUTC = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;

// Measurements configuration for daily summary
const measurements = [
  {
    id: 0,
    label: "Av. Station Pressure",
    range: "14-18",
    unit: "hPa",
    category: "pressure",
  },
  {
    id: 1,
    label: "Av. Sea-Level Pressure",
    range: "19-23",
    unit: "hPa",
    category: "pressure",
  },
  {
    id: 2,
    label: "Av. Dry-Bulb Temperature",
    range: "24-26",
    unit: "°C",
    category: "temperature",
  },
  {
    id: 3,
    label: "Av. Wet Bulb Temperature",
    range: "27-29",
    unit: "°C",
    category: "temperature",
  },
  {
    id: 4,
    label: "Max. Temperature",
    range: "30-32",
    unit: "°C",
    category: "temperature",
  },
  {
    id: 5,
    label: "Min Temperature",
    range: "33-35",
    unit: "°C",
    category: "temperature",
  },
  {
    id: 6,
    label: "Total Precipitation",
    range: "36-39",
    unit: "mm",
    category: "precipitation",
  },
  {
    id: 7,
    label: "Av. Dew Point Temperature",
    range: "40-42",
    unit: "°C",
    category: "temperature",
  },
  {
    id: 8,
    label: "Av. Rel Humidity",
    range: "43-45",
    unit: "%",
    category: "humidity",
  },
  {
    id: 9,
    label: "Av. Wind Speed",
    range: "46-48",
    unit: "m/s",
    category: "wind",
  },
  {
    id: 10,
    label: "Prevailing Wind Direction",
    range: "49-50",
    unit: "16Pts",
    category: "wind",
  },
  {
    id: 11,
    label: "Max Wind Speed",
    range: "51-53",
    unit: "m/s",
    category: "wind",
  },
  {
    id: 12,
    label: "Direction of Max Wind",
    range: "54-55",
    unit: "16Pts",
    category: "wind",
  },
  {
    id: 13,
    label: "Av. Total Cloud",
    range: "56",
    unit: "octas",
    category: "cloud",
  },
  {
    id: 14,
    label: "Lowest visibility",
    range: "57-59",
    unit: "km",
    category: "visibility",
  },
  {
    id: 15,
    label: "Total Duration of Rain",
    range: "60-63",
    unit: "H-M",
    category: "precipitation",
  },
];

const categoryColors = {
  pressure: "bg-blue-50 text-blue-700",
  temperature: "bg-amber-50 text-amber-700",
  precipitation: "bg-cyan-50 text-cyan-700",
  humidity: "bg-indigo-50 text-indigo-700",
  wind: "bg-emerald-50 text-emerald-700",
  cloud: "bg-slate-50 text-slate-700",
  visibility: "bg-yellow-50 text-yellow-700",
};

export function DailySummaryForm() {
  const { values, setFieldValue } = useFormikContext<DailySummaryFormValues>();
  const { data: session } = useSession();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dataStatus, setDataStatus] = useState<{
    hasToday: boolean;
    message: string;
    isLoading: boolean;
    error?: string;
  }>({
    hasToday: true,
    message: "",
    isLoading: true,
  });

  useEffect(() => {
    const fetchDailySummaryData = async () => {
      try {
        setDataStatus((prev) => ({
          ...prev,
          isLoading: true,
          error: undefined,
        }));

        // ---- fetch first & second card ----
        const firstCardResponse = await fetch("/api/first-card-data");
        const formatedFirstCardData = await firstCardResponse.json();
        const todayFirstCardData = formatedFirstCardData.entries.flatMap(
          (item: any) => item.MeteorologicalEntry
        );

        const observationsResponse = await fetch("/api/second-card-data");
        const formatedObservationsData = await observationsResponse.json();
        const todayWeatherObservations = formatedObservationsData.flatMap(
          (item: any) => item.WeatherObservation
        );

        const calculatedMeasurements = Array(16).fill("");

        // ---- PRESSURE (hPa) ----
        {
          const stn = todayFirstCardData
            .map((x: any) => safeNum(x.stationLevelPressure))
            .filter((n: number) => !isNaN(n));
          const slp = todayFirstCardData
            .map((x: any) => safeNum(x.correctedSeaLevelPressure))
            .filter((n: number) => !isNaN(n));

          if (stn.length) calculatedMeasurements[0] = String(round0(avg(stn)));
          if (slp.length) calculatedMeasurements[1] = String(round0(avg(slp)));
        }

        // ---- TEMPERATURES (°C) ----
        {
          const dry = todayFirstCardData
            .map((x: any) => tenthsToC(x.dryBulbAsRead))
            .filter((n: number) => !isNaN(n));
          const wet = todayFirstCardData
            .map((x: any) => tenthsToC(x.wetBulbAsRead))
            .filter((n: number) => !isNaN(n));
          const td = todayFirstCardData
            .map((x: any) => tenthsToC(x.Td))
            .filter((n: number) => !isNaN(n));

          const tAll = todayFirstCardData
            .map((x: any) => tenthsToC(x.maxMinTempAsRead))
            .filter((n: number) => !isNaN(n));

          if (dry.length) calculatedMeasurements[2] = String(round1(avg(dry)));
          if (wet.length) calculatedMeasurements[3] = String(round1(avg(wet)));
          if (tAll.length)
            calculatedMeasurements[4] = String(round1(Math.max(...tAll)));
          if (tAll.length)
            calculatedMeasurements[5] = String(round1(Math.min(...tAll)));
          if (td.length) calculatedMeasurements[7] = String(round1(avg(td)));
        }

        // ---- PRECIPITATION (mm) ----
        {
          const rf24 = todayWeatherObservations
            .map((x: any) => safeNum(x.rainfallLast24Hours))
            .filter((n: number) => !isNaN(n));
          const totalPrecip = rf24.reduce((s: number, n: number) => s + n, 0);
          if (totalPrecip > 0)
            calculatedMeasurements[6] = String(round1(totalPrecip));
        }

        // ---- HUMIDITY (%) ----
        {
          const rh = todayFirstCardData
            .map((x: any) => safeNum(x.relativeHumidity))
            .filter((n: number) => !isNaN(n));
          if (rh.length) calculatedMeasurements[8] = String(round0(avg(rh)));
        }

        // ---- VISIBILITY (km) → lowest ----
        {
          const vis = todayFirstCardData
            .map((x: any) => safeNum(x.horizontalVisibility))
            .filter((n: number) => !isNaN(n));
          if (vis.length)
            calculatedMeasurements[14] = String(round1(Math.min(...vis)));
        }

        // ---- WIND (m/s & 16-pt dir) ----
        {
          // যদি DB already m/s হয়, knotsToMs এর জায়গায় safeNum দিন
          const ws = todayWeatherObservations
            .map((x: any) => knotsToMs(x.windSpeed))
            .filter((n: number) => !isNaN(n));
          if (ws.length) calculatedMeasurements[9] = String(round1(avg(ws)));

          const wdirIdx = todayWeatherObservations
            .map((x: any) => degTo16PtIndex(x.windDirection))
            .filter((n: number | null) => n !== null) as number[];
          if (wdirIdx.length) {
            const freq: Record<number, number> = {};
            for (const d of wdirIdx) freq[d] = (freq[d] || 0) + 1;
            const prevailing = Object.entries(freq).reduce((a, b) =>
              a[1] > b[1] ? a : b
            )[0];
            calculatedMeasurements[10] = String(prevailing);
          }

          const windPairs = todayWeatherObservations
            .map((x: any) => ({
              ms: knotsToMs(x.windSpeed),
              dirIdx: degTo16PtIndex(x.windDirection),
            }))
            .filter((w) => !isNaN(w.ms));
          if (windPairs.length) {
            const maxW = windPairs.reduce(
              (m, x) => (x.ms > m.ms ? x : m),
              windPairs[0]
            );
            calculatedMeasurements[11] = String(round1(maxW.ms));
            if (maxW.dirIdx !== null && maxW.dirIdx !== undefined) {
              calculatedMeasurements[12] = String(maxW.dirIdx);
            }
          }
        }

        // ---- CLOUD (octas) avg total ----
        {
          const tca = todayWeatherObservations
            .map((x: any) => safeNum(x.totalCloudAmount))
            .filter((n: number) => !isNaN(n));
          if (tca.length) calculatedMeasurements[13] = String(round0(avg(tca)));
        }

        // ---- RAIN DURATION (HHMM) using timeSlots/legacy, UTC-safe ----
        {
          const selUTC = new Date(`${selectedDate}T00:00:00Z`);
          const totalRainMinutes = todayWeatherObservations.reduce(
            (sum: number, obs: any) => {
              return sum + sumRainMinutes(obs, selUTC);
            },
            0
          );
          if (totalRainMinutes > 0) {
            const hh = String(Math.floor(totalRainMinutes / 60)).padStart(
              2,
              "0"
            );
            const mm = String(totalRainMinutes % 60).padStart(2, "0");
            calculatedMeasurements[15] = `${hh}${mm}`;
          }
        }

        // ---- Status (UTC-based today check) ----
        const nowUTC = new Date();
        const isToday = ymdUTC(nowUTC) === selectedDate;

        setDataStatus({
          hasToday: isToday,
          message: isToday
            ? "Using today's weather data"
            : "No data available for today, using most recent data",
          isLoading: false,
        });

        // ---- Form fields (UTC-safe date parts) ----
        const sel = new Date(`${selectedDate}T00:00:00Z`);
        setFieldValue("measurements", calculatedMeasurements);
        setFieldValue(
          "stationNo",
          session?.user?.station?.stationId || "41953"
        );
        setFieldValue("dataType", "SY");
        setFieldValue("year", String(sel.getUTCFullYear()));
        setFieldValue("month", String(sel.getUTCMonth() + 1).padStart(2, "0"));
        setFieldValue("day", String(sel.getUTCDate()).padStart(2, "0"));
      } catch (error) {
        console.error("Error fetching daily summary data:", error);
        setDataStatus({
          hasToday: false,
          message: "Error loading weather data",
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        const sel = new Date(`${selectedDate}T00:00:00Z`);
        setFieldValue("measurements", Array(16).fill(""));
        setFieldValue(
          "stationNo",
          session?.user?.station?.stationId || "41953"
        );
        setFieldValue("dataType", "SY");
        setFieldValue("year", String(sel.getUTCFullYear()));
        setFieldValue("month", String(sel.getUTCMonth() + 1).padStart(2, "0"));
        setFieldValue("day", String(sel.getUTCDate()).padStart(2, "0"));
      }
    };

    fetchDailySummaryData();
  }, [selectedDate, setFieldValue, session]);

  if (dataStatus.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
          <p className="text-gray-500">Loading daily summary data...</p>
        </div>
      </div>
    );
  }

  // const handleSubmit = async () => {
  //   try {
  //     const payload = {
  //       dataType: values.dataType || "SY",
  //       measurements: values.measurements,
  //       windDirection: values.measurements[10] || "",
  //     }

  //     const response = await fetch("/api/daily-summary", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     })

  //     const result = await response.json()

  //     if (!result.success) {
  //       return toast.error(result.error)
  //     }

  //     if (!response.ok) {
  //       return toast.error(result.error)
  //     }

  //     if (result.success) {
  //       toast.success(result.message)
  //     }
  //   } catch (error) {
  //     console.error("Submit error:", error)
  //     toast.error("❌ Something went wrong")
  //   }
  // }

  const handleMeasurementChange = (index: number, value: string) => {
    const newMeasurements = [...values.measurements];
    newMeasurements[index] = value;
    setFieldValue("measurements", newMeasurements);
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {dataStatus.error ? (
        <div className="p-3 rounded-md bg-red-100 text-red-800 text-sm">
          <div className="flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" />
            Error: {dataStatus.error}
          </div>
        </div>
      ) : (
        dataStatus.message && (
          <div
            className={`p-3 rounded-md text-sm ${
              dataStatus.hasToday
                ? "bg-blue-100 text-blue-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            <div className="flex items-center">
              {dataStatus.hasToday ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              ) : (
                <AlertCircle className="mr-2 h-4 w-4" />
              )}
              {dataStatus.message}
            </div>
          </div>
        )
      )}

      {/* Measurement Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-blue-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-blue-50">
            <CardTitle className="text-sm font-medium text-blue-700">
              Measurements 1-8
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-5">
                    <Label
                      htmlFor={`measurement-${item.id}`}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </Label>
                    <div
                      className={`text-xs px-1 py-0.5 rounded mt-1 ${categoryColors[item.category]}`}
                    >
                      {item.unit}
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">
                    {item.range}
                  </div>
                  <div className="col-span-4">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      onChange={(e) =>
                        handleMeasurementChange(item.id, e.target.value)
                      }
                      className="border-blue-200 bg-white cursor-text disabled:opacity-80 disabled:font-semibold"
                      placeholder="--"
                      disabled
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-blue-50">
            <CardTitle className="text-sm font-medium text-blue-700">
              Measurements 9-16
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {measurements.slice(8).map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-12 items-center gap-2 p-2 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <div className="col-span-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center">
                    {item.id + 1}
                  </div>
                  <div className="col-span-5">
                    <Label
                      htmlFor={`measurement-${item.id}`}
                      className="text-sm font-medium"
                    >
                      {item.label}
                    </Label>
                    <div
                      className={`text-xs px-1 py-0.5 rounded mt-1 ${categoryColors[item.category]}`}
                    >
                      {item.unit}
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">
                    {item.range}
                  </div>
                  <div className="col-span-4">
                    <Input
                      id={`measurement-${item.id}`}
                      value={values.measurements[item.id] || ""}
                      onChange={(e) =>
                        handleMeasurementChange(item.id, e.target.value)
                      }
                      className="border-blue-200 bg-white cursor-text disabled:opacity-80 disabled:font-semibold"
                      placeholder="--"
                      disabled
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      {/* <div className="flex justify-end mt-6">
        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md shadow-sm text-lg"
          onClick={handleSubmit}
        >
          Submit Daily Summary
        </Button>
      </div> */}
    </div>
  );
}
