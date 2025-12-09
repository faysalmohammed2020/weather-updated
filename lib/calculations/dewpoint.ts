import { hygrometricTable } from "@/data/hygrometric-table";

export interface DewPointResult {
  Td: string;
  relativeHumidity: string;
}

export const calculateDewPointAndHumidity = (
  dryBulbInput: string,
  wetBulbInput: string
): DewPointResult | null => {
  if (!dryBulbInput || !wetBulbInput) return null;

  try {
    const dryBulbValue = Number.parseFloat(
      `${dryBulbInput.slice(0, 2)}.${dryBulbInput.slice(2)}`
    );
    const wetBulbValue = Number.parseFloat(
      `${wetBulbInput.slice(0, 2)}.${wetBulbInput.slice(2)}`
    );

    const difference = Number(
      Math.abs(dryBulbValue - wetBulbValue).toFixed(1)
    );
    const roundedDryBulb = Math.round(dryBulbValue);

    if (roundedDryBulb < 0 || roundedDryBulb > 50 || difference > 30.0) {
      return null;
    }

    const diffIndex = hygrometricTable.differences.indexOf(difference);
    if (diffIndex === -1) {
      return null;
    }

    const dbtEntry = hygrometricTable.data.find(
      (entry) => entry.dbT === roundedDryBulb
    );
    if (!dbtEntry || !dbtEntry.values || !dbtEntry.values[diffIndex]) {
      return null;
    }

    const { DpT, RH } = dbtEntry.values[diffIndex];

    if (DpT === null || RH === null) {
      return null;
    }

    return {
      Td: DpT.toString(),
      relativeHumidity: RH.toString(),
    };
  } catch (error) {
    console.error("Error calculating dew point and humidity:", error);
    return null;
  }
};

