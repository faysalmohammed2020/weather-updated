export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import { LogsTable } from "../user/logs-table";
import { getLogs } from "@/app/actions/logs";

const ActivityLogsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    action?: string;
    role?: string;
    module?: string;
    startDate?: string;
    endDate?: string;
  }>;
}) => {
  const session = await getSession();

  // Only observers are not allowed to view activity logs
  if (session?.user?.role === "observer") {
    redirect("/dashboard");
  }

  // super_admin and station_admin can view activity logs

  const params = await searchParams;
  const parsedPage = parseInt(params.page || "1");
  const parsedLimit = parseInt(params.limit || "10");
  const offset = (parsedPage - 1) * parsedLimit;

  // Parse date filters
  const startDate = params.startDate ? new Date(params.startDate) : undefined;
  const endDate = params.endDate ? new Date(params.endDate) : undefined;

  const logsData = await getLogs({
    limit: parsedLimit,
    offset,
    search: params.search || "",
    action: params.action || "",
    role: params.role || "",
    module: params.module || "",
    startDate,
    endDate,
  });

  // Handle error case
  if ("error" in logsData) {
    return (
      <div className="text-red-600">Error loading logs: {logsData.error}</div>
    );
  }

  return (
    <LogsTable
      logs={logsData.logs || []}
      total={logsData.total}
      limit={parsedLimit}
    />
  );
};

export default ActivityLogsPage;
