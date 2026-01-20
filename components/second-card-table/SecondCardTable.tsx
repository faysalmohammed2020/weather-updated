"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CloudSun } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import TableHeader from "./table/TableHeader";
import TableRow from "./table/TableRow";
import WeekNavigation from "./filters/WeekNavigation";
import DateRange from "./filters/DateRange";
import StationFilter from "./filters/StationFilter";
import EditDialog from "./dialogs/EditDialog";
import PermissionDialog from "./dialogs/PermissionDialog";
import {
  useWeatherData,
  type WeatherQueryParams,
} from "@/lib/fetchers/useWeatherData";
import { useStations } from "@/lib/fetchers/useStations";
import { getNextRange, getPreviousRange } from "@/lib/utils/date-utils";
import type {
  FlattenedWeatherObservation,
  WeatherObservation,
  WeatherObservationRecord,
} from "@/types/weather-observation";
import { exportWeatherCsv } from "@/lib/exports/exportWeatherCSV";
import { exportWeatherTxt } from "@/lib/exports/exportWeatherTXT";
import type { WeatherFormValues } from "./forms/WeatherForm";

interface SecondCardTableProps {
  refreshTrigger?: number;
}

export interface SecondCardTableHandle {
  getData: () => FlattenedWeatherObservation[];
}

const initialFormValues: WeatherFormValues = {
  totalCloudAmount: "",
  lowCloudDirection: "",
  lowCloudHeight: "",
  lowCloudForm: "",
  lowCloudAmount: "",
  mediumCloudDirection: "",
  mediumCloudHeight: "",
  mediumCloudForm: "",
  mediumCloudAmount: "",
  highCloudDirection: "",
  highCloudHeight: "",
  highCloudForm: "",
  highCloudAmount: "",
  windDirection: "",
  layer1Form: "",
  layer1Amount: "",
  layer2Form: "",
  layer2Amount: "",
  layer3Form: "",
  layer3Amount: "",
  layer4Form: "",
  layer4Amount: "",
  layer1Height: "",
  layer2Height: "",
  layer3Height: "",
  layer4Height: "",
  rainfallSincePrevious: "",
  rainfallLast24Hours: "",
  windSpeed: "",
  rainfallDuringPrevious: "",
  windFirstAnemometer: "",
  windSecondAnemometer: "",
  observerInitial: "",
  rainfallTimeStart: "",
  rainfallTimeEnd: "",
  rainfallTimeSlots: [],
};

const mapObservationToForm = (
  observation?: WeatherObservation,
): WeatherFormValues => ({
  ...initialFormValues,
  totalCloudAmount: observation?.totalCloudAmount || "",
  lowCloudDirection: observation?.lowCloudDirection || "",
  lowCloudHeight: observation?.lowCloudHeight || "",
  lowCloudForm: observation?.lowCloudForm || "",
  lowCloudAmount: observation?.lowCloudAmount || "",
  mediumCloudDirection: observation?.mediumCloudDirection || "",
  mediumCloudHeight: observation?.mediumCloudHeight || "",
  mediumCloudForm: observation?.mediumCloudForm || "",
  mediumCloudAmount: observation?.mediumCloudAmount || "",
  highCloudDirection: observation?.highCloudDirection || "",
  highCloudHeight: observation?.highCloudHeight || "",
  highCloudForm: observation?.highCloudForm || "",
  highCloudAmount: observation?.highCloudAmount || "",
  windDirection: observation?.windDirection || "",
  layer1Form: observation?.layer1Form || "",
  layer1Amount: observation?.layer1Amount || "",
  layer2Form: observation?.layer2Form || "",
  layer2Amount: observation?.layer2Amount || "",
  layer3Form: observation?.layer3Form || "",
  layer3Amount: observation?.layer3Amount || "",
  layer4Form: observation?.layer4Form || "",
  layer4Amount: observation?.layer4Amount || "",
  layer1Height: observation?.layer1Height || "",
  layer2Height: observation?.layer2Height || "",
  layer3Height: observation?.layer3Height || "",
  layer4Height: observation?.layer4Height || "",
  rainfallSincePrevious: observation?.rainfallSincePrevious || "",
  rainfallLast24Hours: observation?.rainfallLast24Hours || "",
  windSpeed: observation?.windSpeed || "",
  rainfallDuringPrevious: observation?.rainfallDuringPrevious || "",
  windFirstAnemometer: observation?.windFirstAnemometer || "",
  windSecondAnemometer: observation?.windSecondAnemometer || "",
  observerInitial: observation?.observerInitial || "",
  rainfallTimeStart: observation?.rainfallTimeStart || "",
  rainfallTimeEnd: observation?.rainfallTimeEnd || "",
  rainfallTimeSlots: observation?.rainfallTimeSlots || [],
  rainfallType: observation?.rainfallType || undefined,
});

