import { stationDataMap } from "@/data/station-data-map";

export interface PressureResult {
  stationLevelPressure: string;
  heightDifference: string;
}

export const calculatePressureValues = (
  dryBulb: string,
  barAsRead: string,
  stationId: string
): PressureResult | null => {
  if (!dryBulb || !barAsRead || !stationId) return null;

  try {
    const userStationData = stationDataMap[stationId];
    if (!userStationData) {
      return null;
    }

    const correctionTable = userStationData.station.correction_table;
    const dryBulbValue = Number.parseFloat(dryBulb) / 10;
    const roundedDryBulb = Math.round(dryBulbValue);

    const barAsReadValue = Number.parseFloat(barAsRead) / 10;

    const correctionEntry = correctionTable.find(
      (entry) => entry.dry_bulb_temp_c === roundedDryBulb
    );

    if (!correctionEntry) {
      return null;
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

    return {
      stationLevelPressure: Math.round(stationLevelPressure * 10)
        .toString()
        .padStart(5, "0"),
      heightDifference: `+${Math.round(heightCorrection * 100)}`,
    };
  } catch (error) {
    console.error("Error calculating pressure values:", error);
    return null;
  }
};

