"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMap } from "react-leaflet";
import type L from "leaflet";
import type { WeatherLayer } from "@/types/weather-platform";
import { useAdaptiveQuality } from "@/hooks/useAdaptiveQuality";
import {
  colorForLayer,
  colorForWindSpeed,
  colorTupleForLayer,
  colorTupleForWindSpeed,
} from "@/lib/weather/color-scales";
import { buildPressureContours } from "@/lib/weather/contour-engine";
import type {
  ForecastAnimationLayer,
  WeatherGrid,
} from "@/lib/weather/grid-types";
import { isForecastAnimationLayer } from "@/lib/weather/grid-types";
import {
  interpolateScalar,
  interpolateWind,
} from "@/lib/weather/interpolate-grid";
import { WindParticleEngine } from "@/lib/weather/particle-engine";
import { createSyntheticWeatherFrames } from "@/lib/weather/synthetic-grid";
import {
  getInterpolatedWeatherFrame,
  interpolateGridAtIndex,
  interpolateValue,
} from "@/lib/weather/timeline-interpolation";

type WeatherCanvasLayerProps = {
  activeLayer?: WeatherLayer;
  opacity: number;
  timelineIndex: number;
  isPlaying: boolean;
  speed: 1 | 2;
  timestamps: string[];
  isDark: boolean;
};

type Project = (lat: number, lng: number) => { x: number; y: number };
type Unproject = (x: number, y: number) => { lat: number; lng: number };

const pressureLevels = [996, 1000, 1004, 1008, 1012, 1016, 1020];
const rasterBufferCache = new WeakMap<
  HTMLCanvasElement,
  { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D }
>();

