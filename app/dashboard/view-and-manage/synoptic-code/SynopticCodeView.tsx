"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  Ref,
} from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { DateFilters } from "@/components/synoptic/Filters/DateFilters";
import { StationFilter } from "@/components/synoptic/Filters/StationFilter";
import { ExportButtons } from "@/components/synoptic/Export/ExportButtons";
import { SynopticTable } from "@/components/synoptic/Table/SynopticTable";
import { EditSynopticDialog } from "@/components/synoptic/Dialogs/EditSynopticDialog";
import { PermissionDeniedDialog } from "@/components/synoptic/Dialogs/PermissionDeniedDialog";
import type { Station } from "@/lib/types/station";
import type {
  SynopticHeaderInfo,
  SynopticRecord,
  SynopticUser,
} from "@/lib/types/synoptic";
import { DateRange, todayISO } from "@/lib/utils/date-utils";
import { fetchStations, fetchSynoptic } from "@/lib/api/synoptic";
import { canEditRecord } from "@/lib/utils/role-utils";
import { exportSynopticCSV } from "@/lib/export/exportCSV";
import { exportSynopticTXT } from "@/lib/export/exportTXT";
import { exportSynopticTAC } from "@/lib/export/exportTAC";

export interface SynopticCodeViewHandle {
  getData: () => SynopticRecord[];
}

interface SynopticCodeViewProps {
  filters?: {
    startDate: string;
    endDate: string;
    stationFilter: string;
  };
  hideFilters?: boolean;
}

const buildDefaultHeaderInfo = (user?: SynopticUser): SynopticHeaderInfo => {
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
  record?: SynopticRecord,
  user?: SynopticUser,
): SynopticHeaderInfo => {
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

const SynopticCodeViewComponent = (
  { filters, hideFilters = false }: SynopticCodeViewProps,
  ref: Ref<SynopticCodeViewHandle>,
) => {
  const { data: session } = useSession();
  const user = session?.user as SynopticUser | undefined;
  const isSuperAdmin =
    user?.role === "super_admin" || user?.role === "root_admin";
  const isStationAdmin = user?.role === "station_admin";

  const initialDate = useMemo(
    () => ({
      startDate: todayISO(),
      endDate: todayISO(),
    }),
    [],
  );

  const [localDateRange, setLocalDateRange] = useState<DateRange>(initialDate);
  const [localStationFilter, setLocalStationFilter] = useState("all");
  const [records, setRecords] = useState<SynopticRecord[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [headerInfo, setHeaderInfo] = useState<SynopticHeaderInfo>(() =>
    buildDefaultHeaderInfo(user),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<SynopticRecord | null>(
    null,
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPermissionDeniedOpen, setIsPermissionDeniedOpen] = useState(false);
  const dateRange = filters
    ? { startDate: filters.startDate, endDate: filters.endDate }
    : localDateRange;
  const stationFilter = filters?.stationFilter ?? localStationFilter;

  useImperativeHandle(
    ref,
    () => ({
      getData: () => records,
    }),
    [records],
  );

  const stationQuery =
    stationFilter !== "all" ? { stationId: stationFilter } : undefined;

  const loadSynopticData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchSynoptic({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        stationId: stationQuery?.stationId,
      });
      setRecords(data);
      setHeaderInfo(deriveHeaderInfo(data[0], user));
    } catch (error) {
      console.error("Failed to fetch synoptic data:", error);
      toast.error("Failed to fetch synoptic data");
      setRecords([]);
      setHeaderInfo(deriveHeaderInfo(undefined, user));
    } finally {
      setIsLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate, stationQuery?.stationId, user]);

  useEffect(() => {
    loadSynopticData();
  }, [loadSynopticData]);

  useEffect(() => {
    if (!isSuperAdmin) {
      setStations([]);
      return;
    }

    let active = true;

    const loadStations = async () => {
      try {
        const fetchedStations = await fetchStations();
        if (active) {
          setStations(fetchedStations);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
        toast.error("Failed to fetch stations");
      }
    };

    loadStations();

    return () => {
      active = false;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!records.length) {
      setHeaderInfo(deriveHeaderInfo(undefined, user));
    }
  }, [records.length, user]);

  const handleEditRequest = (record: SynopticRecord) => {
    if (user && canEditRecord(record, user)) {
      setSelectedRecord(record);
      setIsEditDialogOpen(true);
    } else {
      setSelectedRecord(record);
      setIsPermissionDeniedOpen(true);
    }
  };

  const handleRecordUpdated = (updated: SynopticRecord) => {
    setRecords((prev) =>
      prev.map((entry) =>
        entry.id === updated.id ? { ...entry, ...updated } : entry,
      ),
    );
    setSelectedRecord(updated);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedRecord(null);
  };

  const handleExportCSV = () => {
    if (exportSynopticCSV(records, headerInfo)) {
      toast.success("CSV exported successfully");
    }
  };

  const handleExportTXT = () => {
    if (exportSynopticTXT(records, headerInfo)) {
      toast.success("TXT file exported successfully");
    }
  };

  const handleExportTAC = () => {
    if (
      exportSynopticTAC(records, headerInfo, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })
    ) {
      toast.success("TAC message exported successfully");
    }
  };

  return (
    <div className="space-y-6 print:space-y-0 m-2">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center">
        <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mr-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
        </span>
        Synoptic Code Data
      </h2>

      {!hideFilters && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 bg-slate-100 p-3 sm:p-4 md:p-5 rounded-lg print:hidden">
          <DateFilters
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onRangeChange={setLocalDateRange}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
            {(isSuperAdmin || isStationAdmin) && (
              <ExportButtons
                disabled={!records.length}
                onExportCSV={handleExportCSV}
                onExportTXT={handleExportTXT}
                onExportTAC={handleExportTAC}
              />
            )}
            {isSuperAdmin && (
              <StationFilter
                value={stationFilter}
                stations={stations}
                onChange={setLocalStationFilter}
              />
            )}
          </div>
        </div>
      )}

      <SynopticTable
        data={records}
        headerInfo={headerInfo}
        stations={stations}
        user={user}
        isLoading={isLoading}
        onRetry={loadSynopticData}
        onEditRecord={handleEditRequest}
      />

      <EditSynopticDialog
        open={isEditDialogOpen}
        record={selectedRecord}
        onClose={closeEditDialog}
        onRecordUpdated={handleRecordUpdated}
      />

      <PermissionDeniedDialog
        open={isPermissionDeniedOpen}
        onClose={() => setIsPermissionDeniedOpen(false)}
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

export const SynopticCodeView = forwardRef<
  SynopticCodeViewHandle,
  SynopticCodeViewProps
>(
  SynopticCodeViewComponent,
);

export default SynopticCodeView;
