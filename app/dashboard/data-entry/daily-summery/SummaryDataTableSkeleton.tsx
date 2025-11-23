"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const columnCount = 17; // same as table headers (time + 16 cols)
const rowCount = 6;

export default function SummaryDataTableSkeleton() {
  return (
    <Card className="border-gray-200 shadow-sm animate-pulse">
      <CardHeader className="pb-2 pt-4 px-4 bg-gray-50">
        <div className="h-4 w-48 bg-gray-200 rounded" />
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                {Array.from({ length: columnCount }).map((_, i) => (
                  <th key={i} className="px-3 py-3">
                    <div className="h-6 bg-gray-200 rounded" />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: rowCount }).map((_, r) => (
                <tr key={r}>
                  {Array.from({ length: columnCount }).map((__, c) => (
                    <td key={c} className="px-3 py-3">
                      <div className="h-5 bg-gray-200 rounded" />
                    </td>
                  ))}
                </tr>
              ))}

              {/* daily summary row placeholder */}
              <tr className="bg-blue-50 border-t-2 border-blue-200">
                {Array.from({ length: columnCount }).map((_, i) => (
                  <td key={i} className="px-3 py-4">
                    <div className="h-5 bg-gray-200 rounded" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
