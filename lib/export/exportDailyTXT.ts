import { triggerDownload } from "@/lib/export/download";
import type {
  DailySummaryHeaderInfo,
  DailySummaryRecord,
} from "@/lib/types/dailySummary";
import type { DateRange } from "@/lib/utils/date-utils";

export const exportDailySummaryTXT = (
  records: DailySummaryRecord[],
  headerInfo: DailySummaryHeaderInfo,
  range: DateRange
): boolean => {
  if (!records?.length) {
    return false;
  }

  const now = new Date();
  const generatedDate = now.toISOString().split("T")[0];
  const generatedTime = `${now.toISOString().split("T")[1].slice(0, 8)} UTC`;

  let txtContent = `DAILY SUMMARY DATA REPORT
============================================================

REPORT INFORMATION:
  Station: ${headerInfo.stationNo}
  Date Range: ${range.startDate} to ${range.endDate}
  Report Generated: ${generatedDate} at ${generatedTime}
  Total Records: ${records.length}

DAILY SUMMARY VALUES:
============================================================
`;

  records.forEach((entry, index) => {
    const observingTime = entry.ObservingTime?.utcTime
      ? new Date(entry.ObservingTime.utcTime)
      : undefined;
    const dateLabel = observingTime
      ? observingTime.toISOString().split("T")[0]
      : "Unknown";

    txtContent += `
Record ${index + 1} (Date: ${dateLabel}):
------------------------------
Station            ---> ${entry.ObservingTime?.station?.name || "--"}
Av Station Pressure ---> ${entry.avStationPressure || "--"} hPa
Av Sea-Level Press  ---> ${entry.avSeaLevelPressure || "--"} hPa
Av Dry-Bulb Temp    ---> ${entry.avDryBulbTemperature || "--"} deg C
Av Wet Bulb Temp    ---> ${entry.avWetBulbTemperature || "--"} deg C
Max Temperature     ---> ${entry.maxTemperature || "--"} deg C
Min Temperature     ---> ${entry.minTemperature || "--"} deg C
Total Precipitation ---> ${entry.totalPrecipitation || "--"} mm
Av Dew Point Temp   ---> ${entry.avDewPointTemperature || "--"} deg C
Av Relative Humid   ---> ${entry.avRelativeHumidity || "--"} %
Wind Speed          ---> ${entry.windSpeed || "--"} m/s
Wind Direction      ---> ${entry.windDirectionCode || "--"}
Max Wind Speed      ---> ${entry.maxWindSpeed || "--"} m/s
Max Wind Direction  ---> ${entry.maxWindDirection || "--"}
Av Total Cloud      ---> ${entry.avTotalCloud || "--"} oktas
Lowest Visibility   ---> ${entry.lowestVisibility || "--"} km
Total Rain Duration ---> ${entry.totalRainDuration || "--"} HHMM
`;
  });

  txtContent += `
============================================================
Report End
============================================================`;

  triggerDownload(
    txtContent,
    `daily_summary_${headerInfo.stationNo}_${range.startDate}_to_${range.endDate}_${generatedDate}.txt`,
    "text/plain;charset=utf-8;"
  );

  return true;
};
