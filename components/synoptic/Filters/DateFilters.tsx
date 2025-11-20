import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getNextRange,
  getPreviousRange,
  todayISO,
  validateDateChange,
} from "@/lib/utils/date-utils";
import type { DateRange } from "@/lib/utils/date-utils";

interface DateFiltersProps {
  startDate: string;
  endDate: string;
  onRangeChange: (range: DateRange) => void;
}

export const DateFilters = ({
  startDate,
  endDate,
  onRangeChange,
}: DateFiltersProps) => {
  const [error, setError] = useState<string | null>(null);
  const maxDate = useMemo(() => todayISO(), []);

  const handleDateInput = (type: "start" | "end", value: string) => {
    const { range, error: validationError } = validateDateChange(type, value, {
      startDate,
      endDate,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onRangeChange(range);
  };

  const handlePreviousWeek = () => {
    const range = getPreviousRange(startDate, endDate);
    onRangeChange(range);
    setError(null);
  };

  const handleNextWeek = () => {
    const range = getNextRange(startDate, endDate);
    if (!range) {
      return;
    }
    onRangeChange(range);
    setError(null);
  };

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto">
      <div className="flex items-center gap-2 w-full">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousWeek}
          className="hover:bg-slate-200 flex-shrink-0 bg-transparent"
          aria-label="Go to previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              handleDateInput("start", event.currentTarget.value)
            }
            max={endDate}
            className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full sm:w-auto min-w-[120px]"
          />
          <span className="text-sm text-slate-600 whitespace-nowrap">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) =>
              handleDateInput("end", event.currentTarget.value)
            }
            min={startDate}
            max={maxDate}
            className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full sm:w-auto min-w-[120px]"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextWeek}
          className="hover:bg-slate-200 flex-shrink-0 bg-transparent"
          aria-label="Go to next week"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
