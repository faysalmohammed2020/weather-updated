import { format } from "date-fns";
import type { Station } from "@/lib/types/station";
import type { DailySummaryRecord } from "@/lib/types/dailySummary";

export const formatDailyValue = (
  value?: string | number | null
): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue =
    typeof value === "string" ? Number.parseFloat(value) : value;

  if (!Number.isNaN(numericValue) && Number.isFinite(numericValue as number)) {
    return Math.round(Number(numericValue)).toString();
  }

  return String(value);
};

export const formatDailyDate = (isoString?: string) => {
  if (!isoString) {
    return "--";
  }

  const date = new Date(isoString);
  return Number.isNaN(date.getTime())
    ? "--"
    : date.toISOString().split("T")[0];
};

export const resolveDailyStationName = (
  record: DailySummaryRecord,
  stations: Station[]
) => {
  const stationId = record.ObservingTime?.stationId;

  if (stationId) {
    const fromList = stations.find((station) => station.id === stationId);
    if (fromList) {
      return fromList.name;
    }
  }

  return (
    record.ObservingTime?.station?.name ||
    stationId ||
    record.ObservingTime?.station?.stationId ||
    "--"
  );
};

export const formatDateRangeLabel = (start: string, end: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} - ${end}`;
  }

  return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
};
