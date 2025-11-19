import type { Station } from "./station";

export interface MeteorologicalEntry {
  id: string;
  observingTimeId: string;
  stationId?: string;
  stationCode?: string;
  dataType: string;
  subIndicator: string;
  alteredThermometer: string;
  barAsRead: string;
  correctedForIndex: string;
  heightDifference: string;
  correctionForTemp: string;
  stationLevelPressure: string;
  seaLevelReduction: string;
  correctedSeaLevelPressure: string;
  afternoonReading: string;
  pressureChange24h: string;
  dryBulbAsRead: string;
  wetBulbAsRead: string;
  maxMinTempAsRead: string;
  dryBulbCorrected: string;
  wetBulbCorrected: string;
  maxMinTempCorrected: string;
  Td: string;
  relativeHumidity: string;
  squallConfirmed: string;
  squallForce: string;
  squallDirection: string;
  squallTime: string;
  horizontalVisibility: string;
  miscMeteors: string;
  pastWeatherW1: string;
  pastWeatherW2: string;
  presentWeatherWW: string;
  c2Indicator: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  ObservingTime?: {
    stationId: string;
    userId: string;
    utcTime: string;
    station: Station;
  };
}

export interface ObservingTimeEntry {
  id: string;
  userId: string;
  stationId: string;
  utcTime: string;
  localTime: string;
  createdAt: string;
  updatedAt: string;
  station: Station;
  MeteorologicalEntry: MeteorologicalEntry[];
}

