// components/ui/time-picker-utc.tsx
"use client";

import { Label } from "@/components/ui/label";
import { useMemo } from "react";

type Props = {
  id?: string;
  label?: string;
  value: string; // "HH:MM" (UTC)
  onChange: (v: string) => void;
  minutesStep?: number; // default: 1
};

export default function TimePickerUTC({
  id,
  label = "Time (UTC)",
  value,
  onChange,
  minutesStep = 1,
}: Props) {
  const [hStr, mStr] = (value || "").split(":");
  const h = Number.isInteger(Number(hStr)) ? parseInt(hStr, 10) : NaN;
  const m = Number.isInteger(Number(mStr)) ? parseInt(mStr, 10) : NaN;

  const hours = useMemo(
    () => Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0")),
    []
  );

  const minutes = useMemo(() => {
    const step = Math.max(1, minutesStep);
    const list: string[] = [];
    for (let i = 0; i < 60; i += step) list.push(i.toString().padStart(2, "0"));
    return list;
  }, [minutesStep]);

  const safe = (n: number, max: number) =>
    Number.isFinite(n) && n >= 0 && n <= max ? n : 0;

  const handleHour = (v: string) => {
    const hh = safe(parseInt(v, 10), 23).toString().padStart(2, "0");
    const mm = safe(isNaN(m) ? 0 : m, 59)
      .toString()
      .padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  const handleMinute = (v: string) => {
    const hh = safe(isNaN(h) ? 0 : h, 23)
      .toString()
      .padStart(2, "0");
    const mm = safe(parseInt(v, 10), 59).toString().padStart(2, "0");
    onChange(`${hh}:${mm}`);
  };

  return (
    <div className="grid gap-1.5">
      {label && (
        <Label htmlFor={id} className="font-semibold">
          {label} <span className="text-xs text-muted-foreground">(UTC)</span>
        </Label>
      )}
      <div className="flex items-center gap-2">
        <select
          id={id ? `${id}-hour` : undefined}
          className="h-10 rounded-md border px-3 py-2 text-sm font-mono"
          value={Number.isFinite(h) ? h.toString().padStart(2, "0") : "00"}
          onChange={(e) => handleHour(e.target.value)}
        >
          {hours.map((hh) => (
            <option key={hh} value={hh}>
              {hh}
            </option>
          ))}
        </select>
        <span className="font-mono">:</span>
        <select
          id={id ? `${id}-minute` : undefined}
          className="h-10 rounded-md border px-3 py-2 text-sm font-mono"
          value={Number.isFinite(m) ? m.toString().padStart(2, "0") : "00"}
          onChange={(e) => handleMinute(e.target.value)}
        >
          {minutes.map((mm) => (
            <option key={mm} value={mm}>
              {mm}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground ml-1">UTC</span>
      </div>
    </div>
  );
}
