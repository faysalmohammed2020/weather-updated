// app/dashboard/data-entry/first-card/FirstCardSkeleton.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

const fakeTabs = [
  "pressure",
  "temperature",
  "squall",
  "VV",
  "meteors",
  "weather",
  "summary",
];

export default function FirstCardSkeleton({
  activeTab,
}: {
  activeTab?: string;
}) {
  return (
    <div className="w-full p-6 space-y-6 animate-pulse">
      {/* ===== Header / Basic Info Skeleton ===== */}
      <div className="space-y-3">
        <div className="h-6 w-1/3 bg-gray-200 rounded-md" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
          <div className="h-10 bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* ===== Top Pill Tabs Skeleton ===== */}
      <div className="flex flex-wrap justify-center gap-2 px-2">
        {fakeTabs.map((t) => {
          const isActive = activeTab?.toLowerCase() === t.toLowerCase();
          return (
            <div
              key={t}
              className={cn(
                "h-9 w-24 rounded-full bg-gray-200",
                isActive && "bg-gray-300 scale-[1.03]"
              )}
            />
          );
        })}
      </div>

      {/* ===== Active Tab Card Skeleton ===== */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
        <div className="h-5 w-1/4 bg-gray-200 rounded" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="h-9 bg-gray-200 rounded-md" />
          <div className="h-9 bg-gray-200 rounded-md" />
          <div className="h-9 bg-gray-200 rounded-md" />
          <div className="h-9 bg-gray-200 rounded-md" />
          <div className="h-9 bg-gray-200 rounded-md" />
          <div className="h-9 bg-gray-200 rounded-md" />
        </div>

        {/* big textarea / table-like area */}
        <div className="h-28 bg-gray-200 rounded-lg" />

        {/* buttons */}
        <div className="flex justify-between pt-2">
          <div className="h-9 w-24 bg-gray-200 rounded-md" />
          <div className="h-9 w-24 bg-gray-200 rounded-md" />
        </div>
      </div>

      {/* tiny hint */}
      {activeTab && (
        <div className="text-xs text-gray-400 pt-1">
          Loading {activeTab} tab…
        </div>
      )}
    </div>
  );
}
