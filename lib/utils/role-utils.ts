import { differenceInDays, isValid, parseISO } from "date-fns";
import type { SynopticRecord, SynopticUser } from "@/lib/types/synoptic";

export const canEditRecord = (
  record: SynopticRecord,
  user?: SynopticUser | null
): boolean => {
  if (!user) {
    return false;
  }

  if (!record.createdAt) {
    return true;
  }

  try {
    const submissionDate = parseISO(record.createdAt);
    if (!isValid(submissionDate)) {
      return true;
    }

    const now = new Date();
    const daysDifference = differenceInDays(now, submissionDate);
    const role = user.role;
    const userId = user.id;
    const userStationId = user.station?.id;
    const recordStationId = record.ObservingTime?.stationId;
    const recordUserId = record.ObservingTime?.userId;

    if (role === "super_admin") {
      return daysDifference <= 365;
    }

    if (role === "station_admin") {
      return daysDifference <= 30 && userStationId === recordStationId;
    }

    if (role === "observer") {
      return daysDifference <= 2 && userId === recordUserId;
    }

    return false;
  } catch (error) {
    console.warn("Error in canEditRecord:", error);
    return false;
  }
};
