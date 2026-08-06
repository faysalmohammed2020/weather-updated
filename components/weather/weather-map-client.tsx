"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  GeoJSON,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip as LeafletTooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion } from "framer-motion";
import {
  ChevronsLeft,
  ChevronsRight,
  Gauge,
  LocateFixed,
  Minus,
  Pause,
  Play,
  Plus,
  RadioTower,
  Rewind,
  SkipBack,
  SkipForward,
  Wind,
  X,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import {
  bangladeshStations,
  forecastLayers,
  landingCopy,
  stationLayers,
  timelineSteps,
  weatherLayers,
} from "@/lib/weather-platform-data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  createWeatherMarkerIcon,
  getWeatherMarkerTypeFromLayer,
  getZoomMode,
  type WeatherMarkerType,
} from "@/components/weather/weather-marker-factory";
import CombinedMapToolbar from "@/components/map/CombinedMapToolbar";
import type {
  BoundaryViewMode,
  DistrictOption,
  EnabledMap,
  ForecastLayerId,
  WeatherLayer,
  WeatherLayerKey,
  WeatherStation,
} from "@/types/weather-platform";

type WeatherMapClientProps = {
  isDark: boolean;
};

const bangladeshBounds: L.LatLngBoundsLiteral = [
  [20.590609348000044, 88.00862798600008],
  [26.634513010000035, 92.68030687500004],
];

const mapTiles = {
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
};

function ResizeInvalidator() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(() => map.invalidateSize({ animate: true }));
    });

    resizeObserver.observe(container);
    const timeout = window.setTimeout(() => map.invalidateSize(), 250);

    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(timeout);
    };
  }, [map]);

  return null;
}

function BoundaryLayer({ isDark }: { isDark: boolean }) {
  const map = useMap();
  const [countryData, setCountryData] = useState<GeoJSON.GeoJsonObject | null>(
    null
  );

  useEffect(() => {
    const controller = new AbortController();

    fetch("/country.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Country boundary could not be loaded");
        }

        return response.json() as Promise<GeoJSON.GeoJsonObject>;
      })
      .then(setCountryData)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error(error);
      });

    return () => controller.abort();
  }, []);

  const handleBoundaryReady = useCallback(
    (layer: L.GeoJSON) => {
      const bounds = layer.getBounds();

      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          animate: true,
          maxZoom: 8,
          padding: [30, 30],
        });
        window.requestAnimationFrame(() => map.invalidateSize());
      }
    },
    [map]
  );

  if (!countryData) {
    return null;
  }

  return (
    <GeoJSON
      key={isDark ? "dark-boundary" : "light-boundary"}
      data={countryData}
      eventHandlers={{ add: (event) => handleBoundaryReady(event.target) }}
      style={{
        color: isDark ? "#67e8f9" : "#0369a1",
        fillColor: isDark ? "#0e7490" : "#38bdf8",
        fillOpacity: isDark ? 0.1 : 0.08,
        opacity: 0.95,
        weight: 2.25,
      }}
    />
  );
}

function DistrictBoundaryLayer({
  isDark,
  viewMode,
  selectedDistrictCode,
  onDistrictOptionsChange,
}: {
  isDark: boolean;
  viewMode: BoundaryViewMode;
  selectedDistrictCode: string | null;
  onDistrictOptionsChange: (districts: DistrictOption[]) => void;
}) {
  const map = useMap();
  const districtLayerRef = useRef<L.GeoJSON | null>(null);
  const [districtData, setDistrictData] =
    useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    if (viewMode !== "district" || districtData) {
      return;
    }

    const controller = new AbortController();

    fetch("/districts.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("District boundary could not be loaded");
        }

        return response.json() as Promise<GeoJSON.FeatureCollection>;
      })
      .then((data) => {
        setDistrictData(data);
        onDistrictOptionsChange(getDistrictOptions(data));
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error(error);
      });

    return () => controller.abort();
  }, [districtData, onDistrictOptionsChange, viewMode]);

  useEffect(() => {
    if (viewMode !== "district") {
      return;
    }

    if (!selectedDistrictCode) {
      map.fitBounds(bangladeshBounds, {
        animate: true,
        maxZoom: 8,
        padding: [30, 30],
      });
      return;
    }

    districtLayerRef.current?.eachLayer((layer) => {
      const feature = (layer as L.Layer & { feature?: GeoJSON.Feature }).feature;
      const districtCode = getDistrictCode(feature);

      if (districtCode === selectedDistrictCode && "getBounds" in layer) {
        const bounds = (layer as L.Polygon).getBounds();

        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            animate: true,
            duration: 0.85,
            maxZoom: 10,
            padding: [54, 54],
          });
        }
      }
    });
  }, [map, selectedDistrictCode, viewMode]);

  useEffect(() => {
    districtLayerRef.current?.setStyle((feature) =>
      districtStyle(feature, getDistrictCode(feature) === selectedDistrictCode, isDark)
    );
  }, [isDark, selectedDistrictCode]);

  if (viewMode !== "district" || !districtData) {
    return null;
  }

  return (
    <GeoJSON
      ref={districtLayerRef}
      key={isDark ? "districts-dark" : "districts-light"}
      data={districtData}
      style={(feature) =>
        districtStyle(feature, getDistrictCode(feature) === selectedDistrictCode, isDark)
      }
    />
  );
}

