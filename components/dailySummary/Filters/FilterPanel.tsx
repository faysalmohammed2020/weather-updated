import { DateFilters } from "@/components/dailySummary/Filters/DateFilters";
import { StationFilter } from "@/components/dailySummary/Filters/StationFilter";
import { ExportButtons } from "@/components/dailySummary/Export/ExportButtons";
import type { Station } from "@/lib/types/station";
import type { DateRange } from "@/lib/utils/date-utils";

interface FilterPanelProps {
  dateRange: DateRange;
  dateError?: string | null;
  onDateChange: (type: "start" | "end", value: string) => void;
  onNavigate: (direction: "previous" | "next") => void;
  canExport: boolean;
  exportDisabled: boolean;
  onExportCSV: () => void;
  onExportTXT: () => void;
  isSuperAdmin: boolean;
  stations: Station[];
  stationFilter: string;
  onStationChange: (value: string) => void;
}

export const FilterPanel = ({
  dateRange,
  dateError,
  onDateChange,
  onNavigate,
  canExport,
  exportDisabled,
  onExportCSV,
  onExportTXT,
  isSuperAdmin,
  stations,
  stationFilter,
  onStationChange,
}: FilterPanelProps) => (
  <div className="flex flex-col md:flex-row md:justify-between gap-4 bg-slate-100 p-3 sm:p-4 rounded-lg print:hidden">
    <DateFilters
      startDate={dateRange.startDate}
      endDate={dateRange.endDate}
      onDateChange={onDateChange}
      onNavigate={onNavigate}
      dateError={dateError}
    />
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-slate-200 md:pt-0 pt-3">
      {canExport && (
        <ExportButtons
          disabled={exportDisabled}
          onExportCSV={onExportCSV}
          onExportTXT={onExportTXT}
        />
      )}
      {isSuperAdmin && (
        <StationFilter
          value={stationFilter}
          stations={stations}
          onChange={onStationChange}
        />
      )}
    </div>
  </div>
);
