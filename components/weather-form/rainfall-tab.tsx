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

  // Check if current hour is 00, 06, 12, or 18 UTC
  const isSixHourReport = useMemo(() => {
    if (!selectedHour) return false;
    const hour = Number.parseInt(selectedHour, 10);
    if (Number.isNaN(hour)) return false;
    return [0, 6, 12, 18].includes(hour);
  }, [selectedHour]);

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
    // Sort by start time for consistent check
    const sorted = [...slots].sort((a, b) =>
      (a.timeStart || "").localeCompare(b.timeStart || "")
    );

    // If any gap >= 30m between consecutive intervals ⇒ intermittent
    let intermittent = false;
    for (let i = 0; i < sorted.length - 1; i++) {
      const curEnd = sorted[i].timeEnd;
      const nextStart = sorted[i + 1].timeStart;
      if (!curEnd || !nextStart) continue;
      const gap = gapMinutes(curEnd, nextStart);
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
    value: string
  ) => {
    const updated = timeSlots.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
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
      dt.getUTCDate()
    ).padStart(2, "0")}`;
  };

  /**
   * RULE (Bangladesh calendar):
   * - 00 UTC  → previous BD date
   * - non-00  → today BD date
   */
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
      now.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")} ${String(
      now.getUTCHours()
    ).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`;

    return { utcHour, selectedDate, rule, currentUTCTime, bdToday };
  };

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
      (a.timeStart || "").localeCompare(b.timeStart || "")
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
              {/* <div className="text-xs text-violet-600 space-y-1">
                <p className="font-medium">সাধারণত Start Date-এর সমান থাকে</p>
                <p className="text-violet-500">
                  বৃষ্টি একাধিক দিনে হলে পরিবর্তন করুন
                </p>
              </div> */}
            </div>
          </div>

          {/* <div className="mt-4 p-3 bg-violet-50 border border-violet-200 rounded-lg">
            <p className="text-xs font-semibold text-violet-900 mb-2">
              📋 Rule (Bangladesh Calendar):
            </p>
            <div className="text-xs text-violet-700 space-y-1">
              <p>
                • <span className="font-medium">00 UTC</span> → আগের দিনের তারিখ
              </p>
              <p>
                • <span className="font-medium">non-00 UTC</span> → বর্তমান
                দিনের তারিখ
              </p>
              <p className="text-violet-600 mt-1">Examples:</p>
              <p className="ml-4">
                - আজ (BD) 2025-10-16 হলে → 00 UTC = 2025-10-15
              </p>
              <p className="ml-4">
                - আজ (BD) 2025-10-16 হলে → 03/06/12/18 UTC = 2025-10-16
              </p>
            </div>
          </div> */}
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
                </Label>
                <Input
                  id="during-previous"
                  type="text"
                  step="0.1"
                  value={rainfall["during-previous"] || ""}
                  onChange={(e) =>
                    setFieldValue(
                      "rainfall.during-previous",
                      normalizeFourDigitRain(e.target.value)
                    )
                  }
                  inputMode="numeric"
                  pattern="[0-9]{0,4}"
                  maxLength={4}
                  placeholder="0000"
                  className="border-violet-200 focus:border-violet-500"
                />
                <p className="text-xs text-slate-600">
                  Enter four digits for cumulative 6-hour precipitation (e.g., 0005, 0123).
                </p>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="last-24-hours">
                Last 24 Hours Precipitation (mm)
              </Label>
              <Input
                id="last-24-hours"
                type="text"
                step="0.1"
                value={rainfall["last-24-hours"] || ""}
                onChange={(e) =>
                  setFieldValue("rainfall.last-24-hours", e.target.value)
                }
                className="border-violet-200 focus:border-violet-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