function getDistrictOptions(data: GeoJSON.FeatureCollection): DistrictOption[] {
  return data.features
    .map((feature) => ({
      code: getDistrictCode(feature),
      name: getDistrictName(feature),
      division: getDistrictDivision(feature),
    }))
    .filter((district) => district.code && district.name)
    .sort((first, second) => first.name.localeCompare(second.name));
}

function getDistrictCode(feature?: GeoJSON.Feature | null) {
  const properties = getDistrictProperties(feature);

  return String(
    properties.adm2_pcode ??
      properties.ADM2_PCODE ??
      properties.district_code ??
      properties.code ??
      ""
  );
}

function getDistrictName(feature?: GeoJSON.Feature | null) {
  const properties = getDistrictProperties(feature);

  return String(
    properties.adm2_en ??
      properties.ADM2_EN ??
      properties.ADMIN2NAME_EN ??
      properties.name_en ??
      properties.name ??
      ""
  );
}

function getDistrictDivision(feature?: GeoJSON.Feature | null) {
  const properties = getDistrictProperties(feature);

  return String(
    properties.adm1_en ??
      properties.ADM1_EN ??
      properties.division ??
      properties.division_en ??
      ""
  );
}

function getDistrictProperties(feature?: GeoJSON.Feature | null) {
  return (feature?.properties ?? {}) as Record<string, unknown>;
}

function districtStyle(
  feature: GeoJSON.Feature | undefined,
  isActive: boolean,
  isDark: boolean
): L.PathOptions {
  return {
    color: isActive ? "#dc2626" : isDark ? "#38bdf8" : "#2563eb",
    dashArray: isActive ? undefined : "3 4",
    fillColor: isActive ? "#ef4444" : isDark ? "#0ea5e9" : "#3b82f6",
    fillOpacity: isActive ? 0.24 : isDark ? 0.055 : 0.045,
    lineCap: "round",
    lineJoin: "round",
    opacity: isActive ? 0.98 : 0.54,
    weight: isActive ? 2.6 : 0.8,
  };
}

