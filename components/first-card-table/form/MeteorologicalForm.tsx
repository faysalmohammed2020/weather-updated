"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Form, Formik, useFormikContext } from "formik";
import { meteorologicalValidationSchema } from "@/lib/validation/meteorological-schema";
import type {
  MeteorologicalEntry,
  ObservingTimeEntry,
} from "@/types/meteorological";
import FormField from "./FormField";
import AutoCalculatedFields from "./AutoCalculatedFields";
import SquallFields from "./SquallFields";
import { calculateDewPointAndHumidity } from "@/lib/calculations/dewpoint";
import { calculatePressureValues } from "@/lib/calculations/pressure";
import { calculateSeaLevelPressure } from "@/lib/calculations/sea-level";
import { useEffect, useMemo } from "react";

export interface MeteorologicalFormValues {
  subIndicator: string;
  alteredThermometer: string;
  barAsRead: string;
  correctedForIndex: string;
  heightDifference: string;
  stationLevelPressure: string;
  seaLevelReduction: string;
  correctedSeaLevelPressure: string;
  afternoonReading: string;
  pressureChange24h: string;
  dryBulbAsRead: string;
  wetBulbAsRead: string;
  maxMinTempAsRead: string;
  dryBulbCorrected: string;
  wetBulbCorrected: string;
  maxMinTempCorrected: string;
  Td: string;
  relativeHumidity: string;
  squallConfirmed: boolean;
  squallForce: string;
  squallDirection: string;
  squallTime: string;
  horizontalVisibility: string;
  miscMeteors: string;
  pastWeatherW1: string;
  pastWeatherW2: string;
  presentWeatherWW: string;
  c2Indicator: string;
}

