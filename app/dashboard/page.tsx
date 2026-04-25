// app/dashboard/page.tsx

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Station } from "@prisma/client";
import WeatherDashboard from "@/components/msn-weather";
import TimeSeriesGraph from "@/components/map/timeSeriseGraph";

const MapComponent = dynamic(() => import("@/components/map/MapComponent"), {
  ssr: false,
});

const MapControls = dynamic(() => import("@/components/map/map-controls"), {
  ssr: false,
});

export default function DroughtDashboard() {
  const [selectedRegion, setSelectedRegion] = useState("Bangladesh");
  const [selectedPeriod, setSelectedPeriod] = useState("1 Month");
  const [selectedIndex, setSelectedIndex] = useState("Rainfall");
  const [currentDate, setCurrentDate] = useState<string>(new Date().toLocaleDateString("en-US", { day: "numeric", month: "short" }));
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  const stationLabel = selectedStation?.name || "Pick a station";

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div className="w-full px-4 py-6 lg:py-8 space-y-6">
        {/* Dashboard header */}
        <div className="rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wide opacity-80">
                Weather Analytics
              </p>
              <h1 className="text-2xl font-semibold">
                Interactive Weather Dashboard
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm font-medium">
                Station: {stationLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Map + controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 h-full">
              <MapControls
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                selectedIndex={selectedIndex}
                setSelectedIndex={setSelectedIndex}
                selectedStation={selectedStation}
                setSelectedStation={setSelectedStation}
              />
            </div>
          </div>
          <div className="lg:col-span-8">
            <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4 h-full">
              <MapComponent
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                selectedStation={selectedStation}
                onStationSelect={setSelectedStation}
              />
            </div>
          </div>
        </div>

        {/* Weather + time series */}
        <div className="space-y-6">
          <WeatherDashboard selectedStation={selectedStation} />
          <TimeSeriesGraph selectedStationId={selectedStation?.id || null} />
        </div>
      </div>
    </div>
  );
}
