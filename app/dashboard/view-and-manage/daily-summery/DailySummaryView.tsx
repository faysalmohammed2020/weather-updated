"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
  type Ref,
} from "react";
import { LineChart } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import type {
  DailySummaryHeaderInfo,
  DailySummaryRecord,
  DailySummaryUser,
} from "@/lib/types/dailySummary";
import type { Station } from "@/lib/types/station";
import type { DateRange } from "@/lib/utils/date-utils";
import { todayISO } from "@/lib/utils/date-utils";
import { differenceInDays, format, parseISO, isValid } from "date-fns";
import { fetchDailySummary, fetchStations } from "@/lib/api/dailySummary";
import { DailySummaryTable } from "@/components/dailySummary/Table/DailySummaryTable";
import { FilterPanel } from "@/components/dailySummary/Filters/FilterPanel";
import { FooterSummary } from "@/components/dailySummary/Export/FooterSummary";
import { EditDailySummaryDialog } from "@/components/dailySummary/Dialogs/EditDailySummaryDialog";
import { PermissionDeniedDialog } from "@/components/dailySummary/Dialogs/PermissionDeniedDialog";
import { canEditRecord } from "@/lib/utils/role-utils";
import { exportDailySummaryCSV } from "@/lib/export/exportDailyCSV";
import { exportDailySummaryTXT } from "@/lib/export/exportDailyTXT";

export interface DailySummaryViewHandle {
  getData: () => DailySummaryRecord[];
}

interface DailySummaryViewProps {
  initialRecords?: DailySummaryRecord[];
  initialStations?: Station[];
  filters?: {
    startDate: string;
    endDate: string;
    stationFilter: string;
  };
  hideFilters?: boolean;
}

const buildDefaultHeaderInfo = (
  user?: DailySummaryUser | null,
): DailySummaryHeaderInfo => {
  const now = new Date();
  return {
    dataType: "SY",
    stationNo: user?.station?.stationId || "41953",
    year: now.getUTCFullYear().toString().slice(-2),
    month: String(now.getUTCMonth() + 1).padStart(2, "0"),
    day: String(now.getUTCDate()).padStart(2, "0"),
  };
};

const deriveHeaderInfo = (
  record?: DailySummaryRecord,
  user?: DailySummaryUser | null,
): DailySummaryHeaderInfo => {
  if (!record) {
    return buildDefaultHeaderInfo(user);
  }

  const observingTime = record.ObservingTime?.utcTime
    ? new Date(record.ObservingTime.utcTime)
    : new Date();

  return {
    dataType: record.dataType?.substring(0, 2) || "SY",
    stationNo:
      record.ObservingTime?.station?.stationId ||
      record.ObservingTime?.stationId ||
      user?.station?.stationId ||
      "41953",
    year: observingTime.getUTCFullYear().toString().slice(-2),
    month: String(observingTime.getUTCMonth() + 1).padStart(2, "0"),
    day: String(observingTime.getUTCDate()).padStart(2, "0"),
  };
};

