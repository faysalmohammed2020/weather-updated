"use client";

import type { Station } from "@/types/station";
import DateNavigator from "./DateNavigator";
import ExportButtons from "./ExportButtons";
import StationFilterDropdown from "./StationFilterDropdown";

interface FiltersProps {
  startDate: string;
  endDate: string;
  onDateChange: (type: "start" | "end", value: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  dateError?: string | null;
  allowExport: boolean;
  onExportCsv: () => void;
  onExportTxt: () => void;
  exportDisabled: boolean;
  showStationFilter: boolean;
  stations: Station[];
  stationFilter: string;
  onStationFilterChange: (value: string) => void;
  maxDate: string;
}

const Filters = ({
  startDate,
  endDate,
  onDateChange,
  onPrevious,
  onNext,
  dateError,
  allowExport,
  onExportCsv,
  onExportTxt,
  exportDisabled,
  showStationFilter,
  stations,
  stationFilter,
  onStationFilterChange,
  maxDate,
}: FiltersProps) => (
  <div className="flex flex-col md:flex-row md:justify-between mb-6 gap-4 bg-slate-100 p-3 sm:p-4 rounded-lg">
    <DateNavigator
      startDate={startDate}
      endDate={endDate}
      onDateChange={onDateChange}
      onPrevious={onPrevious}
      onNext={onNext}
      maxDate={maxDate}
      dateError={dateError}
    />
    <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
      {allowExport && (
        <ExportButtons
          disabled={exportDisabled}
          onExportCsv={onExportCsv}
          onExportTxt={onExportTxt}
        />
      )}
      {showStationFilter && (
        <StationFilterDropdown
          stations={stations}
          value={stationFilter}
          onChange={onStationFilterChange}
        />
      )}
    </div>
  </div>
);

export default Filters;

