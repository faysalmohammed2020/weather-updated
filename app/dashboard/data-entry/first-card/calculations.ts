// app/dashboard/data-entry/first-card/calculations.ts

import React from "react";
import { toast } from "sonner";
import { hygrometricTable } from "@/data/hygrometric-table";
import { stationDataMap } from "@/data/station-data-map";

export type HygrometricData = {
  dryBulb: string;
  wetBulb: string;
  difference: string;
  dewPoint: string;
  relativeHumidity: string;
};

// ✅ BMD Temperature Validation Helper (pure)
export const validateTemperatureInputs = (dryBulb?: string, wetBulb?: string) => {
  if (!dryBulb || !wetBulb) return { isValid: true };

  const dryBulbValue = Number.parseFloat(
    `${dryBulb.slice(0, 2)}.${dryBulb.slice(2)}`
  );
  const wetBulbValue = Number.parseFloat(
    `${wetBulb.slice(0, 2)}.${wetBulb.slice(2)}`
  );

  if (wetBulbValue > dryBulbValue) {
    return {
      isValid: false,
      message:
        "❌ BMD নিয়ম অনুযায়ী Wet Bulb Temperature কখনোই Dry Bulb এর চেয়ে বেশি হতে পারে না!",
    };
  }

  return { isValid: true };
};

// Factory: formik + state setter inject করে আগের function as-is রাখা
export const createDewPointAndHumidityCalculator = (
  setHygrometricData: React.Dispatch<React.SetStateAction<HygrometricData>>,
  formik: any
) => {
  return (dryBulbInput?: string, wetBulbInput?: string) => {
    if (!dryBulbInput || !wetBulbInput) return;

    const dryBulbValue = Number.parseFloat(
      `${dryBulbInput.slice(0, 2)}.${dryBulbInput.slice(2)}`
    );
    const wetBulbValue = Number.parseFloat(
      `${wetBulbInput.slice(0, 2)}.${wetBulbInput.slice(2)}`
    );

    // ✅ BMD Rule 1: Wet Bulb can't be higher than Dry Bulb
    if (wetBulbValue > dryBulbValue) {
      toast.error("❌ BMD নিয়ম লঙ্ঘন!", {
        description:
          "Wet Bulb Temperature কখনোই Dry Bulb Temperature এর চেয়ে বেশি হতে পারে না।",
        duration: 5000,
      });
      return;
    }

    // ✅ BMD Rule 2: When Dry Bulb = Wet Bulb, Dew Point = Same value
    if (dryBulbValue === wetBulbValue) {
      const formattedTemp = dryBulbInput;

      setHygrometricData({
        dryBulb: dryBulbValue.toFixed(1),
        wetBulb: wetBulbValue.toFixed(1),
        difference: "0.0",
        dewPoint: formattedTemp,
        relativeHumidity: "100",
      });

      formik.setFieldValue("Td", formattedTemp);
      formik.setFieldValue("relativeHumidity", "100");

      toast.success("✅ BMD নিয়ম অনুযায়ী হিসাব সম্পন্ন!", {
        description: `Dry Bulb = Wet Bulb = ${dryBulbValue.toFixed(
          1
        )}°C, তাই Dew Point = ${dryBulbValue.toFixed(1)}°C`,
        duration: 4000,
      });
      return;
    }

    // ✅ Normal calculation when Dry Bulb ≠ Wet Bulb
    const difference = Number(Math.abs(dryBulbValue - wetBulbValue).toFixed(1));
    const roundedDryBulb = Math.round(dryBulbValue);

    if (roundedDryBulb < 0 || roundedDryBulb > 50 || difference > 30.0) {
      toast.error(
        "Temperature values are outside the range of the hygrometric table"
      );
      return;
    }

    const diffIndex = hygrometricTable.differences.indexOf(difference);
    if (diffIndex === -1) {
      toast.error("Invalid temperature difference for lookup");
      return;
    }

    const dbtEntry = hygrometricTable.data.find(
      (entry) => entry.dbT === roundedDryBulb
    );
    if (!dbtEntry || !dbtEntry.values || !dbtEntry.values[diffIndex]) {
      toast.error(
        "Could not find matching dry bulb temperature or difference in the table"
      );
      return;
    }

    const { DpT, RH } = dbtEntry.values[diffIndex];

    const formattedDpT = (DpT * 10).toFixed(0);
    const formattedRH = RH === 100 ? "100" : RH.toString().padStart(3, "0");

    setHygrometricData({
      dryBulb: dryBulbValue.toFixed(1),
      wetBulb: wetBulbValue.toFixed(1),
      difference: difference.toString(),
      dewPoint: formattedDpT,
      relativeHumidity: formattedRH,
    });

    formik.setFieldValue("Td", formattedDpT);
    formik.setFieldValue("relativeHumidity", formattedRH);

    toast.success("✅ Dew point and relative humidity calculated successfully");
  };
};

