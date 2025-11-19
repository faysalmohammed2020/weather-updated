import type { ExportResult } from "@/lib/export/types";
import type { WeatherObservationRecord } from "@/types/weather-observation";
import { utcToHour } from "@/lib/utils/utcToHour";
import { formatUtcDate } from "@/lib/utils/formatUtcDate";

export interface WeatherTxtExportOptions {
  startDate: string;
  endDate: string;
  stationName?: string;
  records: WeatherObservationRecord[];
}

const pad = (label: string, value: string) =>
  `${label}${" ".repeat(Math.max(1, 20 - label.length))} ---> ${value}\n`;

const formatRainfallTime = (iso?: string | null) => {
  if (!iso) return "--";
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return "--";
  }
};

const asValue = (value?: string | null) => value || "--";

export const exportWeatherTxt = ({
  startDate,
  endDate,
  stationName,
  records,
}: WeatherTxtExportOptions): ExportResult => {
  const currentDate = new Date().toISOString().split("T")[0];
  const currentTime =
    new Date().toISOString().split("T")[1].split(".")[0] + " UTC";

  let txtContent = `WEATHER OBSERVATION DATA REPORT
${"=".repeat(60)}
REPORT INFORMATION:
  Date Range: ${startDate} to ${endDate}
  Station: ${stationName || "All Stations"}
  Report Generated: ${currentDate} at ${currentTime}
  Total Records: ${records.length}

DATA VALUES:
${"=".repeat(60)}
`;

  records.forEach((record, index) => {
    const obs = record.WeatherObservation[0] || ({} as Record<string, string | null>);
    txtContent += `\nRecord ${index + 1}:\n`;
    txtContent += `${"-".repeat(30)}\n`;
    txtContent += pad("Time (GMT)", utcToHour(record.utcTime));
    txtContent += pad("Station", record.station?.name || "--");
    txtContent += pad("Total Cloud", asValue(obs.totalCloudAmount));
    txtContent += pad("Low Cloud Form", asValue(obs.lowCloudForm));
    txtContent += pad("Low Cloud Amount", asValue(obs.lowCloudAmount));
    txtContent += pad("Low Cloud Height", asValue(obs.lowCloudHeight));
    txtContent += pad("Low Cloud Direction", asValue(obs.lowCloudDirection));
    txtContent += pad("Medium Cloud Form", asValue(obs.mediumCloudForm));
    txtContent += pad("Medium Cloud Amount", asValue(obs.mediumCloudAmount));
    txtContent += pad("Medium Cloud Height", asValue(obs.mediumCloudHeight));
    txtContent += pad("Medium Cloud Direction", asValue(obs.mediumCloudDirection));
    txtContent += pad("High Cloud Form", asValue(obs.highCloudForm));
    txtContent += pad("High Cloud Amount", asValue(obs.highCloudAmount));
    txtContent += pad("High Cloud Direction", asValue(obs.highCloudDirection));
    txtContent += pad("Layer1 Form", asValue(obs.layer1Form));
    txtContent += pad("Layer1 Amount", asValue(obs.layer1Amount));
    txtContent += pad("Layer1 Height", asValue(obs.layer1Height));
    txtContent += pad("Layer2 Form", asValue(obs.layer2Form));
    txtContent += pad("Layer2 Amount", asValue(obs.layer2Amount));
    txtContent += pad("Layer2 Height", asValue(obs.layer2Height));
    txtContent += pad("Layer3 Form", asValue(obs.layer3Form));
    txtContent += pad("Layer3 Amount", asValue(obs.layer3Amount));
    txtContent += pad("Layer3 Height", asValue(obs.layer3Height));
    txtContent += pad("Layer4 Form", asValue(obs.layer4Form));
    txtContent += pad("Layer4 Amount", asValue(obs.layer4Amount));
    txtContent += pad("Layer4 Height", asValue(obs.layer4Height));
    txtContent += pad("Rainfall Start", formatRainfallTime(obs.rainfallTimeStart));
    txtContent += pad("Rainfall End", formatRainfallTime(obs.rainfallTimeEnd));
    txtContent += pad("Since Previous", asValue(obs.rainfallSincePrevious));
    txtContent += pad("During Previous", asValue(obs.rainfallDuringPrevious));
    txtContent += pad("Last 24 Hours", asValue(obs.rainfallLast24Hours));
    txtContent += pad("Wind 1st Anem", asValue(obs.windFirstAnemometer));
    txtContent += pad("Wind 2nd Anem", asValue(obs.windSecondAnemometer));
    txtContent += pad("Wind Speed", asValue(obs.windSpeed));
    txtContent += pad("Wind Direction", asValue(obs.windDirection));
    txtContent += pad("Observer", asValue(obs.observerInitial));
    txtContent += pad(
      "Date",
      record.utcTime ? formatUtcDate(record.utcTime) : "--"
    );
  });

  txtContent += `\n${"=".repeat(60)}
Report End
${"=".repeat(60)}`;

  return {
    filename: `weather_observation_${startDate}_to_${endDate}_${currentDate}.txt`,
    mime: "text/plain;charset=utf-8;",
    content: txtContent,
  };
};
