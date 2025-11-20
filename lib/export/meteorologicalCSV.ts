import type {
  MeteorologicalEntry,
  ObservingTimeEntry,
} from "@/types/meteorological";
import { formatUtcDate, utcToHour } from "@/lib/utils/table-utils";
import type { ExportResult } from "./types";

export interface CsvExportOptions {
  startDate: string;
  endDate: string;
  observingTimes: ObservingTimeEntry[];
  flattenedData: MeteorologicalEntry[];
}

const CSV_HEADERS = [
  "Time (GMT)",
  "Indicator",
  "Date",
  "Station Name & ID",
  "Station Name",
  "Attached Thermometer (°C)",
  "Bar As Read (hPa)",
  "Corrected for Index",
  "Height Difference Correction (hPa)",
  "Station Level Pressure (QFE)",
  "Sea Level Reduction",
  "Sea Level Pressure (QNH)",
  "Afternoon Reading",
  "24-Hour Pressure Change",
  "Dry Bulb As Read (°C)",
  "Wet Bulb As Read (°C)",
  "MAX/MIN Temp As Read (°C)",
  "Dry Bulb Corrected (°C)",
  "Wet Bulb Corrected (°C)",
  "MAX/MIN Temp Corrected (°C)",
  "Dew Point Temperature (°C)",
  "Relative Humidity (%)",
  "Squall Force (KTS)",
  "Squall Direction (°)",
  "Squall Time",
  "Horizontal Visibility (km)",
  "Misc Meteors (Code)",
  "Past Weather (W1)",
  "Past Weather (W2)",
  "Present Weather (ww)",
  "C2 Indicator",
];

export const exportToCSV = ({
  startDate,
  endDate,
  observingTimes,
  flattenedData,
}: CsvExportOptions): ExportResult => {
  const observingTimeMap = new Map(
    observingTimes.map((ot) => [ot.id, ot] as const)
  );

  const rows = flattenedData.map((record) => {
    const observingTime = observingTimeMap.get(record.observingTimeId);
    const stationLabel = observingTime
      ? `${observingTime.station?.name ?? "--"} ${
          observingTime.station?.stationId ?? "--"
        }`
      : "--";

    return [
      utcToHour(observingTime?.utcTime || ""),
      record.subIndicator || "--",
      observingTime?.utcTime ? formatUtcDate(observingTime.utcTime) : "--",
      stationLabel,
      observingTime?.station?.name || "--",
      record.alteredThermometer || "--",
      record.barAsRead || "--",
      record.correctedForIndex || "--",
      record.heightDifference || "--",
      record.stationLevelPressure || "--",
      record.seaLevelReduction || "--",
      record.correctedSeaLevelPressure || "--",
      record.afternoonReading || "--",
      record.pressureChange24h || "--",
      record.dryBulbAsRead || "--",
      record.wetBulbAsRead || "--",
      record.maxMinTempAsRead || "--",
      record.dryBulbCorrected || "--",
      record.wetBulbCorrected || "--",
      record.maxMinTempCorrected || "--",
      record.Td || "--",
      record.relativeHumidity || "--",
      record.squallForce || "--",
      record.squallDirection || "--",
      record.squallTime || "--",
      record.horizontalVisibility || "--",
      record.miscMeteors || "--",
      record.pastWeatherW1 || "--",
      record.pastWeatherW2 || "--",
      record.presentWeatherWW || "--",
      record.c2Indicator || "--",
    ];
  });

  const csvContent = [CSV_HEADERS, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");

  return {
    filename: `meteorological_data_${startDate}_to_${endDate}.csv`,
    mime: "text/csv;charset=utf-8;",
    content: csvContent,
  };
};