export const calculatePressureValues = (
  dryBulb: string,
  barAsRead: string,
  stationId: string
) => {
  if (!dryBulb || !barAsRead || !stationId) return;

  const userStationData = stationDataMap[stationId];
  if (!userStationData) {
    toast.error("Station data not found");
    return;
  }

  const correctionTable = userStationData.station.correction_table;
  const dryBulbValue = Number.parseFloat(dryBulb) / 10;
  const roundedDryBulb = Math.round(dryBulbValue);

  const barAsReadValue = Number.parseFloat(barAsRead) / 10;

  const correctionEntry = correctionTable.find(
    (entry) => entry.dry_bulb_temp_c === roundedDryBulb
  );

  if (!correctionEntry) {
    toast.error(
      `Dry bulb temperature ${roundedDryBulb}°C not found in correction table`
    );
    return;
  }

  const availablePressures = Object.keys(
    correctionEntry.cistern_level_pressure
  )
    .map(Number)
    .sort((a, b) => a - b);

  const closestPressure = availablePressures.reduce((prev, curr) =>
    Math.abs(curr - barAsReadValue) < Math.abs(prev - barAsReadValue)
      ? curr
      : prev
  );

  const heightCorrection =
    correctionEntry.cistern_level_pressure[closestPressure.toString()];
  const stationLevelPressure = barAsReadValue + heightCorrection;

  const seaLevelCorrection =
    correctionEntry.sea_level_pressure?.[closestPressure.toString()];

  return {
    stationLevelPressure: Math.round(stationLevelPressure * 10)
      .toString()
      .padStart(5, "0"),
    heightDifference: `+${Math.round(heightCorrection * 100)}`,
    seaLevelReduction:
      seaLevelCorrection !== undefined
        ? `+${Math.round(seaLevelCorrection * 100)}`
        : undefined,
  };
};

export const calculateSeaLevelPressure = (
  dryBulb: string,
  stationLevelPressure: string,
  stationId: string
) => {
  if (!dryBulb || !stationLevelPressure || !stationId) return;

  const userStationData = stationDataMap[stationId];
  if (!userStationData) {
    toast.error("Station data not found");
    return;
  }

  const seaCorrectionTable = userStationData.sea.correction_table;
  const dryBulbValue = Number.parseFloat(dryBulb) / 10;
  const roundedDryBulb = Math.round(dryBulbValue);

  const stationPressureValue = Number.parseFloat(stationLevelPressure) / 10;

  const correctionEntry = seaCorrectionTable.find(
    (entry) => entry.dry_bulb_temp_c === roundedDryBulb
  );

  if (!correctionEntry) {
    toast.error(
      `Dry bulb temperature ${roundedDryBulb}°C not found in sea level correction table`
    );
    return;
  }

  const availablePressures = Object.keys(
    correctionEntry.station_level_pressure
  )
    .map(Number)
    .sort((a, b) => a - b);

  const closestPressure = availablePressures.reduce((prev, curr) =>
    Math.abs(curr - stationPressureValue) <
    Math.abs(prev - stationPressureValue)
      ? curr
      : prev
  );

  const seaLevelReduction =
    correctionEntry.station_level_pressure[closestPressure.toString()];
  const seaLevelPressure = stationPressureValue + seaLevelReduction;

  return {
    seaLevelReduction: `+${Math.round(seaLevelReduction * 100)}`,
    correctedSeaLevelPressure: Math.round(seaLevelPressure * 10)
      .toString()
      .padStart(5, "0"),
  };
};
