// app/api/synoptic/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTodayUtcRange, utcToHour } from "@/lib/utils";
import { getSession } from "@/lib/getSession";

 export const dynamic = "force-dynamic";
 export const revalidate = 0;

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { startToday, endToday } = getTodayUtcRange();

    const observingTime = await prisma.observingTime.findFirst({
      where: {
        AND: [
          {
            utcTime: {
              gte: startToday,
              lte: endToday,
            },
          },
          {
            stationId: session.user.station?.id,
          },
        ],
      },
      orderBy: { utcTime: "desc" },
      include: {
        MeteorologicalEntry: true,
        WeatherObservation: true,
      },
    });

    if (
      !observingTime?.MeteorologicalEntry.length ||
      !observingTime?.WeatherObservation.length
    ) {
      return NextResponse.json(
        { error: "First or second card data not found" },
        { status: 404 },
      );
    }

    const firstCard = observingTime?.MeteorologicalEntry[0];
    const weatherObs = observingTime?.WeatherObservation[0];

    // Get the observation date from the most recent record
    const dateObj = new Date(observingTime.utcTime);
    const previousObservationTime = new Date(
      dateObj.getTime() - 3 * 60 * 60 * 1000,
    );
    const previousStart = new Date(
      Date.UTC(
        previousObservationTime.getUTCFullYear(),
        previousObservationTime.getUTCMonth(),
        previousObservationTime.getUTCDate(),
        previousObservationTime.getUTCHours(),
        0,
        0,
        0,
      ),
    );
    const previousEnd = new Date(previousStart.getTime() + 3 * 60 * 60 * 1000);

    const stationId = session.user.station?.id;
    const previousObservingTime = stationId
      ? await prisma.observingTime.findFirst({
          where: {
            stationId,
            utcTime: {
              gte: previousStart,
              lt: previousEnd,
            },
          },
          orderBy: { utcTime: "desc" },
          include: { WeatherObservation: true },
        })
      : null;
    const previousWeatherObs =
      previousObservingTime?.WeatherObservation?.[0] ?? null;

    // Initialize measurements array
    const measurements: string[] = Array(21).fill("");

    // Helper functions
    const pad = (
      num: number | string | null | undefined,
      length: number,
    ): string => {
      return String(num ?? 0).padStart(length, "0");
    };

    const getTempValue = (temp: number | null | undefined): string => {
      const safeTemp = temp ?? 0;
      const sign = safeTemp >= 0 ? "0" : "1";
      const absTemp = Math.abs(Math.round(safeTemp * 10));
      return `${sign}${pad(absTemp, 3)}`;
    };

    // 1. C1 (16) - Always 1
    measurements[0] = "1";

    // 2. Iliii (17-21) - Station number (5 digits)
    const stationNo = session.user.station?.stationId as string;
    measurements[1] = stationNo;

    // 3. iRiXhvv (22-26) - 32 + low cloud height + visibility
    const hour = dateObj.getUTCHours();
    let iR: string;

    if (weatherObs.rainfallType && weatherObs.rainfallType !== "") {
      // Has precipitation
      if ([0, 6, 12, 18].includes(hour)) {
        iR = "1"; // rainfall observe time 00,06,12,18
      } else if ([3, 9, 15, 21].includes(hour)) {
        iR = "2"; // rainfall observe time 03,09,15,21
      } else {
        iR = "1"; // default to 1 for other hours with precipitation
      }
    } else {
      iR = "3"; // No precipitation
    }

    // iX logic based on present weather code
    const ww = Number(firstCard.presentWeatherWW) || 0;

    let iX: string;
    if (ww >= 0 && ww <= 4) {
      iX = "2";
    } else {
      iX = "1";
    }

    const lowCloudHeight = weatherObs.lowCloudHeight || "0";

    const kmToVV = (km: number): number | null => {
      if (!Number.isFinite(km)) return null;

      // Special cases for very low visibility
      if (km === 0.05) return 90; // 0.05 km
      if (km === 0) return 0; // 0.0 km -> 00
      if (km < 0.1) return null; // Other values < 0.1 not valid

      // 0.1 .. 5.0  => 01 .. 50
      if (km >= 0.1 && km <= 5.0) {
        const code = Math.round(km * 10); // 0.1->1, 1.0->10, 5.0->50
        return code; // 1..50
      }

      // 5.1 .. 5.5 would produce 51..55, which are NOT USED
      if (km > 5.0 && km < 6.0) return null;

      // 6 .. 30 => 56 .. 80 (must be integer km)
      if (km >= 6 && km <= 30) {
        if (!Number.isInteger(km)) return null; // avoid 6.3 etc
        return km + 50; // 6->56, 30->80
      }

      // Extended range values
      if (km === 35) return 81;
      if (km === 40) return 82;
      if (km === 45) return 83;
      if (km === 50) return 84;
      if (km === 55) return 85;
      if (km === 60) return 86;
      if (km === 65) return 87;
      if (km === 70) return 88;
      if (km === 75) return 89;

      // Special high visibility codes
      if (km === 0.2) return 92; // Alternative mapping for 0.2 km
      if (km === 0.5) return 93; // Alternative mapping for 0.5 km
      if (km === 1) return 94; // Alternative mapping for 1 km
      if (km === 2) return 95; // Alternative mapping for 2 km
      if (km === 4) return 96; // Alternative mapping for 4 km
      if (km === 10) return 97; // Alternative mapping for 10 km
      if (km === 20) return 98; // Alternative mapping for 20 km
      if (km === 50) return 99; // Alternative mapping for 50 km

      return null;
    };

    const pad2 = (n: number) => String(n).padStart(2, "0");

    const visibilityKm = Number(firstCard.horizontalVisibility) / 10 || 0;

    const vvCode = kmToVV(visibilityKm);
    const VV = vvCode === null ? "00" : pad2(vvCode);

    measurements[2] = `${iR}${iX}${lowCloudHeight}${VV}`;

    // 4. Nddff (27-31) - Total cloud + wind direction + speed
    const totalCloud = weatherObs.totalCloudAmount || "0";
    const windDirectionDeg = Number(weatherObs.windDirection) || 0;
    const windSpeedKnots = Number(weatherObs.windSpeed) || 0;

    let dd;
    if (windSpeedKnots === 0) {
      dd = "00";
    } else {
      let directionCode;
      if (windDirectionDeg >= 355) {
        directionCode = 36;
      } else {
        directionCode = Math.floor((windDirectionDeg + 5) / 10);
      }
      dd = pad(directionCode, 2);
    }

    let ff;
    if (windSpeedKnots >= 100) {
      const numericDd = parseInt(dd, 10);
      dd = pad(numericDd + 50, 2);
      ff = pad(windSpeedKnots - 100, 2);
    } else {
      ff = pad(windSpeedKnots, 2);
    }
    measurements[3] = `${totalCloud}${dd}${ff}`;

    // 5. 1SnTTT (32-36) - Dry bulb temperature
    const dryBulb = Number.parseFloat(firstCard.dryBulbAsRead || "0") / 10;
    measurements[4] = `1${getTempValue(dryBulb)}`;

    // 6. 2SnTdTdTd (37-41) - Dew point temperature
    // Remove last '0' if it exists and Td ends with '0'
    const dewPointRaw = firstCard.Td || "0";
    const dewPointTrimmed = dewPointRaw.endsWith("0")
      ? dewPointRaw.slice(0, -1) // remove last character
      : dewPointRaw;

    const dewPoint = Number.parseFloat(dewPointTrimmed);
    measurements[5] = `2${getTempValue(dewPoint)}`;

    // 7. 3PPP/4PPP (42-46) - Station/sea level pressure
    const formatPressure = (pressure: number | string | undefined): string => {
      const str = pressure?.toString().replace(".", "") || "0000";
      return str.slice(-4).padStart(4, "0");
    };

    const stationPressure = formatPressure(firstCard.stationLevelPressure);
    const seaLevelPressure = formatPressure(
      firstCard.correctedSeaLevelPressure,
    );

    measurements[6] = `3${stationPressure}/4${seaLevelPressure}`;

    // 8. 6RRRtR (47-51) - Precipitation
    const observationTime = dateObj; // H (current observation time)
    const obsHour = observationTime.getUTCHours();
    const shouldInclude6RRRtR = [0, 6, 12, 18].includes(obsHour);

    // Rainfall can arrive as decimal mm ("8.3") or coded tenths ("0083").
    const parseRainfallMm = (value: unknown): number | null => {
      if (value === null || value === undefined) return null;
      const raw = String(value).trim();
      if (!raw) return null;

      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) return null;

      return raw.includes(".") || raw.length < 4 ? parsed : parsed / 10;
    };

    const formatRainfallAmount = (
      amountMm: number | null,
      rounding: "floor" | "round" = "floor",
    ) => {
      if (amountMm === null || !Number.isFinite(amountMm)) return "000";
      const wholeMm =
        rounding === "round" ? Math.round(amountMm) : Math.floor(amountMm);
      return pad((Math.max(0, wholeMm) % 1000).toString(), 3);
    };

    const parseLegacyRainValue = (value: unknown) => {
      if (value === null || value === undefined) return null;
      if (typeof value === "string" && value.trim() === "") return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const legacyRainFallRaw =
      parseLegacyRainValue(weatherObs.rainfallDuringPrevious) ?? 0;
    const legacyRainFallMm = Math.floor(legacyRainFallRaw / 10);
    const legacyRainFallPadded = pad(
      (legacyRainFallMm % 1000).toString(),
      3,
    );

    const buildSlotRanges = (
      obs: typeof weatherObs | null,
      obsTime: Date,
    ): Array<{ start: Date; end: Date }> => {
      if (!obs) return [];
      const ranges: Array<{ start: Date; end: Date }> = [];

      const pushRange = (start: Date, end: Date) => {
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return;
        }
        let normalizedEnd = end;
        if (end.getTime() < start.getTime()) {
          normalizedEnd = new Date(end.getTime() + 24 * 60 * 60 * 1000);
        }
        ranges.push({ start, end: normalizedEnd });
      };

      if (obs.rainfallTimeSlots && Array.isArray(obs.rainfallTimeSlots)) {
        const slotDate = new Date(obsTime);
        if (obsTime.getUTCHours() === 0) {
          slotDate.setUTCDate(slotDate.getUTCDate() - 1);
        }

        (
          obs.rainfallTimeSlots as Array<{
            id: string;
            timeStart: string;
            timeEnd: string;
          }>
        )
          .filter((slot) => slot.timeStart && slot.timeEnd)
          .forEach((slot) => {
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
                startMin,
              ),
            );
            const end = new Date(
              Date.UTC(
                slotDate.getUTCFullYear(),
                slotDate.getUTCMonth(),
                slotDate.getUTCDate(),
                endHour,
                endMin,
              ),
            );
            pushRange(start, end);
          });
      } else if (obs.rainfallTimeStart && obs.rainfallTimeEnd) {
        const start = new Date(obs.rainfallTimeStart);
        const end = new Date(obs.rainfallTimeEnd);
        pushRange(start, end);
      }

      return ranges;
    };

    const detectIntermittent = (slots: Array<{ start: Date; end: Date }>) => {
      if (slots.length <= 1) return false;
      const sorted = [...slots].sort(
        (a, b) => a.start.getTime() - b.start.getTime(),
      );
      for (let i = 0; i < sorted.length - 1; i++) {
        const gapMinutes =
          (sorted[i + 1].start.getTime() - sorted[i].end.getTime()) /
          (1000 * 60);
        if (gapMinutes >= 30) return true;
      }
      return false;
    };

    const currentSlots = buildSlotRanges(weatherObs, observationTime);
    const previousSlots = buildSlotRanges(
      previousWeatherObs,
      previousObservationTime,
    );
    const combinedSlots = [...previousSlots, ...currentSlots].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );

    const rainStart = combinedSlots.length ? combinedSlots[0].start : null;
    const rainEnd = combinedSlots.length
      ? combinedSlots[combinedSlots.length - 1].end
      : null;
    const isIntermittentRain = detectIntermittent(combinedSlots);

    const build6RRRtrGroup = (
      amountMm: number | null,
      options: { includeZero?: boolean } = {},
    ) => {
      if (
        amountMm === null ||
        !Number.isFinite(amountMm) ||
        (!options.includeZero && amountMm <= 0)
      ) {
        return "";
      }

      let tr = "/";

      // Rainfall window (previous 6 hours via two timecards)
      const H = observationTime;
      const H_3 = new Date(H.getTime() - 3 * 60 * 60 * 1000);
      const H_6 = new Date(H.getTime() - 6 * 60 * 60 * 1000);

      if (!previousWeatherObs) {
        tr = "/";
      } else if (rainStart && rainEnd) {
        if (isIntermittentRain) {
          // WMO chart: Intermittent rain (tR = 1..3)
          // 1: occurred only in H-6..H-3
          // 2: occurred only in H-3..H
          // 3: occurred in both halves (spans across H-3)
          if (rainStart < H_6 || rainEnd > H) {
            tr = "/";
          } else if (rainEnd <= H_3) {
            tr = "1";
          } else if (rainStart >= H_3) {
            tr = "2";
          } else {
            tr = "3";
          }
        } else {
          // Continuous rain - WMO tr = 4-9
          if (rainStart < H_6 || rainEnd > H) {
            tr = "/";
          } else {
            const durationHours =
              (rainEnd.getTime() - rainStart.getTime()) / (1000 * 60 * 60);
            let hoursSinceEnd =
              (H.getTime() - rainEnd.getTime()) / (1000 * 60 * 60);

            if (hoursSinceEnd < 0) hoursSinceEnd += 24;

            if (durationHours <= 2) {
              if (hoursSinceEnd <= 2) tr = "4";
              else if (hoursSinceEnd <= 4) tr = "5";
              else if (hoursSinceEnd <= 6) tr = "6";
            } else if (durationHours <= 4) {
              if (hoursSinceEnd <= 2) tr = "7";
              else if (hoursSinceEnd <= 4) tr = "8";
            } else if (durationHours <= 6 && hoursSinceEnd <= 2) {
              tr = "9";
            } else {
              tr = "/";
            }
          }
        }
      } else {
        // If rain amount exists but no timing, image/chart doesn't define a code
        tr = "/";
      }

      return `6${formatRainfallAmount(amountMm)}${tr}`;
    };

    if (!shouldInclude6RRRtR) {
      measurements[7] = "";
    } else {
      let tr = "/";

      // Original section-1 logic: preserve its historical amount handling.
      const H = observationTime;
      const H_3 = new Date(H.getTime() - 3 * 60 * 60 * 1000);
      const H_6 = new Date(H.getTime() - 6 * 60 * 60 * 1000);

      if (!previousWeatherObs) {
        tr = "/";
      } else if (rainStart && rainEnd) {
        if (isIntermittentRain) {
          if (rainStart < H_6 || rainEnd > H) {
            tr = "/";
          } else if (rainEnd <= H_3) {
            tr = "1";
          } else if (rainStart >= H_3) {
            tr = "2";
          } else {
            tr = "3";
          }
        } else if (rainStart < H_6 || rainEnd > H) {
          tr = "/";
        } else {
          const durationHours =
            (rainEnd.getTime() - rainStart.getTime()) / (1000 * 60 * 60);
          let hoursSinceEnd =
            (H.getTime() - rainEnd.getTime()) / (1000 * 60 * 60);

          if (hoursSinceEnd < 0) hoursSinceEnd += 24;

          if (durationHours <= 2) {
            if (hoursSinceEnd <= 2) tr = "4";
            else if (hoursSinceEnd <= 4) tr = "5";
            else if (hoursSinceEnd <= 6) tr = "6";
          } else if (durationHours <= 4) {
            if (hoursSinceEnd <= 2) tr = "7";
            else if (hoursSinceEnd <= 4) tr = "8";
          } else if (durationHours <= 6 && hoursSinceEnd <= 2) {
            tr = "9";
          } else {
            tr = "/";
          }
        }
      } else {
        tr = "/";
      }

      measurements[7] = `6${legacyRainFallPadded}${tr}`;
    }

    // 9. 7wwW1W2 (52-56) - Weather codes
    const presentWeather = firstCard.presentWeatherWW || "00";
    const pastWeather1 = firstCard.pastWeatherW1 || "0";
    const pastWeather2 = firstCard.pastWeatherW2 || "0";
    measurements[8] = `7${presentWeather}${pastWeather1}${pastWeather2}`;

    // 10. 8NhClCmCh (57-61) - Cloud information
    const lowAmount = weatherObs.lowCloudAmount || "";
    const lowForm = weatherObs.lowCloudForm || "";
    const mediumForm = weatherObs.mediumCloudForm || "";
    const highForm = weatherObs.highCloudForm || "";

    const isZeroOrEmpty = (v: unknown) => {
      if (v === null || v === undefined) return true;
      const s = String(v).trim();
      return s === "" || s === "0";
    };

    if (
      isZeroOrEmpty(lowAmount) &&
      isZeroOrEmpty(lowForm) &&
      isZeroOrEmpty(mediumForm) &&
      isZeroOrEmpty(highForm)
    ) {
      measurements[9] = ""; // একেবারেই খালি
    } else {
      measurements[9] = `8${lowAmount}${lowForm}${mediumForm}${highForm}`;
    }

    // 11. 2SnTnTnTn/InInInIn (62-66) - Min temperature / ground state
    const minTemp = Number.parseFloat(firstCard.maxMinTempAsRead || "0") / 10;

    let sN, x;
    if (minTemp >= 0) {
      sN = 0;
    } else {
      sN = 1;
    }

    const time = utcToHour(observingTime.utcTime.toString());
    if (time === "00" || time === "03") {
      x = 2;
    } else if (time === "09" || time === "12") {
      x = 1;
    }

    const conVertMinTemp = pad(Math.abs(Math.round(minTemp * 10)), 3);
    measurements[10] = x ? `${x}${sN}${conVertMinTemp}` : "";

    // 12. 56DlDmDh (67-71) - Cloud directions
    const lowDir = weatherObs.lowCloudDirection || "0";
    const mediumDir = weatherObs.mediumCloudDirection || "0";
    const highDir = weatherObs.highCloudDirection || "0";
    measurements[11] = `56${lowDir}${mediumDir}${highDir}`;

    // 13. 57CDaEc (72-76) - Characteristic of pressure + pressure tendency
    const specialCloudForm = weatherObs.layer1Form || "0";
    const specialCloudDirection = weatherObs.lowCloudDirection || "0";
    measurements[12] = `57${specialCloudForm}${specialCloudDirection}${specialCloudForm}`;

    // 14. Av. Total Cloud (56) - Total cloud amount
    measurements[13] = totalCloud;

    // 15. C2 (16) - Always 2
    measurements[14] = "2";

    // 16. GG (17-18) - Observation time (3 hour gap)

    measurements[15] = utcToHour(observingTime.utcTime.toString());

    // 17. 58P24P24P24/59P24P24P24 (19-23) - Pressure change
    const pressureChange = firstCard.pressureChange24h || "0000";
    const pressureChangeIndicator =
      Number.parseFloat(pressureChange) >= 0 ? "58" : "59";
    const slicedPressure = pressureChange.slice(-3);
    measurements[16] = `${pressureChangeIndicator}${slicedPressure}`;

    // 18. (6RRRtR)/7R24R24R24 (24-28) - Precipitation
    // 7R24R24R24 is mandatory. 6RRRtR is conditional for 03/09/15/21 UTC.
    const last24RainfallMm = parseRainfallMm(weatherObs.rainfallLast24Hours);
    const group7R24 = `7${formatRainfallAmount(last24RainfallMm, "round")}`;

    const currentSincePreviousMm = parseRainfallMm(
      weatherObs.rainfallSincePrevious,
    );
    const previousSincePreviousMm = parseRainfallMm(
      previousWeatherObs?.rainfallSincePrevious,
    );
    const summedSixHourRainfallMm =
      currentSincePreviousMm === null && previousSincePreviousMm === null
        ? null
        : (currentSincePreviousMm ?? 0) + (previousSincePreviousMm ?? 0);
    const sectionThreeSixHourRainfallMm =
      parseRainfallMm(weatherObs.rainfallDuringPrevious) ??
      summedSixHourRainfallMm;
    const sectionThree6RRRtr = [3, 9, 15, 21].includes(obsHour)
      ? build6RRRtrGroup(sectionThreeSixHourRainfallMm)
      : "";

    measurements[17] = sectionThree6RRRtr
      ? `${sectionThree6RRRtr}/${group7R24}`
      : group7R24;

    // 19. 8N5Ch5h5 (29-33) - Cloud information
    const cloudSegments: string[] = [];

    const pushCloudSegment = (
      amount: string | undefined,
      form: string | undefined,
      height: string | undefined,
    ) => {
      if (amount || form || height) {
        const a = amount || "0";
        const f = form || "0";
        const h = pad(Number(height) || 0, 2);
        cloudSegments.push(`8${a}${f}${h}`);
      }
    };

    pushCloudSegment(
      weatherObs.layer1Amount ?? undefined,
      weatherObs.layer1Form ?? undefined,
      weatherObs.layer1Height ?? undefined,
    );
    pushCloudSegment(
      weatherObs.layer2Amount ?? undefined,
      weatherObs.layer2Form ?? undefined,
      weatherObs.layer2Height ?? undefined,
    );
    pushCloudSegment(
      weatherObs.layer3Amount ?? undefined,
      weatherObs.layer3Form ?? undefined,
      weatherObs.layer3Height ?? undefined,
    );
    pushCloudSegment(
      weatherObs.layer4Amount ?? undefined,
      weatherObs.layer4Form ?? undefined,
      weatherObs.layer4Height ?? undefined,
    );

    measurements[18] = cloudSegments.join(" / ");

    // 20. 90dqqqt (34-38) - Dew point depression
    // const dewDepression = dryBulb - dewPoint;
    // measurements[19] = `90${pad(Math.round(dewDepression * 10), 3)}`;

    const sqD = firstCard.squallDirection;
    const sqT = firstCard.squallTime;

    // Only set measurements[19] if both sqD and sqT have valid values (not 0 or empty)
    if (sqD && sqT && sqD !== "0" && sqT !== "0") {
      measurements[19] = `90${sqD}${sqT}`;
    } else {
      measurements[19] = "";
    }

    // 21. 91fqfqfq (39-43) - Relative humidity
    const fqfqfq = firstCard.squallForce || "0";
    const fqfqfqPadded = pad(Number(fqfqfq), 3);
    if (sqD && sqT && sqD !== "0" && sqT !== "0") {
      measurements[20] = `91${fqfqfqPadded}`;
    } else {
      measurements[20] = "";
    }

    // Create the form values
    const formValues = {
      dataType: "SYNOP",
      stationNo,
      year: dateObj.getUTCFullYear().toString(),
      month: pad(dateObj.getUTCMonth() + 1, 2),
      day: pad(dateObj.getUTCDate(), 2),
      weatherRemark: weatherObs.observerInitial || "",
      measurements,
    };

    return NextResponse.json(formValues, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error generating synoptic code:", error);
    return NextResponse.json(
      { error: "Failed to generate synoptic code" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
