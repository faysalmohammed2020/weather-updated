"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Eye,
  Cloud,
  CloudSun,
  AlertTriangle,
} from "lucide-react";
import DailySummaryChart from "./map/DailySummaryChart";

interface WeatherData {
  maxTemperature: string | null;
  minTemperature: string | null;
  totalPrecipitation: string | null;
  windSpeed: string | null;
  avTotalCloud: string | null;
  avRelativeHumidity: string | null;
  lowestVisibility: string | null;
  totalRainDuration: string | null;
}

interface WeatherCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  status: string;
  description: string;
  accent: string;
  badge?: string;
  subtle?: string;
}

function WeatherCard({ icon, title, value, status, description, accent, badge, subtle }: WeatherCardProps) {
  return (
    <div className="rounded-2xl bg-white/90 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-semibold text-slate-900 leading-tight">{value}</span>
            {badge ? (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm font-medium text-slate-700">{status}</p>
        </div>
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shadow-inner"
          style={{ backgroundColor: subtle || "rgba(47,128,237,0.08)", color: accent }}
        >
          {icon}
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="h-px bg-slate-100 mb-3" />
        <p className="text-sm text-slate-600 leading-snug">{description}</p>
      </div>
    </div>
  );
}

export default function WeatherDashboard({ selectedStation }: { selectedStation: any | null }) {
  const { data: session } = useSession();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stationName, setStationName] = useState<string>("No Station Selected");

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);

      try {
        let stationToQuery: string | null = null;
        let nameToDisplay = "Your Station";

        if (session?.user?.role === "super_admin" || session?.user?.role === "root_admin") {
          stationToQuery = selectedStation?.id || session?.user?.station?.id || "";
          nameToDisplay = selectedStation?.name || "No Station";
        } else {
          stationToQuery = session?.user?.station?.id || "";
          nameToDisplay = session?.user?.station?.name || "Your Station";
        }

        if (!stationToQuery) {
          setError("No station selected");
          setLoading(false);
          return;
        }

        setStationName(nameToDisplay);

        const today = new Date();
        const startToday = new Date(today);
        startToday.setUTCHours(0, 0, 0, 0);

        const endToday = new Date(today);
        endToday.setUTCHours(23, 59, 59, 999);

        const response = await fetch(
          `/api/daily-summary?startDate=${startToday.toISOString()}&endDate=${endToday.toISOString()}&stationId=${stationToQuery}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        if (data.length === 0) {
          setError("No data available for selected station");
          setWeatherData(null);
          return;
        }

        const latestEntry = data[0];
        setWeatherData(latestEntry);
      } catch (err) {
        setError("Failed to fetch weather data");
        console.error("Weather fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [selectedStation, session]);

  if (loading) {
    return (
      <div className="w-full md:p-6">
        <h2 className="text-2xl font-bold mb-4">Weather Dashboard</h2>
        <p className="text-blue-600">Loading weather data...</p>
      </div>
    );
  }

  const defaultValues = {
    maxTemperature: "N/A",
    minTemperature: "N/A",
    totalPrecipitation: "N/A",
    windSpeed: "N/A",
    avTotalCloud: "N/A",
    avRelativeHumidity: "N/A",
    lowestVisibility: "N/A",
    totalRainDuration: "N/A",
  };

  const data = weatherData
    ? {
        maxTemperature: weatherData.maxTemperature || defaultValues.maxTemperature,
        minTemperature: weatherData.minTemperature || defaultValues.minTemperature,
        totalPrecipitation: weatherData.totalPrecipitation || defaultValues.totalPrecipitation,
        windSpeed: weatherData.windSpeed || defaultValues.windSpeed,
        avTotalCloud: weatherData.avTotalCloud || defaultValues.avTotalCloud,
        avRelativeHumidity: weatherData.avRelativeHumidity || defaultValues.avRelativeHumidity,
        lowestVisibility: weatherData.lowestVisibility || defaultValues.lowestVisibility,
        totalRainDuration: weatherData.totalRainDuration || defaultValues.totalRainDuration,
      }
    : defaultValues;

  const tempDiff =
    data.maxTemperature !== "N/A" && data.minTemperature !== "N/A"
      ? `${(parseFloat(data.maxTemperature) - parseFloat(data.minTemperature)).toFixed(1)}°C`
      : "N/A";

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full mb-8 md:p-6 bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Weather Dashboard</h2>
          <p className="text-gray-600">{todayFormatted}</p>
        </div>
        <div className="flex items-center gap-2 mt-2 md:mt-0">
          <div className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md flex items-center">
            <CloudSun className="mr-2" size={20} />
            <span>{stationName}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded flex items-center">
          <AlertTriangle className="mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="mb-8">
        <DailySummaryChart selectedStation={selectedStation} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <WeatherCard
          icon={<Thermometer size={22} />}
          title="Temperature"
          value={data.maxTemperature !== "N/A" ? `${data.maxTemperature}°C` : "N/A"}
          status={`High ${data.maxTemperature ?? "–"} / Low ${data.minTemperature ?? "–"}`}
          description={`Daily range: ${tempDiff}`}
          accent="#EB5757"
          subtle="rgba(235,87,87,0.08)"
          badge="°C"
        />

        <WeatherCard
          icon={<Cloud size={22} />}
          title="Cloud Cover"
          value={data.avTotalCloud !== "N/A" ? `${data.avTotalCloud}%` : "N/A"}
          status={
            data.avTotalCloud !== "N/A"
              ? parseInt(data.avTotalCloud) > 50
                ? "Mostly Cloudy"
                : "Partly Cloudy"
              : "No data"
          }
          description="Average cloud cover today"
          accent="#2F80ED"
          subtle="rgba(47,128,237,0.08)"
          badge="%"
        />

        <WeatherCard
          icon={<CloudRain size={22} />}
          title="Precipitation"
          value={
            data.totalPrecipitation !== "N/A"
              ? `${data.totalPrecipitation} mm`
              : "N/A"
          }
          status={
            data.totalPrecipitation !== "N/A" && parseFloat(data.totalPrecipitation) > 0
              ? "Rain recorded"
              : "No precipitation"
          }
          description="Total precipitation in last 24 hours"
          accent="#2D9CDB"
          subtle="rgba(45,156,219,0.08)"
          badge="mm"
        />

        <WeatherCard
          icon={<Wind size={22} />}
          title="Wind Speed"
          value={data.windSpeed !== "N/A" ? `${data.windSpeed} kt` : "N/A"}
          status="Current wind conditions"
          description="Average wind speed"
          accent="#27AE60"
          subtle="rgba(39,174,96,0.08)"
          badge="kt"
        />

        <WeatherCard
          icon={<Droplets size={22} />}
          title="Humidity"
          value={
            data.avRelativeHumidity !== "N/A"
              ? `${data.avRelativeHumidity}%`
              : "N/A"
          }
          status={
            data.avRelativeHumidity !== "N/A"
              ? parseInt(data.avRelativeHumidity) > 70
                ? "Very Humid"
                : "Moderate"
              : "No data"
          }
          description="Relative humidity in the air"
          accent="#00B5D8"
          subtle="rgba(0,181,216,0.08)"
          badge="%"
        />

        <WeatherCard
          icon={<Eye size={22} />}
          title="Visibility"
          value={
            data.lowestVisibility !== "N/A"
              ? `${(parseFloat(data.lowestVisibility) / 10).toFixed(1)} km`
              : "N/A"
          }
          status={
            data.lowestVisibility !== "N/A"
              ? parseFloat(data.lowestVisibility) / 10 > 10
                ? "Excellent"
                : "Good"
              : "No data"
          }
          description="Current visibility level"
          accent="#9B51E0"
          subtle="rgba(155,81,224,0.08)"
          badge="km"
        />
      </div>
    </div>
  );
}
