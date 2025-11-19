"use client";

import useSWR from "swr";
import type { Station } from "@/types/station";

const stationsFetcher = async (): Promise<Station[]> => {
  const response = await fetch("/api/stations");
  if (!response.ok) {
    throw new Error("Failed to fetch stations");
  }
  return response.json();
};

export const useStations = (enabled: boolean) => {
  const swrResponse = useSWR<Station[]>(enabled ? "stations" : null, stationsFetcher, {
    revalidateOnFocus: false,
  });

  return {
    ...swrResponse,
    stations: swrResponse.data ?? [],
  };
};
