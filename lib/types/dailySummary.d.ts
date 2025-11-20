import type { Station } from "./station";

export interface DailyObservingTimeMeta {
  utcTime?: string;
  stationId?: string;
  station?: Station;
  userId?: string;
}

export interface DailySummaryRecord {
  id: string;
  dataType?: string | null;
  ObservingTime?: DailyObservingTimeMeta;
  createdAt?: string;
  avStationPressure?: string | number | null;
  avSeaLevelPressure?: string | number | null;
  avDryBulbTemperature?: string | number | null;
  avWetBulbTemperature?: string | number | null;
  maxTemperature?: string | number | null;
  minTemperature?: string | number | null;
  totalPrecipitation?: string | number | null;
  avDewPointTemperature?: string | number | null;
  avRelativeHumidity?: string | number | null;
  windSpeed?: string | number | null;
  windDirectionCode?: string | number | null;
  maxWindSpeed?: string | number | null;
  maxWindDirection?: string | number | null;
  avTotalCloud?: string | number | null;
  lowestVisibility?: string | number | null;
  totalRainDuration?: string | number | null;
}

export interface DailySummaryHeaderInfo {
  dataType: string;
  stationNo: string;
  year: string;
  month: string;
  day: string;
}

export interface DailySummaryUser {
  id: string;
  role: string;
  station?: {
    id?: string;
    stationId?: string;
  };
}

export type DailySummaryEditableField =
  | "avStationPressure"
  | "avSeaLevelPressure"
  | "avDryBulbTemperature"
  | "avWetBulbTemperature"
  | "maxTemperature"
  | "minTemperature"
  | "totalPrecipitation"
  | "avDewPointTemperature"
  | "avRelativeHumidity"
  | "windSpeed"
  | "windDirectionCode"
  | "maxWindSpeed"
  | "maxWindDirection"
  | "avTotalCloud"
  | "lowestVisibility"
  | "totalRainDuration";

export type DailySummaryFormData = Partial<
  Record<DailySummaryEditableField, string>
>;

export interface DailySummaryFieldConfig {
  id: DailySummaryEditableField;
  label: string;
  length: number;
  bgClass: string;
}
