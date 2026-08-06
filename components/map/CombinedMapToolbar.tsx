"use client";

import { useState } from "react";
import { Layers, MapPinned, PanelLeftOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { forecastLayers, stationLayers } from "@/lib/weather-platform-data";
import { cn } from "@/lib/utils";
import type {
  BoundaryViewMode,
  DistrictOption,
  EnabledMap,
  ForecastLayerId,
  WeatherLayer,
} from "@/types/weather-platform";

type CombinedMapToolbarProps = {
  viewMode: BoundaryViewMode;
  selectedDistrictId: string | null;
  districts: DistrictOption[];
  onViewModeChange: (value: BoundaryViewMode) => void;
  onDistrictChange: (value: string) => void;
  onReset: () => void;
  enabled: EnabledMap;
  enabledForecast: Record<ForecastLayerId, boolean>;
  onParameterToggle: (id: string, on: boolean) => void;
  onForecastToggle: (id: ForecastLayerId, on: boolean) => void;
  onLayerDrawerOpen: () => void;
};

export default function CombinedMapToolbar({
  viewMode,
  selectedDistrictId,
  districts,
  onViewModeChange,
  onDistrictChange,
  onReset,
  enabled,
  enabledForecast,
  onParameterToggle,
  onForecastToggle,
  onLayerDrawerOpen,
}: CombinedMapToolbarProps) {
  const [isLayerPanelOpen, setIsLayerPanelOpen] = useState(false);
  const districtDisabled = viewMode !== "district" || districts.length === 0;
  const previewForecastLayers = forecastLayers.slice(0, 3);

  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-[1200] w-[min(calc(100%-1rem),980px)] -translate-x-1/2 px-2 sm:px-0">
      <div className="pointer-events-auto overflow-hidden rounded-2xl border border-white/50 bg-white/88 shadow-xl shadow-slate-950/12 ring-1 ring-slate-950/5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/82 dark:ring-white/10">
        <div className="flex items-center gap-2 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300">
                <MapPinned className="size-4" />
              </span>
            </TooltipTrigger>
            <TooltipContent>Boundary controls</TooltipContent>
          </Tooltip>

          <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[minmax(170px,0.9fr)_minmax(210px,1.1fr)]">
            <Select
              value={viewMode}
              onValueChange={(value) =>
                onViewModeChange(value as BoundaryViewMode)
              }
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white/92 px-3 text-sm font-semibold shadow-sm dark:border-white/10 dark:bg-slate-900/80">
                <SelectValue placeholder="Boundary mode" />
              </SelectTrigger>
              <SelectContent className="z-[1300]">
                <SelectItem value="country">🇧🇩 Bangladesh</SelectItem>
                <SelectItem value="district">District-wise Boundary</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={selectedDistrictId ?? undefined}
              disabled={districtDisabled}
              onValueChange={onDistrictChange}
            >
              <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white/92 px-3 text-sm font-medium shadow-sm dark:border-white/10 dark:bg-slate-900/80">
                <SelectValue
                  placeholder={
                    districts.length === 0
                      ? "Loading districts..."
                      : "Select district"
                  }
                />
              </SelectTrigger>
              <SelectContent className="z-[1300] max-h-72">
                {districts.map((district) => (
                  <SelectItem key={district.code} value={district.code}>
                    {district.name}
                    {district.division ? ` · ${district.division}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-10 shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                onClick={onReset}
                aria-label="Reset boundary view"
              >
                <RotateCcw className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset boundary view</TooltipContent>
          </Tooltip>

          <div className="hidden h-10 w-px shrink-0 bg-slate-200 dark:bg-white/10 sm:block" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-10 shrink-0 rounded-xl border border-slate-200 bg-white/80 text-slate-700 shadow-sm hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
                onClick={() => setIsLayerPanelOpen((value) => !value)}
                aria-expanded={isLayerPanelOpen}
                aria-label="Show all weather layers"
              >
                <Layers className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show all weather layers</TooltipContent>
          </Tooltip>

          <div className="flex min-w-0 gap-1.5 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {stationLayers.map((layer) => (
              <ToolbarLayerButton
                key={layer.key}
                layer={layer}
                active={enabled[layer.key]}
                onClick={() =>
                  onParameterToggle(layer.key, !enabled[layer.key])
                }
              />
            ))}
            <div className="mx-0.5 min-h-10 w-px shrink-0 bg-slate-200 dark:bg-white/10" />
            {previewForecastLayers.map((layer) => {
              const layerId = layer.key as ForecastLayerId;

              return (
                <ToolbarLayerButton
                  key={layer.key}
                  layer={layer}
                  active={enabledForecast[layerId]}
                  onClick={() =>
                    onForecastToggle(layerId, !enabledForecast[layerId])
                  }
                />
              );
            })}
            <button
              type="button"
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl border text-xs font-bold transition-all",
                isLayerPanelOpen
                  ? "border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                  : "border-slate-200 bg-white/80 text-slate-600 shadow-sm hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
              )}
              onClick={() => setIsLayerPanelOpen((value) => !value)}
              aria-expanded={isLayerPanelOpen}
              aria-label="Show remaining weather layers"
            >
              +{forecastLayers.length - previewForecastLayers.length}
            </button>
          </div>
        </div>
        {isLayerPanelOpen && (
          <div className="border-t border-slate-200/70 bg-slate-50/78 p-3 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="grid gap-3 lg:grid-cols-[0.85fr_1.15fr]">
              <LayerPanelSection
                title="Station Parameters"
                layers={stationLayers}
                enabled={enabled}
                onToggle={(layer) =>
                  onParameterToggle(layer.key, !enabled[layer.key])
                }
              />
              <LayerPanelSection
                title="Forecast Overlays"
                layers={forecastLayers}
                enabled={enabledForecast}
                onToggle={(layer) => {
                  const layerId = layer.key as ForecastLayerId;
                  onForecastToggle(layerId, !enabledForecast[layerId]);
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/78 px-3 py-2 text-xs text-slate-500 dark:border-white/10 dark:bg-slate-950/35 dark:text-slate-400">
              <span>
                All weather layers are available here; the top row stays
                compact.
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 shrink-0 rounded-lg px-2 text-xs font-semibold"
                onClick={() => {
                  setIsLayerPanelOpen(false);
                  onLayerDrawerOpen();
                }}
              >
                <PanelLeftOpen className="mr-1.5 size-3.5" />
                Sidebar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LayerPanelSection({
  title,
  layers,
  enabled,
  onToggle,
}: {
  title: string;
  layers: WeatherLayer[];
  enabled: Partial<Record<string, boolean>>;
  onToggle: (layer: WeatherLayer) => void;
}) {
  return (
    <section>
      <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {title}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {layers.map((layer) => (
          <LayerPanelButton
            key={layer.key}
            layer={layer}
            active={Boolean(enabled[layer.key])}
            onClick={() => onToggle(layer)}
          />
        ))}
      </div>
    </section>
  );
}

function LayerPanelButton({
  layer,
  active,
  onClick,
}: {
  layer: WeatherLayer;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = layer.icon;

  return (
    <button
      type="button"
      className={cn(
        "group flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-sm transition-all duration-200",
        active
          ? "border-transparent bg-slate-950 text-white shadow-lg shadow-slate-950/15 dark:bg-white dark:text-slate-950"
          : "border-slate-200 bg-white/82 text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
      )}
      onClick={onClick}
      aria-pressed={active}
    >
      <span
        className="grid size-8 shrink-0 place-items-center rounded-lg text-white shadow-sm"
        style={{ backgroundColor: layer.accent }}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold leading-tight">
          {layer.shortLabel}
        </span>
        <span className="block truncate text-[11px] opacity-70">
          {layer.unit}
        </span>
      </span>
    </button>
  );
}

function ToolbarLayerButton({
  layer,
  active,
  onClick,
}: {
  layer: WeatherLayer;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = layer.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "group relative grid size-10 shrink-0 place-items-center rounded-xl border transition-all duration-200",
            active
              ? "border-transparent bg-slate-950 text-white shadow-lg shadow-slate-950/20 dark:bg-white dark:text-slate-950"
              : "border-slate-200 bg-white/80 text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
          )}
          onClick={onClick}
          aria-pressed={active}
          aria-label={layer.label}
        >
          <span
            className={cn(
              "absolute inset-x-2 bottom-1 h-0.5 rounded-full transition-opacity",
              active ? "opacity-100" : "opacity-0 group-hover:opacity-70",
            )}
            style={{ backgroundColor: layer.accent }}
          />
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {layer.label} · {layer.unit}
      </TooltipContent>
    </Tooltip>
  );
}
