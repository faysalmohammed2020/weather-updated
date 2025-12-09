import { stationDataMap } from "@/data/station-data-map";

export interface SeaLevelResult {
  seaLevelReduction: string;
  correctedSeaLevelPressure: string;
}

export const calculateSeaLevelPressure = (
  dryBulb: string,
  stationLevelPressure: string,
  stationId: string
): SeaLevelResult | null => {
  if (!dryBulb || !stationLevelPressure || !stationId) return null;

  try {
    const userStationData = stationDataMap[stationId];
    if (!userStationData) {
      return null;
    }

    const seaCorrectionTable = userStationData.sea.correction_table;
    const dryBulbValue = Number.parseFloat(dryBulb) / 10;
    const roundedDryBulb = Math.round(dryBulbValue);

    const stationPressureValue = Number.parseFloat(stationLevelPressure) / 10;

    const correctionEntry = seaCorrectionTable.find(
      (entry) => entry.dry_bulb_temp_c === roundedDryBulb
    );

    if (!correctionEntry) {
      return null;
    }

    const availablePressures = Object.keys(
      correctionEntry.station_level_pressure
    )
      .map(Number)
      .sort((a, b) => a - b);

    const closestPressure = availablePressures.reduce((prev, curr) =>
      Math.abs(curr - stationPressureValue) < Math.abs(prev - stationPressureValue)
        ? curr
        : prev
    );

    const seaLevelReduction =
      (correctionEntry.station_level_pressure as Record<string, number>)[closestPressure.toString()];
    const seaLevelPressure = stationPressureValue + seaLevelReduction;

    return {
      seaLevelReduction: `+${Math.round(seaLevelReduction * 100)}`,
      correctedSeaLevelPressure: Math.round(seaLevelPressure * 10)
        .toString()
        .padStart(5, "0"),
    };
  } catch (error) {
    console.error("Error calculating sea level pressure:", error);
    return null;
  }
};

