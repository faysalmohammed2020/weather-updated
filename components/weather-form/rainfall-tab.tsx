// components/weather-form/rainfall-tab.tsx

"use client";

import { useFormikContext } from "formik";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CloudRain,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  Droplets,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { useHour } from "@/contexts/hourContext";
import TimePickerUTC from "@/components/ui/time-picker-utc";

interface RainfallApiData {
  utcTime: string;
  rainfallSincePrevious: string;
  rainfallTimeSlots?: TimeSlot[] | null;
  rainfallTimeStart?: string | null;
  rainfallTimeEnd?: string | null;
  rainfallType?: string | null;
}

interface TimeSlot {
  id: string;
  timeStart: string;
  timeEnd: string;
}

interface RainfallData {
  timeSlots?: TimeSlot[];
  "date-start"?: string;
  "date-end"?: string;
  "since-previous"?: string;
  "during-previous"?: string;
  "last-24-hours"?: string;
  rainfallType?: "continuous" | "intermittent" | "";
}

export default function RainfallTab() {
  const { values, setFieldValue } = useFormikContext<{
    rainfall: RainfallData;
  }>();
  const { selectedHour } = useHour();

  const rainfall = values.rainfall || {};
  const timeSlots = rainfall.timeSlots || [];
  const sincePrevious = rainfall["since-previous"] || "";
  const [rainfallApiData, setRainfallApiData] = useState<RainfallApiData[]>([]);

  // Fetch rainfall calculation data
  useEffect(() => {
    const fetchRainfallData = async () => {
      try {
        const response = await fetch("/api/rainfallcalculation");
        if (response.ok) {
          const data = await response.json();
          setRainfallApiData(data);
        }
      } catch (error) {
        console.error("Failed to fetch rainfall data:", error);
      }
    };

    fetchRainfallData();
  }, []);

  // Check if current hour is 00, 06, 12, or 18 UTC
  const isSixHourReport = useMemo(() => {
    if (!selectedHour) return false;
    const hour = Number.parseInt(selectedHour, 10);
    if (Number.isNaN(hour)) return false;
    return [0, 6, 12, 18].includes(hour);
  }, [selectedHour]);

  // Check if current hour is 00 UTC only
  const isMidnightReport = useMemo(() => {
    if (!selectedHour) return false;
    const hour = Number.parseInt(selectedHour, 10);
    if (Number.isNaN(hour)) return false;
    return hour === 0;
  }, [selectedHour]);

  const padHour = (hour: number) => String(hour).padStart(2, "0");

  const windowInfo = useMemo(() => {
    if (!selectedHour) return null;
    const hour = Number.parseInt(selectedHour, 10);
    if (Number.isNaN(hour)) return null;
    const startHour = (hour + 24 - 3) % 24;
    const startMin = startHour * 60;
    const endMin = hour * 60;
    return {
      startHour,
      endHour: hour,
      startMin,
      endMin,
      crossesMidnight: startMin > endMin,
      startLabel: `${padHour(startHour)}:00`,
      endLabel: `${padHour(hour)}:00`,
    };
  }, [selectedHour]);

  const normalizeToWindow = (
    minutes: number,
    windowStartMin: number,
    crossesMidnight: boolean,
  ) => {
    if (!crossesMidnight) return minutes;
    return minutes < windowStartMin ? minutes + 24 * 60 : minutes;
  };

  const [rainfallType, setRainfallType] = useState<
    "continuous" | "intermittent" | ""
  >(rainfall.rainfallType || "");

  // ---------- Time helpers ----------
  const toMinutes = (hhmm: string) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const diffMinutes = (startHHMM: string, endHHMM: string) => {
    const s = toMinutes(startHHMM);
    const e = toMinutes(endHHMM);
    if (s === null || e === null) return 0;
    // support cross-midnight: e < s → next day
    const end = e >= s ? e : e + 24 * 60;
    return end - s;
  };

  const gapMinutes = (endHHMM: string, nextStartHHMM: string) => {
    const e = toMinutes(endHHMM);
    const n = toMinutes(nextStartHHMM);
    if (e === null || n === null) return 0;
    return n - e; // assumes same day ordering; negative means overlap
  };

  // ---------- Detect rainfall type ----------
  const detectRainfallType = (slots: TimeSlot[]) => {
    if (slots.length === 0) {
      setRainfallType("");
      setFieldValue("rainfall.rainfallType", "");
      return;
    }
    // Sort by start time for consistent check (respect UTC window if crossing midnight)
    const sorted = [...slots].sort((a, b) => {
      const aMin = toMinutes(a.timeStart || "");
      const bMin = toMinutes(b.timeStart || "");
      if (aMin === null || bMin === null) return 0;
      if (!windowInfo) return aMin - bMin;
      const aNorm = normalizeToWindow(
        aMin,
        windowInfo.startMin,
        windowInfo.crossesMidnight,
      );
      const bNorm = normalizeToWindow(
        bMin,
        windowInfo.startMin,
        windowInfo.crossesMidnight,
      );
      return aNorm - bNorm;
    });

    // If any gap >= 30m between consecutive intervals ⇒ intermittent
    let intermittent = false;
    for (let i = 0; i < sorted.length - 1; i++) {
      const curEnd = sorted[i].timeEnd;
      const nextStart = sorted[i + 1].timeStart;
      if (!curEnd || !nextStart) continue;
      const curEndMin = toMinutes(curEnd);
      const nextStartMin = toMinutes(nextStart);
      if (curEndMin === null || nextStartMin === null) continue;
      const curEndNorm = windowInfo
        ? normalizeToWindow(
            curEndMin,
            windowInfo.startMin,
            windowInfo.crossesMidnight,
          )
        : curEndMin;
      const nextStartNorm = windowInfo
        ? normalizeToWindow(
            nextStartMin,
            windowInfo.startMin,
            windowInfo.crossesMidnight,
          )
        : nextStartMin;
      const gap = nextStartNorm - curEndNorm;
      if (gap >= 30) {
        intermittent = true;
        break;
      }
    }
    const type = intermittent ? "intermittent" : "continuous";
    setRainfallType(type);
    setFieldValue("rainfall.rainfallType", type);
  };

  // ---------- Slot ops ----------
  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      timeStart: "",
      timeEnd: "",
    };
    setFieldValue("rainfall.timeSlots", [...timeSlots, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    const updated = timeSlots.filter((s) => s.id !== id);
    setFieldValue("rainfall.timeSlots", updated);
  };

  const updateTimeSlot = (
    id: string,
    field: "timeStart" | "timeEnd",
    value: string,
  ) => {
    const updated = timeSlots.map((s) =>
      s.id === id ? { ...s, [field]: value } : s,
    );
    setFieldValue("rainfall.timeSlots", updated);
  };

  // ---------- Bangladesh calendar based date selection (Asia/Dhaka) ----------
  const fmtISOInTZ = (d: Date, timeZone = "Asia/Dhaka") =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d); // YYYY-MM-DD

  const shiftISOByDays = (iso: string, delta: number) => {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    dt.setUTCDate(dt.getUTCDate() + delta);
    return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(
      dt.getUTCDate(),
    ).padStart(2, "0")}`;
  };

  const getCurrentUTCInfo = () => {
    const now = new Date();
    const utcHour = selectedHour
      ? parseInt(selectedHour, 10)
      : now.getUTCHours();
    const bdToday = fmtISOInTZ(now, "Asia/Dhaka");
    const selectedDate = utcHour === 0 ? shiftISOByDays(bdToday, -1) : bdToday;

    const rule =
      utcHour === 0
        ? "00 UTC → Previous date "
        : `${String(utcHour).padStart(2, "0")} UTC → Present date `;

    const currentUTCTime = `${now.getUTCFullYear()}-${String(
      now.getUTCMonth() + 1,
    ).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")} ${String(
      now.getUTCHours(),
    ).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`;

    return { utcHour, selectedDate, rule, currentUTCTime, bdToday };
  };

  const getUtcDateStrings = () => {
    const now = new Date();
    const todayUTC = now.toISOString().split("T")[0];
    const prevUTC = shiftISOByDays(todayUTC, -1);
    return { todayUTC, prevUTC };
  };

  const formatUtcClock = (value?: string | null) => {
    if (!value) return "--";
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "--";
    return `${padHour(dt.getUTCHours())}:${String(dt.getUTCMinutes()).padStart(
      2,
      "0",
    )}`;
  };

  const previousTimecardInfo = useMemo(() => {
    if (!selectedHour) return null;
    const hour = parseInt(selectedHour, 10);
    if (Number.isNaN(hour)) return null;
    const prevHour = (hour + 24 - 3) % 24;
    const { todayUTC, prevUTC } = getUtcDateStrings();
    const date = hour < 3 ? prevUTC : todayUTC;
    const utcTime = `${date}T${padHour(prevHour)}:00:00.000Z`;
    const data = rainfallApiData.find((item) => item.utcTime === utcTime);
    return {
      utcTime,
      label: `${padHour(prevHour)}:00 UTC`,
      data: data || null,
    };
  }, [rainfallApiData, selectedHour]);

  // Auto-select when hour changes
  useEffect(() => {
    if (selectedHour) {
      const { selectedDate } = getCurrentUTCInfo();
      setFieldValue("rainfall.date-start", selectedDate);
      setFieldValue("rainfall.date-end", selectedDate);
    }
  }, [selectedHour]);

  // Keep rainfall type in sync
  useEffect(() => {
    detectRainfallType(timeSlots);
  }, [timeSlots]);

  const slotWindowValidation = useMemo(() => {
    if (!windowInfo || timeSlots.length === 0) {
      return { isValid: true, invalidSlots: [] as number[] };
    }

    const invalidSlots: number[] = [];
    const windowEndNormalized = windowInfo.crossesMidnight
      ? windowInfo.endMin + 24 * 60
      : windowInfo.endMin;

    timeSlots.forEach((slot, index) => {
      if (!slot.timeStart || !slot.timeEnd) return;
      const startMin = toMinutes(slot.timeStart);
      const endMin = toMinutes(slot.timeEnd);
      if (startMin === null || endMin === null) return;

      const normalizedStart = normalizeToWindow(
        startMin,
        windowInfo.startMin,
        windowInfo.crossesMidnight,
      );
      let normalizedEnd = normalizeToWindow(
        endMin,
        windowInfo.startMin,
        windowInfo.crossesMidnight,
      );

      if (normalizedEnd < normalizedStart) {
        normalizedEnd += 24 * 60;
      }

      if (
        normalizedStart < windowInfo.startMin ||
        normalizedEnd > windowEndNormalized
      ) {
        invalidSlots.push(index + 1);
      }
    });

    return { isValid: invalidSlots.length === 0, invalidSlots };
  }, [timeSlots, windowInfo]);

  const slotWindowMessage = useMemo(() => {
    if (!windowInfo || slotWindowValidation.isValid) return "";
    const slotList = slotWindowValidation.invalidSlots.join(", ");
    return `Only previous 3 hours (${windowInfo.startLabel}-${windowInfo.endLabel} UTC) are allowed. Invalid slot(s): ${slotList}.`;
  }, [slotWindowValidation, windowInfo]);

  // ---------- UX: slot summary ----------
  const slotSummary = useMemo(() => {
    if (!timeSlots.length) {
      return {
        total: 0,
        completed: 0,
        totalMin: 0,
        maxGap: 0,
        hasOverlap: false,
      };
    }
    const sorted = [...timeSlots].sort((a, b) =>
      (a.timeStart || "").localeCompare(b.timeStart || ""),
    );
    let completed = 0;
    let totalMin = 0;
    let maxGap = -Infinity;
    let hasOverlap = false;

    for (const s of sorted) {
      if (s.timeStart && s.timeEnd) {
        completed++;
        totalMin += diffMinutes(s.timeStart, s.timeEnd);
      }
    }

    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i];
      const b = sorted[i + 1];
      if (a.timeEnd && b.timeStart) {
        const g = gapMinutes(a.timeEnd, b.timeStart);
        maxGap = Math.max(maxGap, g);
        if (g < 0) hasOverlap = true; // next starts before current ends (overlap)
      }
    }
    if (maxGap === -Infinity) maxGap = 0;

    return { total: timeSlots.length, completed, totalMin, maxGap, hasOverlap };
  }, [timeSlots]);

  const minutesToHM = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (mins <= 0) return "0m";
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const normalizeFourDigitRain = (value: string) =>
    value.replace(/\D/g, "").slice(0, 4);

  // ---------- Rainfall Calculation Functions ----------
  const formatToFourDigits = (value: number): string => {
    return String(value).padStart(4, "0");
  };

  const parseSincePreviousInput = () =>
    parseInt(rainfall["since-previous"] || "0", 10) || 0;

  const getRainfallValue = (utcTime: string): number => {
    const item = rainfallApiData.find((data) => data.utcTime === utcTime);
    return item ? parseInt(item.rainfallSincePrevious, 10) || 0 : 0;
  };

  const calculateDuringPrevious6Hours = (): string => {
    if (!selectedHour) return "";

    const hour = parseInt(selectedHour, 10);
    if (![0, 6, 12, 18].includes(hour)) return "";

    const { todayUTC, prevUTC } = getUtcDateStrings();
    const currentSincePrevious = parseSincePreviousInput();

    if (hour === 0) {
      const total =
        getRainfallValue(`${prevUTC}T21:00:00.000Z`) + currentSincePrevious;
      return formatToFourDigits(total);
    }

    const lookups: Record<number, string> = {
      6: `${todayUTC}T03:00:00.000Z`,
      12: `${todayUTC}T09:00:00.000Z`,
      18: `${todayUTC}T15:00:00.000Z`,
    };

    const previousUtc = lookups[hour];
    if (!previousUtc) return "";

    const total = getRainfallValue(previousUtc) + currentSincePrevious;
    return formatToFourDigits(total);
  };

  const calculateLast24Hours = (): string => {
    if (!selectedHour || parseInt(selectedHour, 10) !== 0) return "";

    const { prevUTC } = getUtcDateStrings();
    const currentSincePrevious = parseSincePreviousInput();

    // Sum all values from previous day 03 to previous day 21 UTC
    const timesToSum = [
      `${prevUTC}T03:00:00.000Z`,
      `${prevUTC}T06:00:00.000Z`,
      `${prevUTC}T09:00:00.000Z`,
      `${prevUTC}T12:00:00.000Z`,
      `${prevUTC}T15:00:00.000Z`,
      `${prevUTC}T18:00:00.000Z`,
      `${prevUTC}T21:00:00.000Z`,
    ];

    // Apply the rainfall code logic - convert codes to decimal, sum with decimal since-previous, round, then convert back to code
    let totalDecimal = 0;
    timesToSum.forEach((time) => {
      const value = getRainfallValue(time);
      totalDecimal += value;
    });

    // Add the Since Previous Observation input value (current 00 UTC) - this is already in mm/decimal
    totalDecimal += currentSincePrevious;

    // Round to nearest integer
    const roundedTotal = Math.round(totalDecimal);
    
    // Convert back to 4-digit code and take first 3 digits
    const totalStr = String(roundedTotal).padStart(4, '0');
    return totalStr.substring(0, 3);
  };

  // Auto-fill calculated values
  useEffect(() => {
    if (rainfallApiData.length === 0) return;

    // Auto-fill During Previous 6 Hours
    if (isSixHourReport) {
      const calculated6Hours = calculateDuringPrevious6Hours();
      setFieldValue("rainfall.during-previous", calculated6Hours || "");
    }

    // Auto-fill Last 24 Hours (only at 00 UTC)
    if (isMidnightReport) {
      const calculated24Hours = calculateLast24Hours();
      if (calculated24Hours) {
        setFieldValue("rainfall.last-24-hours", calculated24Hours);
      }
    }
  }, [
    rainfallApiData,
    selectedHour,
    sincePrevious,
    isSixHourReport,
    isMidnightReport,
    setFieldValue,
  ]);

  // Separate useEffect for Last 24 Hours calculation when since-previous changes
  useEffect(() => {
    if (rainfallApiData.length === 0 || !isMidnightReport) return;

    const calculated24Hours = calculateLast24Hours();
    if (calculated24Hours) {
      setFieldValue("rainfall.last-24-hours", calculated24Hours);
    }
  }, [
    rainfall["since-previous"],
    rainfallApiData,
    isMidnightReport,
    setFieldValue,
  ]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <h2 className="text-lg font-semibold text-violet-700 flex items-center">
        <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center mr-2">
          <CloudRain className="h-4 w-4" />
        </span>
        Rainfall Measurement (mm)
      </h2>

      {/* Date Selection (Bangladesh calendar rule) */}
      <Card className="border-violet-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-violet-50">
          <CardTitle className="text-sm font-medium text-violet-700">
            বৃষ্টির তারিখ (Rainfall Date) — Auto Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Observing Time:{" "}
                  {selectedHour
                    ? `${selectedHour}:00 UTC`
                    : "⚠️ Not selected yet"}
                </p>
                {selectedHour ? (
                  <>
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">
                        Auto-Selection Rule (BD):
                      </span>{" "}
                      {getCurrentUTCInfo().rule}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      <span className="font-medium">Selected Date:</span>{" "}
                      {getCurrentUTCInfo().selectedDate}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-orange-700 mt-1">
                    📌 প্রথমে উপরে থেকে{" "}
                    <span className="font-semibold">UTC Hour</span> নির্বাচন
                    করুন।
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="rainfall-date-start" className="font-semibold">
                শুরুর তারিখ (Start Date)
              </Label>
              <Input
                id="rainfall-date-start"
                type="date"
                value={rainfall["date-start"] || ""}
                onChange={(e) =>
                  setFieldValue("rainfall.date-start", e.target.value)
                }
                className="border-violet-300 focus:border-violet-500 font-medium"
              />
              <div className="text-xs text-violet-600 space-y-1">
                {/* <p className="font-medium">✓ auto-select</p> */}
                <p className="text-violet-500">
                  প্রয়োজনে আপনি ম্যানুয়ালি পরিবর্তন করতে পারবেন
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rainfall-date-end" className="font-semibold">
                শেষের তারিখ (End Date)
              </Label>
              <Input
                id="rainfall-date-end"
                type="date"
                value={rainfall["date-end"] || ""}
                onChange={(e) =>
                  setFieldValue("rainfall.date-end", e.target.value)
                }
                className="border-violet-300 focus:border-violet-500 font-medium"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      <Card className="border-violet-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-violet-50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-violet-700">
            বৃষ্টির সময় (Rainfall Time Slots)
          </CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={addTimeSlot}
            className="bg-violet-600 hover:bg-violet-700 h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Slot
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {/* Friendly helper */}
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <div className="text-xs text-green-800">
                <p className="font-semibold">Minute-Granular Input Supported</p>
                <p>
                  যেকোনো HH:MM দিন (যেমন{" "}
                  <span className="font-mono font-semibold">21:00</span>,{" "}
                  <span className="font-mono font-semibold">22:50</span>,{" "}
                  <span className="font-mono font-semibold">13:07</span>).
                  Cross-midnight থাকলে End Time ছোট হতে পারে — সেক্ষেত্রে
                  duration স্বয়ংক্রিয়ভাবে next day ধরে গণনা হবে।
                </p>
              </div>
            </div>
          </div>

          {windowInfo && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 text-amber-700" />
                <div className="text-xs text-amber-800">
                  <p className="font-semibold">
                    Allowed window: {windowInfo.startLabel}-{windowInfo.endLabel}{" "}
                    UTC (previous 3 hours)
                  </p>
                  <p>
                    Only this 3-hour range is valid for the current observation.
                    Older ranges will show validation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {previousTimecardInfo && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-slate-700" />
                <div className="text-xs text-slate-700">
                  <p className="font-semibold">
                    Previous timecard ({previousTimecardInfo.label})
                  </p>
                  {previousTimecardInfo.data ? (
                    <>
                      <p>
                        Since Previous:{" "}
                        <span className="font-semibold">
                          {previousTimecardInfo.data.rainfallSincePrevious ||
                            "--"}
                        </span>{" "}
                        mm
                      </p>
                      {Array.isArray(
                        previousTimecardInfo.data.rainfallTimeSlots,
                      ) &&
                      previousTimecardInfo.data.rainfallTimeSlots.length ? (
                        <div className="mt-1">
                          <p className="font-medium">Slots:</p>
                          <ul className="mt-1 space-y-1">
                            {previousTimecardInfo.data.rainfallTimeSlots.map(
                              (slot, idx) => (
                                <li key={slot.id || idx}>
                                  {slot.timeStart}-{slot.timeEnd}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      ) : (
                        <p className="mt-1">
                          Slots:{" "}
                          {formatUtcClock(
                            previousTimecardInfo.data.rainfallTimeStart,
                          )}
                          {" - "}
                          {formatUtcClock(
                            previousTimecardInfo.data.rainfallTimeEnd,
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <p>No previous timecard found for this UTC window.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Slots */}
          <div className="space-y-4">
            {timeSlots.map((slot: TimeSlot, index: number) => (
              <div
                key={slot.id}
                className="border border-violet-200 rounded-xl p-4 bg-violet-50/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-violet-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Slot {index + 1}
                  </span>
                  {timeSlots.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTimeSlot(slot.id)}
                      className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="grid gap-2">
                    <TimePickerUTC
                      id={`time-start-${slot.id}`}
                      label="শুরুর সময় (Start Time)"
                      value={slot.timeStart || "00:00"}
                      onChange={(v) => updateTimeSlot(slot.id, "timeStart", v)}
                      minutesStep={1}
                    />
                    <p className="text-xs text-violet-600">
                      e.g., 21:00, 22:50, 13:07
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <TimePickerUTC
                      id={`time-end-${slot.id}`}
                      label="শেষের সময় (End Time)"
                      value={slot.timeEnd || "00:00"}
                      onChange={(v) => updateTimeSlot(slot.id, "timeEnd", v)}
                      minutesStep={1}
                    />
                    <p className="text-xs text-violet-600">
                      e.g., 23:45, 00:30, 14:15
                    </p>
                  </div>
                </div>

                {/* Per-slot quick duration */}
                {slot.timeStart && slot.timeEnd ? (
                  <div className="mt-3 text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Duration:{" "}
                    <span className="font-semibold">
                      {minutesToHM(diffMinutes(slot.timeStart, slot.timeEnd))}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-slate-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Start/End পূর্ণ করুন duration দেখতে।
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Slots summary chips */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-violet-600 hover:bg-violet-700">
              মোট Slot: {slotSummary.total}
            </Badge>
            <Badge className="bg-emerald-600 hover:bg-emerald-700">
              সম্পূর্ণ: {slotSummary.completed}
            </Badge>
            <Badge className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1">
              <Droplets className="h-3 w-3" /> মোট সময়:{" "}
              {minutesToHM(slotSummary.totalMin)}
            </Badge>
            <Badge className="bg-amber-600 hover:bg-amber-700">
              সর্বোচ্চ Gap:{" "}
              {slotSummary.maxGap > 0 ? minutesToHM(slotSummary.maxGap) : "0m"}
            </Badge>
            {slotSummary.hasOverlap && (
              <Badge className="bg-red-600 hover:bg-red-700">
                ⚠️ Overlap detected
              </Badge>
            )}
          </div>

          {slotWindowMessage && (
            <div className="mt-3 p-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {slotWindowMessage}
            </div>
          )}
        </CardContent>
      </Card>

      {/* >>> NEW POSITION: Rainfall Type section (after Time Slots) <<< */}
      <Card className="border-2 border-violet-300 bg-violet-50">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium text-violet-900">
            বৃষ্টির ধরন (Rainfall Type)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-violet-700 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-violet-900">
                Detected from time slots:
              </p>
              {rainfallType ? (
                <Badge
                  variant={
                    rainfallType === "continuous" ? "default" : "destructive"
                  }
                  className={`mt-1 ${
                    rainfallType === "continuous"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {rainfallType === "continuous"
                    ? "ধারাবাহিক বৃষ্টি (Continuous)"
                    : "অনিয়মিত বৃষ্টি (Intermittent)"}
                </Badge>
              ) : (
                <Badge className="mt-1 bg-slate-500 hover:bg-slate-600">
                  নির্ধারিত নয় (Not specified)
                </Badge>
              )}

              <div className="mt-3 text-xs text-violet-700 space-y-1">
                <p>
                  • দুই Slot-এর মধ্যে ব্যবধান ≥ 30 মিনিট হলে Intermittent ধরা
                  হয়।
                </p>
                <p>
                  • Overlap থাকলে আগে সময়গুলো ঠিক করুন যাতে সঠিকভাবে ধরন
                  নির্ধারণ হয়।
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Rainfall Data */}
      <Card className="border-violet-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-violet-50">
          <CardTitle className="text-sm font-medium text-violet-700">
            অন্যান্য বৃষ্টিপাত তথ্য (Other Rainfall Data)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="since-previous">
                Since Previous Observation (mm)
              </Label>
              <Input
                id="since-previous"
                type="text"
                step="0.1"
                value={rainfall["since-previous"] || ""}
                onChange={(e) =>
                  setFieldValue("rainfall.since-previous", e.target.value)
                }
                className="border-violet-200 focus:border-violet-500"
              />
            </div>

            {/* During Previous 6 Hours - Only visible at 00, 06, 12, 18 UTC */}
            {isSixHourReport && (
              <div className="grid gap-2">
                <Label htmlFor="during-previous">
                  During Previous 6 Hours (At 00, 06, 12, 18 UTC) - mm (4-digit)
                  <span className="ml-2 text-xs text-green-600 font-medium">
                    (Auto-calculated)
                  </span>
                </Label>
                <Input
                  id="during-previous"
                  type="text"
                  step="0.1"
                  value={rainfall["during-previous"] || ""}
                  readOnly
                  className="border-violet-200 focus:border-violet-500 bg-green-50 font-mono"
                />
              </div>
            )}
            {/* Last 24 Hours Precipitation - Only visible at 00 UTC */}
             {/* Last 24 Hours Precipitation - Only visible at 00 UTC */}
            {isMidnightReport && (
              <div className="grid gap-2">
                <Label htmlFor="last-24-hours">
                  Last 24 Hours Precipitation (mm)
                  <span className="ml-2 text-xs text-green-600 font-medium">
                    (Auto-calculated)
                  </span>
                </Label>
                <Input
                  id="last-24-hours"
                  type="text"
                  maxLength={3}
                  step="0.1"
                  value={rainfall["last-24-hours"] || ""}
                  readOnly
                  className="border-violet-200 focus:border-violet-500 bg-green-50 font-mono"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
