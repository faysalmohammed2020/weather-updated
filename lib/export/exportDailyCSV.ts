import { triggerDownload } from "@/lib/export/download";
import type {
  DailySummaryHeaderInfo,
  DailySummaryRecord,
} from "@/lib/types/dailySummary";

const CSV_HEADERS =
  "Date (UTC),Station,Av Station Pressure,Av Sea-Level Pressure,Av Dry-Bulb Temperature,Av Wet-Bulb Temperature,Max Temperature,Min Temperature,Total Precipitation,Av Dew Point Temperature,Av Relative Humidity,Wind Speed,Wind Direction,Max Wind Speed,Max Wind Direction,Av Total Cloud,Lowest Visibility,Total Rain Duration\n";

const escapeValue = (value: unknown) => {
  const stringValue = value ?? "";
  const normalized = typeof stringValue === "string" ? stringValue : `${stringValue}`;
  return /[",\n]/.test(normalized)
    ? `"${normalized.replace(/"/g, '""')}"`
    : normalized;
};

export const exportDailySummaryCSV = (
  records: DailySummaryRecord[],
  headerInfo: DailySummaryHeaderInfo
): boolean => {
  if (!records?.length) {
    return false;
  }

  let csvContent = CSV_HEADERS;

  records.forEach((entry) => {
    const observingTime = entry.ObservingTime?.utcTime
      ? new Date(entry.ObservingTime.utcTime)
      : undefined;
    const dateStr = observingTime
      ? observingTime.toISOString().split("T")[0]
      : "";

    const row = [
      dateStr,
      escapeValue(entry.ObservingTime?.station?.name ?? ""),
      escapeValue(entry.avStationPressure ?? ""),
      escapeValue(entry.avSeaLevelPressure ?? ""),
      escapeValue(entry.avDryBulbTemperature ?? ""),
      escapeValue(entry.avWetBulbTemperature ?? ""),
      escapeValue(entry.maxTemperature ?? ""),
      escapeValue(entry.minTemperature ?? ""),
      escapeValue(entry.totalPrecipitation ?? ""),
      escapeValue(entry.avDewPointTemperature ?? ""),
      escapeValue(entry.avRelativeHumidity ?? ""),
      escapeValue(entry.windSpeed ?? ""),
      escapeValue(entry.windDirectionCode ?? ""),
      escapeValue(entry.maxWindSpeed ?? ""),
      escapeValue(entry.maxWindDirection ?? ""),
      escapeValue(entry.avTotalCloud ?? ""),
      escapeValue(entry.lowestVisibility ?? ""),
      escapeValue(entry.totalRainDuration ?? ""),
    ].join(",");

    csvContent += `${row}\n`;
  });

  triggerDownload(
    csvContent,
    `daily_summary_${headerInfo.year}${headerInfo.month}${headerInfo.day}.csv`,
    "text/csv;charset=utf-8;"
  );

  return true;
};
