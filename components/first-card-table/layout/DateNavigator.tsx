"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigatorProps {
  startDate: string;
  endDate: string;
  onDateChange: (type: "start" | "end", value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  maxDate: string;
  dateError?: string | null;
}

const DateNavigator = ({
  startDate,
  endDate,
  onDateChange,
  onPrevious,
  onNext,
  maxDate,
  dateError,
}: DateNavigatorProps) => (
  <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
    <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 w-full sm:w-auto">
      <div className="flex items-center gap-2 w-full xs:w-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevious}
          className="hover:bg-slate-200 shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(event) => onDateChange("start", event.target.value)}
            className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
          />
          <span className="text-sm text-slate-600 whitespace-nowrap">to</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            max={maxDate}
            onChange={(event) => onDateChange("end", event.target.value)}
            className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full xs:w-auto min-w-0"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onNext}
          className="hover:bg-slate-200 shrink-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
    {dateError && (
      <p className="text-xs text-red-500 font-medium">{dateError}</p>
    )}
  </div>
);

export default DateNavigator;

