"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { LandingNavbar } from "@/components/weather/landing-navbar";
import { landingCopy } from "@/lib/weather-platform-data";

const WeatherMapClient = dynamic(
  () => import("@/components/weather/weather-map-client"),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[calc(100vh-4rem)] min-h-[640px] place-items-center bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <div className="flex items-center gap-3 rounded-lg border border-white/30 bg-white/75 px-4 py-3 shadow-xl backdrop-blur dark:border-white/10 dark:bg-slate-900/75">
          <Loader2 className="size-4 animate-spin text-cyan-500" />
          <span className="text-sm font-medium">{landingCopy.mapLoading}</span>
        </div>
      </div>
    ),
  }
);

export default function LandingWeatherPlatform() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = storedTheme ? storedTheme === "dark" : prefersDark;

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDark(shouldUseDark);
  }, []);

  const handleThemeToggle = () => {
    setIsDark((current) => {
      const next = !current;
      document.documentElement.classList.toggle("dark", next);
      window.localStorage.setItem("theme", next ? "dark" : "light");

      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <LandingNavbar isDark={isDark} onThemeToggle={handleThemeToggle} />
      <main className="relative">
        <WeatherMapClient isDark={isDark} />
      </main>
    </div>
  );
}
