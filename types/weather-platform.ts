import type { LucideIcon } from "lucide-react";

export type WeatherLayerKind = "station" | "forecast";

export type WeatherLayerKey =
  | "temperature"
  | "wind"
  | "humidity"
  | "pressure"
  | "dewPoint"
  | "solarRadiation"
  | "temperatureForecast"
  | "humidityForecast"
  | "windForecast"
  | "pressureIsolines"
  | "meanSeaLevelPressure"
  | "geopotential"
  | "dewPointForecast"
  | "lowCloud"
  | "totalCloud";

export type WeatherLayer = {
  key: WeatherLayerKey;
  label: string;
  shortLabel: string;
  kind: WeatherLayerKind;
  unit: string;
  accent: string;
  icon: LucideIcon;
};

export type WeatherStation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  maxTemperature: number;
  minTemperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  solarRadiation: number;
  rainfall: number;
  dewPoint: number;
};

export type TimelineStep = {
  label: string;
  iso: string;
};
