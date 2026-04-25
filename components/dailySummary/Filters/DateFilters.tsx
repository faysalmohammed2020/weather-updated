import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateFiltersProps {
  startDate: string;
  endDate: string;
  onDateChange: (type: "start" | "end", value: string) => void;
  onNavigate: (direction: "previous" | "next") => void;
  dateError?: string | null;
}

export const DateFilters = ({
  startDate,
  endDate,
  onDateChange,
  onNavigate,
  dateError,
}: DateFiltersProps) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate("previous")}
          className="hover:bg-slate-200 shrink-0 bg-transparent"
          aria-label="Go to previous range"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={(event) =>
              onDateChange("start", event.currentTarget.value)
            }
            max={endDate}
            className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full sm:w-auto min-w-[120px]"
          />
          <span className="text-sm text-slate-600 whitespace-nowrap">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(event) => onDateChange("end", event.currentTarget.value)}
            min={startDate}
            max={today}
            className="text-xs sm:text-sm p-2 border border-slate-300 focus:ring-purple-500 focus:ring-2 rounded w-full sm:w-auto min-w-[120px]"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onNavigate("next")}
          className="hover:bg-slate-200 shrink-0 bg-transparent"
          aria-label="Go to next range"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
    </div>
  );
};
