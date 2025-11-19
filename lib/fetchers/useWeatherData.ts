"use client";

import { useMemo } from "react";
import useSWR from "swr";
import type {
  WeatherObservationApiResponse,
  WeatherObservationRecord,
} from "@/types/weather-observation";

export interface WeatherQueryParams {
  startDate: string;
  endDate: string;
  stationFilter?: string;
  refreshKey?: number;
}

const buildWeatherUrl = (
  startDate: string,
  endDate: string,
  stationFilter?: string
) => {
  const params = new URLSearchParams({
    startDate,
    endDate,
  });
  if (stationFilter && stationFilter !== "all") {
    params.append("stationId", stationFilter);
  }
  return `/api/save-observation?${params.toString()}`;
};

const weatherFetcher = async (
  startDate: string,
  endDate: string,
  stationFilter?: string
): Promise<WeatherObservationApiResponse> => {
  const response = await fetch(buildWeatherUrl(startDate, endDate, stationFilter));
  if (!response.ok) {
    throw new Error("Failed to fetch weather observations");
  }
  return response.json();
};

const hasObservation = (record: WeatherObservationRecord) =>
  record.WeatherObservation && record.WeatherObservation.length > 0;

export const useWeatherData = ({
  startDate,
  endDate,
  stationFilter,
  refreshKey = 0,
}: WeatherQueryParams) => {
  const shouldFetch = Boolean(startDate && endDate);
  const swrResponse = useSWR<WeatherObservationApiResponse>(
    shouldFetch
      ? ["weather-observations", startDate, endDate, stationFilter, refreshKey]
      : null,
    () => weatherFetcher(startDate, endDate, stationFilter),
    { revalidateOnFocus: false }
  );

  const records = swrResponse.data?.data ?? [];
  const observations = useMemo(
    () => records.filter(hasObservation),
    [records]
  );

  return {
    ...swrResponse,
    records,
    observations,
  };
};
