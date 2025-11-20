import type {
  DailySummaryEditableField,
  DailySummaryFieldConfig,
  DailySummaryFormData,
  DailySummaryRecord,
} from "@/lib/types/dailySummary";

export const DAILY_SUMMARY_FIELDS: DailySummaryFieldConfig[] = [
  {
    id: "avStationPressure",
    label: "Av. Station Pressure (hPa)",
    length: 5,
    bgClass: "bg-blue-50",
  },
  {
    id: "avSeaLevelPressure",
    label: "Av. Sea-Level Pressure (hPa)",
    length: 5,
    bgClass: "bg-indigo-50",
  },
  {
    id: "avDryBulbTemperature",
    label: "Av. Dry-Bulb Temperature (deg C)",
    length: 3,
    bgClass: "bg-blue-50",
  },
  {
    id: "avWetBulbTemperature",
    label: "Av. Wet-Bulb Temperature (deg C)",
    length: 3,
    bgClass: "bg-indigo-50",
  },
  {
    id: "maxTemperature",
    label: "Max Temperature (deg C)",
    length: 3,
    bgClass: "bg-blue-50",
  },
  {
    id: "minTemperature",
    label: "Min Temperature (deg C)",
    length: 3,
    bgClass: "bg-indigo-50",
  },
  {
    id: "totalPrecipitation",
    label: "Total Precipitation (mm)",
    length: 3,
    bgClass: "bg-blue-50",
  },
  {
    id: "avDewPointTemperature",
    label: "Av. Dew Point Temperature (deg C)",
    length: 3,
    bgClass: "bg-indigo-50",
  },
  {
    id: "avRelativeHumidity",
    label: "Av. Relative Humidity (%)",
    length: 3,
    bgClass: "bg-blue-50",
  },
  {
    id: "windSpeed",
    label: "Wind Speed (m/s)",
    length: 3,
    bgClass: "bg-indigo-50",
  },
  {
    id: "windDirectionCode",
    label: "Wind Direction (16Pts)",
    length: 2,
    bgClass: "bg-blue-50",
  },
  {
    id: "maxWindSpeed",
    label: "Max Wind Speed (m/s)",
    length: 3,
    bgClass: "bg-indigo-50",
  },
  {
    id: "maxWindDirection",
    label: "Max Wind Direction (16Pts)",
    length: 2,
    bgClass: "bg-blue-50",
  },
  {
    id: "avTotalCloud",
    label: "Av. Total Cloud (oktas)",
    length: 1,
    bgClass: "bg-indigo-50",
  },
  {
    id: "lowestVisibility",
    label: "Lowest Visibility (km)",
    length: 3,
    bgClass: "bg-blue-50",
  },
  {
    id: "totalRainDuration",
    label: "Total Rain Duration (HHMM)",
    length: 4,
    bgClass: "bg-indigo-50",
  },
];

export const DAILY_SUMMARY_FIELD_VALIDATIONS = DAILY_SUMMARY_FIELDS.reduce(
  (acc, field) => {
    acc[field.id] = field.length;
    return acc;
  },
  {} as Record<DailySummaryEditableField, number>
);

export const sanitizeDailyNumericInput = (value: string, length: number) =>
  value.replace(/[^0-9]/g, "").slice(0, length);

export const validateDailyFieldValue = (
  value: string,
  length: number
): string | null => {
  if (!value.length) {
    return "This field is required";
  }

  if (value.length !== length) {
    return `Must be exactly ${length} digits (currently ${value.length})`;
  }

  return null;
};

export const validateDailyForm = (data: DailySummaryFormData) => {
  const errors: Record<string, string> = {};
  let isValid = true;

  DAILY_SUMMARY_FIELDS.forEach((field) => {
    const value = data[field.id] || "";
    const error = validateDailyFieldValue(value, field.length);
    if (error) {
      errors[field.id] = error;
      isValid = false;
    }
  });

  return { errors, isValid };
};

export const buildInitialDailyFormData = (
  record?: DailySummaryRecord
): DailySummaryFormData => {
  const initial: DailySummaryFormData = {};

  DAILY_SUMMARY_FIELDS.forEach((field) => {
    const rawValue = record?.[field.id];
    const numericString =
      rawValue === null || rawValue === undefined
        ? ""
        : String(rawValue).replace(/\./g, "");
    initial[field.id] = sanitizeDailyNumericInput(
      numericString,
      field.length
    );
  });

  return initial;
};
