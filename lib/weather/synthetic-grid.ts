import type {
  ForecastAnimationLayer,
  WeatherBounds,
  WeatherGrid,
} from "@/lib/weather/grid-types";
import { REGIONAL_WEATHER_BOUNDS } from "@/lib/weather/grid-types";

const gridSize = {
  width: 96,
  height: 128,
};

export function createSyntheticWeatherFrames(
  layerKey: ForecastAnimationLayer,
  timestamps: string[],
  bounds: WeatherBounds = REGIONAL_WEATHER_BOUNDS
) {
  return timestamps.map((timestamp, index) =>
    createSyntheticWeatherGrid(layerKey, index, timestamp, bounds)
  );
}

export function createSyntheticWeatherGrid(
  layerKey: ForecastAnimationLayer,
  frameIndex: number,
  timestamp: string,
  bounds: WeatherBounds = REGIONAL_WEATHER_BOUNDS
): WeatherGrid {
  const { width, height } = gridSize;
  const total = width * height;
  const u = new Float32Array(total);
  const v = new Float32Array(total);
  const scalar = new Float32Array(total);
  const phase = frameIndex * 0.42;

  for (let y = 0; y < height; y += 1) {
    const latRatio = y / (height - 1);
    const lat = bounds.north - latRatio * (bounds.north - bounds.south);

    for (let x = 0; x < width; x += 1) {
      const lngRatio = x / (width - 1);
      const lng = bounds.west + lngRatio * (bounds.east - bounds.west);
      const index = y * width + x;
      const normalized = normalize(lng, lat, bounds);
      const flow = syntheticWind(normalized.x, normalized.y, phase);

      u[index] = flow.u;
      v[index] = flow.v;
      scalar[index] = syntheticScalar(layerKey, normalized.x, normalized.y, phase);
    }
  }

  return {
    width,
    height,
    bounds,
    u,
    v,
    scalar,
    timestamp,
  };
}

function syntheticWind(x: number, y: number, phase: number) {
  const monsoonU = 10 + 5 * Math.sin(y * Math.PI + phase * 0.5);
  const monsoonV = 13 + 4 * Math.cos(x * Math.PI * 1.2 - phase * 0.35);
  const vortexA = vortex(x, y, 0.32 + 0.06 * Math.sin(phase), 0.72, 9);
  const vortexB = vortex(x, y, 0.78, 0.36 + 0.08 * Math.cos(phase * 0.8), -7);
  const terrainShear = 4 * Math.sin((x + y) * Math.PI * 2.2 + phase);

  return {
    u: monsoonU + vortexA.u + vortexB.u + terrainShear,
    v: monsoonV + vortexA.v + vortexB.v - terrainShear * 0.55,
  };
}

function syntheticScalar(
  layerKey: ForecastAnimationLayer,
  x: number,
  y: number,
  phase: number
) {
  const waveA = Math.sin((x * 2.4 + y * 1.2) * Math.PI + phase);
  const waveB = Math.cos((x * 0.9 - y * 2.1) * Math.PI - phase * 0.7);
  const coastal = 1 - y;
  const northeastMoisture = gaussian(x, y, 0.78, 0.3, 0.22);
  const centralHeat = gaussian(x, y, 0.52, 0.56, 0.28);

  switch (layerKey) {
    case "temperatureForecast":
      return 27 + coastal * 3.8 + centralHeat * 4.5 + waveA * 1.8 + waveB * 0.9;
    case "humidityForecast":
      return clamp(54 + coastal * 24 + northeastMoisture * 26 + waveB * 10, 0, 100);
    case "meanSeaLevelPressure":
    case "pressureIsolines":
      return 1008 + (x - 0.5) * 8 - coastal * 4 + waveA * 3 + waveB * 1.8;
    case "geopotential":
      return 578 + y * 16 + waveA * 5 + waveB * 3;
    case "dewPointForecast":
      return 20 + coastal * 5 + northeastMoisture * 4 + waveB * 1.6;
    case "lowCloud":
      return clamp(18 + coastal * 42 + northeastMoisture * 30 + waveA * 16, 0, 100);
    case "totalCloud":
      return clamp(28 + coastal * 36 + northeastMoisture * 36 + waveA * 18, 0, 100);
    case "windForecast":
      return 0;
  }
}

function normalize(lng: number, lat: number, bounds: WeatherBounds) {
  return {
    x: (lng - bounds.west) / (bounds.east - bounds.west),
    y: (bounds.north - lat) / (bounds.north - bounds.south),
  };
}

function vortex(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  strength: number
) {
  const dx = x - centerX;
  const dy = y - centerY;
  const radius = Math.max(0.045, dx * dx + dy * dy);
  const falloff = Math.exp(-radius * 9);

  return {
    u: (-dy / radius) * strength * falloff,
    v: (dx / radius) * strength * falloff,
  };
}

function gaussian(
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  radius: number
) {
  const dx = x - centerX;
  const dy = y - centerY;
  return Math.exp(-(dx * dx + dy * dy) / (radius * radius));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
