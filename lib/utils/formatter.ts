import type { Station } from "@/lib/types/station";
import type { SynopticRecord } from "@/lib/types/synoptic";

export const formatSynopticValue = (value?: string | null) =>
  value ?? "";

export const formatObservationDate = (isoString?: string) => {
  if (!isoString) {
    return "--";
  }

  const date = new Date(isoString);
  return Number.isNaN(date.getTime())
    ? "--"
    : date.toISOString().slice(0, 10);
};

export const formatTimeSlot = (isoString?: string) => {
  if (!isoString) {
    return "--";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.getUTCHours().toString().padStart(2, "0");
};

export const resolveStationName = (
  record: SynopticRecord,
  stations: Station[]
) => {
  const stationId = record.ObservingTime?.stationId;
  const fromList = stationId
    ? stations.find((station) => station.id === stationId)
    : undefined;

  if (fromList) {
    return fromList.name;
  }

  return (
    record.ObservingTime?.station?.name ||
    stationId ||
    record.ObservingTime?.stationId ||
    "--"
  );
};

export const getWeatherRemarkParts = (remark?: string | null) => {
  if (!remark) {
    return {
      icon: null as string | null,
      text: null as string | null,
    };
  }

  const [icon, text] = remark.split(" - ");
  return {
    icon: icon || null,
    text: text || null,
  };
};
