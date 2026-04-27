// components/backlog/DateSelector.tsx

"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";

type Props = {
  value?: string;
  onChange: (date: string) => void;
  onCheckData?: () => void;
  isLoading?: boolean;
};

export default function DateSelector({
  value,
  onChange,
  onCheckData,
  isLoading,
}: Props) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const maxDate = yesterday.toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;

    if (date > maxDate) return;

    setSelectedDate(date);
    onChange(date);
  };

  return (
    <div className="w-full min-h-[85vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <CalendarDays className="h-7 w-7" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800">
            Select Date For Input Data
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Choose a date to check backlog data status.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            Observation Date
          </label>

          <input
            type="date"
            value={selectedDate}
            max={maxDate}
            onChange={handleChange}
            className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>
        {onCheckData && (
          <div className="mt-6">
            <button
              onClick={onCheckData}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Loading..." : "Check Data Status"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
