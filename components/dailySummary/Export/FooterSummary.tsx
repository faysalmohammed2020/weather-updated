import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import type { Station } from "@/lib/types/station";
import type { DateRange } from "@/lib/utils/date-utils";
import { formatDateRangeLabel } from "@/lib/utils/format-utils";

interface FooterSummaryProps {
  dateRange: DateRange;
  recordCount: number;
  stationFilter: string;
  stations: Station[];
}

const resolveStationLabel = (stations: Station[], stationId: string) => {
  const match = stations.find((station) => station.id === stationId);
  return match ? `${match.name} (${match.stationId})` : stationId;
};

export const FooterSummary = ({
  dateRange,
  recordCount,
  stationFilter,
  stations,
}: FooterSummaryProps) => (
  <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 print:hidden">
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-sky-500" />
      <span className="text-sm text-slate-600">
        Date Range:{" "}
        <span className="font-semibold text-slate-800">
          {formatDateRangeLabel(dateRange.startDate, dateRange.endDate)}
        </span>
      </span>
    </div>
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="bg-sky-100 text-sky-800 hover:bg-sky-200"
      >
        {recordCount} record(s)
      </Badge>
      {stationFilter !== "all" && (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 hover:bg-blue-200"
        >
          Station: {resolveStationLabel(stations, stationFilter)}
        </Badge>
      )}
    </div>
  </div>
);
