import type {
  SynopticFormData,
  SynopticRecord,
} from "@/lib/types/synoptic";
import type { Station } from "@/lib/types/station";

const SYNOPTIC_ENDPOINT = "/api/synoptic-code";
const STATIONS_ENDPOINT = "/api/stations";

export interface SynopticQuery {
  startDate: string;
  endDate: string;
  stationId?: string;
}

const buildSynopticUrl = ({ startDate, endDate, stationId }: SynopticQuery) => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });

  if (stationId) {
    params.set("stationId", stationId);
  }

  return `${SYNOPTIC_ENDPOINT}?${params.toString()}`;
};

export const fetchSynoptic = async (
  query: SynopticQuery
): Promise<SynopticRecord[]> => {
  const url = buildSynopticUrl(query);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch synoptic data");
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

export const updateSynoptic = async (
  recordId: string,
  payload: SynopticFormData
): Promise<SynopticRecord> => {
  const response = await fetch(SYNOPTIC_ENDPOINT, {
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
    throw new Error("Failed to update record");
  }

  return response.json();
};
