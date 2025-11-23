// app/dashboard/data-entry/synoptic-code/SynopticCodeSkeleton.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SynopticCodeSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="h-5 w-56 bg-gray-200 rounded-md" />
      </div>

      {/* banner */}
      <div className="h-10 w-full bg-gray-200 rounded-md" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* left card skeleton */}
        <Card className="border-green-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </CardContent>
        </Card>

        {/* right card skeleton */}
        <Card className="border-green-200 bg-white shadow-sm">
          <CardHeader className="pb-2 pt-4 px-4 bg-green-50">
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}

            {/* weather remark block */}
            <div className="mt-4 rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto" />
              <div className="h-4 w-40 bg-gray-200 rounded mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* submit button skeleton */}
      <div className="flex justify-end">
        <div className="h-12 w-32 bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-2 p-2">
      <div className="col-span-1 h-6 w-6 bg-gray-200 rounded-full" />
      <div className="col-span-6 h-4 bg-gray-200 rounded" />
      <div className="col-span-2 h-4 bg-gray-200 rounded" />
      <div className="col-span-3 h-9 bg-gray-200 rounded-md" />
    </div>
  );
}
