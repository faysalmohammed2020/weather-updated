import type { WeatherLayerKey } from "@/types/weather-platform";

export type WeatherBounds = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type WeatherGrid = {
  width: number;
  height: number;
  bounds: WeatherBounds;
  u: Float32Array;
  v: Float32Array;
  scalar?: Float32Array;
  timestamp: string;
};

export type AnimationQuality = "low" | "medium" | "high";

export type WeatherClipMode = "regional" | "bangladesh";

export type ForecastAnimationLayer = Extract<
  WeatherLayerKey,
  | "temperatureForecast"
  | "humidityForecast"
  | "windForecast"
  | "pressureIsolines"
  | "meanSeaLevelPressure"
  | "geopotential"
  | "dewPointForecast"
  | "lowCloud"
  | "totalCloud"
>;

export const BANGLADESH_WEATHER_BOUNDS: WeatherBounds = {
  west: 88.0,
  south: 20.3,
  east: 92.7,
  north: 26.7,
};

export const REGIONAL_WEATHER_BOUNDS: WeatherBounds = {
  west: 84.5,
  south: 17.0,
  east: 96.5,
  north: 29.5,
};

export function isForecastAnimationLayer(
  layerKey: WeatherLayerKey
): layerKey is ForecastAnimationLayer {
  return (
    layerKey === "temperatureForecast" ||
    layerKey === "humidityForecast" ||
    layerKey === "windForecast" ||
    layerKey === "pressureIsolines" ||
    layerKey === "meanSeaLevelPressure" ||
    layerKey === "geopotential" ||
    layerKey === "dewPointForecast" ||
    layerKey === "lowCloud" ||
    layerKey === "totalCloud"
  );
}
