"use client";

import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, AlertCircle, CheckCircle2, Clock, Info, Droplets } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import TimePickerUTC from "@/components/ui/time-picker-utc";
import type { WeatherFormValues } from "./WeatherForm";

interface TimeSlot {
  id: string;
  timeStart: string;
  timeEnd: string;
}

const RainFields = () => {
  const { register, control, setValue, watch } = useFormContext<WeatherFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rainfallTimeSlots"
  });

  // Watch rainfall related fields
  const rainfallTimeSlots = watch("rainfallTimeSlots") || [];
  const rainfallSincePrevious = watch("rainfallSincePrevious") || "";
  const observationUtcTime = watch("observationUtcTime") || "";
  const [rainfallType, setRainfallType] = useState<"continuous" | "intermittent" | "">("");
  const [rainfallApiData, setRainfallApiData] = useState<any[]>([]);
  const observationHour = useMemo(() => {
    if (!observationUtcTime) return null;
    const parsed = new Date(observationUtcTime);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getUTCHours();
  }, [observationUtcTime]);
  const isSixHourReport = observationHour !== null && [0, 6, 12, 18].includes(observationHour);

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

  // Time helpers
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
    const end = e >= s ? e : e + 24 * 60;
    return end - s;
  };

  const gapMinutes = (endHHMM: string, nextStartHHMM: string) => {
    const e = toMinutes(endHHMM);
    const n = toMinutes(nextStartHHMM);
    if (e === null || n === null) return 0;
    return n - e;
  };

  // Detect rainfall type
  const detectRainfallType = (slots: TimeSlot[]) => {
    if (slots.length === 0) {
      setRainfallType("");
      setValue("rainfallType", "");
      return;
    }

    const sorted = [...slots].sort((a, b) =>
      (a.timeStart || "").localeCompare(b.timeStart || "")
    );

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
    setValue("rainfallType", type);
  };

  // Auto-detect rainfall type when slots change
  useEffect(() => {
    detectRainfallType(rainfallTimeSlots);
  }, [rainfallTimeSlots]);

  // Slot operations
  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      timeStart: "",
      timeEnd: "",
    };
    append(newSlot);
  };

  const removeTimeSlot = (index: number) => {
    remove(index);
  };

  const updateTimeSlot = (index: number, field: "timeStart" | "timeEnd", value: string) => {
    setValue(`rainfallTimeSlots.${index}.${field}` as keyof WeatherFormValues, value);
  };

  // Slot summary
  const slotSummary = useMemo(() => {
    if (!rainfallTimeSlots.length) {
      return {
        total: 0,
        completed: 0,
        totalMin: 0,
        maxGap: 0,
        hasOverlap: false,
      };
    }

    const sorted = [...rainfallTimeSlots].sort((a, b) =>
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
        if (g < 0) hasOverlap = true;
      }
    }
    if (maxGap === -Infinity) maxGap = 0;

    return { total: rainfallTimeSlots.length, completed, totalMin, maxGap, hasOverlap };
  }, [rainfallTimeSlots]);

  const minutesToHM = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (mins <= 0) return "0m";
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Rainfall calculation functions
  const parseRainfallCodeToMm = (value?: string | null): number => {
    if (!value) return 0;
    const trimmed = value.trim();
    if (!trimmed) return 0;
    const numeric = Number.parseFloat(trimmed);
    if (Number.isNaN(numeric)) return 0;
    if (trimmed.includes(".")) return numeric;
    return trimmed.length >= 4 ? numeric / 10 : numeric;
  };

  const formatToFourDigitCode = (mm: number): string => {
    const tenths = Math.round(Math.max(0, mm) * 10);
    return String(tenths).padStart(4, "0");
  };

  const formatToR24Code = (mm: number): string => {
    const tenths = Math.round(Math.max(0, mm) * 10);
    if (tenths >= 9998) return "9998";
    return String(tenths).padStart(4, "0");
  };

  const parseSincePreviousInput = () =>
    parseRainfallCodeToMm(rainfallSincePrevious);

  const getRainfallValue = (utcTime: string): number => {
    const item = rainfallApiData.find((data) => data.utcTime === utcTime);
    return item ? parseRainfallCodeToMm(item.rainfallSincePrevious) : 0;
  };

  const getCurrentObservationUtc = () => {
    if (!observationUtcTime) return null;
    const parsed = new Date(observationUtcTime);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const calculateDuringPrevious6Hours = (): string => {
    const currentObservationUtc = getCurrentObservationUtc();
    if (!currentObservationUtc || observationHour === null || !isSixHourReport) {
      return "";
    }

    const currentSincePrevious = parseSincePreviousInput();
    const previousSlotUtc = new Date(
      currentObservationUtc.getTime() - 3 * 60 * 60 * 1000,
    );
    const total = getRainfallValue(previousSlotUtc.toISOString()) + currentSincePrevious;

    return formatToFourDigitCode(total);
  };

  const calculateLast24Hours = (): string => {
    const currentObservationUtc = getCurrentObservationUtc();
    if (!currentObservationUtc) return "";

    const currentSincePrevious = parseSincePreviousInput();
    let total = currentSincePrevious;

    for (let i = 1; i <= 7; i++) {
      const previousSlotUtc = new Date(
        currentObservationUtc.getTime() - i * 3 * 60 * 60 * 1000,
      );
      total += getRainfallValue(previousSlotUtc.toISOString());
    }

    return formatToR24Code(total);
  };

  // Auto-fill calculated values using the same rolling UTC accumulation rule as the create form.
  useEffect(() => {
    if (isSixHourReport) {
      const calculated6Hours = calculateDuringPrevious6Hours();
      setValue("rainfallDuringPrevious", calculated6Hours || "");
    } else {
      setValue("rainfallDuringPrevious", "");
    }

    const calculated24Hours = calculateLast24Hours();
    setValue("rainfallLast24Hours", calculated24Hours || "");
  }, [
    rainfallApiData,
    rainfallSincePrevious,
    isSixHourReport,
    observationUtcTime,
    setValue,
  ]);

  return (
    <div className="space-y-4">
      {/* Time Slots Card */}
      <Card className="border-emerald-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-emerald-50 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-emerald-700">
            Rainfall Time Slots
          </CardTitle>
          <Button
            type="button"
            size="sm"
            onClick={addTimeSlot}
            className="bg-emerald-600 hover:bg-emerald-700 h-8"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Slot
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {/* Time Slots */}
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Slot {index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTimeSlot(index)}
                      className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="grid gap-2">
                    <TimePickerUTC
                      id={`time-start-${field.id}`}
                      label="Start Time"
                      value={rainfallTimeSlots[index]?.timeStart || "00:00"}
                      onChange={(v) => updateTimeSlot(index, "timeStart", v)}
                      minutesStep={1}
                    />
                    <p className="text-xs text-emerald-600">
                      e.g., 21:00, 22:50, 13:07
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <TimePickerUTC
                      id={`time-end-${field.id}`}
                      label="End Time"
                      value={rainfallTimeSlots[index]?.timeEnd || "00:00"}
                      onChange={(v) => updateTimeSlot(index, "timeEnd", v)}
                      minutesStep={1}
                    />
                    <p className="text-xs text-emerald-600">
                      e.g., 23:45, 00:30, 14:15
                    </p>
                  </div>
                </div>

                {/* Per-slot duration */}
                {rainfallTimeSlots[index]?.timeStart && rainfallTimeSlots[index]?.timeEnd ? (
                  <div className="mt-3 text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Duration:{" "}
                    <span className="font-semibold">
                      {minutesToHM(diffMinutes(rainfallTimeSlots[index].timeStart, rainfallTimeSlots[index].timeEnd))}
                    </span>
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-slate-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Fill start/end times to see duration
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Slots summary */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge className="bg-emerald-600 hover:bg-emerald-700">
              Total Slots: {slotSummary.total}
            </Badge>
            <Badge className="bg-emerald-600 hover:bg-emerald-700">
              Completed: {slotSummary.completed}
            </Badge>
            <Badge className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1">
              <Droplets className="h-3 w-3" /> Total Time:{" "}
              {minutesToHM(slotSummary.totalMin)}
            </Badge>
            {slotSummary.hasOverlap && (
              <Badge className="bg-red-600 hover:bg-red-700">
                ⚠️ Overlap detected
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rainfall Measurements */}
      <Card className="border-emerald-200 bg-white shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4 bg-emerald-50">
          <CardTitle className="text-sm font-medium text-emerald-700">
            Rainfall Measurements (mm)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
            <Label className="text-sm font-medium text-gray-700">
              Since Previous Observation
            </Label>
            <Input
              {...register("rainfallSincePrevious")}
              className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
              placeholder="Enter rainfall amount"
            />
          </div>

          <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
            <Label className="text-sm font-medium text-gray-700">
              During Previous 6 Hours
              <span className="ml-2 text-xs text-green-600 font-medium">
                (Auto-calculated)
              </span>
            </Label>
            <Input
              {...register("rainfallDuringPrevious")}
              className="w-full bg-green-50 border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 font-mono"
              readOnly
              placeholder="Auto-calculated"
            />
          </div>

          <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
            <Label className="text-sm font-medium text-gray-700">
              Last 24 Hours (0.1 mm code)
              <span className="ml-2 text-xs text-green-600 font-medium">
                (Auto-calculated for all UTC)
              </span>
            </Label>
            <Input
              {...register("rainfallLast24Hours")}
              className="w-full bg-green-50 border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 font-mono"
              readOnly
              placeholder="Auto-calculated"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RainFields;
