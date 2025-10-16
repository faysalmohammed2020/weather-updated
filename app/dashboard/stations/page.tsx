import { StationManagement } from "@/components/stationManagement";
import { stations as initialStations } from "@/data/stations";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";

export default async function StationsAdminPage() {
  const session = await getSession();

  // 🔒 Only allow super_admin and station_admin
  if (session?.user?.role !== "super_admin") {
    redirect("/dashboard"); // বা custom 403 page
  }

  return (
    <div>
      <StationManagement initialStations={initialStations} />
    </div>
  );
}
