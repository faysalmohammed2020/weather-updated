// contexts/WeatherApiContext.tsx
"use client";

import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";

interface ApiContextType {
  fetchStations: () => Promise<any[]>;
  fetchFirstCardData: (params: { startDate: string; endDate: string; stationId: string }) => Promise<any>;
  fetchSecondCardData: (params: { startDate: string; endDate: string; stationId: string }) => Promise<any>;
  fetchDailySummary: (params: { startDate: string; endDate: string; stationId: string }) => Promise<any>;
  fetchSynopticCode: (date: string) => Promise<any>;
}

const WeatherApiContext = createContext<ApiContextType | undefined>(undefined);

export function WeatherApiProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }, []);

  const fetchStations = useCallback(async (): Promise<any[]> => {
    try {
      return await fetchWithAuth('/api/stations');
    } catch (error) {
      toast.error("Failed to fetch stations");
      throw error;
    }
  }, [fetchWithAuth]);

  const fetchFirstCardData = useCallback(async (params: { startDate: string; endDate: string; stationId: string }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await fetchWithAuth(`/api/first-card-data?${queryString}`);
    } catch (error) {
      toast.error("Failed to fetch meteorological data");
      throw error;
    }
  }, [fetchWithAuth]);

  const fetchSecondCardData = useCallback(async (params: { startDate: string; endDate: string; stationId: string }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await fetchWithAuth(`/api/save-observation?${queryString}`);
    } catch (error) {
      toast.error("Failed to fetch observation data");
      throw error;
    }
  }, [fetchWithAuth]);

  const fetchDailySummary = useCallback(async (params: { startDate: string; endDate: string; stationId: string }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      return await fetchWithAuth(`/api/daily-summary?${queryString}`);
    } catch (error) {
      toast.error("Failed to fetch daily summary");
      throw error;
    }
  }, [fetchWithAuth]);

  const fetchSynopticCode = useCallback(async (date: string) => {
    try {
      return await fetchWithAuth(`/api/synoptic-code?date=${date}`);
    } catch (error) {
      console.error("Failed to fetch synoptic code data");
      throw error;
    }
  }, [fetchWithAuth]);

  const apiMethods = useMemo(() => ({
    fetchStations,
    fetchFirstCardData,
    fetchSecondCardData,
    fetchDailySummary,
    fetchSynopticCode,
  }), [fetchStations, fetchFirstCardData, fetchSecondCardData, fetchDailySummary, fetchSynopticCode]);

  return (
    <WeatherApiContext.Provider value={apiMethods}>
      {children}
    </WeatherApiContext.Provider>
  );
}

export const useWeatherApi = () => {
  const context = useContext(WeatherApiContext);
  if (context === undefined) {
    throw new Error('useWeatherApi must be used within a WeatherApiProvider');
  }
  return context;
};