export default function WeatherCanvasLayer({
  activeLayer,
  opacity,
  timelineIndex,
  isPlaying,
  speed,
  timestamps,
  isDark,
}: WeatherCanvasLayerProps) {
  const map = useMap();
  const { quality, reducedMotion } = useAdaptiveQuality();
  const rasterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const segmentStartRef = useRef(0);
  const lastTimelineIndexRef = useRef(timelineIndex);
  const isMapMovingRef = useRef(false);
  const particleEngineRef = useRef(new WindParticleEngine());
  const layerKey =
    activeLayer && isForecastAnimationLayer(activeLayer.key)
      ? activeLayer.key
      : null;
  const frames = useMemo(
    () =>
      layerKey
        ? createSyntheticWeatherFrames(
            layerKey,
            timestamps.length ? timestamps : [new Date().toISOString()]
          )
        : [],
    [layerKey, timestamps]
  );

  useEffect(() => {
    particleEngineRef.current.setQuality(quality, reducedMotion);
  }, [quality, reducedMotion]);

  useEffect(() => {
    const rasterPane = ensurePane(map, "weatherRasterPane", 390);
    const particlePane = ensurePane(map, "weatherParticlePane", 395);
    const rasterCanvas = document.createElement("canvas");
    const particleCanvas = document.createElement("canvas");

    configureCanvas(rasterCanvas);
    configureCanvas(particleCanvas);
    rasterPane.appendChild(rasterCanvas);
    particlePane.appendChild(particleCanvas);
    rasterCanvasRef.current = rasterCanvas;
    particleCanvasRef.current = particleCanvas;

    const handleMoving = () => {
      isMapMovingRef.current = true;
      resizeCanvases(map, rasterCanvas, particleCanvas, quality);
    };
    const handleSettled = () => {
      isMapMovingRef.current = false;
      resizeCanvases(map, rasterCanvas, particleCanvas, quality);
    };

    resizeCanvases(map, rasterCanvas, particleCanvas, quality);
    map.on("move zoom resize", handleMoving);
    map.on("moveend zoomend", handleSettled);

    return () => {
      map.off("move zoom resize", handleMoving);
      map.off("moveend zoomend", handleSettled);
      rasterCanvas.remove();
      particleCanvas.remove();
      rasterCanvasRef.current = null;
      particleCanvasRef.current = null;
    };
  }, [map, quality]);

  useEffect(() => {
    if (lastTimelineIndexRef.current !== timelineIndex) {
      lastTimelineIndexRef.current = timelineIndex;
      segmentStartRef.current = performance.now();
    }
  }, [timelineIndex]);

  useEffect(() => {
    const rasterCanvas = rasterCanvasRef.current;
    const particleCanvas = particleCanvasRef.current;

    if (!rasterCanvas || !particleCanvas || !layerKey || frames.length === 0) {
      clearCanvas(rasterCanvas);
      clearCanvas(particleCanvas);
      return;
    }

    segmentStartRef.current = performance.now();
    particleEngineRef.current.reset(frames[0]);

    const render = (now: number) => {
      const frameProgress = isPlaying
        ? Math.min(1, (now - segmentStartRef.current) / (speed === 2 ? 900 : 1600))
        : 0;
      const frame = getInterpolatedWeatherFrame(
        frames,
        timelineIndex,
        frameProgress
      );

      if (frame) {
        const geometry = syncCanvasGeometry(map, rasterCanvas, particleCanvas, quality);
        const project: Project = (lat, lng) => {
          const point = map.latLngToLayerPoint([lat, lng]);
          return {
            x: point.x - geometry.topLeft.x,
            y: point.y - geometry.topLeft.y,
          };
        };
        const unproject: Unproject = (x, y) => {
          const latLng = map.layerPointToLatLng([
            geometry.topLeft.x + x,
            geometry.topLeft.y + y,
          ]);

          return {
            lat: latLng.lat,
            lng: latLng.lng,
          };
        };
        const rasterContext = rasterCanvas.getContext("2d");
        const particleContext = particleCanvas.getContext("2d");
        const normalizedOpacity = opacity / 100;

        if (rasterContext && particleContext) {
          drawRasterLayer(
            rasterContext,
            project,
            unproject,
            layerKey,
            frame.current,
            frame.next,
            frame.progress,
            normalizedOpacity,
            isDark,
            reducedMotion,
            quality
          );

          if (layerKey === "windForecast") {
            particleEngineRef.current.draw(
              particleContext,
              project,
              frame,
              Math.max(0.65, normalizedOpacity),
              isMapMovingRef.current
            );
          } else {
            fadeCanvas(particleContext, 0.72);
          }

          if (
            layerKey === "pressureIsolines" ||
            layerKey === "meanSeaLevelPressure" ||
            layerKey === "geopotential"
          ) {
            drawContours(
              rasterContext,
              project,
              frame.current,
              frame.next,
              frame.progress,
              layerKey
            );
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    frames,
    isDark,
    isPlaying,
    layerKey,
    map,
    opacity,
    quality,
    reducedMotion,
    speed,
    timelineIndex,
  ]);

  return null;
}

function ensurePane(map: L.Map, name: string, zIndex: number) {
  const pane = map.getPane(name) ?? map.createPane(name);
  pane.style.zIndex = String(zIndex);
  pane.style.pointerEvents = "none";
  return pane;
}

function configureCanvas(canvas: HTMLCanvasElement) {
  canvas.className = "bd-weather-canvas";
  canvas.style.position = "absolute";
  canvas.style.left = "0";
  canvas.style.top = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.mixBlendMode = "normal";
}

function syncCanvasGeometry(
  map: L.Map,
  rasterCanvas: HTMLCanvasElement,
  particleCanvas: HTMLCanvasElement,
  quality: "low" | "medium" | "high"
) {
  const size = map.getSize();
  const topLeft = map.containerPointToLayerPoint([0, 0]);
  const dpr = getDpr(quality);

  for (const canvas of [rasterCanvas, particleCanvas]) {
    const targetWidth = Math.max(1, Math.floor(size.x * dpr));
    const targetHeight = Math.max(1, Math.floor(size.y * dpr));

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;
    }

    canvas.style.transform = `translate3d(${topLeft.x}px, ${topLeft.y}px, 0)`;
    const context = canvas.getContext("2d");
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return { size, topLeft, dpr };
}

function resizeCanvases(
  map: L.Map,
  rasterCanvas: HTMLCanvasElement,
  particleCanvas: HTMLCanvasElement,
  quality: "low" | "medium" | "high"
) {
  syncCanvasGeometry(map, rasterCanvas, particleCanvas, quality);
}

function drawRasterLayer(
  context: CanvasRenderingContext2D,
  project: Project,
  unproject: Unproject,
  layerKey: ForecastAnimationLayer,
  current: WeatherGrid,
  next: WeatherGrid,
  progress: number,
  opacity: number,
  isDark: boolean,
  reducedMotion: boolean,
  quality: "low" | "medium" | "high"
) {
  clearCanvas(context.canvas);

  if (layerKey === "windForecast") {
    drawSmoothSurface(
      context,
      unproject,
      layerKey,
      current,
      next,
      progress,
      Math.min(0.32, opacity * 0.38),
      isDark,
      reducedMotion,
      quality
    );
    return;
  }

  drawSmoothSurface(
    context,
    unproject,
    layerKey,
    current,
    next,
    progress,
    opacityForLayer(layerKey, opacity),
    isDark,
    reducedMotion,
    quality
  );
}

function drawSmoothSurface(
  context: CanvasRenderingContext2D,
  unproject: Unproject,
  layerKey: ForecastAnimationLayer,
  current: WeatherGrid,
  next: WeatherGrid,
  progress: number,
  opacity: number,
  isDark: boolean,
  reducedMotion: boolean,
  quality: "low" | "medium" | "high"
) {
  const cssWidth =
    Number.parseFloat(context.canvas.style.width) ||
    context.canvas.width / (window.devicePixelRatio || 1);
  const cssHeight =
    Number.parseFloat(context.canvas.style.height) ||
    context.canvas.height / (window.devicePixelRatio || 1);
  const scale = reducedMotion
    ? 0.24
    : quality === "high"
      ? 0.52
      : quality === "medium"
        ? 0.38
        : 0.28;
  const width = Math.max(96, Math.min(620, Math.round(cssWidth * scale)));
  const height = Math.max(96, Math.min(520, Math.round(cssHeight * scale)));
  const buffer = getRasterBuffer(context.canvas, width, height);
  const image = buffer.context.createImageData(width, height);
  const data = image.data;

  for (let y = 0; y < height; y += 1) {
    const screenY = ((y + 0.5) / height) * cssHeight;

    for (let x = 0; x < width; x += 1) {
      const screenX = ((x + 0.5) / width) * cssWidth;
      const { lat, lng } = unproject(screenX, screenY);
      const color =
        layerKey === "windForecast"
          ? windColorAt(lng, lat, current, next, progress)
          : scalarColorAt(layerKey, lng, lat, current, next, progress);
      const pixelIndex = (y * width + x) * 4;

      if (!color) {
        data[pixelIndex + 3] = 0;
        continue;
      }

      const edgeFade = boundsFeather(lng, lat, current);
      const cloudAlpha =
        layerKey === "lowCloud" || layerKey === "totalCloud"
          ? color.alpha * 0.82
          : color.alpha;

      data[pixelIndex] = color.r;
      data[pixelIndex + 1] = color.g;
      data[pixelIndex + 2] = color.b;
      data[pixelIndex + 3] = Math.round(255 * opacity * cloudAlpha * edgeFade);
    }
  }

  buffer.context.putImageData(image, 0, 0);
  context.save();
  context.globalAlpha = 1;
  context.globalCompositeOperation = isDark ? "screen" : "multiply";
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.filter =
    layerKey === "lowCloud" || layerKey === "totalCloud"
      ? "blur(10px) saturate(0.95)"
      : "blur(6px) saturate(1.08)";
  context.drawImage(buffer.canvas, -3, -3, cssWidth + 6, cssHeight + 6);
  context.restore();
}

function scalarColorAt(
  layerKey: ForecastAnimationLayer,
  lng: number,
  lat: number,
  current: WeatherGrid,
  next: WeatherGrid,
  progress: number
) {
  const currentValue = interpolateScalar(lng, lat, current);
  const nextValue = interpolateScalar(lng, lat, next);

  if (currentValue === null || nextValue === null) {
    return null;
  }

  const value = interpolateValue(currentValue, nextValue, progress);
  const [r, g, b] = colorTupleForLayer(layerKey, value);
  const alpha =
    layerKey === "lowCloud" || layerKey === "totalCloud"
      ? Math.min(1, Math.max(0.15, value / 100))
      : 1;

  return { r, g, b, alpha };
}

function windColorAt(
  lng: number,
  lat: number,
  current: WeatherGrid,
  next: WeatherGrid,
  progress: number
) {
  const currentWind = interpolateWind(lng, lat, current);
  const nextWind = interpolateWind(lng, lat, next);

  if (!currentWind || !nextWind) {
    return null;
  }

  const u = interpolateValue(currentWind.u, nextWind.u, progress);
  const v = interpolateValue(currentWind.v, nextWind.v, progress);
  const speed = Math.hypot(u, v);
  const [r, g, b] = colorTupleForWindSpeed(speed);

  return { r, g, b, alpha: 0.85 };
}

function boundsFeather(lng: number, lat: number, grid: WeatherGrid) {
  const { bounds } = grid;
  const x = (lng - bounds.west) / (bounds.east - bounds.west);
  const y = (lat - bounds.south) / (bounds.north - bounds.south);

  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return 0;
  }

  const edgeDistance = Math.min(x, 1 - x, y, 1 - y);
  return smoothstep(0, 0.08, edgeDistance);
}

function smoothstep(min: number, max: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

function getRasterBuffer(
  owner: HTMLCanvasElement,
  width: number,
  height: number
) {
  const existing = rasterBufferCache.get(owner);

  if (
    existing &&
    existing.canvas.width === width &&
    existing.canvas.height === height
  ) {
    return existing;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Raster buffer context could not be created");
  }

  const buffer = { canvas, context };
  rasterBufferCache.set(owner, buffer);

  return buffer;
}

function drawWindSpeedWash(
  context: CanvasRenderingContext2D,
  project: Project,
  current: WeatherGrid,
  next: WeatherGrid,
  progress: number,
  opacity: number
) {
  const step = 4;
  const bounds = current.bounds;

  context.globalAlpha = Math.min(0.32, opacity * 0.38);
  context.globalCompositeOperation = "multiply";

  for (let y = 0; y < current.height - step; y += step) {
    for (let x = 0; x < current.width - step; x += step) {
      const index = y * current.width + x;
      const value = interpolateGridAtIndex(current, next, index, progress);
      const speed = Math.hypot(value.u, value.v);
      const lng = bounds.west + (x / (current.width - 1)) * (bounds.east - bounds.west);
      const lat = bounds.north - (y / (current.height - 1)) * (bounds.north - bounds.south);
      const nextLng =
        bounds.west +
        ((x + step) / (current.width - 1)) * (bounds.east - bounds.west);
      const nextLat =
        bounds.north -
        ((y + step) / (current.height - 1)) * (bounds.north - bounds.south);
      const start = project(lat, lng);
      const end = project(nextLat, nextLng);

      context.fillStyle = colorForWindSpeed(speed, 1);
      context.fillRect(
        start.x,
        start.y,
        Math.max(2, Math.abs(end.x - start.x) + 2),
        Math.max(2, Math.abs(end.y - start.y) + 2)
      );
    }
  }

  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
}

function drawContours(
  context: CanvasRenderingContext2D,
  project: Project,
  current: WeatherGrid,
  next: WeatherGrid,
  progress: number,
  layerKey: ForecastAnimationLayer
) {
  const segments = buildPressureContours(current, next, progress, pressureLevels);
  const bounds = current.bounds;
  const gridToLatLng = (x: number, y: number) => ({
    lng: bounds.west + (x / (current.width - 1)) * (bounds.east - bounds.west),
    lat: bounds.north - (y / (current.height - 1)) * (bounds.north - bounds.south),
  });

  context.save();
  context.globalAlpha = layerKey === "pressureIsolines" ? 0.95 : 0.62;
  context.lineWidth = layerKey === "pressureIsolines" ? 1.35 : 0.9;
  context.strokeStyle = layerKey === "geopotential" ? "#facc15" : "#0f172a";
  context.fillStyle = layerKey === "geopotential" ? "#854d0e" : "#0f172a";
  context.font = "600 10px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";

  segments.forEach((segment, index) => {
    const startLatLng = gridToLatLng(segment.start.x, segment.start.y);
    const endLatLng = gridToLatLng(segment.end.x, segment.end.y);
    const start = project(startLatLng.lat, startLatLng.lng);
    const end = project(endLatLng.lat, endLatLng.lng);

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();

    if (index % 34 === 0) {
      const labelX = (start.x + end.x) / 2;
      const labelY = (start.y + end.y) / 2;
      context.save();
      context.globalAlpha = 0.78;
      context.fillStyle = "rgba(255, 255, 255, 0.78)";
      context.fillRect(labelX - 16, labelY - 7, 32, 14);
      context.restore();
      context.fillText(`${segment.level}`, labelX, labelY);
    }
  });

  context.restore();
}

function opacityForLayer(layerKey: ForecastAnimationLayer, opacity: number) {
  if (layerKey === "lowCloud" || layerKey === "totalCloud") {
    return Math.min(0.72, Math.max(0.18, opacity * 0.76));
  }

  if (layerKey === "temperatureForecast") {
    return Math.min(0.64, Math.max(0.34, opacity * 0.68));
  }

  if (layerKey === "pressureIsolines") {
    return Math.min(0.38, Math.max(0.12, opacity * 0.34));
  }

  return Math.min(0.66, Math.max(0.28, opacity * 0.62));
}

function fadeCanvas(context: CanvasRenderingContext2D, alpha: number) {
  context.globalCompositeOperation = "destination-in";
  context.fillStyle = `rgba(0, 0, 0, ${alpha})`;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  context.globalCompositeOperation = "source-over";
}

function clearCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) {
    return;
  }

  const context = canvas.getContext("2d");
  context?.clearRect(0, 0, canvas.width, canvas.height);
}

function getDpr(quality: "low" | "medium" | "high") {
  const dpr = window.devicePixelRatio || 1;

  if (quality === "low") {
    return Math.min(1, dpr);
  }

  if (quality === "medium") {
    return Math.min(1.5, dpr);
  }

  return Math.min(2, dpr);
}
