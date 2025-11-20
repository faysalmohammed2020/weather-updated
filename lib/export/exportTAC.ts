import { triggerDownload } from "@/lib/export/download";
import type { SynopticHeaderInfo, SynopticRecord } from "@/lib/types/synoptic";

const SECTION_DIVIDER = "=".repeat(70);

export const exportSynopticTAC = (
  records: SynopticRecord[],
  headerInfo: SynopticHeaderInfo,
  period?: { startDate: string; endDate: string }
): boolean => {
  if (!records?.length) {
    return false;
  }

  const now = new Date();
  const currentDateStr = now.toISOString().split("T")[0];
  const currentTimeStr = now.toISOString().split("T")[1].substring(0, 8);

  let tacContent = `ZCZC
FM12 SYNOP

TTAAii CCCC YYGGgg
SYNOPTIC OBSERVATIONS

${SECTION_DIVIDER}
TAC MESSAGE - SYNOPTIC DATA
${SECTION_DIVIDER}

MESSAGE HEADER:
  Originating Station: ${headerInfo.stationNo}
  Date/Time Group: ${headerInfo.year}${headerInfo.month}${headerInfo.day}
  Message Type: FM-12 SYNOP
  Generated: ${currentDateStr} ${currentTimeStr} UTC
  Total Observations: ${records.length}

${SECTION_DIVIDER}
SYNOPTIC OBSERVATIONS:
${SECTION_DIVIDER}

`;

  records.forEach((entry, index) => {
    const observingTime = entry.ObservingTime?.utcTime
      ? new Date(entry.ObservingTime.utcTime)
      : new Date();
    const day = observingTime.getUTCDate().toString().padStart(2, "0");
    const hour = observingTime.getUTCHours().toString().padStart(2, "0");
    const timeGroup = `${day}${hour}`;
    const stationId = entry.Iliii || headerInfo.stationNo;

    tacContent += `OBSERVATION ${index + 1}:
${"-".repeat(50)}
AAXX ${timeGroup}
${stationId}`;

    const synopGroups = [
      entry.iRiXhvv,
      entry.Nddff,
      entry.S1nTTT,
      entry.S2nTddTddTdd,
      entry.P3PPP4PPPP,
      entry.RRRtR6,
      entry.wwW1W2,
      entry.NhClCmCh,
    ].filter(Boolean) as string[];

    let currentLine = "";
    synopGroups.forEach((group) => {
      if (currentLine.length + group.length + 1 > 65) {
        tacContent += ` ${currentLine}\n`;
        currentLine = group;
      } else {
        currentLine += (currentLine ? " " : "") + group;
      }
    });

    if (currentLine) {
      tacContent += ` ${currentLine}\n`;
    }

    const section3Groups = [
      entry.S2nTnTnTnInInInIn,
      entry.D56DLDMDH,
      entry.CD57DaEc,
      entry.P24Group58_59,
      entry.NsChshs,
      entry.dqqqt90,
      entry.fqfqfq91,
    ].filter(Boolean) as string[];

    if (section3Groups.length > 0) {
      tacContent += "333\n";
      let sectionLine = "";
      section3Groups.forEach((group) => {
        if (sectionLine.length + group.length + 1 > 65) {
          tacContent += ` ${sectionLine}\n`;
          sectionLine = group;
        } else {
          sectionLine += (sectionLine ? " " : "") + group;
        }
      });

      if (sectionLine) {
        tacContent += ` ${sectionLine}\n`;
      }
    }

    if (entry.weatherRemark) {
      const [, remarkText = entry.weatherRemark] =
        entry.weatherRemark.split(" - ");
      tacContent += `RMK ${remarkText}\n`;
    }

    tacContent += "=\n\n";
  });

  const periodLabel = period
    ? `${period.startDate} to ${period.endDate}`
    : `${headerInfo.year}-${headerInfo.month}-${headerInfo.day}`;

  tacContent += `${SECTION_DIVIDER}
END OF TAC MESSAGE
${SECTION_DIVIDER}

MESSAGE SUMMARY:
  Total Observations: ${records.length}
  Station: ${headerInfo.stationNo}
  Period: ${periodLabel}
  Generated: ${currentDateStr} ${currentTimeStr} UTC

NNNN`;

  triggerDownload(
    tacContent,
    `TAC_SYNOP_${headerInfo.stationNo}_${headerInfo.year}${headerInfo.month}${headerInfo.day}_${currentDateStr.replace(
      /-/g,
      ""
    )}.tac`,
    "text/plain;charset=utf-8;"
  );

  return true;
};
