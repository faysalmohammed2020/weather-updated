"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FirstCardForm } from "@/app/dashboard/data-entry/first-card/FirstCardForm";
import SecondCardForm from "@/components/SecondCard/SecondCard";
import { SynopticCode } from "@/app/dashboard/data-entry/synoptic-code/SynopticCode";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimeInfo } from "@/lib/data-type";
import { useHour } from "@/contexts/hourContext";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

type Step = "first-card" | "second-card" | "synoptic-code" | "completed";

export default function BacklogInputFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const date = searchParams.get("date");
  const utc = searchParams.get("utc");
  const { data: session, status } = useSession();

  const [currentStep, setCurrentStep] = useState<Step>("first-card");
  const [timeInfo, setTimeInfo] = useState<TimeInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { setSelectedHour, clearError } = useHour();

  // Redirect to login if session expires
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  useEffect(() => {
    if (!date || !utc) {
      router.push("/dashboard/data-entry/backlog");
      return;
    }

    const initFlow = async () => {
      setIsLoading(true);
      try {
        // Set context hour
        setSelectedHour(utc);
        clearError();

        // Fetch full time info for the forms that need it
        const timeRes = await fetch(`/api/time-info?date=${date}`);
        const timeData = await timeRes.json();
        const info: TimeInfo[] = timeData.timeInfo || [];
        setTimeInfo(info);

        const utcHour = utc.padStart(2, "0");
        const entry = info.find((t) => {
          const hour = new Date(t.utcTime).getUTCHours().toString().padStart(2, "0");
          return hour === utcHour;
        });

        if (!entry) {
          setCurrentStep("first-card");
        } else if (!entry.hasMeteorologicalEntry) {
          setCurrentStep("first-card");
        } else if (!entry.hasWeatherObservation) {
          setCurrentStep("second-card");
        } else if (!entry.hasSynopticCode) {
          setCurrentStep("synoptic-code");
        } else {
          setCurrentStep("completed");
        }
      } catch (error) {
        console.error("Init flow error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initFlow();
  }, [date, utc, router, setSelectedHour, clearError]);

  const handleNextStep = () => {
    if (currentStep === "first-card") {
      toast.success("First Card submitted", { description: "Moving to Second Card..." });
      setCurrentStep("second-card");
    } else if (currentStep === "second-card") {
      toast.success("Second Card submitted", { description: "Moving to Synoptic Code..." });
      setCurrentStep("synoptic-code");
    } else if (currentStep === "synoptic-code") {
      toast.success("Synoptic Code submitted", { description: "Completing entry..." });
      setCurrentStep("completed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-lg font-medium text-slate-500">Preparing input flow...</p>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      {/* Flow Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto mb-4">
          <FlowStep 
            label="First Card" 
            active={currentStep === "first-card"} 
            completed={["second-card", "synoptic-code", "completed"].includes(currentStep)} 
          />
          <ArrowRight className="text-slate-300" />
          <FlowStep 
            label="Second Card" 
            active={currentStep === "second-card"} 
            completed={["synoptic-code", "completed"].includes(currentStep)} 
          />
          <ArrowRight className="text-slate-300" />
          <FlowStep 
            label="Synoptic Code" 
            active={currentStep === "synoptic-code"} 
            completed={currentStep === "completed"} 
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800">Backlog Data Entry</h1>
          <p className="text-slate-500 font-medium">Date: {date} | UTC: {utc}:00</p>
        </div>
      </div>

      <div className="relative min-h-[600px]">
        {currentStep === "first-card" && (
          <FirstCardForm 
            timeInfo={timeInfo} 
            backlogMode 
            selectedDate={date!} 
            selectedUtc={utc!} 
            onSuccess={handleNextStep} 
          />
        )}
        {currentStep === "second-card" && (
          <SecondCardForm 
            timeInfo={timeInfo} 
            backlogMode 
            selectedDate={date!} 
            selectedUtc={utc!} 
            onSuccess={handleNextStep} 
          />
        )}
        {currentStep === "synoptic-code" && (
          <Formik
            initialValues={{
              dataType: "",
              stationNo: "",
              year: "",
              month: "",
              day: "",
              weatherRemark: "",
              measurements: Array(21).fill(""),
            }}
            onSubmit={(values) => console.log(values)}
          >
            <Form>
              <SynopticCode
                backlogMode
                selectedDate={date!}
                selectedUtc={utc!}
                onSuccess={handleNextStep}
              />
            </Form>
          </Formik>
        )}
        {currentStep === "completed" && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">All Done!</h2>
            <p className="text-slate-500 text-lg mb-10">Data for {date} {utc}:00 UTC has been successfully recorded.</p>
            <button
              onClick={() => router.push("/dashboard/data-entry/backlog")}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-100"
            >
              Back to Backlog Overview
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FlowStep({ label, active, completed }: { label: string; active: boolean; completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
          completed ? "bg-emerald-500 border-emerald-500 text-white" : 
          active ? "bg-blue-600 border-blue-600 text-white scale-110 shadow-lg shadow-blue-100" : 
          "bg-white border-slate-200 text-slate-400"
        )}
      >
        {completed ? <CheckCircle2 className="h-6 w-6" /> : <div className="h-2.5 w-2.5 rounded-full bg-current" />}
      </div>
      <span className={cn(
        "text-xs font-bold uppercase tracking-wider",
        active ? "text-blue-600" : completed ? "text-emerald-600" : "text-slate-400"
      )}>
        {label}
      </span>
    </div>
  );
}
