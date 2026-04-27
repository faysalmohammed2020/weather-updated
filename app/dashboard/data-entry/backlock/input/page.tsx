//app/dashboard/data-entry/backlock/input/page.tsx
"use client";

import BacklockInputFlow from "@/components/backlock/BacklockInputFlow";
import { HourProvider } from "@/contexts/hourContext";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function BacklockInput() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-slate-500">Loading flow...</p>
      </div>
    }>
      <HourProvider>
        <BacklockInputFlow />
      </HourProvider>
    </Suspense>
  );
}
