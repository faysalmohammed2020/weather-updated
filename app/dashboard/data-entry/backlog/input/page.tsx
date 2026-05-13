//app/dashboard/data-entry/backlog/input/page.tsx
"use client";

import BacklogInputFlow from "@/components/backlog/BacklogInputFlow";
import { HourProvider } from "@/contexts/hourContext";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function BacklogInput() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-slate-500">Loading flow...</p>
      </div>
    }>
      <HourProvider>
        <BacklogInputFlow />
      </HourProvider>
    </Suspense>
  );
}
