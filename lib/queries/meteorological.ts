import { useMemo } from "react";
import useSWR from "swr";
import type {
  MeteorologicalEntry,
  ObservingTimeEntry,
} from "@/types/meteorological";
import type { Station } from "@/types/station";

interface MeteorologicalApiResponse {
  entries: ObservingTimeEntry[];
}

export interface MeteorologicalQueryParams {
  startDate: string;
  endDate: string;
  stationFilter?: string;
  refreshKey?: number;
}

const meteorologicalFetcher = async (
  startDate: string,
  endDate: string,
  stationFilter?: string
): Promise<MeteorologicalApiResponse> => {
  const stationQuery =
    stationFilter && stationFilter !== "all" ? `&stationId=${stationFilter}` : "";
  const response = await fetch(
    `/api/first-card-data?startDate=${startDate}&endDate=${endDate}${stationQuery}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch meteorological data");
  }

  return response.json();
};

const stationsFetcher = async (): Promise<Station[]> => {
  const response = await fetch("/api/stations");
  if (!response.ok) {
    throw new Error("Failed to fetch stations");
  }
  return response.json();
};

const flattenMeteorologicalEntries = (
  entries: ObservingTimeEntry[]
): MeteorologicalEntry[] => {
  const flattened: MeteorologicalEntry[] = [];
  entries.forEach((observingTime) => {
    observingTime.MeteorologicalEntry.forEach((entry) => {
      flattened.push({
        ...entry,
        observingTimeId: observingTime.id,
        stationId: observingTime.stationId,
        stationCode: observingTime.station?.stationId,
      });
    });
  });

  return flattened;
};

export const useMeteorologicalEntries = ({
  startDate,
  endDate,
  stationFilter,
  refreshKey = 0,
}: MeteorologicalQueryParams) => {
  const swrResponse = useSWR<MeteorologicalApiResponse>(
    startDate && endDate
      ? ["meteorological", startDate, endDate, stationFilter, refreshKey]
      : null,
    () => meteorologicalFetcher(startDate, endDate, stationFilter),
    {
      revalidateOnFocus: false,
    }
  );

  const flattenedData = useMemo(
    () => flattenMeteorologicalEntries(swrResponse.data?.entries ?? []),
    [swrResponse.data?.entries]
  );

  return {
    ...swrResponse,
    entries: swrResponse.data?.entries ?? [],
    flattenedData,
  };
};

export const useStationsQuery = (enabled: boolean) => {
  const swrResponse = useSWR<Station[]>(enabled ? "stations" : null, () =>
    stationsFetcher()
  );

  return {
    ...swrResponse,
    stations: swrResponse.data ?? [],
  };
};

