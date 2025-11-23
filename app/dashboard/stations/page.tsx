export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import { getStationsServer, type Station as ServerStation } from "@/lib/server/user-data";
import { StationManagementClient } from "./station-management-client";

export default async function StationsPage() {
  const session = await getSession();

  // 🔒 Only allow super_admin and station_admin
  if (session?.user?.role !== "super_admin") {
    redirect("/dashboard");
  }

  // Fetch stations server-side
  const serverStations = await getStationsServer();

  // Convert ServerStation to Station with default lat/lng values
  const stations = serverStations.map(station => ({
    ...station,
    latitude: station.latitude ?? 23.685, // Default latitude (Bangladesh)
    longitude: station.longitude ?? 90.3563, // Default longitude (Bangladesh)
  }));

  return (
    <StationManagementClient 
      initialStations={stations}
      session={session}
    />
  );
}
