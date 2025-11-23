// app/dashboard/data-entry/daily-summery/DailySummerySkeleton.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DailySummerySkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* top banner skeleton */}
      <div className="h-10 w-full bg-gray-200 rounded-md" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* card 1 */}
        <Card className="border-blue-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-blue-50">
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </CardContent>
        </Card>

        {/* card 2 */}
        <Card className="border-blue-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-blue-50">
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-2 p-2">
      <div className="col-span-1 h-6 w-6 bg-gray-200 rounded-full" />
      <div className="col-span-5 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-12" />
      </div>
      <div className="col-span-2 h-4 bg-gray-200 rounded" />
      <div className="col-span-4 h-9 bg-gray-200 rounded-md" />
    </div>
  );
}
