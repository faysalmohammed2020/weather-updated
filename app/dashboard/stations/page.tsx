export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import { getStationsForSession } from "@/lib/server/stations"; // ✅ use session-aware server fn
import { StationManagementClient } from "./station-management-client";

export default async function StationsPage() {
  const session = await getSession();

  // 🔒 Only allow super_admin and root_admin
  if (
    session?.user?.role !== "super_admin" &&
    session?.user?.role !== "root_admin"
  ) {
    redirect("/dashboard");
  }

  // ✅ Fetch stations server-side (root_admin treated like super_admin)
  const serverStations = await getStationsForSession();

  const stations = serverStations.map((station) => ({
    ...station,
    latitude: station.latitude ?? 23.685,
    longitude: station.longitude ?? 90.3563,
  }));

  return <StationManagementClient initialStations={stations} session={session} />;
}
