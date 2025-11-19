"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { format } from "date-fns";
import Filters from "./layout/Filters";
import TableHeader from "./layout/TableHeader";
import TableRow from "./layout/TableRow";
import EditDialog from "./form/EditDialog";
import type { MeteorologicalFormValues } from "./form/MeteorologicalForm";
import type {
  MeteorologicalEntry,
  ObservingTimeEntry,
} from "@/types/meteorological";
import { useMeteorologicalEntries, useStationsQuery } from "@/lib/queries/meteorological";
import { exportToCSV as buildCsv } from "@/lib/export/exportCSV";
import { exportToTXT as buildTxt } from "@/lib/export/exportTXT";
import { getNextRange, getPreviousRange } from "@/lib/utils/date-utils";
import { CloudSun } from "lucide-react";

interface FirstCardTableProps {
  refreshTrigger?: number;
}

export interface FirstCardTableHandle {
  getData: () => Array<
    MeteorologicalEntry & {
      stationId: string;
      stationName: string;
      utcTime: string;
      localTime: string;
    }
  >;
}

const FirstCardTable = forwardRef<FirstCardTableHandle, FirstCardTableProps>(
  ({ refreshTrigger = 0 }, ref) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [dateError, setDateError] = useState<string | null>(null);
    const [stationFilter, setStationFilter] = useState("all");
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] =
      useState<MeteorologicalEntry | null>(null);
    const [selectedObservingTime, setSelectedObservingTime] =
      useState<ObservingTimeEntry | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { data: session } = useSession();
    const user = session?.user;
    const isSuperAdmin = user?.role === "super_admin";
    const isStationAdmin = user?.role === "station_admin";

    const {
      entries,
      flattenedData,
      isLoading,
      error,
      mutate,
    } = useMeteorologicalEntries({
      startDate,
      endDate,
      stationFilter,
      refreshKey: refreshTrigger,
    });
    const { stations } = useStationsQuery(Boolean(isSuperAdmin));

    useEffect(() => {
      if (error) {
        toast.error("Failed to fetch meteorological data");
      }
    }, [error]);

    useImperativeHandle(ref, () => ({
      getData: () =>
        flattenedData.map((record) => {
          const observingTime = entries.find(
            (ot) => ot.id === record.observingTimeId
          );
          return {
            ...record,
            stationId: observingTime?.stationId || "",
            stationName: observingTime?.station?.name || "",
            utcTime: observingTime?.utcTime || "",
            localTime: observingTime?.localTime || "",
          };
        }),
    }));

    const handleDateChange = (type: "start" | "end", newValue: string) => {
      const date = new Date(newValue);
      const otherDate =
        type === "start" ? new Date(endDate) : new Date(startDate);

      if (Number.isNaN(date.getTime())) {
        setDateError("Invalid date format");
        return;
      }

      setDateError(null);
      if (type === "start") {
        if (date > otherDate) {
          setDateError("Start date cannot be after end date");
          return;
        }
        setStartDate(newValue);
      } else {
        if (date < otherDate) {
          setDateError("End date cannot be before start date");
          return;
        }
        setEndDate(newValue);
      }
    };

    const changeRange = (getRange: () => { startDate: string; endDate: string } | null) => {
      const range = getRange();
      if (!range) return;
      setStartDate(range.startDate);
      setEndDate(range.endDate);
      setDateError(null);
    };

    const goToPreviousWeek = () =>
      changeRange(() => getPreviousRange(startDate, endDate));
    const goToNextWeek = () =>
      changeRange(() => getNextRange(startDate, endDate));

    const canEditRecord = (utcTime: string | undefined) => {
      if (!user?.role || !utcTime) return false;
      const recordDate = new Date(utcTime);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      const diffMs = todayDate.getTime() - recordDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      switch (user.role) {
        case "super_admin":
          return diffDays <= 365;
        case "station_admin":
          return diffDays <= 30;
        case "observer":
          return diffDays <= 1;
        default:
          return false;
      }
    };

    const handleEditClick = (
      record: MeteorologicalEntry,
      observingTime: ObservingTimeEntry
    ) => {
      setSelectedRecord(record);
      setSelectedObservingTime(observingTime);
      setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async (values: MeteorologicalFormValues) => {
      if (!selectedRecord) return;
      setIsSaving(true);
      try {
        const response = await fetch("/api/first-card-data", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedRecord.id,
            ...values,
            squallConfirmed: values.squallConfirmed ? "true" : "false",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update record");
        }

        await response.json();
        toast.success("Record updated successfully");
        setIsEditDialogOpen(false);
        setSelectedRecord(null);
        setSelectedObservingTime(null);
        mutate();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update record"
        );
      } finally {
        setIsSaving(false);
      }
    };

    const downloadFile = (content: string, mime: string, filename: string) => {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    const exportCsv = () => {
      if (!flattenedData.length || !entries.length) {
        toast.error("No data to export");
        return;
      }
      const result = buildCsv({
        startDate,
        endDate,
        observingTimes: entries,
        flattenedData,
      });
      downloadFile(result.content, result.mime, result.filename);
      toast.success("CSV export started");
    };

    const selectedStationName = useMemo(() => {
      if (stationFilter === "all") {
        return user?.station?.name || "All Stations";
      }
      const selectedStation = stations.find(
        (station) => station.id === stationFilter
      );
      return selectedStation?.name || user?.station?.name || "Selected Station";
    }, [stationFilter, stations, user?.station?.name]);

    const exportTxt = () => {
      if (!flattenedData.length || !entries.length) {
        toast.error("No data to export");
        return;
      }
      const result = buildTxt({
        startDate,
        endDate,
        stationName: selectedStationName,
        observingTimes: entries,
        flattenedData,
      });
      downloadFile(result.content, result.mime, result.filename);
      toast.success("Data exported to TXT");
    };

    const tableRows = useMemo(() => {
      const rows: Array<{
        record: MeteorologicalEntry;
        observingTime: ObservingTimeEntry;
      }> = [];
      entries.forEach((observingTime) => {
        observingTime.MeteorologicalEntry.forEach((record) => {
          rows.push({ record, observingTime });
        });
      });
      return rows;
    }, [entries]);

    return (
      <>
        <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
          <div className="text-center font-bold text-xl border-b-2 border-indigo-600 pb-2 text-indigo-800">
            First Card Data Table
          </div>
          <CardContent className="p-6">
            <Filters
              startDate={startDate}
              endDate={endDate}
              onDateChange={handleDateChange}
              onPrevious={goToPreviousWeek}
              onNext={goToNextWeek}
              dateError={dateError}
              allowExport={Boolean(isSuperAdmin || isStationAdmin)}
              onExportCsv={exportCsv}
              onExportTxt={exportTxt}
              exportDisabled={flattenedData.length === 0}
              showStationFilter={Boolean(isSuperAdmin)}
              stations={stations}
              stationFilter={stationFilter}
              onStationFilterChange={setStationFilter}
              maxDate={today}
            />

            <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
              <div className="flex flex-col md:flex-row md:justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300 gap-3 sm:gap-4">
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                  <div className="flex flex-col items-center min-w-[100px]">
                    <label className="text-xs sm:text-sm font-medium text-slate-900 mb-1 sm:mb-2 text-center">
                      DATA TYPE
                    </label>
                    <div className="flex gap-1">
                      {["S", "Y"].map((char) => (
                        <input
                          key={char}
                          value={char}
                          readOnly
                          className="w-8 sm:w-10 h-8 sm:h-9 text-center p-1 bg-slate-100 border border-slate-400 shadow-sm text-xs sm:text-sm"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                      STATION NO
                    </div>
                    <div className="flex h-8 sm:h-9 w-full min-w-[80px] sm:min-w-[100px] border border-slate-400 rounded-lg px-2 items-center justify-center bg-white text-xs sm:text-sm font-mono truncate">
                      {user?.station?.stationId || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                      YEAR
                    </div>
                    <div className="flex">
                      {new Date().getFullYear().toString().slice(-2).split("").map((digit, index) => (
                        <div
                          key={`${digit}-${index}`}
                          className={`w-8 sm:w-10 h-8 sm:h-9 border border-slate-400 flex items-center justify-center p-1 font-mono ${
                            index === 0 ? "rounded-l-md" : "rounded-r-md border-l-0"
                          } bg-white text-xs sm:text-sm`}
                        >
                          {digit}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center min-w-[120px] sm:min-w-[150px]">
                    <div className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2 text-center">
                      STATION
                    </div>
                    <div className="h-8 sm:h-9 w-full border border-slate-400 px-2 flex items-center justify-center font-mono rounded-md bg-white text-xs sm:text-sm text-center truncate">
                      {user?.station?.name || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <TableHeader />
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={27} className="text-center py-8">
                            <div className="flex justify-center items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                              <span className="ml-3 text-indigo-600 font-medium">
                                Loading data...
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : tableRows.length === 0 ? (
                        <tr>
                          <td colSpan={27} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center text-slate-500">
                              <CloudSun size={48} className="text-slate-400 mb-3" />
                              <p className="text-lg font-medium">
                                No meteorological data found
                              </p>
                              <p className="text-sm">
                                Try selecting a different date or station
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        tableRows.map(({ record, observingTime }, index) => (
                          <TableRow
                            key={record.id}
                            record={record}
                            observingTime={observingTime}
                            rowIndex={index}
                            onEdit={handleEditClick}
                            canEdit={canEditRecord(observingTime.utcTime)}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <EditDialog
          isOpen={isEditDialogOpen}
          record={selectedRecord}
          observingTime={selectedObservingTime}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRecord(null);
            setSelectedObservingTime(null);
          }}
          onSubmit={handleSaveEdit}
          isSaving={isSaving}
        />
      </>
    );
  }
);

FirstCardTable.displayName = "FirstCardTable";

export default FirstCardTable;
