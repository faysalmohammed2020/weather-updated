import { triggerDownload } from "@/lib/export/download";
import type { SynopticRecord } from "@/lib/types/synoptic";
import type { DailySummaryRecord } from "@/lib/types/dailySummary";

interface AllDataExportOptions {
  firstCardData: any[];
  secondCardData: any[];
  synopticData: SynopticRecord[];
  dailySummaryData: DailySummaryRecord[];
  stationInfo: {
    stationId: string;
    stationName: string;
    stationCode?: string;
    date: string;
  };
}

export const exportAllToTXT = ({
  firstCardData,
  secondCardData,
  synopticData,
  dailySummaryData,
  stationInfo,
}: AllDataExportOptions): boolean => {
  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const currentTime = `${now.toISOString().split("T")[1].slice(0, 8)} UTC`;

  let txtContent = `COMPLETE WEATHER DATA REPORT
${"=".repeat(70)}

REPORT INFORMATION:
  Station ID: ${stationInfo.stationId}
  Station Name: ${stationInfo.stationName}
  Station Code: ${stationInfo.stationCode || "--"}
  Date: ${stationInfo.date}
  Report Generated: ${currentDate} at ${currentTime}

${"=".repeat(70)}
`;

  // First Card Data (Meteorological)
  if (firstCardData.length > 0) {
    txtContent += `\nFIRST CARD DATA (METEOROLOGICAL)
${"=".repeat(70)}
Total Records: ${firstCardData.length}\n`;

    firstCardData.forEach((record, index) => {
      const utcTime = record.utcTime || record.ObservingTime?.utcTime;
      const dateLabel = utcTime ? new Date(utcTime).toISOString().split("T")[0] : "--";
      const timeLabel = utcTime ? new Date(utcTime).toTimeString().slice(0, 5) : "--";

      txtContent += `\nRecord ${index + 1} (${dateLabel} ${timeLabel}):\n`;
      txtContent += `${"-".repeat(40)}\n`;
      txtContent += `Indicator              ---> ${record.subIndicator || "--"}\n`;
      txtContent += `Date                   ---> ${dateLabel}\n`;
      txtContent += `Station                ---> ${record.stationName || stationInfo.stationName}\n`;
      txtContent += `Attached Thermometer   ---> ${record.alteredThermometer || "--"}\n`;
      txtContent += `Bar As Read             ---> ${record.barAsRead || "--"}\n`;
      txtContent += `Corrected for Index    ---> ${record.correctedForIndex || "--"}\n`;
      txtContent += `Height Difference       ---> ${record.heightDifference || "--"}\n`;
      txtContent += `Station Level Pressure ---> ${record.stationLevelPressure || "--"}\n`;
      txtContent += `Sea Level Reduction     ---> ${record.seaLevelReduction || "--"}\n`;
      txtContent += `Sea Level Pressure      ---> ${record.correctedSeaLevelPressure || "--"}\n`;
      txtContent += `Afternoon Reading      ---> ${record.afternoonReading || "--"}\n`;
      txtContent += `24h Pressure Change     ---> ${record.pressureChange24h || "--"}\n`;
      txtContent += `Dry Bulb               ---> ${record.dryBulbAsRead || "--"}\n`;
      txtContent += `Wet Bulb               ---> ${record.wetBulbAsRead || "--"}\n`;
      txtContent += `MAX/MIN Temp           ---> ${record.maxMinTempAsRead || "--"}\n`;
      txtContent += `Dry Bulb Corrected     ---> ${record.dryBulbCorrected || "--"}\n`;
      txtContent += `Wet Bulb Corrected     ---> ${record.wetBulbCorrected || "--"}\n`;
      txtContent += `MAX/MIN Corrected      ---> ${record.maxMinTempCorrected || "--"}\n`;
      txtContent += `Dew Point              ---> ${record.Td || "--"}\n`;
      txtContent += `Relative Humidity      ---> ${record.relativeHumidity || "--"}\n`;
      txtContent += `Squall Force           ---> ${record.squallForce || "--"}\n`;
      txtContent += `Squall Direction       ---> ${record.squallDirection || "--"}\n`;
      txtContent += `Squall Time            ---> ${record.squallTime || "--"}\n`;
      txtContent += `Visibility             ---> ${record.horizontalVisibility || "--"}\n`;
      txtContent += `Misc Meteors           ---> ${record.miscMeteors || "--"}\n`;
      txtContent += `Past W1                ---> ${record.pastWeatherW1 || "--"}\n`;
      txtContent += `Past W2                ---> ${record.pastWeatherW2 || "--"}\n`;
      txtContent += `Present WW             ---> ${record.presentWeatherWW || "--"}\n`;
    });
  }

  // Second Card Data (Weather Observation)
  if (secondCardData.length > 0) {
    txtContent += `\n\nSECOND CARD DATA (WEATHER OBSERVATION)
${"=".repeat(70)}
Total Records: ${secondCardData.length}\n`;

    secondCardData.forEach((record, index) => {
      const utcTime = record.utcTime || record.ObservingTime?.utcTime;
      const dateLabel = utcTime ? new Date(utcTime).toISOString().split("T")[0] : "--";
      const timeLabel = utcTime ? new Date(utcTime).toTimeString().slice(0, 5) : "--";

      txtContent += `\nRecord ${index + 1} (${dateLabel} ${timeLabel}):\n`;
      txtContent += `${"-".repeat(40)}\n`;
      txtContent += `Card Indicator         ---> ${record.cardIndicator || "--"}\n`;
      txtContent += `Date                   ---> ${dateLabel}\n`;
      txtContent += `Station                ---> ${record.stationName || stationInfo.stationName}\n`;
      txtContent += `Low Cloud Form          ---> ${record.lowCloudForm || "--"}\n`;
      txtContent += `Low Cloud Height        ---> ${record.lowCloudHeight || "--"}\n`;
      txtContent += `Low Cloud Amount        ---> ${record.lowCloudAmount || "--"}\n`;
      txtContent += `Low Cloud Direction     ---> ${record.lowCloudDirection || "--"}\n`;
      txtContent += `Medium Cloud Form       ---> ${record.mediumCloudForm || "--"}\n`;
      txtContent += `Medium Cloud Height     ---> ${record.mediumCloudHeight || "--"}\n`;
      txtContent += `Medium Cloud Amount     ---> ${record.mediumCloudAmount || "--"}\n`;
      txtContent += `Medium Cloud Direction  ---> ${record.mediumCloudDirection || "--"}\n`;
      txtContent += `High Cloud Form         ---> ${record.highCloudForm || "--"}\n`;
      txtContent += `High Cloud Height       ---> ${record.highCloudHeight || "--"}\n`;
      txtContent += `High Cloud Amount       ---> ${record.highCloudAmount || "--"}\n`;
      txtContent += `High Cloud Direction    ---> ${record.highCloudDirection || "--"}\n`;
      txtContent += `Total Cloud Amount      ---> ${record.totalCloudAmount || "--"}\n`;
      txtContent += `Layer 1 Form            ---> ${record.layer1Form || "--"}\n`;
      txtContent += `Layer 1 Height          ---> ${record.layer1Height || "--"}\n`;
      txtContent += `Layer 1 Amount          ---> ${record.layer1Amount || "--"}\n`;
      txtContent += `Layer 2 Form            ---> ${record.layer2Form || "--"}\n`;
      txtContent += `Layer 2 Height          ---> ${record.layer2Height || "--"}\n`;
      txtContent += `Layer 2 Amount          ---> ${record.layer2Amount || "--"}\n`;
      txtContent += `Layer 3 Form            ---> ${record.layer3Form || "--"}\n`;
      txtContent += `Layer 3 Height          ---> ${record.layer3Height || "--"}\n`;
      txtContent += `Layer 3 Amount          ---> ${record.layer3Amount || "--"}\n`;
      txtContent += `Layer 4 Form            ---> ${record.layer4Form || "--"}\n`;
      txtContent += `Layer 4 Height          ---> ${record.layer4Height || "--"}\n`;
      txtContent += `Layer 4 Amount          ---> ${record.layer4Amount || "--"}\n`;
      txtContent += `Rainfall Time Start     ---> ${record.rainfallTimeStart || "--"}\n`;
      txtContent += `Rainfall Time End       ---> ${record.rainfallTimeEnd || "--"}\n`;
      txtContent += `Rainfall Since Previous ---> ${record.rainfallSincePrevious || "--"}\n`;
      txtContent += `Rainfall During Previous ---> ${record.rainfallDuringPrevious || "--"}\n`;
      txtContent += `Rainfall Last 24 Hours  ---> ${record.rainfallLast24Hours || "--"}\n`;
      txtContent += `Wind First Anemometer   ---> ${record.windFirstAnemometer || "--"}\n`;
      txtContent += `Wind Second Anemometer  ---> ${record.windSecondAnemometer || "--"}\n`;
      txtContent += `Wind Speed              ---> ${record.windSpeed || "--"}\n`;
      txtContent += `Wind Direction          ---> ${record.windDirection || "--"}\n`;
      txtContent += `Observer Initial        ---> ${record.observerInitial || "--"}\n`;
    });
  }

  // Synoptic Data
  if (synopticData.length > 0) {
    txtContent += `\n\nSYNOPTIC DATA
${"=".repeat(70)}
Total Records: ${synopticData.length}\n`;

    synopticData.forEach((record, index) => {
      const utcTime = record.ObservingTime?.utcTime;
      const dateLabel = utcTime ? new Date(utcTime).toISOString().split("T")[0] : "--";
      const timeLabel = utcTime ? new Date(utcTime).toTimeString().slice(0, 5) : "--";

      txtContent += `\nRecord ${index + 1} (${dateLabel} ${timeLabel}):\n`;
      txtContent += `${"-".repeat(40)}\n`;
      txtContent += `Data Type              ---> ${record.dataType || "--"}\n`;
      txtContent += `C1                     ---> ${record.C1 || "--"}\n`;
      txtContent += `Iliii                  ---> ${record.Iliii || "--"}\n`;
      txtContent += `iRiXhvv                ---> ${record.iRiXhvv || "--"}\n`;
      txtContent += `Nddff                  ---> ${record.Nddff || "--"}\n`;
      txtContent += `1SnTTT                 ---> ${record.S1nTTT || "--"}\n`;
      txtContent += `2SnTdTdTd              ---> ${record.S2nTddTddTdd || "--"}\n`;
      txtContent += `3PPP/4PPP              ---> ${record.P3PPP4PPPP || "--"}\n`;
      txtContent += `6RRRtR                 ---> ${record.RRRtR6 || "--"}\n`;
      txtContent += `7wwW1W2                ---> ${record.wwW1W2 || "--"}\n`;
      txtContent += `8NhClCmCh              ---> ${record.NhClCmCh || "--"}\n`;
      txtContent += `2SnTnTnTn/InInInIn     ---> ${record.S2nTnTnTnInInInIn || "--"}\n`;
      txtContent += `56DlDmDh               ---> ${record.D56DLDMDH || "--"}\n`;
      txtContent += `57CDaEc                ---> ${record.CD57DaEc || "--"}\n`;
      txtContent += `Avg Total Cloud        ---> ${record.avgTotalCloud || "--"}\n`;
      txtContent += `C2                     ---> ${record.C2 || "--"}\n`;
      txtContent += `GG                     ---> ${record.GG || "--"}\n`;
      txtContent += `58/59P24               ---> ${record.P24Group58_59 || "--"}\n`;
      txtContent += `6RRRtR (24h)           ---> ${record.R24Group6_7 || "--"}\n`;
      txtContent += `8N5Ch5h5               ---> ${record.NsChshs || "--"}\n`;
      txtContent += `90dqqqt                ---> ${record.dqqqt90 || "--"}\n`;
      txtContent += `91fqfqfq               ---> ${record.fqfqfq91 || "--"}\n`;
      if (record.weatherRemark) {
        txtContent += `Weather Remarks         ---> ${record.weatherRemark}\n`;
      }
    });
  }

  // Daily Summary Data
  if (dailySummaryData.length > 0) {
    txtContent += `\n\nDAILY SUMMARY DATA
${"=".repeat(70)}
Total Records: ${dailySummaryData.length}\n`;

    dailySummaryData.forEach((record, index) => {
      const utcTime = record.ObservingTime?.utcTime;
      const dateLabel = utcTime ? new Date(utcTime).toISOString().split("T")[0] : "--";

      txtContent += `\nRecord ${index + 1} (${dateLabel}):\n`;
      txtContent += `${"-".repeat(40)}\n`;
      txtContent += `Station                ---> ${record.ObservingTime?.station?.name || stationInfo.stationName}\n`;
      txtContent += `Av Station Pressure    ---> ${record.avStationPressure || "--"} hPa\n`;
      txtContent += `Av Sea-Level Pressure  ---> ${record.avSeaLevelPressure || "--"} hPa\n`;
      txtContent += `Av Dry-Bulb Temp       ---> ${record.avDryBulbTemperature || "--"} deg C\n`;
      txtContent += `Av Wet Bulb Temp       ---> ${record.avWetBulbTemperature || "--"} deg C\n`;
      txtContent += `Max Temperature        ---> ${record.maxTemperature || "--"} deg C\n`;
      txtContent += `Min Temperature        ---> ${record.minTemperature || "--"} deg C\n`;
      txtContent += `Total Precipitation    ---> ${record.totalPrecipitation || "--"} mm\n`;
      txtContent += `Av Dew Point Temp      ---> ${record.avDewPointTemperature || "--"} deg C\n`;
      txtContent += `Av Relative Humidity   ---> ${record.avRelativeHumidity || "--"} %\n`;
      txtContent += `Wind Speed             ---> ${record.windSpeed || "--"} m/s\n`;
      txtContent += `Wind Direction          ---> ${record.windDirectionCode || "--"}\n`;
      txtContent += `Max Wind Speed         ---> ${record.maxWindSpeed || "--"} m/s\n`;
      txtContent += `Max Wind Direction     ---> ${record.maxWindDirection || "--"}\n`;
      txtContent += `Av Total Cloud         ---> ${record.avTotalCloud || "--"} oktas\n`;
      txtContent += `Lowest Visibility      ---> ${record.lowestVisibility || "--"} km\n`;
      txtContent += `Total Rain Duration    ---> ${record.totalRainDuration || "--"} HHMM\n`;
    });
  }

  txtContent += `\n${"=".repeat(70)}
END OF REPORT
${"=".repeat(70)}`;

  const fileName = `weather_data_all_${stationInfo.stationCode || stationInfo.stationId}_${stationInfo.date.replace(/\//g, "-")}_${currentDate}.txt`;

  triggerDownload(txtContent, fileName, "text/plain;charset=utf-8;");

  return true;
};