function CustomZoomControl() {
  const map = useMap();

  return (
    <div className="absolute right-3 top-24 z-[1000] flex flex-col gap-2 sm:right-5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            className="size-10 rounded-lg border border-white/35 bg-white/85 text-slate-900 shadow-lg backdrop-blur hover:bg-white dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
            onClick={() => map.zoomIn()}
            aria-label={landingCopy.zoomIn}
          >
            <Plus className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">{landingCopy.zoomIn}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            className="size-10 rounded-lg border border-white/35 bg-white/85 text-slate-900 shadow-lg backdrop-blur hover:bg-white dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
            onClick={() => map.zoomOut()}
            aria-label={landingCopy.zoomOut}
          >
            <Minus className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">{landingCopy.zoomOut}</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            className="size-10 rounded-lg border border-white/35 bg-white/85 text-slate-900 shadow-lg backdrop-blur hover:bg-white dark:border-white/10 dark:bg-slate-950/80 dark:text-white"
            onClick={() => map.flyToBounds(bangladeshBounds, { duration: 0.8 })}
            aria-label={landingCopy.boundary}
          >
            <LocateFixed className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">{landingCopy.boundary}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function StationTooltip({
  station,
  activeLayer,
  markerType,
}: {
  station: WeatherStation;
  activeLayer?: WeatherLayer;
  markerType: WeatherMarkerType;
}) {
  const activeMetric = getStationMetric(station, activeLayer);

  return (
    <div
      className={cn(
        "w-72 rounded-lg border p-3 text-slate-900 shadow-2xl backdrop-blur-xl dark:text-white",
        "border-white/60 bg-white/90 dark:border-white/10 dark:bg-slate-950/88"
      )}
      style={
        {
          "--tooltip-accent": activeLayer?.accent ?? "#0284c7",
        } as CSSProperties
      }
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-950 dark:text-white">
            {station.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {landingCopy.coordinates}: {station.latitude.toFixed(3)},{" "}
            {station.longitude.toFixed(3)}
          </div>
        </div>
        <span
          className="rounded-md px-2 py-1 text-xs font-semibold text-white shadow-sm"
          style={{ backgroundColor: activeLayer?.accent ?? "#0f172a" }}
        >
          {activeLayer?.shortLabel ?? "OBS"}
        </span>
      </div>
      <div
        className="mb-3 rounded-lg border px-3 py-2"
        style={{
          borderColor: "color-mix(in srgb, var(--tooltip-accent) 38%, transparent)",
          background: "color-mix(in srgb, var(--tooltip-accent) 10%, white)",
        }}
      >
        <div className="text-[10px] font-semibold uppercase text-slate-500 dark:text-slate-400">
          {activeLayer?.kind === "forecast"
            ? landingCopy.forecastOverlay
            : activeLayer?.label ?? landingCopy.stationNetwork}
        </div>
        <div className="mt-0.5 flex items-end gap-2">
          <span className="text-2xl font-bold leading-none text-slate-950 dark:text-white">
            {activeMetric.value}
          </span>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            {activeMetric.unit}
          </span>
          <span className="ml-auto text-xs font-medium capitalize text-slate-500 dark:text-slate-400">
            {markerType.replace(/([A-Z])/g, " $1")}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <Metric label={landingCopy.maxTemperature} value={`${station.maxTemperature}°C`} />
        <Metric label={landingCopy.minTemperature} value={`${station.minTemperature}°C`} />
        <Metric label={landingCopy.relativeHumidity} value={`${station.humidity}%`} />
        <Metric label={landingCopy.pressure} value={`${station.pressure} hPa`} />
        <Metric label={landingCopy.windSpeed} value={`${station.windSpeed} kt`} />
        <Metric label={landingCopy.windDirection} value={`${station.windDirection}°`} />
        <Metric label={landingCopy.rainfall} value={`${station.rainfall} mm`} />
        <Metric
          label={landingCopy.solarRadiation}
          value={`${station.solarRadiation} W/m²`}
        />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-100 px-2 py-1.5 dark:bg-white/10">
      <div className="truncate text-[10px] uppercase text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function getStationMetric(station: WeatherStation, activeLayer?: WeatherLayer) {
  if (!activeLayer || activeLayer.kind === "forecast") {
    return {
      value: activeLayer?.kind === "forecast" ? activeLayer.shortLabel : "Online",
      unit: activeLayer?.kind === "forecast" ? activeLayer.label : "station",
    };
  }

  switch (activeLayer.key) {
    case "temperature":
      return { value: Math.round(station.temperature), unit: activeLayer.unit };
    case "wind":
      return { value: Math.round(station.windSpeed), unit: activeLayer.unit };
    case "humidity":
      return { value: Math.round(station.humidity), unit: activeLayer.unit };
    case "pressure":
      return { value: Math.round(station.pressure), unit: activeLayer.unit };
    case "dewPoint":
      return { value: Math.round(station.dewPoint), unit: activeLayer.unit };
    case "solarRadiation":
      return { value: Math.round(station.solarRadiation), unit: activeLayer.unit };
    default:
      return { value: "Online", unit: "station" };
  }
}

function getMarkerLabel(
  station: WeatherStation,
  markerType: WeatherMarkerType,
  activeLayer?: WeatherLayer
) {
  const metric = getStationMetric(station, activeLayer);

  return `${station.name}, ${activeLayer?.label ?? "station"}, ${metric.value} ${metric.unit}`;
}

function ZoomWatcher({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

function StationMarkers({
  activeLayer,
  zoom,
}: {
  activeLayer?: WeatherLayer;
  zoom: number;
}) {
  const [hoveredStationId, setHoveredStationId] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const markerType = useMemo(
    () => getWeatherMarkerTypeFromLayer(activeLayer?.key, activeLayer?.kind),
    [activeLayer]
  );
  const icons = useMemo(
    () =>
      new Map(
        bangladeshStations.map((station) => {
          const metric = getStationMetric(station, activeLayer);
          const selected = selectedStationId === station.id;
          const hovered = hoveredStationId === station.id;

          return [
            station.id,
            createWeatherMarkerIcon({
              type: markerType,
              value: metric.value,
              unit: metric.unit,
              direction: station.windDirection,
              selected,
              hovered,
              zoom,
              label: getMarkerLabel(station, markerType, activeLayer),
            }),
          ];
        })
      ),
    [activeLayer, hoveredStationId, markerType, selectedStationId, zoom]
  );
  const tooltipOffset = getZoomMode(zoom) === "compact" ? -12 : -20;

  return (
    <>
      {bangladeshStations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
          icon={icons.get(station.id)}
          zIndexOffset={
            selectedStationId === station.id
              ? 1200
              : hoveredStationId === station.id
                ? 900
                : activeLayer?.kind === "forecast"
                  ? 120
                  : 420
          }
          eventHandlers={{
            click: (event) => {
              setSelectedStationId((current) =>
                current === station.id ? null : station.id
              );
              event.target.openTooltip();
            },
            mouseover: (event) => {
              setHoveredStationId(station.id);
              event.target.openTooltip();
            },
            mouseout: (event) => {
              setHoveredStationId((current) =>
                current === station.id ? null : current
              );
              if (selectedStationId !== station.id) {
                event.target.closeTooltip();
              }
            },
          }}
        >
          <LeafletTooltip
            direction="top"
            offset={[0, tooltipOffset]}
            opacity={1}
            className="bd-weather-tooltip"
            sticky
          >
            <StationTooltip
              station={station}
              activeLayer={activeLayer}
              markerType={markerType}
            />
          </LeafletTooltip>
        </Marker>
      ))}
    </>
  );
}

function ForecastOverlay({
  activeLayer,
  opacity,
  timelineIndex,
}: {
  activeLayer?: WeatherLayer;
  opacity: number;
  timelineIndex: number;
}) {
  if (!activeLayer || activeLayer.kind !== "forecast") {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-[650] overflow-hidden mix-blend-multiply transition-opacity duration-300 dark:mix-blend-screen",
        `forecast-${activeLayer.key}`
      )}
      style={
        {
          "--overlay-opacity": opacity / 100,
          "--timeline-shift": `${timelineIndex * 16}px`,
          opacity: opacity / 100,
        } as CSSProperties
      }
    >
      <div className="forecast-gradient" />
      <div className="forecast-streams" />
      <div className="forecast-contours" />
    </div>
  );
}

