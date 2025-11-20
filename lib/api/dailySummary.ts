import type {
  DailySummaryFormData,
  DailySummaryRecord,
} from "@/lib/types/dailySummary";
import type { Station } from "@/lib/types/station";

const DAILY_SUMMARY_ENDPOINT = "/api/daily-summary";
const STATIONS_ENDPOINT = "/api/stations";

export interface DailySummaryQuery {
  startDate: string;
  endDate: string;
  stationId?: string;
}

const buildDailySummaryUrl = ({
  startDate,
  endDate,
  stationId,
}: DailySummaryQuery) => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  if (stationId) {
    params.set("stationId", stationId);
  }

  return `${DAILY_SUMMARY_ENDPOINT}?${params.toString()}`;
};

export const fetchDailySummary = async (
  query: DailySummaryQuery
): Promise<DailySummaryRecord[]> => {
  const response = await fetch(buildDailySummaryUrl(query));

  if (!response.ok) {
    throw new Error("Failed to fetch daily summary data");
  }

  return response.json();
};

export const fetchStations = async (): Promise<Station[]> => {
  const response = await fetch(STATIONS_ENDPOINT);

  if (!response.ok) {
    throw new Error("Failed to fetch stations");
  }

  return response.json();
};

export const updateDailySummary = async (
  recordId: string,
  payload: DailySummaryFormData
): Promise<DailySummaryRecord> => {
  const response = await fetch(DAILY_SUMMARY_ENDPOINT, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: recordId,
      ...payload,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update daily summary record");
  }

  return response.json();
};