const DailySummaryViewComponent = (
  {
    initialRecords,
    initialStations,
    filters,
    hideFilters = false,
  }: DailySummaryViewProps,
  ref: Ref<DailySummaryViewHandle>,
) => {
  const { data: session } = useSession();
  const user = session?.user as DailySummaryUser | undefined;
  const isSuperAdmin =
    user?.role === "super_admin" || user?.role === "root_admin";
  const isStationAdmin = user?.role === "station_admin";

  const [localDateRange, setLocalDateRange] = useState<DateRange>({
    startDate: todayISO(),
    endDate: todayISO(),
  });
  const [dateError, setDateError] = useState<string | null>(null);
  const [localStationFilter, setLocalStationFilter] = useState("all");
  const [records, setRecords] = useState<DailySummaryRecord[]>(
    initialRecords || [],
  );
  const [stations, setStations] = useState<Station[]>(initialStations || []);
  const [headerInfo, setHeaderInfo] = useState<DailySummaryHeaderInfo>(() =>
    buildDefaultHeaderInfo(user),
  );
  const [isLoading, setIsLoading] = useState(false); // Start with false since we have initial data
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<DailySummaryRecord | null>(null);
  const [isPermissionDeniedOpen, setIsPermissionDeniedOpen] = useState(false);
  const dateRange = filters
    ? { startDate: filters.startDate, endDate: filters.endDate }
    : localDateRange;
  const stationFilter = filters?.stationFilter ?? localStationFilter;

  const stationQuery =
    isSuperAdmin && stationFilter !== "all" ? stationFilter : undefined;

  // Safe date formatting utility
  const formatDate = useCallback(
    (dateValue: string | Date | null | undefined): string => {
      try {
        if (!dateValue) return "N/A";

        if (typeof dateValue === "string") {
          const date = parseISO(dateValue);
          if (isValid(date)) {
            return format(date, "MMM d, yyyy");
          }
        } else if (dateValue instanceof Date) {
          if (isValid(dateValue)) {
            return format(dateValue, "MMM d, yyyy");
          }
        }
        return "Invalid Date";
      } catch (error) {
        console.error("Error formatting date:", error);
        return "Invalid Date";
      }
    },
    [],
  );

  const loadDailySummary = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDailySummary({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        stationId: stationQuery,
      });
      setRecords(data);
      setHeaderInfo(deriveHeaderInfo(data[0], user));
    } catch (error) {
      console.error("Failed to fetch daily summary:", error);
      toast.error("Failed to fetch daily summary data");
      setRecords([]);
      setHeaderInfo(deriveHeaderInfo(undefined, user));
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, stationQuery, user]);

  useEffect(() => {
    loadDailySummary();
  }, [loadDailySummary]);

  useEffect(() => {
    if (!isSuperAdmin || initialStations?.length) {
      return;
    }

    let active = true;
    const loadStations = async () => {
      try {
        const fetched = await fetchStations();
        if (active) {
          setStations(fetched);
        }
      } catch (error) {
        console.error("Failed to fetch stations:", error);
        toast.error("Failed to fetch stations");
      }
    };

    loadStations();
    return () => {
      active = false;
    };
  }, [isSuperAdmin, initialStations]);

  useImperativeHandle(ref, () => ({
    getData: () =>
      records.map((record) => ({
        ...record,
        dataType: headerInfo.dataType,
        stationNo: headerInfo.stationNo,
        date: record.ObservingTime?.utcTime || new Date().toISOString(),
      })),
  }));

  const handleNavigate = (direction: "previous" | "next") => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const daysInRange = differenceInDays(end, start);

    if (direction === "previous") {
      const newStart = new Date(start);
      newStart.setDate(start.getDate() - (daysInRange + 1));
      const newEnd = new Date(start);
      newEnd.setDate(start.getDate() - 1);
      setLocalDateRange({
        startDate: format(newStart, "yyyy-MM-dd"),
        endDate: format(newEnd, "yyyy-MM-dd"),
      });
      setDateError(null);
      return;
    }

    const newStart = new Date(start);
    newStart.setDate(start.getDate() + (daysInRange + 1));
    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + daysInRange);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newEnd > today) {
      if (end >= today) {
        return;
      }
      const adjustedEnd = new Date(today);
      const adjustedStart = new Date(adjustedEnd);
      adjustedStart.setDate(adjustedEnd.getDate() - daysInRange);
      setLocalDateRange({
        startDate: format(adjustedStart, "yyyy-MM-dd"),
        endDate: format(adjustedEnd, "yyyy-MM-dd"),
      });
    } else {
      setLocalDateRange({
        startDate: format(newStart, "yyyy-MM-dd"),
        endDate: format(newEnd, "yyyy-MM-dd"),
      });
    }
    setDateError(null);
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      setDateError("Invalid date format");
      return;
    }

    const otherDate =
      type === "start"
        ? new Date(dateRange.endDate)
        : new Date(dateRange.startDate);

    if (type === "start") {
      if (date > otherDate) {
        setDateError("Start date cannot be after end date");
        return;
      }
      setLocalDateRange((prev) => ({
        ...prev,
        startDate: value,
      }));
    } else {
      if (date < otherDate) {
        setDateError("End date cannot be before start date");
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date > today) {
        setDateError("End date cannot be in the future");
        return;
      }
      setLocalDateRange((prev) => ({
        ...prev,
        endDate: value,
      }));
    }

    setDateError(null);
  };

  const handleEditRequest = (record: DailySummaryRecord) => {
    if (user && canEditRecord(record, user)) {
      setSelectedRecord(record);
      setIsEditDialogOpen(true);
    } else {
      setSelectedRecord(record);
      setIsPermissionDeniedOpen(true);
    }
  };

  const handleRecordUpdated = (updated: DailySummaryRecord) => {
    setRecords((prev) =>
      prev.map((record) => (record.id === updated.id ? updated : record)),
    );
    setSelectedRecord(updated);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
  };

  const closePermissionDialog = () => {
    setIsPermissionDeniedOpen(false);
    setSelectedRecord(null);
  };

  const handleExportCSV = () => {
    if (exportDailySummaryCSV(records, headerInfo)) {
      toast.success("CSV exported successfully");
    } else {
      toast.error("No data available to export");
    }
  };

  const handleExportTXT = () => {
    if (
      exportDailySummaryTXT(records, headerInfo, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
    ) {
      toast.success("TXT exported successfully");
    } else {
      toast.error("No data available to export");
    }
  };

  return (
    <div className="space-y-6 print:space-y-0 m-2">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <span className="w-10 h-10 rounded-full bg-linear-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-sm mr-3">
          <LineChart size={20} />
        </span>
        Daily Summary Data
      </h2>

      {!hideFilters && (
        <FilterPanel
          dateRange={dateRange}
          dateError={dateError}
          onDateChange={handleDateChange}
          onNavigate={handleNavigate}
          canExport={isSuperAdmin || isStationAdmin}
          exportDisabled={!records.length}
          onExportCSV={handleExportCSV}
          onExportTXT={handleExportTXT}
          isSuperAdmin={Boolean(isSuperAdmin)}
          stations={stations}
          stationFilter={stationFilter}
          onStationChange={setLocalStationFilter}
        />
      )}

      <DailySummaryTable
        data={records}
        headerInfo={headerInfo}
        stations={stations}
        user={user}
        isLoading={isLoading}
        onRetry={loadDailySummary}
        onEditRecord={handleEditRequest}
      />

      <FooterSummary
        dateRange={dateRange}
        recordCount={records.length}
        stationFilter={stationFilter}
        stations={stations}
      />

      <EditDailySummaryDialog
        open={isEditDialogOpen}
        record={selectedRecord}
        onClose={closeEditDialog}
        onRecordUpdated={handleRecordUpdated}
      />

      <PermissionDeniedDialog
        open={isPermissionDeniedOpen}
        onClose={closePermissionDialog}
      />

      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }

          body {
            font-size: 10pt;
          }

          .print\\:bg-blue-700 {
            background-color: #1d4ed8 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print\\:bg-white {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export const DailySummaryView = forwardRef<
  DailySummaryViewHandle,
  DailySummaryViewProps
>(DailySummaryViewComponent);

export default DailySummaryView;
