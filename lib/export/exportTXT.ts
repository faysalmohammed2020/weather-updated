import { triggerDownload } from "@/lib/export/download";
import type { SynopticHeaderInfo, SynopticRecord } from "@/lib/types/synoptic";

export const exportSynopticTXT = (
  records: SynopticRecord[],
  headerInfo: SynopticHeaderInfo
): boolean => {
  if (!records?.length) {
    return false;
  }

  const now = new Date();
  const currentDate = now.toISOString().split("T")[0];
  const currentTime = `${now.toISOString().split("T")[1].slice(0, 8)} UTC`;

  let txtContent = `SYNOPTIC DATA REPORT
${"=".repeat(60)}
REPORT INFORMATION:
  Station: ${headerInfo.stationNo}
  Date: ${headerInfo.year}/${headerInfo.month}/${headerInfo.day}
  Report Generated: ${currentDate} at ${currentTime}
  Total Records: ${records.length}

SYNOPTIC DATA VALUES:
${"=".repeat(60)}`;

  records.forEach((entry, index) => {
    const observingTime = entry.ObservingTime?.utcTime
      ? new Date(entry.ObservingTime.utcTime)
      : new Date();
    const timeSlot = observingTime.getUTCHours().toString().padStart(2, "0");

    txtContent += `\nRecord ${index + 1} (Time Slot: ${timeSlot}):\n`;
    txtContent += `${"-".repeat(30)}\n`;
    txtContent += `C1${" ".repeat(18)} ---> ${entry.C1 || "--"}\n`;
    txtContent += `Iliii${" ".repeat(15)} ---> ${entry.Iliii || "--"}\n`;
    txtContent += `iRiXhvv${" ".repeat(13)} ---> ${entry.iRiXhvv || "--"}\n`;
    txtContent += `Nddff${" ".repeat(15)} ---> ${entry.Nddff || "--"}\n`;
    txtContent += `1SnTTT${" ".repeat(14)} ---> ${entry.S1nTTT || "--"}\n`;
    txtContent += `2SnTdTdTd${" ".repeat(11)} ---> ${
      entry.S2nTddTddTdd || "--"
    }\n`;
    txtContent += `3PPP/4PPP${" ".repeat(11)} ---> ${
      entry.P3PPP4PPPP || "--"
    }\n`;
    txtContent += `6RRRtR${" ".repeat(14)} ---> ${entry.RRRtR6 || "--"}\n`;
    txtContent += `7wwW1W2${" ".repeat(13)} ---> ${entry.wwW1W2 || "--"}\n`;
    txtContent += `8NhClCmCh${" ".repeat(11)} ---> ${entry.NhClCmCh || "--"}\n`;
    txtContent += `2SnTnTnTn/InInInIn${" ".repeat(4)} ---> ${
      entry.S2nTnTnTnInInInIn || "--"
    }\n`;
    txtContent += `56DlDmDh${" ".repeat(12)} ---> ${
      entry.D56DLDMDH || "--"
    }\n`;
    txtContent += `57CDaEc${" ".repeat(13)} ---> ${
      entry.CD57DaEc || "--"
    }\n`;
    txtContent += `C2${" ".repeat(18)} ---> ${entry.C2 || "--"}\n`;
    txtContent += `GG${" ".repeat(18)} ---> ${entry.GG || "--"}\n`;
    txtContent += `58/59P24${" ".repeat(12)} ---> ${
      entry.P24Group58_59 || "--"
    }\n`;
    txtContent += `6RRRtR${" ".repeat(14)} ---> ${
      entry.R24Group6_7 || "--"
    }\n`;
    txtContent += `8N5Ch5h5${" ".repeat(12)} ---> ${
      entry.NsChshs || "--"
    }\n`;
    txtContent += `90dqqqt${" ".repeat(13)} ---> ${entry.dqqqt90 || "--"}\n`;
    txtContent += `91fqfqfq${" ".repeat(12)} ---> ${entry.fqfqfq91 || "--"}\n`;

    if (entry.weatherRemark) {
      const [, remarkText = "--"] = entry.weatherRemark.split(" - ");
      txtContent += `Weather Remarks${" ".repeat(6)} ---> ${remarkText}\n`;
    }
  });

  txtContent += `\n${"=".repeat(60)}
Report End
${"=".repeat(60)}`;

  triggerDownload(
    txtContent,
    `synoptic_data_${headerInfo.stationNo}_${headerInfo.year}${headerInfo.month}${headerInfo.day}_${currentDate}.txt`,
    "text/plain;charset=utf-8;"
  );

  return true;
};
