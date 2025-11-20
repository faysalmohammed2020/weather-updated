// contexts/WeatherDataContext.tsx
"use client";

import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { useSession } from "@/lib/auth-client";
import { useWeatherApi } from "./WeatherApiContext";

interface WeatherDataContextType {
  dailySummary: any | null;
  fetchDailySummary: (stationId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  stations: any[];
  fetchStations: () => Promise<void>;
  stationsLoading: boolean;
}

const WeatherDataContext = createContext<WeatherDataContextType | undefined>(undefined);

export function WeatherDataProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { fetchDailySummary: fetchDailySummaryApi, fetchStations: fetchStationsApi } = useWeatherApi();
  
  const [dailySummary, setDailySummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [stations, setStations] = useState<any[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);

  // Cache for daily summary by stationId
  const dailySummaryCache = useMemo(() => new Map<string, { data: any; timestamp: number }>(), []);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

  // Fetch daily summary with caching
  const fetchDailySummary = useCallback(async (stationId: string) => {
    if (!stationId) return;

    // Check cache first
    const cached = dailySummaryCache.get(stationId);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setDailySummary(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const today = new Date();
      const startToday = new Date(today);
      startToday.setUTCHours(0, 0, 0, 0);
      const endToday = new Date(today);
      endToday.setUTCHours(23, 59, 59, 999);

      const data = await fetchDailySummaryApi({
        startDate: startToday.toISOString(),
        endDate: endToday.toISOString(),
        stationId
      });

      const latestEntry = data.length > 0 ? data[0] : null;
      setDailySummary(latestEntry);
      
      // Update cache
      dailySummaryCache.set(stationId, { data: latestEntry, timestamp: now });
    } catch (err) {
      setError("Failed to fetch daily summary");
      console.error("Daily summary fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchDailySummaryApi, dailySummaryCache]);

  // Fetch stations with caching
  const fetchStations = useCallback(async () => {
    setStationsLoading(true);
    try {
      const data = await fetchStationsApi();
      setStations(data);
    } catch (err) {
      console.error("Stations fetch error:", err);
    } finally {
      setStationsLoading(false);
    }
  }, [fetchStationsApi]);

  const value = useMemo(() => ({
    dailySummary,
    fetchDailySummary,
    loading,
    error,
    stations,
    fetchStations,
    stationsLoading,
  }), [dailySummary, fetchDailySummary, loading, error, stations, fetchStations, stationsLoading]);

  return (
    <WeatherDataContext.Provider value={value}>
      {children}
    </WeatherDataContext.Provider>
  );
}

export const useWeatherData = () => {
  const context = useContext(WeatherDataContext);
  if (context === undefined) {
    throw new Error('useWeatherData must be used within a WeatherDataProvider');
  }
  return context;
};