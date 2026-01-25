// app/dashboard/user/page.tsx

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import {
  getUsersServer,
  getStationsServer,
  type User,
  type Station,
} from "@/lib/server/user-data";
import { UserTableClient } from "./user-table-client";

const UserPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) => {
  const session = await getSession();

  // Block access if user role is observer
  if (session?.user?.role === "observer") {
    redirect("/dashboard");
  }

  // Await searchParams and parse page parameter
  const params = await searchParams;
  const page = parseInt(params.page || "0", 10);
  const statusParamRaw = params.status;
  const statusParam =
    statusParamRaw === "banned" || statusParamRaw === "all"
      ? statusParamRaw
      : session?.user?.role === "super_admin" ||
        session?.user?.role === "root_admin"
      ? "all"
      : "active";
  const pageSize = 10;

  // Fetch data server-side
  const [usersData, stations] = await Promise.all([
    getUsersServer(page, pageSize, statusParam),
    getStationsServer(),
  ]);

  return (
    <div className="p-6">
      <UserTableClient
        initialUsers={usersData.users}
        initialTotalUsers={usersData.total}
        initialStations={stations}
        initialPage={page}
        pageSize={pageSize}
        session={session}
      />
    </div>
  );
};

export default UserPage;
