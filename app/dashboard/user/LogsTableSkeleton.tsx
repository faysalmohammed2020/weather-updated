"use client";

import React from "react";

export default function LogsTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="overflow-auto">
      <table className="w-full">
        <thead className="border-b-2 border-slate-300 bg-slate-100">
          <tr>
            {Array.from({ length: 10 }).map((_, i) => (
              <th key={i} className="p-3 text-left">
                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b animate-pulse">
              {Array.from({ length: 10 }).map((_, c) => (
                <td key={c} className="p-3">
                  <div className="h-4 w-full max-w-[220px] bg-slate-200 rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