interface MeteorologicalFormProps {
  record: MeteorologicalEntry;
  observingTime: ObservingTimeEntry;
  onSubmit: (values: MeteorologicalFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSaving: boolean;
}

const editableFields = [
  { name: "subIndicator", label: "Indicator", highlight: "bg-indigo-50" },
  {
    name: "alteredThermometer",
    label: "Attached Thermometer (°C)",
    highlight: "bg-blue-50",
  },
  { name: "barAsRead", label: "Bar As Read (hPa)", highlight: "bg-indigo-50" },
  {
    name: "correctedForIndex",
    label: "Corrected for Index",
    highlight: "bg-blue-50",
  },
  {
    name: "afternoonReading",
    label: "Altimeter setting (QNH)",
    highlight: "bg-indigo-50",
  },
  {
    name: "pressureChange24h",
    label: "24-Hour Pressure Change",
    highlight: "bg-blue-50",
  },
  {
    name: "dryBulbAsRead",
    label: "Dry Bulb As Read (°C)",
    highlight: "bg-indigo-50",
  },
  {
    name: "wetBulbAsRead",
    label: "Wet Bulb As Read (°C)",
    highlight: "bg-blue-50",
  },
  {
    name: "maxMinTempAsRead",
    label: "MAX/MIN Temp As Read (°C)",
    highlight: "bg-indigo-50",
  },
  {
    name: "dryBulbCorrected",
    label: "Dry Bulb Corrected (°C)",
    highlight: "bg-blue-50",
  },
  {
    name: "wetBulbCorrected",
    label: "Wet Bulb Corrected (°C)",
    highlight: "bg-indigo-50",
  },
  {
    name: "maxMinTempCorrected",
    label: "MAX/MIN Temp Corrected (°C)",
    highlight: "bg-blue-50",
  },
  {
    name: "squallForce",
    label: "Squall Force (KTS)",
    highlight: "bg-indigo-50",
  },
  {
    name: "squallDirection",
    label: "Squall Direction (°)",
    highlight: "bg-blue-50",
  },
  {
    name: "horizontalVisibility",
    label: "Horizontal Visibility (km)",
    highlight: "bg-blue-50",
  },
  { name: "miscMeteors", label: "Misc Meteors (Code)", highlight: "bg-indigo-50" },
  { name: "pastWeatherW1", label: "Past Weather (W1)", highlight: "bg-blue-50" },
  { name: "pastWeatherW2", label: "Past Weather (W2)", highlight: "bg-indigo-50" },
  {
    name: "presentWeatherWW",
    label: "Present Weather (ww)",
    highlight: "bg-blue-50",
  },
  { name: "c2Indicator", label: "C2 Indicator", highlight: "bg-indigo-50" },
];

const autoFields = [
  {
    name: "heightDifference",
    label: "Height Difference Correction (hPa)",
    highlightClass: "bg-indigo-50",
  },
  {
    name: "stationLevelPressure",
    label: "Station Level Pressure (QFE)",
    highlightClass: "bg-blue-50",
  },
  {
    name: "seaLevelReduction",
    label: "Sea Level Reduction",
    highlightClass: "bg-indigo-50",
  },
  {
    name: "correctedSeaLevelPressure",
    label: "Sea Level Pressure (QNH)",
    highlightClass: "bg-blue-50",
  },
  {
    name: "Td",
    label: "Dew Point Temperature (°C)",
    highlightClass: "bg-indigo-50",
  },
  {
    name: "relativeHumidity",
    label: "Relative Humidity (%)",
    highlightClass: "bg-blue-50",
  },
];

const buildInitialValues = (record: MeteorologicalEntry): MeteorologicalFormValues => ({
  subIndicator: record.subIndicator || "",
  alteredThermometer: record.alteredThermometer || "",
  barAsRead: record.barAsRead || "",
  correctedForIndex: record.correctedForIndex || "",
  heightDifference: record.heightDifference || "",
  stationLevelPressure: record.stationLevelPressure || "",
  seaLevelReduction: record.seaLevelReduction || "",
  correctedSeaLevelPressure: record.correctedSeaLevelPressure || "",
  afternoonReading: record.afternoonReading || "",
  pressureChange24h: record.pressureChange24h || "",
  dryBulbAsRead: record.dryBulbAsRead || "",
  wetBulbAsRead: record.wetBulbAsRead || "",
  maxMinTempAsRead: record.maxMinTempAsRead || "",
  dryBulbCorrected: record.dryBulbCorrected || "",
  wetBulbCorrected: record.wetBulbCorrected || "",
  maxMinTempCorrected: record.maxMinTempCorrected || "",
  Td: record.Td || "",
  relativeHumidity: record.relativeHumidity || "",
  squallConfirmed: record.squallConfirmed === "true",
  squallForce: record.squallForce || "",
  squallDirection: record.squallDirection || "",
  squallTime: record.squallTime || "",
  horizontalVisibility: record.horizontalVisibility || "",
  miscMeteors: record.miscMeteors || "",
  pastWeatherW1: record.pastWeatherW1 || "",
  pastWeatherW2: record.pastWeatherW2 || "",
  presentWeatherWW: record.presentWeatherWW || "",
  c2Indicator: record.c2Indicator || "",
});

const AutoCalculationManager = ({
  observingTime,
}: {
  observingTime: ObservingTimeEntry;
}) => {
  const { values, setFieldValue } =
    useFormikContext<MeteorologicalFormValues>();

  useEffect(() => {
    if (values.dryBulbAsRead && values.wetBulbAsRead) {
      const result = calculateDewPointAndHumidity(
        values.dryBulbAsRead,
        values.wetBulbAsRead
      );
      if (result) {
        setFieldValue("Td", result.Td);
        setFieldValue("relativeHumidity", result.relativeHumidity);
      }
    }
  }, [values.dryBulbAsRead, values.wetBulbAsRead, setFieldValue]);

  useEffect(() => {
    if (
      values.dryBulbAsRead &&
      values.barAsRead &&
      observingTime?.station?.stationId
    ) {
      const stationId = observingTime.station.stationId;
      const pressureResult = calculatePressureValues(
        values.dryBulbAsRead,
        values.barAsRead,
        stationId
      );

      if (pressureResult) {
        setFieldValue("stationLevelPressure", pressureResult.stationLevelPressure);
        setFieldValue("heightDifference", pressureResult.heightDifference);

        const seaResult = calculateSeaLevelPressure(
          values.dryBulbAsRead,
          pressureResult.stationLevelPressure,
          stationId
        );

        if (seaResult) {
          setFieldValue("seaLevelReduction", seaResult.seaLevelReduction);
          setFieldValue(
            "correctedSeaLevelPressure",
            seaResult.correctedSeaLevelPressure
          );
        }
      }
    }
  }, [
    values.dryBulbAsRead,
    values.barAsRead,
    observingTime?.station?.stationId,
    setFieldValue,
  ]);

  return null;
};

const MeteorologicalForm = ({
  record,
  observingTime,
  onSubmit,
  onCancel,
  isSaving,
}: MeteorologicalFormProps) => {
  const initialValues = useMemo(
    () => buildInitialValues(record),
    [record]
  );

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={meteorologicalValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {() => (
        <Form>
          <AutoCalculationManager observingTime={observingTime} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
            {editableFields.map((field) => (
              <FormField
                key={field.name}
                name={field.name}
                label={field.label}
                highlightClass={field.highlight}
              />
            ))}
            <AutoCalculatedFields fields={autoFields} />
            <SquallFields />
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </Form>
      )}
    </Formik>
  );
};

export default MeteorologicalForm;

