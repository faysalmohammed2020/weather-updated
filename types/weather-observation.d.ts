import type { Station } from "./station";

export interface RainfallTimeSlot {
  id: string;
  timeStart: string;
  timeEnd: string;
}

export interface WeatherObservation {
  id: string;
  observingTimeId: string;
  cardIndicator: string | null;
  tabActive: string | null;
  observerInitial: string | null;
  lowCloudForm: string | null;
  lowCloudHeight: string | null;
  lowCloudAmount: string | null;
  lowCloudDirection: string | null;
  mediumCloudForm: string | null;
  mediumCloudHeight: string | null;
  mediumCloudAmount: string | null;
  mediumCloudDirection: string | null;
  highCloudForm: string | null;
  highCloudHeight: string | null;
  highCloudAmount: string | null;
  highCloudDirection: string | null;
  totalCloudAmount: string | null;
  layer1Form: string | null;
  layer1Height: string | null;
  layer1Amount: string | null;
  layer2Form: string | null;
  layer2Height: string | null;
  layer2Amount: string | null;
  layer3Form: string | null;
  layer3Height: string | null;
  layer3Amount: string | null;
  layer4Form: string | null;
  layer4Height: string | null;
  layer4Amount: string | null;
  rainfallTimeStart: string | null;
  rainfallTimeEnd: string | null;
  rainfallTimeSlots: RainfallTimeSlot[] | null;
  rainfallSincePrevious: string | null;
  rainfallDuringPrevious: string | null;
  rainfallLast24Hours: string | null;
  rainfallType: string | null;
  isIntermittentRain: boolean | null;
  windFirstAnemometer: string | null;
  windSecondAnemometer: string | null;
  windSpeed: string | null;
  windDirection: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: string | number | boolean | null | RainfallTimeSlot[] | undefined;
}

export interface WeatherObservationRecord {
  id: string;
  userId: string;
  stationId: string;
  utcTime: string;
  localTime: string;
  createdAt: string;
  updatedAt: string;
  station: Station | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
  WeatherObservation: WeatherObservation[];
}

export interface WeatherObservationApiResponse {
  data: WeatherObservationRecord[];
}

export interface FlattenedWeatherObservation extends WeatherObservation {
  stationId: string;
  stationName: string;
  utcTime: string;
  localTime: string;
}
