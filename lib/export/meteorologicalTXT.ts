import type {
  MeteorologicalEntry,
  ObservingTimeEntry,
} from "@/types/meteorological";
import { formatUtcDate, utcToHour } from "@/lib/utils/table-utils";
import type { ExportResult } from "./types";

export interface TxtExportOptions {
  startDate: string;
  endDate: string;
  stationName?: string;
  observingTimes: ObservingTimeEntry[];
  flattenedData: MeteorologicalEntry[];
}

export const exportToTXT = ({
  startDate,
  endDate,
  stationName,
  observingTimes,
  flattenedData,
}: TxtExportOptions): ExportResult => {
  const observingTimeMap = new Map(
    observingTimes.map((ot) => [ot.id, ot] as const)
  );

  const currentDate = new Date().toISOString().split("T")[0];
  const currentTime =
    new Date().toISOString().split("T")[1].split(".")[0] + " UTC";

  let txtContent = `METEOROLOGICAL DATA REPORT
${"=".repeat(60)}

REPORT INFORMATION:
  Date Range: ${startDate} to ${endDate}
  Station: ${stationName || "All Stations"}
  Report Generated: ${currentDate} at ${currentTime}
  Total Records: ${flattenedData.length}

DATA VALUES:
${"=".repeat(60)}
`;

  flattenedData.forEach((record, index) => {
    const observingTime = observingTimeMap.get(record.observingTimeId);

    txtContent += `\nRecord ${index + 1}:\n`;
    txtContent += `${"-".repeat(30)}\n`;

    const stationLabel = observingTime
      ? `${observingTime.station?.name || "--"} ${
          observingTime.station?.stationId || "--"
        }`
      : "--";

    txtContent += `Time (GMT)${" ".repeat(10)} ---> ${utcToHour(
      observingTime?.utcTime || "--"
    )}\n`;
    txtContent += `Indicator${" ".repeat(12)} ---> ${
      record.subIndicator || "--"
    }\n`;
    txtContent += `Date${" ".repeat(16)} ---> ${
      observingTime?.utcTime ? formatUtcDate(observingTime.utcTime) : "--"
    }\n`;
    txtContent += `Station${" ".repeat(13)} ---> ${stationLabel}\n`;
    txtContent += `Attached Thermometer ---> ${
      record.alteredThermometer || "--"
    }\n`;
    txtContent += `Bar As Read${" ".repeat(9)} ---> ${
      record.barAsRead || "--"
    }\n`;
    txtContent += `Corrected for Index ---> ${
      record.correctedForIndex || "--"
    }\n`;
    txtContent += `Height Diff${" ".repeat(9)} ---> ${
      record.heightDifference || "--"
    }\n`;
    txtContent += `Station Level Press --> ${
      record.stationLevelPressure || "--"
    }\n`;
    txtContent += `Sea Level Reduction --> ${
      record.seaLevelReduction || "--"
    }\n`;
    txtContent += `Sea Level Pressure${" ".repeat(3)} ---> ${
      record.correctedSeaLevelPressure || "--"
    }\n`;
    txtContent += `Afternoon Reading${" ".repeat(3)} ---> ${
      record.afternoonReading || "--"
    }\n`;
    txtContent += `24h Pressure Change --> ${
      record.pressureChange24h || "--"
    }\n`;
    txtContent += `Dry Bulb${" ".repeat(13)} ---> ${
      record.dryBulbAsRead || "--"
    }\n`;
    txtContent += `Wet Bulb${" ".repeat(13)} ---> ${
      record.wetBulbAsRead || "--"
    }\n`;
    txtContent += `MAX/MIN Temp${" ".repeat(7)} ---> ${
      record.maxMinTempAsRead || "--"
    }\n`;
    txtContent += `Dry Bulb Corrected --> ${
      record.dryBulbCorrected || "--"
    }\n`;
    txtContent += `Wet Bulb Corrected --> ${
      record.wetBulbCorrected || "--"
    }\n`;
    txtContent += `MAX/MIN Corrected --> ${
      record.maxMinTempCorrected || "--"
    }\n`;
    txtContent += `Dew Point${" ".repeat(11)} ---> ${record.Td || "--"}\n`;
    txtContent += `Relative Humid${" ".repeat(6)} ---> ${
      record.relativeHumidity || "--"
    }\n`;
    txtContent += `Squall Force${" ".repeat(8)} ---> ${
      record.squallForce || "--"
    }\n`;
    txtContent += `Squall Direction${" ".repeat(5)} ---> ${
      record.squallDirection || "--"
    }\n`;
    txtContent += `Squall Time${" ".repeat(9)} ---> ${
      record.squallTime || "--"
    }\n`;

    const visibilityValue = record.horizontalVisibility
      ? Number.parseInt(record.horizontalVisibility, 10) % 10 === 0
        ? Number.parseInt(record.horizontalVisibility, 10) / 10
        : (Number.parseInt(record.horizontalVisibility, 10) / 10).toFixed(1)
      : "--";
    txtContent += `Visibility${" ".repeat(9)} ---> ${visibilityValue}\n`;

    txtContent += `Misc Meteors${" ".repeat(7)} ---> ${
      record.miscMeteors || "--"
    }\n`;
    txtContent += `Past W1${" ".repeat(13)} ---> ${
      record.pastWeatherW1 || "--"
    }\n`;
    txtContent += `Past W2${" ".repeat(13)} ---> ${
      record.pastWeatherW2 || "--"
    }\n`;
    txtContent += `Present WW${" ".repeat(9)} ---> ${
      record.presentWeatherWW || "--"
    }\n`;
  });

  txtContent += `\n${"=".repeat(60)}
Report End
${"=".repeat(60)}`;

  return {
    filename: `meteorological_data_${startDate}_to_${endDate}_${currentDate}.txt`,
    mime: "text/plain;charset=utf-8;",
    content: txtContent,
  };
};