const canEditObservation = (record: WeatherObservationRecord, user: any) => {
  if (!user || !record.WeatherObservation?.[0]) return false;
  const observationDate = new Date(record.WeatherObservation[0].createdAt);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - observationDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const role = user.role;
  const userId = user.id;
  const userStationId = user.station?.id;
  const recordStationId = record.station?.id;

  if (role === "root_admin") return diffDays <= 365;
  if (role === "super_admin") return diffDays <= 365;
  if (role === "station_admin")
    return diffDays <= 30 && userStationId === recordStationId;
  if (role === "observer") return diffDays <= 2 && userId === record.userId;
  return false;
};

const SecondCardTable = forwardRef<SecondCardTableHandle, SecondCardTableProps>(
  ({ refreshTrigger = 0 }, ref) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [dateError, setDateError] = useState<string | null>(null);
    const [stationFilter, setStationFilter] = useState("all");
    const [selectedRecord, setSelectedRecord] =
      useState<WeatherObservationRecord | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<WeatherFormValues>({
      defaultValues: initialFormValues,
    });

    const { data: session } = useSession();
    const user = session?.user;
    const isSuperAdmin =
      user?.role === "super_admin" || user?.role === "root_admin";
    const isStationAdmin = user?.role === "station_admin";
    const canExport = Boolean(isSuperAdmin || isStationAdmin);

    const weatherQuery: WeatherQueryParams = {
      startDate,
      endDate,
      stationFilter,
      refreshKey: refreshTrigger,
    };

    const { observations, isLoading, error, mutate } =
      useWeatherData(weatherQuery);
    const { stations } = useStations(Boolean(isSuperAdmin));

    useEffect(() => {
      if (error) {
        toast.error("Failed to fetch weather observation data");
      }
    }, [error]);

    const flattenedObservations = useMemo(
      () =>
        observations.map((record) => {
          const observation = record.WeatherObservation[0];
          return {
            ...(observation || ({} as WeatherObservation)),
            stationId: record.stationId,
            stationName: record.station?.name || "",
            utcTime: record.utcTime,
            localTime: record.localTime,
          } as FlattenedWeatherObservation;
        }),
      [observations],
    );

    useImperativeHandle(ref, () => ({
      getData: () => flattenedObservations,
    }));

    const changeRange = (
      getRange: () => { startDate: string; endDate: string } | null,
    ) => {
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

    const handleDateChange = (type: "start" | "end", value: string) => {
      const date = new Date(value);
      const otherDate =
        type === "start" ? new Date(endDate) : new Date(startDate);

      if (Number.isNaN(date.getTime())) {
        setDateError("Invalid date format");
        return;
      }

      if (type === "start") {
        if (date > otherDate) {
          setDateError("Start date cannot be after end date");
          return;
        }
        setStartDate(value);
      } else {
        if (date < otherDate) {
          setDateError("End date cannot be before start date");
          return;
        }
        setEndDate(value);
      }

      setDateError(null);
    };

    const handleEditClick = (record: WeatherObservationRecord) => {
      if (user && canEditObservation(record, user)) {
        setSelectedRecord(record);
        const observation = record.WeatherObservation[0];
        form.reset(mapObservationToForm(observation));
        setIsEditDialogOpen(true);
      } else {
        setIsPermissionDialogOpen(true);
      }
    };

    const handleSaveEdit = async (values: WeatherFormValues) => {
      if (!selectedRecord || !selectedRecord.WeatherObservation?.[0]) return;
      setIsSaving(true);
      try {
        const response = await fetch("/api/save-observation", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: selectedRecord.WeatherObservation[0].id,
            type: "weather",
            ...values,
          }),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(
            message || "Failed to update weather observation record",
          );
        }

        toast.success("Weather observation updated successfully");
        setIsEditDialogOpen(false);
        setSelectedRecord(null);
        form.reset(initialFormValues);
        mutate();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to update record",
        );
      } finally {
        setIsSaving(false);
      }
    };

    const handleCancelEdit = () => {
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      form.reset(initialFormValues);
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

    const handleExportCsv = () => {
      if (!flattenedObservations.length) {
        toast.error("No data to export");
        return;
      }
      const result = exportWeatherCsv({
        startDate,
        endDate,
        records: observations,
      });
      downloadFile(result.content, result.mime, result.filename);
      toast.success("CSV export started");
    };

    const selectedStationName = useMemo(() => {
      if (stationFilter === "all") {
        return isSuperAdmin ? "All Stations" : user?.station?.name || "Station";
      }
      const selected = stations.find((station) => station.id === stationFilter);
      return selected?.name || user?.station?.name || "Station";
    }, [stationFilter, stations, user?.station?.name, isSuperAdmin]);

    const handleExportTxt = () => {
      if (!flattenedObservations.length) {
        toast.error("No data to export");
        return;
      }
      const result = exportWeatherTxt({
        startDate,
        endDate,
        stationName: selectedStationName,
        records: observations,
      });
      downloadFile(result.content, result.mime, result.filename);
      toast.success("TXT export started");
    };

    return (
      <div className="py-6">
        <Card className="shadow-xl border-none overflow-hidden bg-gradient-to-br from-white to-slate-50">
          <div className="text-center font-bold text-xl border-b-2 border-indigo-600 pb-2 text-indigo-800">
            Second Card Data Table
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col gap-4 bg-slate-100 p-3 sm:p-4 rounded-lg">
              <WeekNavigation
                onPrevious={goToPreviousWeek}
                onNext={goToNextWeek}
              >
                <DateRange
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={today}
                  onDateChange={handleDateChange}
                  dateError={dateError}
                />
              </WeekNavigation>

              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-200">
                {canExport && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCsv}
                      className="flex items-center justify-center gap-2 hover:bg-green-50 border-green-200 text-green-700 bg-transparent"
                      disabled={flattenedObservations.length === 0}
                    >
                      <Download className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Export CSV</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportTxt}
                      className="flex items-center justify-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 bg-transparent"
                      disabled={flattenedObservations.length === 0}
                    >
                      <Download className="h-4 w-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">Export TXT</span>
                    </Button>
                  </div>
                )}

                {isSuperAdmin && (
                  <StationFilter
                    stations={stations}
                    value={stationFilter}
                    onChange={setStationFilter}
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
              <div className="p-3 md:p-4 bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs md:text-sm font-medium text-slate-900 mb-1 md:mb-2">
                      DATA TYPE
                    </span>
                    <div className="flex gap-1">
                      {["S", "Y"].map((char) => (
                        <Input
                          key={char}
                          className="w-8 sm:w-10 h-8 text-center p-1 bg-slate-100 border border-slate-400 shadow-sm text-xs sm:text-sm"
                          defaultValue={char}
                          readOnly
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2">
                      STATION NO
                    </span>
                    <div className="h-8 w-full min-w-[60px] border border-slate-400 rounded-lg p-1 flex items-center justify-center bg-white text-xs sm:text-sm font-mono truncate">
                      {user?.station?.stationId || "N/A"}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs md:text-sm font-bold uppercase text-slate-600 mb-1 md:mb-2">
                      YEAR
                    </span>
                    <div className="flex">
                      <div className="w-8 md:w-10 h-8 border border-slate-400 flex items-center justify-center p-1 font-mono rounded-l-md bg-white text-xs md:text-sm">
                        {new Date().getFullYear().toString().slice(-2, -1)}
                      </div>
                      <div className="w-8 sm:w-10 h-8 border-t border-r border-b border-slate-400 flex items-center justify-center p-1 font-mono rounded-r-md bg-white text-xs sm:text-sm">
                        {new Date().getFullYear().toString().slice(-1)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs sm:text-sm font-bold uppercase text-slate-600 mb-1 sm:mb-2">
                      STATION
                    </span>
                    <div className="h-8 w-full border border-slate-400 p-1 flex items-center justify-center font-mono rounded-md bg-white text-xs sm:text-sm truncate">
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
                          <td colSpan={39} className="text-center py-8">
                            <div className="flex justify-center items-center gap-3 text-indigo-600 font-medium">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                              Loading data...
                            </div>
                          </td>
                        </tr>
                      ) : observations.length === 0 ? (
                        <tr>
                          <td colSpan={39} className="text-center py-12">
                            <div className="flex flex-col items-center justify-center text-slate-500">
                              <CloudSun
                                size={48}
                                className="text-slate-400 mb-3"
                              />
                              <p className="text-lg font-medium">
                                No weather observations found
                              </p>
                              <p className="text-sm">
                                Try selecting a different date or station
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        observations.map((record, index) => (
                          <TableRow
                            key={record.id}
                            record={record}
                            rowIndex={index}
                            onEdit={handleEditClick}
                            canEdit={Boolean(
                              user && canEditObservation(record, user),
                            )}
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
          onOpenChange={(open) => {
            if (!open) {
              handleCancelEdit();
            } else {
              setIsEditDialogOpen(true);
            }
          }}
          record={selectedRecord}
          form={form}
          isSaving={isSaving}
          onSubmit={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
        <PermissionDialog
          isOpen={isPermissionDialogOpen}
          onClose={() => setIsPermissionDialogOpen(false)}
        />
      </div>
    );
  },
);

SecondCardTable.displayName = "SecondCardTable";

export default SecondCardTable;
