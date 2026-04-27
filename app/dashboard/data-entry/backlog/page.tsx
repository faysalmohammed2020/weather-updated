"use client";

import { useState, useEffect } from "react";
import DateSelector from "@/components/backlog/DateSelector";
import { HourProvider, useHour } from "@/contexts/hourContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import HourSelector from "@/components/hour-selector";
import { useRouter } from "next/navigation";
import { TimeInfo } from "@/lib/data-type";
import { useSession } from "@/lib/auth-client";

function BacklogContent() {
  const router = useRouter();
  const { selectedHour, setSelectedHour, clearError } = useHour();
  const { data: session, status } = useSession();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [timeInfo, setTimeInfo] = useState<TimeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  // Redirect to login if session expires
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setShowStatus(false);
  };

  const handleCheckData = async () => {
    if (!selectedDate) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/time-info?date=${selectedDate}`);
      const data = await response.json();
      setTimeInfo(data.timeInfo || []);
      setShowStatus(true);
    } catch (error) {
      console.error("Error fetching backlog status:", error);
      setTimeInfo([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedHour && selectedDate) {
      router.push(`/dashboard/data-entry/backlog/input?date=${selectedDate}&utc=${selectedHour}`);
    }
  }, [selectedHour, selectedDate, router]);

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-8">
      <DateSelector
        onChange={handleDateChange}
        onCheckData={handleCheckData}
        isLoading={isLoading}
      />

      <Dialog open={showStatus} onOpenChange={setShowStatus}>
        <DialogContent className="w-[calc(100%-1.5rem)]sm:w-[95%] max-w-7xl rounded-xl sm:rounded-2xl border-0 bg-white p-0 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5 sticky top-0 bg-white z-10">
            <DialogTitle className="flex flex-col gap-1 text-lg sm:text-xl font-bold text-slate-800">
              UTC Data Status
              <span className="text-sm font-medium text-slate-500">
                Selected Date: {selectedDate}
              </span>
            </DialogTitle>
            <button
              onClick={() => setShowStatus(false)}
              className="absolute right-4 top-4 sm:right-6 sm:top-5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>

          <div className="px-4 py-5 sm:px-6 sm:py-8">
            <HourSelector type="first" timeInfo={timeInfo} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Backlog() {
  return (
    <HourProvider>
      <BacklogContent />
    </HourProvider>
  );
}
