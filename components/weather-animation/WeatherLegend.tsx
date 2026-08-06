"use client";

import { Pause, Play } from "lucide-react";
import { layerLegends } from "@/lib/weather/color-scales";
import type { ForecastAnimationLayer } from "@/lib/weather/grid-types";

type WeatherLegendProps = {
  layerKey: ForecastAnimationLayer;
  isPlaying: boolean;
  timestamp: string;
  opacity: number;
};

export default function WeatherLegend({
  layerKey,
  isPlaying,
  timestamp,
  opacity,
}: WeatherLegendProps) {
  const legend = layerLegends[layerKey];

  return (
    <div className="pointer-events-none absolute bottom-[6.25rem] right-4 z-[860] w-64 rounded-2xl border border-white/45 bg-white/86 p-3 shadow-2xl shadow-slate-950/15 ring-1 ring-slate-950/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/82 dark:ring-white/10">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-slate-950 dark:text-white">
            {legend.label} · {legend.unit}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Demo forecast · {formatTimestamp(timestamp)}
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white dark:bg-white dark:text-slate-950">
          {isPlaying ? <Play className="size-3" /> : <Pause className="size-3" />}
          {isPlaying ? "Live" : "Hold"}
        </span>
      </div>
      <div
        className="h-2.5 rounded-full shadow-inner"
        style={{ background: `linear-gradient(90deg, ${legend.gradient})` }}
      />
      <div className="mt-1.5 flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400">
        {legend.ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
        <span>Canvas animation</span>
        <span>Opacity {opacity}%</span>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
