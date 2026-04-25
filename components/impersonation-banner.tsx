// app/components/impersonation-banner.tsxy

"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export const ImpersonationBanner = () => {
  const { data: session } = useSession();
  const [isStoppingImpersonation, setIsStoppingImpersonation] = useState(false);

  // Check if user is being impersonated
  const isImpersonating = session?.user?.isImpersonating || false;
  const originalUser = session?.user?.originalUser;

  const handleStopImpersonation = async () => {
    try {
      setIsStoppingImpersonation(true);

      const response = await fetch("/api/impersonate", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to stop impersonation");
      }

      toast.success("Impersonation Stopped", {
        description: `Stopped impersonating ${session?.user?.name || session?.user?.email}. Redirecting...`,
        duration: 2000,
      });

      // Redirect to dashboard after stopping impersonation
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error("Stop impersonation failed:", error);
      toast.error("Failed to Stop Impersonation", {
        description:
          typeof error === "object" && error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        duration: 3000,
      });
    } finally {
      setIsStoppingImpersonation(false);
    }
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <>
      {/* ✨ ENHANCEMENT 1: Darker background for visibility */}
      <div className="bg-slate-700 p-4 mb-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="shrink-0">
              {/* ✨ ENHANCEMENT 2: White icon, slightly larger */}
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              {/* ✨ ENHANCEMENT 3: White text, larger font, more emphasis */}
              <p className="text-base text-white font-semibold">
                <span className="text-yellow-300">🚨 IMPERSONATION MODE:</span>{" "}
                You are currently impersonating{" "}
                <strong className="underline decoration-yellow-300">
                  {session?.user?.name || session?.user?.email}
                </strong>
                {session?.user?.role && (
                  <span className="text-gray-200 ml-2">
                    ({session.user.role.replace(/_/g, " ")})
                  </span>
                )}
                {originalUser && (
                  <span>
                    {" "}
                    (Original user:{" "}
                    <strong className="text-yellow-300">
                      {originalUser.name || originalUser.email}
                    </strong>
                    {originalUser.role && (
                      <span className="text-gray-200 ml-1">
                        {originalUser.role.replace(/_/g, " ")}
                      </span>
                    )}
                    )
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="shrink-0">
            {/* ✨ ENHANCEMENT 4: High-contrast white button */}
            <Button
              variant="default"
              size="sm"
              onClick={handleStopImpersonation}
              disabled={isStoppingImpersonation}
              className="bg-white text-red-600 hover:bg-red-100 hover:text-red-700 font-bold"
            >
              {isStoppingImpersonation ? "Stopping..." : "Stop Impersonation"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
