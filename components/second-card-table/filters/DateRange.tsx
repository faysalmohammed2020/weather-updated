"use client";

interface DateRangeProps {
  startDate: string;
  endDate: string;
  maxDate: string;
  onDateChange: (type: "start" | "end", value: string) => void;
  dateError?: string | null;
}

const DateRange = ({
  startDate,
  endDate,
  maxDate,
  onDateChange,
  dateError,
}: DateRangeProps) => (
  <div className="flex flex-col w-full">
    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
      <input
        type="date"
        value={startDate}
        onChange={(event) => onDateChange("start", event.target.value)}
        max={endDate}
        className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full md:w-auto min-w-0"
      />
      <span className="text-sm text-slate-600 whitespace-nowrap px-1">
        to
      </span>
      <input
        type="date"
        value={endDate}
        onChange={(event) => onDateChange("end", event.target.value)}
        min={startDate}
        max={maxDate}
        className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full md:w-auto min-w-0"
      />
    </div>
    {dateError && (
      <p className="text-sm text-red-600 mt-1 text-center md:text-left">
        {dateError}
      </p>
    )}
  </div>
);

export default DateRange;
