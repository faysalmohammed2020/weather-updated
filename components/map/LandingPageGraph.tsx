"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FaThermometerHalf, FaCloudRain, FaWind } from "react-icons/fa";
import { BsDropletHalf } from "react-icons/bs";
import { FaLayerGroup } from "react-icons/fa";

// Colors
const CHART_COLORS = {
  maxTemperature: "#FF6B6B",
  minTemperature: "#4ECDC4",
  totalPrecipitation: "#54A0FF",
  windSpeed: "#FF9FF3",
  avRelativeHumidity: "#FECA57",
};

interface WeatherData {
  date: string;
  stationName: string;
  maxTemperature: number;
  minTemperature: number;
  totalPrecipitation: number;
  windSpeed: number;
  avRelativeHumidity: number;
  avTotalCloud: number;
  lowestVisibility: number;
}

type Station = {
  id: string;
  stationId: string;
  name: string;
};

// Date formatting helpers
function formatDate(dateStr: string, formatType: "short" | "long"): string {
  const date = new Date(dateStr);
  if (formatType === "short") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function LandingPageDailySummaryChart() {
  const [stations, setStations] = React.useState<Station[]>([]);
  const [stationSelection, setStationSelection] =
    React.useState<Station | null>(null);
  const [stationsLoading, setStationsLoading] = React.useState(false);

  const [weatherData, setWeatherData] = React.useState<WeatherData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [timeRange, setTimeRange] = React.useState("7d");
  const [dataType, setDataType] = React.useState("all");

  React.useEffect(() => {
    const fetchStations = async () => {
      try {
        setStationsLoading(true);
        const response = await fetch("/api/stationlocation");
        const data = await response.json();
        setStations(data);

        if (data.length > 0) {
          const dhakaStation = data.find((station: Station) => 
            station.name.toLowerCase().includes('dhaka')
          );
          setStationSelection(dhakaStation || data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setStationsLoading(false);
      }
    };

    fetchStations();
  }, []);

  const chartConfig = React.useMemo(
    () => ({
      maxTemperature: {
        label: "Max Temperature",
        color: CHART_COLORS.maxTemperature,
      },
      minTemperature: {
        label: "Min Temperature",
        color: CHART_COLORS.minTemperature,
      },
      totalPrecipitation: {
        label: "Total Precipitation",
        color: CHART_COLORS.totalPrecipitation,
      },
      windSpeed: { label: "Wind Speed", color: CHART_COLORS.windSpeed },
      avRelativeHumidity: {
        label: "Avg Relative Humidity",
        color: CHART_COLORS.avRelativeHumidity,
      },
    }),
    []
  ) satisfies ChartConfig;

  const dataTypeOptions = [
    {
      value: "temperature",
      label: "Temperature",
      metrics: ["maxTemperature", "minTemperature"],
      icon: <FaThermometerHalf />,
    },
    {
      value: "precipitation",
      label: "Precipitation",
      metrics: ["totalPrecipitation"],
      icon: <FaCloudRain />,
    },
    {
      value: "wind",
      label: "Wind Speed",
      metrics: ["windSpeed"],
      icon: <FaWind />,
    },
    {
      value: "humidity",
      label: "Humidity",
      metrics: ["avRelativeHumidity"],
      icon: <BsDropletHalf />,
    },
    {
      value: "all",
      label: "All Metrics",
      metrics: [
        "maxTemperature",
        "minTemperature",
        "totalPrecipitation",
        "windSpeed",
        "avRelativeHumidity",
      ],
      icon: <FaLayerGroup />,
    },
  ];

  const timeRangeOptions = [
    { value: "7d", label: "Last 7 Days" },
    { value: "30d", label: "Last 30 Days" },
    { value: "90d", label: "Last 90 Days" },
  ];

  const fetchWeatherData = React.useCallback(async () => {
    if (!stationSelection?.id) return;

    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const start =
        timeRange === "7d"
          ? subDays(endDate, 7)
          : timeRange === "30d"
            ? subDays(endDate, 30)
            : subDays(endDate, 90);

      const params = new URLSearchParams({
        startDate: formatDateISO(start),
        endDate: formatDateISO(endDate),
        stationId: stationSelection.id,
      });

      const response = await fetch(`/api/daily-summary?${params}`);
      if (!response.ok) throw new Error(`Failed: ${response.status}`);

      const json = await response.json();

      const transformed = json.map((item: any) => ({
        date: item.ObservingTime.utcTime.split("T")[0],
        stationName: item.ObservingTime.station.name,
        maxTemperature: +item.maxTemperature || 0,
        minTemperature: +item.minTemperature || 0,
        totalPrecipitation: +item.totalPrecipitation || 0,
        windSpeed: +item.windSpeed || 0,
        avRelativeHumidity: +item.avRelativeHumidity || 0,
        avTotalCloud: +item.avTotalCloud || 0,
        lowestVisibility: +item.lowestVisibility || 0,
      }));

      setWeatherData(
        transformed.sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [stationSelection, timeRange]);

  React.useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  const getYAxisLabel = () => {
    switch (dataType) {
      case "temperature":
        return "°C";
      case "precipitation":
        return "mm";
      case "wind":
        return "km/h";
      case "humidity":
        return "%";
      default:
        return "Value";
    }
  };

  if (loading || stationsLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-10 text-red-600 text-center">
        <h2>Error loading data</h2>
        <p>{error}</p>
      </div>
    );
  }

  const metrics =
    dataTypeOptions.find((x) => x.value === dataType)?.metrics || [];

  return (
    <Card className="border-0 shadow-none rounded-none">
      <CardHeader className="border-b">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">
              Weather Data
            </CardTitle>
            <CardDescription>
              {stationSelection?.name || "No Station Selected"} Station
            </CardDescription>
          </div>

          <div className="flex gap-2">
            <Select
              value={stationSelection?.stationId || ""}
              onValueChange={(val) => {
                const st = stations.find((s) => s.stationId === val);
                setStationSelection(st || null);
              }}
            >
              <SelectTrigger className="w-[200px] rounded-lg border-gray-300">
                <SelectValue placeholder="Select Station" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {stations.map((st) => (
                  <SelectItem
                    key={st.id}
                    value={st.stationId}
                    className="rounded-md"
                  >
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dataType} onValueChange={setDataType}>
              <SelectTrigger className="w-[160px] rounded-lg border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {dataTypeOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      {opt.icon} {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px] rounded-lg border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {timeRangeOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="rounded-md"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[400px]">
          {weatherData.length === 0 ? (
            <div className="relative h-full overflow-hidden rounded-xl bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 border border-sky-100/50">
              {/* Animated background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-gradient-to-r from-sky-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-gradient-to-r from-blue-100/10 to-cyan-100/10 rounded-full blur-2xl animate-pulse delay-500"></div>
              </div>

              {/* Floating weather icons */}
              <div className="absolute top-6 right-8 animate-float">
                <div className="text-4xl">🌤️</div>
              </div>
              <div className="absolute bottom-12 left-8 animate-float delay-1000">
                <div className="text-3xl">💨</div>
              </div>
              <div className="absolute top-1/3 right-1/4 animate-float delay-1500">
                <div className="text-2xl">☁️</div>
              </div>

              <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
                {/* Animated icon container */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                  <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className="text-5xl animate-bounce-subtle">📡</div>
                    <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 bg-amber-400 rounded-full shadow-md animate-ping-slow">
                      <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Main message */}
                <div className="max-w-md">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                    {stationSelection?.name || "Welcome to Weather Insights"}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {stationSelection
                      ? "We're scanning the skies above this station for live weather data. Hold tight while we connect to atmospheric satellites and ground sensors!"
                      : "Select a weather station to unveil meteorological insights. Each location offers unique atmospheric patterns waiting to be discovered."}
                  </p>

                  {/* Interactive elements */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                      <div className="relative px-6 py-3 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-2">
                          <div className="text-blue-500">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                              />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800">
                            {stationSelection
                              ? "Awaiting Data"
                              : "Select Station"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!stationSelection && stations.length > 0) {
                          const st = stations[0];
                          setStationSelection(st);
                        }
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        {stationSelection
                          ? "Refresh Connection"
                          : "Explore Stations"}
                      </div>
                    </button>
                  </div>

                  {/* Weather stats preview */}
                  <div className="mt-8 grid grid-cols-3 gap-4 opacity-50">
                    {["Temperature", "Precipitation", "Wind"].map((item) => (
                      <div
                        key={item}
                        className="p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/70 shadow-sm"
                      >
                        <div className="text-xs text-gray-500 mb-1">{item}</div>
                        <div className="text-lg font-bold text-gray-700">
                          --
                        </div>
                        <div className="text-xs text-gray-400">
                          Awaiting data...
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Animated dots */}
                  <div className="flex items-center justify-center gap-1 mt-6">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${i * 200}ms` }}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-gray-400 mt-4">
                    {stationSelection
                      ? "Real-time weather data streaming in..."
                      : "Ready to visualize meteorological patterns"}
                  </p>
                </div>
              </div>

              {/* Decorative corner elements */}
              <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-blue-200/50 rounded-tl-xl"></div>
              <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-200/50 rounded-tr-xl"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-blue-200/50 rounded-bl-xl"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-200/50 rounded-br-xl"></div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weatherData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                >
                  <defs>
                    {metrics.map((metric) => (
                      <linearGradient
                        key={metric}
                        id={`fill${metric}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={
                            CHART_COLORS[metric as keyof typeof CHART_COLORS]
                          }
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor={
                            CHART_COLORS[metric as keyof typeof CHART_COLORS]
                          }
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={32}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={(value) => formatDate(value, "short")}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    width={40}
                    label={{
                      value: getYAxisLabel(),
                      angle: -90,
                      position: "insideLeft",
                      style: { textAnchor: "middle", fill: "#6b7280" },
                      offset: -10,
                    }}
                  />
                  <ChartTooltip
                    cursor={{
                      stroke: "#d1d5db",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(value) => formatDate(value, "long")}
                        indicator="dot"
                        labelClassName="font-medium text-gray-900"
                        className="bg-white shadow-lg rounded-lg border border-gray-200 p-3"
                      />
                    }
                  />
                  {metrics.map((metric) => (
                    <Area
                      key={metric}
                      dataKey={metric}
                      type="monotone"
                      fill={`url(#fill${metric})`}
                      stroke={CHART_COLORS[metric as keyof typeof CHART_COLORS]}
                      strokeWidth={2}
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        fill: "#ffffff",
                        stroke:
                          CHART_COLORS[metric as keyof typeof CHART_COLORS],
                      }}
                      stackId={dataType === "all" ? "a" : undefined}
                    />
                  ))}
                  <ChartLegend
                    content={
                      <ChartLegendContent className="mt-4 flex flex-wrap justify-center gap-4" />
                    }
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
