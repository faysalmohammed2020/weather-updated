"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ImpersonationLoaderProps {
  isLoading: boolean;
  userName: string;
  userEmail: string;
  userRole: string;
  mode: "start" | "stop";
}

export const ImpersonationLoader = ({
  isLoading,
  userName,
  userEmail,
  userRole,
  mode,
}: ImpersonationLoaderProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 40;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const isStarting = mode === "start";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in duration-300">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full mb-4">
            {isStarting ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-green-600 animate-pulse" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isStarting ? "Starting Impersonation" : "Stopping Impersonation"}
          </h2>
          <p className="text-sm text-gray-600">
            {isStarting
              ? "Securing session and authenticating..."
              : "Restoring original session..."}
          </p>
        </div>

        {/* User Information */}
        <div className="bg-linear-to-r from-slate-50 to-blue-50 rounded-lg p-4 mb-6 border border-slate-200">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {isStarting ? "Impersonating" : "Original User"}
              </p>
              <p className="text-lg font-bold text-gray-900">{userName}</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-gray-700 font-medium">{userEmail}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Role</p>
                <p className="text-sm text-blue-600 font-bold uppercase">
                  {userRole.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Progress</p>
            <p className="text-xs font-semibold text-blue-600">
              {Math.round(progress)}%
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-700">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            <span>Authenticating credentials</span>
          </div>
          <div
            className={`flex items-center text-sm ${
              progress > 30 ? "text-gray-700" : "text-gray-400"
            }`}
          >
            <div
              className={`w-2 h-2 mr-2 rounded-full ${
                progress > 30 ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span>Establishing session</span>
          </div>
          <div
            className={`flex items-center text-sm ${
              progress > 60 ? "text-gray-700" : "text-gray-400"
            }`}
          >
            <div
              className={`w-2 h-2 mr-2 rounded-full ${
                progress > 60 ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            <span>
              {isStarting ? "Preparing interface" : "Completing logout process"}
            </span>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            {isStarting
              ? "Do not close this window. You'll be redirected shortly."
              : "Restoring your original session..."}
          </p>
        </div>
      </div>
    </div>
  );
};
