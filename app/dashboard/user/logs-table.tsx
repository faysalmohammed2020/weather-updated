"use client";

import React, { useCallback, useMemo, useState } from "react";
import { logs } from "@prisma/client";
import moment from "moment";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogActionType } from "@/lib/log";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import LogsTableSkeleton from "./LogsTableSkeleton"; // ✅ skeleton
import { LogsFilter } from "./logs-filter";

type LogWithUsers = logs & {
  actor?: { name?: string | null } | null;
  targetUser?: { name?: string | null } | null;
  details?: any;
};

export const LogsTable = ({
  logs: rawLogs,
  total: rawTotal,
  limit = 10,
}: {
  logs: LogWithUsers[];
  total?: number;
  limit?: number;
}) => {
  /**
   * ✅ Skeleton trigger:
   * rawLogs যদি undefined/null হয় => skeleton দেখাবে
   * rawLogs [] হলে => loading না, empty state (same as before)
   */
  const isLoading = rawLogs == null;

  // Handle error case or missing data (unchanged)
  const logsArr = Array.isArray(rawLogs) ? rawLogs : [];
  const total = typeof rawTotal === "number" ? rawTotal : logsArr.length;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");

  const [selectedDetails, setSelectedDetails] = useState<JSON | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ✅ stable badge style map (same output)
  const badgeStyleByAction = useMemo(
    () => ({
      [LogActionType.CREATE]: "bg-green-100 text-green-800 border-green-300",
      [LogActionType.UPDATE]: "bg-blue-100 text-blue-800 border-blue-300",
      [LogActionType.DELETE]: "bg-red-100 text-red-800 border-red-300",
      default: "bg-gray-100 text-gray-800 border-gray-300",
    }),
    []
  );

  const getActionBadgeStyle = useCallback(
    (action: string) =>
      (badgeStyleByAction as any)[action] ?? badgeStyleByAction.default,
    [badgeStyleByAction]
  );

  // Navigate to a specific page without resetting scroll position (same behavior)
  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());

      router.replace(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, pathname, searchParams]
  );

  const handleViewDetails = useCallback((details: any) => {
    setSelectedDetails(details);
    setIsDialogOpen(true);
  }, []);

  // ✅ memo page-number list (same logic, just precomputed)
  const pageNumbers = useMemo(() => {
    const totalPages = Math.ceil(total / limit);
    const size = Math.min(5, totalPages);

    return Array.from({ length: size }).map((_, i) => {
      let pageNum;

      if (totalPages <= 5) pageNum = i + 1;
      else if (currentPage <= 3) pageNum = i + 1;
      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
      else pageNum = currentPage - 2 + i;

      if (pageNum <= 0 || pageNum > totalPages) return null;
      return pageNum;
    });
  }, [total, limit, currentPage]);

  // ✅ Skeleton UI (no logic change except UX)
  if (isLoading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>
        <LogsFilter />
        <div className=" bg-white py-6 rounded-xl border shadow">
          <LogsTableSkeleton rows={limit} />
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Activity Logs</h1>
      <LogsFilter />
      <div className=" bg-white py-6 rounded-xl border shadow">
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="border-b-2 border-slate-300 bg-slate-100">
              <tr>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Time
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Actor Name
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Actor Email
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Actor Role
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Target User
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Target Email
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Action
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Action Text
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Module
                </th>
                <th className="p-3 text-lg font-medium whitespace-nowrap min-w-max-[250px] text-left">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {logsArr.map((log) => (
                <tr key={log.id} className="border-b">
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.actor?.name ?? ""}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.actorEmail}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.role}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.targetUser?.name ?? ""}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.targetEmail}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium border",
                        getActionBadgeStyle(log.action)
                      )}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.actionText}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.module}
                  </td>
                  <td className="p-3 text-left truncate max-w-[250px]">
                    {log.details ? (
                      <Button
                        variant="secondary"
                        onClick={() => handleViewDetails(log.details)}
                        className="hover:bg-slate-100"
                      >
                        <Eye className="h-5 w-5" />
                        <span>View</span>
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination (same logic) */}
        {total > limit && (
          <div className="border-t pt-4 px-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {total > 0 ? (currentPage - 1) * limit + 1 : 0}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * limit, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => goToPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  size="sm"
                >
                  Previous
                </Button>

                {pageNumbers.map((pageNum) =>
                  pageNum ? (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => goToPage(pageNum)}
                      size="sm"
                      className="min-w-[40px]"
                    >
                      {pageNum}
                    </Button>
                  ) : null
                )}

                <Button
                  variant="outline"
                  onClick={() =>
                    goToPage(
                      Math.min(Math.ceil(total / limit), currentPage + 1)
                    )
                  }
                  disabled={currentPage >= Math.ceil(total / limit)}
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Dialog (unchanged) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Log Details{" "}
              <span className="text-slate-500 text-sm">(Changes made)</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-auto">
            {selectedDetails && (
              <pre className="bg-slate-50 border p-4 rounded-md text-sm whitespace-pre-wrap text-green-900">
                {JSON.stringify(selectedDetails, null, 2)}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
