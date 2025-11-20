// app/dashboard/data-entry/first-card/validation.ts

import * as Yup from "yup";

// Determine when to show min or max temp based on selected utc hour
export const checkMinMax = (value: string): string | null => {
  if (value === "00" || value === "03") {
    return "Min";
  } else if (value === "09" || value === "12") {
    return "Max";
  } else {
    return null;
  }
};

// Validation schemas for each tab
const temperatureSchema = Yup.object({
  dryBulbAsRead: Yup.string()
    .required("Dry-bulb অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
  wetBulbAsRead: Yup.string()
    .required("Wet-bulb অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 256 for 25.6°C)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    )
    .test(
      "wet-bulb-validation",
      "Wet Bulb Temperature can't be higher than Dry Bulb temperature",
      function (value) {
        const { dryBulbAsRead } = this.parent;
        if (!value || !dryBulbAsRead) return true;

        const wetBulbValue = Number.parseFloat(
          `${value.slice(0, 2)}.${value.slice(2)}`
        );
        const dryBulbValue = Number.parseFloat(
          `${dryBulbAsRead.slice(0, 2)}.${dryBulbAsRead.slice(2)}`
        );

        return wetBulbValue <= dryBulbValue;
      }
    ),
  maxMinTempAsRead: Yup.string().matches(
    /^\d{3}$/,
    "Must be exactly 3 digits (e.g., 256 for 25.6°C)"
  ),
});

const pressureSchema = Yup.object({
  barAsRead: Yup.string()
    .required("Bar As Read অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10142 for 1014.2 hPa)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
});

const squallSchema = Yup.object({
  squallForce: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Force অবশ্যই পূরণ করতে হবে")
        .test("is-numeric", "Only numeric values allowed", (value) =>
          /^\d+$/.test(value || "")
        ),
    otherwise: (schema) => schema,
  }),
  squallDirection: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) =>
      schema
        .required("Squall Direction অবশ্যই পূরণ করতে হবে")
        .test("is-numeric", "Only numeric values allowed", (value) =>
          /^\d+$/.test(value || "")
        ),
    otherwise: (schema) => schema,
  }),
  squallTime: Yup.string().when("squallConfirmed", {
    is: true,
    then: (schema) => schema.required("Squall Time অবশ্যই পূরণ করতে হবে"),
    otherwise: (schema) => schema,
  }),
});

const visibilitySchema = Yup.object({
  horizontalVisibility: Yup.string()
    .required("Horizontal Visibility অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 050, 999)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
});

const weatherSchema = Yup.object({
  pastWeatherW1: Yup.string()
    .required("Past Weather (W1) অবশ্যই পূরণ করতে হবে")
    .matches(/^[0-9]$/, "Past Weather (W1) শুধুমাত্র 0-9 সংখ্যা হতে হবে"),
  pastWeatherW2: Yup.string()
    .required("Past Weather (W2) অবশ্যই পূরণ করতে হবে")
    .matches(/^[0-9]$/, "Past Weather (W2) শুধুমাত্র 0-9 সংখ্যা হতে হবে"),
  presentWeatherWW: Yup.string()
    .required("Present Weather অবশ্যই পূরণ করতে হবে")
    .matches(/^\d{2}$/, "Must be exactly 2 digits (e.g., 01, 23, 99)")
    .test("is-numeric", "Only numeric values allowed", (value) =>
      /^\d+$/.test(value || "")
    ),
});

// Combined schema for the entire form
export const validationSchema = Yup.object({
  ...temperatureSchema.fields,
  ...pressureSchema.fields,
  ...squallSchema.fields,
  ...visibilitySchema.fields,
  ...weatherSchema.fields,
});