function LayerButton({
  layer,
  activeLayerKey,
  onChange,
  compact = false,
}: {
  layer: WeatherLayer;
  activeLayerKey: WeatherLayerKey | null;
  onChange: (layerKey: WeatherLayerKey) => void;
  compact?: boolean;
}) {
  const Icon = layer.icon;
  const isActive = activeLayerKey === layer.key;

  return (
    <button
      type="button"
      className={cn(
        "group flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
        isActive
          ? "border-transparent bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950"
          : "border-slate-200 bg-white/72 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-white/10 dark:bg-slate-950/58 dark:text-slate-200 dark:hover:bg-slate-900",
        compact && "justify-center px-2"
      )}
      onClick={() => onChange(layer.key)}
      title={layer.label}
    >
      <span
        className="grid size-7 shrink-0 place-items-center rounded-md text-white"
        style={{ backgroundColor: layer.accent }}
      >
        <Icon className="size-3.5" />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate font-medium">{layer.label}</span>
          <span className="block text-xs opacity-70">{layer.unit}</span>
        </span>
      )}
    </button>
  );
}

function LayerGroup({
  title,
  layers,
  activeLayerKey,
  onChange,
}: {
  title: string;
  layers: WeatherLayer[];
  activeLayerKey: WeatherLayerKey | null;
  onChange: (layerKey: WeatherLayerKey) => void;
}) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-2">
        {layers.map((layer) => (
          <LayerButton
            key={layer.key}
            layer={layer}
            activeLayerKey={activeLayerKey}
            onChange={onChange}
          />
        ))}
      </div>
    </section>
  );
}

