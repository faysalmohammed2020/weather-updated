// lib/generateSynopticCode.ts

import firstCardData from "../data/first-card-data.json";
import weatherObservations from "../data/weather-observations.json";

export interface SynopticFormValues {
  dataType: string;
  stationNo: string;
  year: string;
  month: string;
  day: string;
  weatherRemark: string;
  measurements: string[];
}

export function generateSynopticCode(): SynopticFormValues {
  // Get the current date
  const now = new Date();
  const today = now.toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Filter data for the current date only
  const todayFirstCardData = firstCardData.filter((card) => {
    // Check if the card has a timestamp property and it matches today's date
    return card.timestamp && card.timestamp.toString().includes(today);
  });

  const todayWeatherObservations = weatherObservations.filter((obs) => {
    // Check if the observation has a date property and it matches today's date
    const obsDate = obs.observer?.["observation-time"]?.split("T")[0];
    return obsDate === today;
  });

  // Get the most recent entries from filtered data
  // If no entries for today, fall back to the most recent entry
  const firstCard =
    todayFirstCardData.length > 0
      ? todayFirstCardData[todayFirstCardData.length - 1]
      : firstCardData[firstCardData.length - 1];

  const weatherObs =
    todayWeatherObservations.length > 0
      ? todayWeatherObservations[todayWeatherObservations.length - 1]
      : weatherObservations[weatherObservations.length - 1];

  // Initialize measurements array with empty strings
  const measurements: string[] = Array(21).fill("");

  // Helper functions
  const pad = (num: number | string, length: number): string => {
    return String(num).padStart(length, "0");
  };

  const getTempValue = (temp: number): string => {
    const sign = temp >= 0 ? "0" : "1";
    const absTemp = Math.abs(Math.round(temp * 10));
    return `${sign}${pad(absTemp, 3)}`;
  };

  // 1. C1 (16) - Always 1
  measurements[0] = "1";

  // 2. Iliii (17-21) - Station number (5 digits)
  // "Iliii 17-21" field data will come from: "stationNo" of "first-card-data.json"
  const stationNo = firstCard.stationNo
    ? Object.values(firstCard.stationNo).slice(0, 5).join("")
    : "00000";
  measurements[1] = stationNo;

  // 3. iRiXhvv (22-26) - 32 + low cloud height (2 digits) + visibility (1 digit)
  // "iRiXhW 22-26" field data will come from : 32 is constant + "clouds>low>height" fields+ "horizontalVisibility" of "first-card-data.json"
  const lowCloudHeight = weatherObs.clouds?.low?.height || 0;
  const visibility = pad(
    (Number(firstCard.horizontalVisibility?.toString()?.[0]) || 0) * 10,
    2
  );

  measurements[2] = `32${lowCloudHeight}${visibility}`;

  // 4. Nddff (27-31) - Total cloud (1 digit) + wind direction (2 digits) + wind speed (2 digits)
  const totalCloud = weatherObs.totalCloud?.["total-cloud-amount"] || "0";
  const windDirectionDeg = Number(weatherObs.wind?.direction) || 0; // in degrees (0-359)
  const windSpeedKnots = Number(weatherObs.wind?.speed) || 0; // in knots

  // Calculate dd (wind direction code)
  let dd;
  if (windSpeedKnots === 0) {
    dd = "00"; // Calm wind
  } else {
    // Convert wind direction to code (00-36)
    // Each code represents a 10° range:
    // Code XX = (XX*10 - 5)° to (XX*10 + 4)°
    // Example: Code 09 = 85° to 94°
    let directionCode;
    if (windDirectionDeg >= 355) {
      // Special case for 355-364° which wraps around to 36
      directionCode = 36;
    } else {
      directionCode = Math.floor((windDirectionDeg + 5) / 10);
    }
    dd = pad(directionCode, 2);
  }

  // Calculate ff (wind speed)
  let ff;
  if (windSpeedKnots >= 100) {
    // Apply the 50 rule for high winds
    const numericDd = parseInt(dd, 10);
    dd = pad(numericDd + 50, 2); // Add 50 to wind direction code
    ff = pad(windSpeedKnots - 100, 2); // Subtract 100 from wind speed
  } else {
    ff = pad(windSpeedKnots, 2); // Use wind speed as-is
  }

  // Format the Nddff value (N + dd + ff)
  measurements[3] = `${totalCloud}${dd}${ff}`;

  // 5. 1SnTTT (32-36) - 1 + sign + dry bulb temp (3 digits)
  // "1SnTTT 32-36" field data come from: 1 is constant + (0/1, if zero or positive then value is 0 , else 1)+"dryBulbAsRead" from "first-card-data.json"
  const dryBulb = Number.parseFloat(firstCard.dryBulbAsRead || "0");
  measurements[4] = `1${getTempValue(dryBulb)}`;

  // 6. 2SnTdTdTd (37-41) - 2 + sign + dew point temp (3 digits)
  // "2SnTdTdTd 37-41" field come from: 2 is constant +(0/1, if zero or positive then value is 0 , else 1)+"Td" of "first-card-data.json"
  const dewPoint = Number.parseFloat(firstCard.Td || "0");
  measurements[5] = `2${getTempValue(dewPoint)}`;

  // 7. 3PPP/4PPP (42-46) - Station pressure / sea level pressure
  // "3PPP/4PPP 42-46" field come from: (show as the given format, do not calculate:(3/4)(stationLevelPressure/correctedSeaLevelPressure)) from "first-card-data.json"
  const stationPressure =
    firstCard.stationLevelPressure?.toString().replace(".", "").slice(0, 4) ||
    "0000";
  const seaLevelPressure =
    firstCard.correctedSeaLevelPressure
      ?.toString()
      .replace(".", "")
      .slice(0, 4) || "0000";
  measurements[6] = `3${stationPressure}/4${seaLevelPressure}`;

  // 8. 6RRRtR (47-51) - Precipitation (4 digits) + duration (1 digit)
  const obsTimeFor6RRRtR = weatherObs.observer?.["observation-time"] || "";
  const obsHourFor6RRRtR = obsTimeFor6RRRtR
    ? Number(obsTimeFor6RRRtR.split("T")[1]?.split(":")[0] || "0")
    : now.getUTCHours();
  const shouldInclude6RRRtR = [0, 6, 12, 18].includes(obsHourFor6RRRtR);

  const parseObservationTime = (value: string) => {
    if (!value || !value.includes("T")) return null;
    const [datePart, timePart] = value.split("T");
    if (!datePart || !timePart) return null;
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    if (
      [year, month, day, hour, minute].some((v) => Number.isNaN(v))
    ) {
      return null;
    }
    return new Date(Date.UTC(year, month - 1, day, hour, minute));
  };

  const formatObservationTime = (date: Date) => {
    const yyyy = date.getUTCFullYear();
    const mm = pad(date.getUTCMonth() + 1, 2);
    const dd = pad(date.getUTCDate(), 2);
    const hh = pad(date.getUTCHours(), 2);
    const min = pad(date.getUTCMinutes(), 2);
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const currentObservationTime =
    parseObservationTime(obsTimeFor6RRRtR) || now;
  const previousObservationTime = new Date(
    currentObservationTime.getTime() - 3 * 60 * 60 * 1000
  );
  const previousObservationKey = formatObservationTime(
    previousObservationTime
  );
  const previousWeatherObs =
    weatherObservations.find(
      (obs) => obs.observer?.["observation-time"] === previousObservationKey
    ) || null;

  const precipitation =
    weatherObs.rainfall?.["during-previous"] ||
    weatherObs.rainfall?.["since-previous"] ||
    "0";

  const parseRainfallMm = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    const raw = String(value).trim();
    if (!raw) return null;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return null;
    return raw.includes(".") || raw.length < 4 ? parsed : parsed / 10;
  };

  const formatR24RainfallAmount = (value: unknown) => {
    const raw = String(value ?? "").trim().toLowerCase();
    if (!raw) return "0000";
    if (["trace", "tr", "t"].includes(raw) || raw === "9999") {
      return "9999";
    }

    const amountMm = parseRainfallMm(value);
    if (amountMm === null || !Number.isFinite(amountMm)) return "0000";

    const tenths = Math.round(Math.max(0, amountMm) * 10);
    if (tenths >= 9998) return "9998";

    return pad(tenths, 4);
  };

  // precipitation is treated as 0.1 mm units here (e.g., 0020 => 2.0 mm => RRR=002)
  const precipRaw = Number(precipitation) || 0;
  const precipMm = Math.floor(precipRaw / 10);

  const buildSlotRanges = (obs: any, obsTime: Date) => {
    if (!obs) return [] as Array<{ start: Date; end: Date }>;
    const ranges: Array<{ start: Date; end: Date }> = [];

    const pushRange = (start: Date, end: Date) => {
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
      let normalizedEnd = end;
      if (end.getTime() < start.getTime()) {
        normalizedEnd = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      }
      ranges.push({ start, end: normalizedEnd });
    };

    const timeSlots = Array.isArray(obs?.rainfall?.timeSlots)
      ? obs.rainfall.timeSlots
      : [];

    if (timeSlots.length > 0) {
      const slotDate = new Date(obsTime);
      if (obsTime.getUTCHours() === 0) {
        slotDate.setUTCDate(slotDate.getUTCDate() - 1);
      }
      timeSlots.forEach((slot: any) => {
        if (!slot?.timeStart || !slot?.timeEnd) return;
        const [startHour, startMin] = slot.timeStart.split(":").map(Number);
        const [endHour, endMin] = slot.timeEnd.split(":").map(Number);
        if (
          Number.isNaN(startHour) ||
          Number.isNaN(startMin) ||
          Number.isNaN(endHour) ||
          Number.isNaN(endMin)
        ) {
          return;
        }
        const start = new Date(
          Date.UTC(
            slotDate.getUTCFullYear(),
            slotDate.getUTCMonth(),
            slotDate.getUTCDate(),
            startHour,
            startMin
          )
        );
        const end = new Date(
          Date.UTC(
            slotDate.getUTCFullYear(),
            slotDate.getUTCMonth(),
            slotDate.getUTCDate(),
            endHour,
            endMin
          )
        );
        pushRange(start, end);
      });
    } else if (obs?.rainfall?.["time-start"] && obs?.rainfall?.["time-end"]) {
      const [startHour, startMin] = String(obs.rainfall["time-start"])
        .split(":")
        .map(Number);
      const [endHour, endMin] = String(obs.rainfall["time-end"])
        .split(":")
        .map(Number);
      if (
        !Number.isNaN(startHour) &&
        !Number.isNaN(startMin) &&
        !Number.isNaN(endHour) &&
        !Number.isNaN(endMin)
      ) {
        const slotDate = new Date(obsTime);
        if (obsTime.getUTCHours() === 0) {
          slotDate.setUTCDate(slotDate.getUTCDate() - 1);
        }
        const start = new Date(
          Date.UTC(
            slotDate.getUTCFullYear(),
            slotDate.getUTCMonth(),
            slotDate.getUTCDate(),
            startHour,
            startMin
          )
        );
        const end = new Date(
          Date.UTC(
            slotDate.getUTCFullYear(),
            slotDate.getUTCMonth(),
            slotDate.getUTCDate(),
            endHour,
            endMin
          )
        );
        pushRange(start, end);
      }
    }

    return ranges;
  };

  const detectIntermittent = (slots: Array<{ start: Date; end: Date }>) => {
    if (slots.length <= 1) return false;
    const sorted = [...slots].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );
    for (let i = 0; i < sorted.length - 1; i++) {
      const gapMinutes =
        (sorted[i + 1].start.getTime() - sorted[i].end.getTime()) /
        (1000 * 60);
      if (gapMinutes >= 30) return true;
    }
    return false;
  };

  const currentSlots = buildSlotRanges(weatherObs, currentObservationTime);
  const previousSlots = buildSlotRanges(
    previousWeatherObs,
    previousObservationTime
  );
  const combinedSlots = [...previousSlots, ...currentSlots].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const rainStart = combinedSlots.length ? combinedSlots[0].start : null;
  const rainEnd = combinedSlots.length
    ? combinedSlots[combinedSlots.length - 1].end
    : null;
  const isIntermittentRain = detectIntermittent(combinedSlots);

  if (!shouldInclude6RRRtR || precipRaw <= 0) {
    measurements[7] = "";
  } else {
    let tR = "/";
    const H = currentObservationTime;
    const H_3 = new Date(H.getTime() - 3 * 60 * 60 * 1000);
    const H_6 = new Date(H.getTime() - 6 * 60 * 60 * 1000);

    if (!previousWeatherObs) {
      tR = "/";
    } else if (rainStart && rainEnd) {
      if (isIntermittentRain) {
        if (rainStart < H_6 || rainEnd > H) {
          tR = "/";
        } else if (rainEnd <= H_3) {
          tR = "1";
        } else if (rainStart >= H_3) {
          tR = "2";
        } else {
          tR = "3";
        }
      } else {
        if (rainStart < H_6 || rainEnd > H) {
          tR = "/";
        } else {
          const durationHours =
            (rainEnd.getTime() - rainStart.getTime()) / (1000 * 60 * 60);
          let hoursSinceEnd =
            (H.getTime() - rainEnd.getTime()) / (1000 * 60 * 60);

          if (hoursSinceEnd < 0) hoursSinceEnd += 24;

          if (durationHours <= 2) {
            if (hoursSinceEnd <= 2) tR = "4";
            else if (hoursSinceEnd <= 4) tR = "5";
            else if (hoursSinceEnd <= 6) tR = "6";
          } else if (durationHours <= 4) {
            if (hoursSinceEnd <= 2) tR = "7";
            else if (hoursSinceEnd <= 4) tR = "8";
          } else if (durationHours <= 6 && hoursSinceEnd <= 2) {
            tR = "9";
          } else {
            tR = "/";
          }
        }
      }
    } else {
      tR = "/";
    }

    measurements[7] = `6${pad((precipMm % 1000).toString(), 3)}${tR}`;
  }

  // 9. 7wwW1W2 (52-56) - Weather codes
  const presentWeather = firstCard.presentWeatherWW || "00";
  const pastWeather1 = firstCard.pastWeatherW1 || "0";
  const pastWeather2 = firstCard.pastWeatherW2 || "0";
  measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`;

  // 10. 8NhClCmCh (57-61) - Cloud information
  // "8NhClCmCh 57-61" field data come from: 8 is constant + "clouds>low>amount" from "weather-obserbations.json"+"clouds>low>form"+"clouds>medium>form"+"clouds>high>form"
  const lowAmount = weatherObs.clouds?.low?.amount || "0";
  const lowForm = weatherObs.clouds?.low?.form || "0";
  const mediumForm = weatherObs.clouds?.medium?.form || "0";
  const highForm = weatherObs.clouds?.high?.form || "0";
  measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`;

  // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
  const minTemp = Number.parseFloat(firstCard.maxMinTempAsRead || "0");
  let sN, x;
  if (minTemp >= 0) {
    sN = 0;
    x = 1;
  } else {
    sN = 1;
    x = 2;
  }
  const conVertMinTemp = pad(Math.abs(Math.round(minTemp * 10)), 3);
  measurements[10] = `${x}${sN}${conVertMinTemp}`;

  // 12. 56DlDmDh (67-71) - Cloud directions
  // "56DlDmDh 67-71" field data come from: 56 is constant+ low cloud direction "clouds>low>direction" from "weather-obserbations.json" + medium cloud direction "clouds>medium>direction" from "weather-obserbations.json" + high cloud direction "clouds>high>direction" "weather-obserbations.json"
  const lowDir = weatherObs.clouds?.low?.direction || "0";
  const mediumDir = weatherObs.clouds?.medium?.direction || "0";
  const highDir = weatherObs.clouds?.high?.direction || "0";
  measurements[11] = `56${lowDir}${mediumDir}${highDir}`;

  // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
  // const pressureTendency = firstCard.pressureChange24h?.toString()[0] || "0";
  // measurements[12] = `57${pressureTendency}00`;

  // 14. Av. Total Cloud (56) - Total cloud amount
  measurements[13] = totalCloud;

  // 15. C2 (16) - Always 2
  // "C2 16": all are 2
  measurements[14] = "2";

  // 16. GG (17-18) - Observation time (3 hour gap)
  // "GG 17-18" : this field data means time 3houre gap data 03 , 06, 09
  const obsTime = weatherObs.observer?.["observation-time"] || "";
  let hour = "00";
  if (obsTime) {
    const timePart = obsTime.split("T")[1] || "";
    const hours = Number.parseInt(timePart.split(":")[0] || "0");
    hour = pad(Math.floor(hours / 3) * 3, 2);
  }
  measurements[15] = hour;

  // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
  // "58P24P24P24/59P24P24P24 19-23" this field data come from: "pressureChange24h" of "first-card-data.json" if value is possitive then code value is 58 else 59 + Value of "pressureChange24h"
  const pressureChange = Number.parseFloat(firstCard.pressureChange24h || "0");
  const pressureChangeIndicator = pressureChange >= 0 ? "58" : "59";
  const absPressureChange = pad(Math.abs(Math.round(pressureChange * 10)), 3);
  measurements[16] = `${pressureChangeIndicator}${absPressureChange}`;

  // 18. (6RRRtR)/7R24R24R24R24 (24-28) - Precipitation
  measurements[17] = `7${formatR24RainfallAmount(
    weatherObs.rainfall?.["last-24-hours"]
  )}`;

  // 19. 8N5Ch5h5 (29-33) - Cloud information
  const lowFormSig = weatherObs.significantClouds?.layer1?.form || "0";
  const mediumFormSig = weatherObs.significantClouds?.layer2?.form || "0";
  const highFormSig = weatherObs.significantClouds?.layer3?.form || "0";

  const lowAmountSig = weatherObs.significantClouds?.layer1?.amount || "0";
  const mediumAmountSig = weatherObs.significantClouds?.layer2?.amount || "0";
  const highAmountSig = weatherObs.significantClouds?.layer3?.amount || "0";

  const lowHeightSig = pad(
    (Number(weatherObs.significantClouds?.layer1?.height) || 0) * 10,
    2
  );
  const mediumHeightSig = pad(
    (Number(weatherObs.significantClouds?.layer2?.height) || 0) * 10,
    2
  );
  const highHeightSig = pad(
    (Number(weatherObs.significantClouds?.layer3?.height) || 0) * 10,
    2
  );

  measurements[18] = `8${lowAmountSig}${lowFormSig}${lowHeightSig} / 8${mediumAmountSig}${mediumFormSig}${mediumHeightSig} / 8${highAmountSig}${highFormSig}${highHeightSig}`;

  // 20. 90dqqqt (34-38) - Dew point depression
  const dewDepression = dryBulb - dewPoint;
  measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`;

  // 21. 91fqfqfq (39-43) - Relative humidity
  const humidity = firstCard.relativeHumidity || "0";
  measurements[20] = `91${pad(humidity, 3)}`;

  // Create the form values
  const formValues: SynopticFormValues = {
    dataType: "SYNOP",
    stationNo,
    year: now.getFullYear().toString(),
    month: pad(now.getMonth() + 1, 2),
    day: pad(now.getDate(), 2),
    weatherRemark: weatherObs.observer?.["observer-initial"] || "",
    measurements,
  };

  return formValues;
}
import remarksData from "../data/remarksdata";

export const getRemarksFromPresentWeather = (presentWeather: string) => {
  const remarks = remarksData[presentWeather];
  if (remarks) {
    return `${remarks.symbol} - ${remarks.description}`;
  } else {
    return "/remarks/default.png - No remark available for this weather code";
  }
};
