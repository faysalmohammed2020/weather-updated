import type { ExportResult } from "@/lib/export/types";
import type { WeatherObservationRecord } from "@/types/weather-observation";
import { utcToHour } from "@/lib/utils/utcToHour";
import { formatCl17RainfallAmount } from "@/lib/utils/rainfall-format";

export interface WeatherCsvExportOptions {
  startDate: string;
  endDate: string;
  records: WeatherObservationRecord[];
}

const CSV_HEADERS = [
  "Time (GMT)",
  "Station Name & ID",
  "Total Cloud Amount",
  "Low Cloud Direction",
  "Low Cloud Height",
  "Low Cloud Form",
  "Low Cloud Amount",
  "Medium Cloud Direction",
  "Medium Cloud Height",
  "Medium Cloud Form",
  "Medium Cloud Amount",
  "High Cloud Direction",
  "High Cloud Height",
  "High Cloud Form",
  "High Cloud Amount",
  "Layer1 Height",
  "Layer1 Form",
  "Layer1 Amount",
  "Layer2 Height",
  "Layer2 Form",
  "Layer2 Amount",
  "Layer3 Height",
  "Layer3 Form",
  "Layer3 Amount",
  "Layer4 Height",
  "Layer4 Form",
  "Layer4 Amount",
  "Rainfall Start Time",
  "Rainfall End Time",
  "Since Previous",
  "During Previous",
  "Last 24 Hours",
  "Wind First Anemometer",
  "Wind Second Anemometer",
  "Wind Speed",
  "Wind Direction",
  "Observer Initial",
];

const formatStation = (record: WeatherObservationRecord) => {
  const station = record.station;
  if (!station) return "--";
  const parts = [station.name, station.stationId].filter(Boolean);
  return parts.join(" ");
};

const valueOrDash = (value?: string | null) => value || "--";

export const exportWeatherCsv = ({
  startDate,
  endDate,
  records,
}: WeatherCsvExportOptions): ExportResult => {
  const rows = records.map((record) => {
    const obs = record.WeatherObservation[0] || ({} as Record<string, string | null>);
    return [
      utcToHour(record.utcTime),
      formatStation(record),
      valueOrDash(obs.totalCloudAmount),
      valueOrDash(obs.lowCloudDirection),
      valueOrDash(obs.lowCloudHeight),
      valueOrDash(obs.lowCloudForm),
      valueOrDash(obs.lowCloudAmount),
      valueOrDash(obs.mediumCloudDirection),
      valueOrDash(obs.mediumCloudHeight),
      valueOrDash(obs.mediumCloudForm),
      valueOrDash(obs.mediumCloudAmount),
      valueOrDash(obs.highCloudDirection),
      valueOrDash(obs.highCloudHeight),
      valueOrDash(obs.highCloudForm),
      valueOrDash(obs.highCloudAmount),
      valueOrDash(obs.layer1Height),
      valueOrDash(obs.layer1Form),
      valueOrDash(obs.layer1Amount),
      valueOrDash(obs.layer2Height),
      valueOrDash(obs.layer2Form),
      valueOrDash(obs.layer2Amount),
      valueOrDash(obs.layer3Height),
      valueOrDash(obs.layer3Form),
      valueOrDash(obs.layer3Amount),
      valueOrDash(obs.layer4Height),
      valueOrDash(obs.layer4Form),
      valueOrDash(obs.layer4Amount),
      valueOrDash(obs.rainfallTimeStart),
      valueOrDash(obs.rainfallTimeEnd),
      valueOrDash(obs.rainfallSincePrevious),
      valueOrDash(obs.rainfallDuringPrevious),
      formatCl17RainfallAmount(obs.rainfallLast24Hours),
      valueOrDash(obs.windFirstAnemometer),
      valueOrDash(obs.windSecondAnemometer),
      valueOrDash(obs.windSpeed),
      valueOrDash(obs.windDirection),
      valueOrDash(obs.observerInitial),
    ];
  });

  const csvContent = [CSV_HEADERS, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  return {
    filename: `weather_observation_${startDate}_to_${endDate}.csv`,
    mime: "text/csv;charset=utf-8;",
    content: csvContent,
  };
};