function LayerDrawer({
  isOpen,
  isRtl,
  activeLayerKey,
  activeLayer,
  opacity,
  onLayerChange,
  onOpacityChange,
  onOpenChange,
}: {
  isOpen: boolean;
  isRtl: boolean;
  activeLayerKey: WeatherLayerKey | null;
  activeLayer?: WeatherLayer;
  opacity: number;
  onLayerChange: (layerKey: WeatherLayerKey) => void;
  onOpacityChange: (value: number) => void;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const closedX = isRtl ? 306 : -306;

  return (
    <motion.aside
      drag="x"
      dragElastic={0.08}
      dragMomentum={false}
      dragConstraints={{ left: -306, right: 306 }}
      onDragEnd={(_, info) => {
        if (isRtl) {
          onOpenChange(info.offset.x < -45 || isOpen);
          if (info.offset.x > 45) onOpenChange(false);
          return;
        }

        onOpenChange(info.offset.x > 45 || isOpen);
        if (info.offset.x < -45) onOpenChange(false);
      }}
      animate={{ x: isOpen ? 0 : closedX }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className={cn(
        "absolute top-4 z-[900] h-[calc(100%-7.75rem)] w-[292px] overflow-hidden rounded-lg border border-white/35 bg-white/82 shadow-2xl shadow-slate-950/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78 sm:w-[306px]",
        isRtl ? "right-4" : "left-4"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-white/10">
          <div>
            <div className="text-sm font-semibold">{landingCopy.layerSelection}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {activeLayer?.label ?? landingCopy.fallbackLayer}
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 rounded-md"
            onClick={() => onOpenChange(false)}
            aria-label={landingCopy.closeDrawer}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <LayerGroup
            title={landingCopy.stationParameters}
            layers={stationLayers}
            activeLayerKey={activeLayerKey}
            onChange={onLayerChange}
          />
          <LayerGroup
            title={landingCopy.forecastLayers}
            layers={forecastLayers}
            activeLayerKey={activeLayerKey}
            onChange={onLayerChange}
          />
        </div>

        <div className="border-t border-slate-200/70 p-4 dark:border-white/10">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">{landingCopy.opacity}</span>
            <span className="text-slate-500 dark:text-slate-400">{opacity}%</span>
          </div>
          <Slider
            value={[opacity]}
            min={20}
            max={100}
            step={5}
            onValueChange={(value) => onOpacityChange(value[0])}
          />
        </div>
      </div>
    </motion.aside>
  );
}

function RoleStatus() {
  const { data: session, status } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const label =
    role === "root_admin" || role === "super_admin"
      ? landingCopy.superAdmin
      : role === "station_admin"
        ? landingCopy.stationAdmin
        : role === "observer"
          ? landingCopy.observer
          : landingCopy.guest;
  const description =
    role === "root_admin" || role === "super_admin"
      ? landingCopy.allStations
      : role === "station_admin" || role === "observer"
        ? landingCopy.assignedStation
        : landingCopy.noStations;

  return (
    <div className="absolute right-3 top-[8.5rem] z-[850] max-w-[calc(100%-6rem)] rounded-lg border border-white/35 bg-white/82 px-3 py-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78 sm:right-5 lg:top-[6.5rem]">
      <div className="flex items-center gap-2">
        <RadioTower className="size-4 text-cyan-500" />
        <div>
          <div className="text-sm font-semibold">
            {status === "loading" ? "..." : label}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineController({
  timelineIndex,
  isPlaying,
  speed,
  onTimelineChange,
  onPlayingChange,
  onSpeedChange,
}: {
  timelineIndex: number;
  isPlaying: boolean;
  speed: 1 | 2;
  onTimelineChange: (index: number) => void;
  onPlayingChange: (isPlaying: boolean) => void;
  onSpeedChange: (speed: 1 | 2) => void;
}) {
  const step = timelineSteps[timelineIndex];

  return (
    <div className="absolute inset-x-3 bottom-4 z-[850] rounded-lg border border-white/40 bg-white/84 p-3 shadow-2xl shadow-slate-950/15 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/78 sm:inset-x-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 rounded-md"
            onClick={() => onTimelineChange(0)}
            aria-label="First frame"
          >
            <Rewind className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 rounded-md"
            onClick={() => onTimelineChange(Math.max(0, timelineIndex - 1))}
            aria-label="Previous frame"
          >
            <SkipBack className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            className="size-9 rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950"
            onClick={() => onPlayingChange(!isPlaying)}
            aria-label={isPlaying ? "Pause timeline" : "Play timeline"}
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8 rounded-md"
            onClick={() =>
              onTimelineChange(Math.min(timelineSteps.length - 1, timelineIndex + 1))
            }
            aria-label="Next frame"
          >
            <SkipForward className="size-4" />
          </Button>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-[auto_1fr_auto] items-center gap-3">
          <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-400 sm:block">
            {timelineSteps[0].label}
          </span>
          <Slider
            value={[timelineIndex]}
            min={0}
            max={timelineSteps.length - 1}
            step={1}
            onValueChange={(value) => onTimelineChange(value[0])}
          />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {timelineSteps[timelineSteps.length - 1].label}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 lg:w-80">
          <div className="min-w-0">
            <div className="text-xs uppercase text-slate-500 dark:text-slate-400">
              {landingCopy.timeline}
            </div>
            <div className="truncate text-sm font-semibold">
              {step.label} · {new Date(step.iso).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-white/10 dark:bg-white/10">
            {[1, 2].map((item) => (
              <button
                key={item}
                type="button"
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-semibold transition",
                  speed === item
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
                    : "text-slate-500 dark:text-slate-300"
                )}
                onClick={() => onSpeedChange(item as 1 | 2)}
              >
                {item}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileDrawerHandle({
  isOpen,
  isRtl,
  onClick,
}: {
  isOpen: boolean;
  isRtl: boolean;
  onClick: () => void;
}) {
  const Icon = isRtl
    ? isOpen
      ? ChevronsRight
      : ChevronsLeft
    : isOpen
      ? ChevronsLeft
      : ChevronsRight;

  return (
    <Button
      type="button"
      size="icon"
      className={cn(
        "absolute top-1/2 z-[920] size-10 -translate-y-1/2 rounded-lg border border-white/35 bg-white/86 text-slate-900 shadow-xl backdrop-blur hover:bg-white dark:border-white/10 dark:bg-slate-950/82 dark:text-white",
        isRtl ? "right-3" : "left-3"
      )}
      onClick={onClick}
      aria-label={isOpen ? landingCopy.closeDrawer : landingCopy.openDrawer}
    >
      <Icon className="size-4" />
    </Button>
  );
}

export default function WeatherMapClient({ isDark }: WeatherMapClientProps) {
  const [activeLayerKey, setActiveLayerKey] =
    useState<WeatherLayerKey | null>("temperatureForecast");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [overlayOpacity, setOverlayOpacity] = useState(72);
  const [isRtl, setIsRtl] = useState(false);
  const [mapZoom, setMapZoom] = useState(7);
  const [boundaryViewMode, setBoundaryViewMode] =
    useState<BoundaryViewMode>("country");
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | null>(
    null
  );
  const [districtOptions, setDistrictOptions] = useState<DistrictOption[]>([]);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsRtl(document.documentElement.dir === "rtl");
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimelineIndex((current) => (current + 1) % timelineSteps.length);
    }, speed === 2 ? 900 : 1600);

    return () => window.clearInterval(interval);
  }, [isPlaying, speed]);

  const activeLayer = useMemo(
    () => weatherLayers.find((layer) => layer.key === activeLayerKey),
    [activeLayerKey]
  );

  const handleLayerChange = useCallback((layerKey: WeatherLayerKey) => {
    setActiveLayerKey((current) => (current === layerKey ? null : layerKey));
  }, []);
  const handleParameterToggle = useCallback((layerKey: string, isEnabled: boolean) => {
    setActiveLayerKey((current) => {
      if (!isEnabled && current === layerKey) {
        return null;
      }

      if (isEnabled) {
        return layerKey as WeatherLayerKey;
      }

      return current;
    });
  }, []);
  const handleForecastToggle = useCallback(
    (layerKey: ForecastLayerId, isEnabled: boolean) => {
      setActiveLayerKey((current) => {
        if (!isEnabled && current === layerKey) {
          return null;
        }

        if (isEnabled) {
          return layerKey;
        }

        return current;
      });
    },
    []
  );
  const handleZoomChange = useCallback((zoom: number) => {
    setMapZoom(zoom);
  }, []);
  const handleDistrictOptionsChange = useCallback((districts: DistrictOption[]) => {
    setDistrictOptions(districts);
  }, []);
  const handleResetBoundary = useCallback(() => {
    setBoundaryViewMode("country");
    setSelectedDistrictCode(null);
    mapRef.current?.flyToBounds(bangladeshBounds, {
      animate: true,
      duration: 0.75,
      maxZoom: 8,
      padding: [30, 30],
    });
  }, []);

  const enabled = useMemo<EnabledMap>(
    () => ({
      temperature: activeLayerKey === "temperature",
      wind: activeLayerKey === "wind",
      humidity: activeLayerKey === "humidity",
      pressure: activeLayerKey === "pressure",
      dewPoint: activeLayerKey === "dewPoint",
      solarRadiation: activeLayerKey === "solarRadiation",
      temperatureForecast: activeLayerKey === "temperatureForecast",
      humidityForecast: activeLayerKey === "humidityForecast",
      windForecast: activeLayerKey === "windForecast",
      pressureIsolines: activeLayerKey === "pressureIsolines",
      meanSeaLevelPressure: activeLayerKey === "meanSeaLevelPressure",
      geopotential: activeLayerKey === "geopotential",
      dewPointForecast: activeLayerKey === "dewPointForecast",
      lowCloud: activeLayerKey === "lowCloud",
      totalCloud: activeLayerKey === "totalCloud",
    }),
    [activeLayerKey]
  );

  const enabledForecast = useMemo<Record<ForecastLayerId, boolean>>(
    () => ({
      temperatureForecast: enabled.temperatureForecast,
      humidityForecast: enabled.humidityForecast,
      windForecast: enabled.windForecast,
      pressureIsolines: enabled.pressureIsolines,
      meanSeaLevelPressure: enabled.meanSeaLevelPressure,
      geopotential: enabled.geopotential,
      dewPointForecast: enabled.dewPointForecast,
      lowCloud: enabled.lowCloud,
      totalCloud: enabled.totalCloud,
    }),
    [enabled]
  );

  useEffect(() => {
    if (boundaryViewMode !== "country") {
      return;
    }

    mapRef.current?.flyToBounds(bangladeshBounds, {
      animate: true,
      duration: 0.75,
      maxZoom: 8,
      padding: [30, 30],
    });
  }, [boundaryViewMode]);

  return (
    <section className="relative h-[calc(100vh-4rem)] min-h-[640px] overflow-hidden bg-slate-100 dark:bg-slate-950">
      <div className="absolute inset-0">
        <MapContainer
          center={[23.685, 90.3563]}
          zoom={7}
          minZoom={6}
          maxZoom={12}
          maxBounds={bangladeshBounds}
          maxBoundsViscosity={1}
          scrollWheelZoom
          doubleClickZoom
          worldCopyJump={false}
          zoomControl={false}
          className="h-full w-full"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url={isDark ? mapTiles.dark : mapTiles.light}
          />
          <BoundaryLayer isDark={isDark} />
          <DistrictBoundaryLayer
            isDark={isDark}
            viewMode={boundaryViewMode}
            selectedDistrictCode={selectedDistrictCode}
            onDistrictOptionsChange={handleDistrictOptionsChange}
          />
          <StationMarkers activeLayer={activeLayer} zoom={mapZoom} />
          <CustomZoomControl />
          <ResizeInvalidator />
          <ZoomWatcher onZoomChange={handleZoomChange} />
        </MapContainer>
      </div>

      <ForecastOverlay
        activeLayer={activeLayer}
        opacity={overlayOpacity}
        timelineIndex={timelineIndex}
      />
      <CombinedMapToolbar
        viewMode={boundaryViewMode}
        selectedDistrictId={selectedDistrictCode}
        districts={districtOptions}
        onViewModeChange={(viewMode) => {
          setBoundaryViewMode(viewMode);
          if (viewMode === "country") {
            handleResetBoundary();
          }
        }}
        onDistrictChange={(districtCode) => {
          setBoundaryViewMode("district");
          setSelectedDistrictCode(districtCode);
        }}
        onReset={handleResetBoundary}
        enabled={enabled}
        enabledForecast={enabledForecast}
        onParameterToggle={handleParameterToggle}
        onForecastToggle={handleForecastToggle}
        onLayerDrawerOpen={() => setIsDrawerOpen(true)}
      />
      <RoleStatus />
      <LayerDrawer
        isOpen={isDrawerOpen}
        isRtl={isRtl}
        activeLayerKey={activeLayerKey}
        activeLayer={activeLayer}
        opacity={overlayOpacity}
        onLayerChange={handleLayerChange}
        onOpacityChange={setOverlayOpacity}
        onOpenChange={setIsDrawerOpen}
      />
      <MobileDrawerHandle
        isOpen={isDrawerOpen}
        isRtl={isRtl}
        onClick={() => setIsDrawerOpen((value) => !value)}
      />
      <TimelineController
        timelineIndex={timelineIndex}
        isPlaying={isPlaying}
        speed={speed}
        onTimelineChange={setTimelineIndex}
        onPlayingChange={setIsPlaying}
        onSpeedChange={setSpeed}
      />

      <div className="pointer-events-none absolute left-[20.75rem] top-[6.5rem] z-[840] hidden rounded-lg border border-white/35 bg-white/78 px-3 py-2 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 lg:block">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {activeLayer?.kind === "forecast" ? (
            <Wind className="size-4 text-cyan-500" />
          ) : (
            <Gauge className="size-4 text-cyan-500" />
          )}
          {activeLayer?.label ?? landingCopy.fallbackLayer}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {activeLayer?.kind === "forecast"
            ? landingCopy.forecastOverlay
            : landingCopy.stationNetwork}
        </div>
      </div>

      <style jsx global>{`
        .leaflet-container {
          background: #dbeafe;
          font-family: inherit;
        }

        .leaflet-control-attribution {
          border-radius: 6px 0 0 0;
          background: rgba(255, 255, 255, 0.78);
          font-size: 10px;
        }

        .dark .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.78);
          color: rgba(255, 255, 255, 0.76);
        }

        .bd-weather-marker-shell {
          background: transparent;
          border: 0;
        }

        .bd-weather-marker {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border: 2px solid rgba(255, 255, 255, 0.82);
          background: rgba(255, 255, 255, 0.86);
          color: white;
          box-shadow:
            0 12px 24px rgba(15, 23, 42, 0.22),
            inset 0 1px 0 rgba(255, 255, 255, 0.42);
          backdrop-filter: blur(10px);
          transform: translate3d(0, 0, 0);
          transition:
            filter 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
          white-space: nowrap;
        }

        .bd-weather-marker svg {
          width: 14px;
          height: 14px;
          flex: 0 0 auto;
        }

        .bd-weather-marker.is-hovered {
          box-shadow:
            0 18px 34px rgba(15, 23, 42, 0.32),
            0 0 0 4px color-mix(in srgb, var(--marker-accent) 18%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.48);
          filter: saturate(1.08);
          transform: scale(1.08);
        }

        .bd-weather-marker.is-selected {
          box-shadow:
            0 20px 38px rgba(15, 23, 42, 0.36),
            0 0 0 5px rgba(255, 255, 255, 0.72),
            0 0 0 9px color-mix(in srgb, var(--marker-accent) 32%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.5);
          transform: scale(1.12);
        }

        .bd-weather-marker.is-selected::after {
          position: absolute;
          inset: -8px;
          border: 1px solid color-mix(in srgb, var(--marker-accent) 45%, transparent);
          border-radius: inherit;
          content: "";
          animation: weather-marker-pulse 2.4s ease-out infinite;
        }

        .bd-weather-marker-station {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.94);
          color: #0284c7;
          border-color: #0ea5e9;
        }

        .bd-weather-marker-station::before,
        .bd-weather-marker-forecast::before {
          position: absolute;
          inset: -5px;
          border: 1px solid color-mix(in srgb, var(--marker-accent) 35%, transparent);
          border-radius: inherit;
          content: "";
          animation: weather-marker-pulse 2.7s ease-out infinite;
        }

        .bd-marker-station-core {
          display: grid;
          width: 14px;
          height: 14px;
          place-items: center;
        }

        .bd-weather-marker-temperature {
          min-width: 54px;
          height: 38px;
          padding: 0 9px;
          border-radius: 999px;
          background: linear-gradient(135deg, #ef4444, #f97316);
        }

        .bd-weather-marker-wind {
          min-width: 56px;
          height: 40px;
          padding: 0 10px;
          border-radius: 12px 999px 999px 12px;
          background: linear-gradient(135deg, #0f766e, #06b6d4);
        }

        .bd-weather-marker-humidity {
          min-width: 54px;
          height: 38px;
          padding: 0 9px;
          border-radius: 999px 999px 14px 999px;
          background: linear-gradient(135deg, #1d4ed8, #38bdf8);
        }

        .bd-weather-marker-pressure {
          width: 46px;
          height: 46px;
          flex-direction: column;
          gap: 0;
          border-radius: 999px;
          background:
            radial-gradient(circle at center, rgba(255, 255, 255, 0.18) 0 36%, transparent 37%),
            conic-gradient(from 35deg, #6d28d9, #a855f7, #4f46e5, #6d28d9);
        }

        .bd-weather-marker-dewpoint {
          min-width: 58px;
          height: 38px;
          padding: 0 9px;
          border-radius: 15px 999px 999px 15px;
          background: linear-gradient(135deg, #0891b2, #2dd4bf);
        }

        .bd-weather-marker-solar {
          min-width: 62px;
          height: 38px;
          padding: 0 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, #f59e0b, #eab308);
          color: #111827;
          border-color: rgba(255, 255, 255, 0.9);
        }

        .bd-weather-marker-forecast {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.64);
          color: #334155;
          border-color: rgba(71, 85, 105, 0.42);
          opacity: 0.78;
          box-shadow:
            0 8px 18px rgba(15, 23, 42, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }

        .bd-marker-value,
        .bd-marker-pressure-value {
          font-size: 13px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: 0;
        }

        .bd-marker-pressure-value {
          font-size: 12px;
        }

        .bd-marker-unit {
          font-size: 8.5px;
          font-weight: 700;
          line-height: 1;
          opacity: 0.9;
        }

        .bd-marker-icon {
          display: grid;
          width: 15px;
          height: 15px;
          place-items: center;
          color: currentColor;
        }

        .bd-marker-wind-arrow {
          display: inline-grid;
          width: 17px;
          height: 17px;
          place-items: center;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.2);
          font-size: 15px;
          font-weight: 800;
          line-height: 1;
          transform-origin: center;
        }

        .bd-marker-sun-icon {
          color: #111827;
        }

        .bd-weather-marker.is-compact {
          gap: 2px;
        }

        .bd-weather-marker.is-compact .bd-marker-icon {
          display: none;
        }

        .bd-weather-marker.is-compact .bd-marker-unit {
          display: none;
        }

        .bd-weather-marker-temperature.is-compact,
        .bd-weather-marker-humidity.is-compact,
        .bd-weather-marker-dewpoint.is-compact {
          min-width: 42px;
          height: 34px;
          padding: 0 8px;
        }

        .bd-weather-marker-wind.is-compact {
          min-width: 44px;
          height: 36px;
          padding: 0 8px;
        }

        .bd-weather-marker-pressure.is-compact {
          width: 40px;
          height: 40px;
        }

        .bd-weather-marker-solar.is-compact {
          min-width: 46px;
          height: 34px;
          padding: 0 8px;
        }

        .bd-weather-marker.is-detailed .bd-marker-value,
        .bd-weather-marker.is-detailed .bd-marker-pressure-value {
          font-size: 14px;
        }

        .bd-weather-marker.is-detailed .bd-marker-unit {
          font-size: 9.5px;
        }

        .dark .bd-weather-marker-forecast {
          background: rgba(15, 23, 42, 0.58);
          color: #cbd5e1;
          border-color: rgba(203, 213, 225, 0.38);
        }

        .bd-weather-tooltip {
          border: 0;
          border-radius: 8px;
          padding: 0;
          background: transparent;
          box-shadow: none;
        }

        .bd-weather-tooltip::before {
          display: none;
        }

        .forecast-gradient,
        .forecast-streams,
        .forecast-contours {
          position: absolute;
          inset: -18%;
          transform: translate3d(var(--timeline-shift), 0, 0);
          will-change: transform, opacity;
        }

        .forecast-gradient {
          background:
            radial-gradient(circle at 18% 30%, rgba(239, 68, 68, 0.5), transparent 30%),
            radial-gradient(circle at 72% 24%, rgba(14, 165, 233, 0.42), transparent 28%),
            radial-gradient(circle at 52% 78%, rgba(34, 197, 94, 0.34), transparent 34%),
            linear-gradient(130deg, rgba(245, 158, 11, 0.24), rgba(59, 130, 246, 0.22));
          filter: saturate(1.25);
          animation: forecast-drift 14s linear infinite;
        }

        .forecast-streams {
          background-image:
            repeating-linear-gradient(
              112deg,
              transparent 0 28px,
              rgba(255, 255, 255, 0.34) 30px 32px,
              transparent 34px 64px
            );
          opacity: 0.48;
          animation: forecast-stream 9s linear infinite;
        }

        .forecast-contours {
          background-image:
            repeating-radial-gradient(
              ellipse at 54% 46%,
              rgba(15, 23, 42, 0.22) 0 1px,
              transparent 2px 28px
            );
          opacity: 0.36;
          animation: forecast-contour 18s linear infinite;
        }

        .forecast-windForecast .forecast-gradient,
        .forecast-windForecast .forecast-streams {
          filter: hue-rotate(95deg) saturate(1.35);
        }

        .forecast-humidityForecast .forecast-gradient,
        .forecast-lowCloud .forecast-gradient,
        .forecast-totalCloud .forecast-gradient {
          filter: hue-rotate(165deg) saturate(1.15);
        }

        .forecast-pressureIsolines .forecast-contours,
        .forecast-meanSeaLevelPressure .forecast-contours,
        .forecast-geopotential .forecast-contours {
          opacity: 0.7;
        }

        @keyframes weather-marker-pulse {
          0% {
            opacity: 0.5;
            transform: scale(0.86);
          }
          100% {
            opacity: 0;
            transform: scale(1.48);
          }
        }

        @keyframes forecast-drift {
          from {
            transform: translate3d(calc(var(--timeline-shift) - 4%), -2%, 0) scale(1);
          }
          to {
            transform: translate3d(calc(var(--timeline-shift) + 4%), 2%, 0) scale(1.04);
          }
        }

        @keyframes forecast-stream {
          from {
            transform: translate3d(calc(var(--timeline-shift) - 8%), -6%, 0);
          }
          to {
            transform: translate3d(calc(var(--timeline-shift) + 8%), 6%, 0);
          }
        }

        @keyframes forecast-contour {
          from {
            transform: translate3d(var(--timeline-shift), 0, 0) rotate(0deg);
          }
          to {
            transform: translate3d(var(--timeline-shift), 0, 0) rotate(4deg);
          }
        }
      `}</style>
    </section>
  );
}
