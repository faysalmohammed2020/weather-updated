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

  if (session?.user?.role === "observer") {
    redirect("/dashboard");
  }

  const { page, limit } = await searchParams;
  const parsedPage = parseInt(page || "1");
  const parsedLimit = parseInt(limit || "10");
  const offset = (parsedPage - 1) * parsedLimit;

  const logsData = await getLogs({ limit: parsedLimit, offset });

  return (
    <LogsTable
      logs={logsData.logs}
      total={logsData.total}
      limit={parsedLimit}
      offset={offset}
    />
  );
};

export default ActivityLogsPage;
