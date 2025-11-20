import { triggerDownload } from "@/lib/export/download";
import type { SynopticHeaderInfo, SynopticRecord } from "@/lib/types/synoptic";

const CSV_HEADERS =
  "Time,C1,Iliii,iRiXhvv,Nddff,1SnTTT,2SnTdTdTd,3PPP/4PPP,6RRRtR,7wwW1W2,8NhClCmCh,2SnTnTnTn/InInInIn,56DlDmDh,57CDaEc,C2,GG,58P24P24P24/59P24P24P24,(6RRRtR),8N5Ch5h5,90dqqqt,91fqfqfq,Weather Remarks\n";

export const exportSynopticCSV = (
  records: SynopticRecord[],
  headerInfo: SynopticHeaderInfo
): boolean => {
  if (!records?.length) {
    return false;
  }

  let csvContent = CSV_HEADERS;

  records.forEach((entry) => {
    const observingTime = entry.ObservingTime?.utcTime
      ? new Date(entry.ObservingTime.utcTime)
      : new Date();
    const timeSlot = observingTime.getUTCHours().toString().padStart(2, "0");
    const remark = (entry.weatherRemark || "").replace(/"/g, '""');

    const row = [
      timeSlot,
      entry.C1 || "",
      entry.Iliii || "",
      entry.iRiXhvv || "",
      entry.Nddff || "",
      entry.S1nTTT || "",
      entry.S2nTddTddTdd || "",
      entry.P3PPP4PPPP || "",
      entry.RRRtR6 || "",
      entry.wwW1W2 || "",
      entry.NhClCmCh || "",
      entry.S2nTnTnTnInInInIn || "",
      entry.D56DLDMDH || "",
      entry.CD57DaEc || "",
      entry.avgTotalCloud || "",
      entry.C2 || "",
      entry.GG || "",
      entry.P24Group58_59 || "",
      entry.R24Group6_7 || "",
      entry.NsChshs || "",
      entry.dqqqt90 || "",
      entry.fqfqfq91 || "",
      `"${remark}"`,
    ].join(",");

    csvContent += `${row}\n`;
  });

  triggerDownload(
    csvContent,
    `synoptic_data_${headerInfo.year}${headerInfo.month}${headerInfo.day}.csv`,
    "text/csv;charset=utf-8;"
  );

  return true;
};
