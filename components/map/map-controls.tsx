"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";

interface Station {
  id: string;
  stationId: string; // station code like "41923"
  name: string;
  latitude: number;
  longitude: number;
  securityCode: string;
  createdAt: Date;
  updatedAt: Date;
}

type Props = {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;

  selectedStation: Station | null;
  setSelectedStation: (station: Station | null) => void;

  // তুমি props type এ রেখেছিলে, দরকার না হলে বাদ দাও,
  // দরকার হলে destructure করে use করো
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  selectedIndex: string;
  setSelectedIndex: (index: string) => void;
};

export default function MapControls({
  setSelectedRegion,
  selectedStation,
  setSelectedStation,
}: Props) {
  const { data: session, status } = useSession();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Always fetch stations on mount (super_admin হলেও)
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/stationlocation");
        if (!response.ok) throw new Error(`Error: ${response.status}`);

        const data = await response.json();
        setStations(data);

        // ✅ যদি user এর station code session এ থাকে, সেটা preselect করো
        const userStationCode = session?.user?.station?.stationId;
        if (userStationCode) {
          const userStation = data.find(
            (s: Station) => s.stationId === userStationCode,
          );
          if (userStation) {
            setSelectedStation(userStation);
            setSelectedRegion("station");
          }
        }
      } catch (err) {
        console.error("Error fetching stations:", err);
        setError("Failed to fetch stations");
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [
    session?.user?.station?.stationId,
    setSelectedStation,
    setSelectedRegion,
  ]);

  // ✅ Safe role check
  const role = session?.user?.role;

  // ✅ permittedStations safe + memo
  const permittedStations = useMemo(() => {
    if (!role) return stations; // session লোড হওয়া পর্যন্ত সব দেখাও
    if (role === "super_admin" || role === "root_admin") return stations;

    const userStationCode = session?.user?.station?.stationId;
    return stations.filter((s) => s.stationId === userStationCode);
  }, [role, stations, session?.user?.station?.stationId]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium bg-blue-400 text-white py-2 px-4 mb-4 rounded">
        Map Controls
      </h3>

      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        Stations
      </label>

      <Select
        value={selectedStation?.stationId || ""}
        onValueChange={(value) => {
          const st = stations.find((s) => s.stationId === value);
          setSelectedStation(st || null);
        }}
        disabled={loading || permittedStations.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              loading
                ? "Loading..."
                : permittedStations.length === 0
                  ? "No stations"
                  : "Select Station"
            }
          />
        </SelectTrigger>

        <SelectContent>
          {permittedStations.map((st) => (
            <SelectItem key={st.id} value={st.stationId}>
              {st.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <div className="mt-4 text-red-600 text-sm">Error: {error}</div>}
    </div>
  );
}
