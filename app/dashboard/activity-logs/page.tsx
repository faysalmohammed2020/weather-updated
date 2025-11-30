export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import { LogsTable } from "../user/logs-table";
import { getLogs } from "@/app/actions/logs";

const ActivityLogsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) => {
  const session = await getSession();

  // Only observers are not allowed to view activity logs
  if (session?.user?.role === "observer") {
    redirect("/dashboard");
  }

  // super_admin and station_admin can view activity logs

  const { page, limit } = await searchParams;
  const parsedPage = parseInt(page || "1");
  const parsedLimit = parseInt(limit || "10");
  const offset = (parsedPage - 1) * parsedLimit;

  const logsData = await getLogs({ limit: parsedLimit, offset });

  // Handle error case
  if ("error" in logsData) {
    return (
      <div className="text-red-600">Error loading logs: {logsData.error}</div>
    );
  }

  return (
    <div className="p-6">
      <LogsTable
        logs={logsData.logs || []}
        total={logsData.total}
        limit={parsedLimit}
      />
    </div>
  );
};

export default ActivityLogsPage;
