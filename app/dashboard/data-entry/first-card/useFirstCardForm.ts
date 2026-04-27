// app/dashboard/data-entry/first-card/useFirstCardForm.ts

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import { useHour } from "@/contexts/hourContext";
import type { MeteorologicalEntry } from "@prisma/client";
import { validationSchema, checkMinMax } from "./validation";
import {
  HygrometricData,
  createDewPointAndHumidityCalculator,
  validateTemperatureInputs,
  calculatePressureValues,
  calculateSeaLevelPressure,
} from "./calculations";

export const tabOrder = [
  "temperature",
  "pressure",
  "squall",
  "V.V",
  "meteors",
  "weather",
  "summary",
] as const;

export const useFirstCardForm = ({
  backlogMode = false,
  selectedDate,
  selectedUtc,
  onSuccess
}: {
  backlogMode?: boolean;
  selectedDate?: string;
  selectedUtc?: string;
  onSuccess?: () => void;
} = {}) => {
  const [activeTab, setActiveTab] = useState<string>("temperature");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hygrometricData, setHygrometricData] = useState<HygrometricData>({
    dryBulb: "",
    wetBulb: "",
    difference: "",
    dewPoint: "",
    relativeHumidity: "",
  });

  const { data: session } = useSession();
  const {
    isHourSelected,
    selectedHour: contextHour,
    firstCardError,
    isLoading,
    timeData,
    resetStates,
  } = useHour();

  const selectedHour = backlogMode ? selectedUtc : contextHour;

  const formik = useFormik<any>({
    initialValues: {
      presentWeatherWW: "",
      subIndicator: "1",
      alteredThermometer: "",
      barAsRead: "",
      correctedForIndex: "",
      heightDifference: "",
      stationLevelPressure: "",
      seaLevelReduction: "",
      correctedSeaLevelPressure: "",
      afternoonReading: "",
      pressureChange24h: "",
      dryBulbAsRead: "",
      wetBulbAsRead: "",
      maxMinTempAsRead: "",
      dryBulbCorrected: "",
      wetBulbCorrected: "",
      maxMinTempCorrected: "",
      Td: "",
      relativeHumidity: "",
      squallConfirmed: false,
      squallForce: "",
      squallDirection: "",
      squallTime: "",
      horizontalVisibility: "",
      miscMeteors: "",
      pastWeatherW1: "",
      pastWeatherW2: "",
      c2Indicator: "",
      observationTime: "",
      stationNo: session?.user?.station?.id || "",
      year: new Date().getFullYear().toString().slice(2),
      cloudCover: "",
      visibility: "",
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  const calculateDewPointAndHumidity =
    createDewPointAndHumidityCalculator(setHygrometricData, formik);

  async function handleSubmit(values: MeteorologicalEntry) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...values,
        ...hygrometricData,
        observingTimeId: selectedHour,
        backlogMode,
        selectedDate,
        selectedUtc,
      };

      const response = await fetch("/api/first-card-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message, {
        description: `Entry #${data.dataCount} saved`,
      });

      formik.resetForm();

      setHygrometricData({
        dryBulb: "",
        wetBulb: "",
        difference: "",
        dewPoint: "",
        relativeHumidity: "",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        resetStates();
        setActiveTab("temperature");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission failed", {
        description: error instanceof Error ? error.message : "Network error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // ---- TAB VALIDATION ----
  const isTabValid = (tabName: string) => {
    const errors = formik.errors;
    const touched = formik.touched;

    switch (tabName) {
      case "Observing Time":
        return !(
          (touched.observationTime && errors.observationTime) ||
          Boolean(timeData?.time)
        );
      case "temperature":
        return !(
          (touched.dryBulbAsRead && errors.dryBulbAsRead) ||
          (touched.wetBulbAsRead && errors.wetBulbAsRead) ||
          (touched.maxMinTempAsRead && errors.maxMinTempAsRead)
        );
      case "pressure":
        return !(
          (touched.barAsRead && errors.barAsRead) ||
          (touched.correctedForIndex && errors.correctedForIndex)
        );
      case "squall":
        if (!formik.values.squallConfirmed) return true;
        return !(
          (touched.squallForce && errors.squallForce) ||
          (touched.squallDirection && errors.squallDirection) ||
          (touched.squallTime && errors.squallTime)
        );
      case "V.V":
        return !(touched.horizontalVisibility && errors.horizontalVisibility);
      case "weather":
        return !(
          (touched.pastWeatherW1 && errors.pastWeatherW1) ||
          (touched.pastWeatherW2 && errors.pastWeatherW2) ||
          (touched.presentWeatherWW && errors.presentWeatherWW)
        );
      default:
        return true;
    }
  };

  const validateTab = (tabName: string) => {
    let fieldsToValidate: string[] = [];

    switch (tabName) {
      case "Observing Time":
        fieldsToValidate = ["observationTime"];
        break;
      case "temperature":
        fieldsToValidate = [
          "dryBulbAsRead",
          "wetBulbAsRead",
          "maxMinTempAsRead",
        ];
        break;
      case "pressure":
        fieldsToValidate = ["barAsRead", "correctedForIndex"];
        break;
      case "squall":
        if (formik.values.squallConfirmed) {
          fieldsToValidate = ["squallForce", "squallDirection", "squallTime"];
        }
        break;
      case "V.V":
        fieldsToValidate = ["horizontalVisibility"];
        break;
      case "weather":
        fieldsToValidate = [
          "pastWeatherW1",
          "pastWeatherW2",
          "presentWeatherWW",
        ];
        break;
    }

    const touchedFields: Record<string, boolean> = {};
    fieldsToValidate.forEach((field) => {
      touchedFields[field] = true;
    });
    formik.setTouched({ ...formik.touched, ...touchedFields }, true);

    return fieldsToValidate.every((field) => !formik.errors[field]);
  };

  const handleTabChange = (tabName: string) => {
    if (activeTab !== tabName) {
      if (!validateTab(activeTab)) {
        toast.error("অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন", {
          description:
            "অন্য ট্যাবে যাওয়ার আগে বর্তমান ট্যাবের সকল তথ্য পূরণ করুন",
        });
        return;
      }
    }
    setActiveTab(tabName);
  };

  useEffect(() => {
    const year = new Date().getFullYear().toString();
    formik.setFieldValue("year", year.slice(2));
    formik.setFieldValue("stationNo", session?.user?.station?.id || "");
  }, []);

  // ---- HANDLERS ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.handleChange(e);

    if (name === "dryBulbAsRead" || name === "wetBulbAsRead") {
      const dryBulb =
        name === "dryBulbAsRead" ? value : formik.values.dryBulbAsRead;
      const wetBulb =
        name === "wetBulbAsRead" ? value : formik.values.wetBulbAsRead;

      if (dryBulb && wetBulb) {
        calculateDewPointAndHumidity(dryBulb, wetBulb);
      }
    }

    if (name === "dryBulbAsRead" || name === "barAsRead") {
      const dryBulb =
        name === "dryBulbAsRead" ? value : formik.values.dryBulbAsRead;
      const barAsRead = name === "barAsRead" ? value : formik.values.barAsRead;

      if (dryBulb && barAsRead) {
        const stationId = session?.user?.station?.stationId;

        if (!stationId) {
          toast.error("Station ID is missing");
          return;
        }

        const pressureData = calculatePressureValues(
          dryBulb,
          barAsRead,
          stationId
        );

        if (pressureData) {
          formik.setFieldValue(
            "stationLevelPressure",
            pressureData.stationLevelPressure
          );
          formik.setFieldValue(
            "heightDifference",
            pressureData.heightDifference
          );

          const seaData = calculateSeaLevelPressure(
            dryBulb,
            pressureData.stationLevelPressure,
            stationId
          );

          if (seaData) {
            formik.setFieldValue(
              "seaLevelReduction",
              seaData.seaLevelReduction
            );
            formik.setFieldValue(
              "correctedSeaLevelPressure",
              seaData.correctedSeaLevelPressure
            );
          }
        }
      }
    }
  };

  const handleNumericInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (!/^\d*$/.test(value)) return;

    const is3 = (s?: string) => !!s && s.length === 3;

    const mode = checkMinMax(selectedHour || "");
    const isMinMode = (mode || "").toLowerCase().includes("min");
    const isMaxMode = (mode || "").toLowerCase().includes("max");

    const violatesRule = (side: "as" | "corr", nextVal: string) => {
      const dryStr =
        side === "as"
          ? formik.values.dryBulbAsRead
          : formik.values.dryBulbCorrected;
      if (!is3(dryStr) || !is3(nextVal) || (!isMinMode && !isMaxMode))
        return false;

      const dry = Number(dryStr!);
      const v = Number(nextVal);

      if (isMinMode && v > dry) {
        toast.error("Minimum temperature নিয়ম ভঙ্গ হয়েছে", {
          description:
            "Minimum Dry-bulb মানের চেয়ে বড় হতে পারবে না (Tmin ≤ Dry-bulb).",
          duration: 3500,
        });
        return true;
      }
      if (isMaxMode && v < dry) {
        toast.error("Maximum temperature নিয়ম ভঙ্গ হয়েছে", {
          description:
            "Maximum Dry-bulb মানের চেয়ে ছোট হতে পারবে না (Dry-bulb ≤ Tmax).",
          duration: 3500,
        });
        return true;
      }
      return false;
    };

    switch (name) {
      case "dryBulbAsRead":
      case "wetBulbAsRead":
      case "maxMinTempAsRead": {
        if (value.length <= 3) {
          if (name === "maxMinTempAsRead") {
            if (violatesRule("as", value)) return;
          }

          formik.setFieldValue(name, value);

          if (name === "dryBulbAsRead" || name === "wetBulbAsRead") {
            const dryBulb =
              name === "dryBulbAsRead" ? value : formik.values.dryBulbAsRead;
            const wetBulb =
              name === "wetBulbAsRead" ? value : formik.values.wetBulbAsRead;

            if (is3(dryBulb) && is3(wetBulb)) {
              const validation = validateTemperatureInputs(dryBulb!, wetBulb!);
              if (!validation.isValid) {
                toast.error(validation.message, {
                  description: "অনুগ্রহ করে সঠিক তাপমাত্রা প্রবেশ করান।",
                  duration: 4000,
                });
                return;
              }
            }
          }

          if (
            name === "dryBulbAsRead" &&
            is3(value) &&
            is3(formik.values.maxMinTempAsRead)
          ) {
            if (violatesRule("as", formik.values.maxMinTempAsRead!)) {
              // optional clear
            }
          }
        }
        break;
      }

      case "barAsRead":
      case "correctedForIndex":
        if (value.length <= 5) {
          formik.setFieldValue(name, value);
        }
        break;

      case "horizontalVisibility":
        if (value.length <= 3) {
          formik.setFieldValue(name, value);
        }
        break;

      case "presentWeatherWW":
        if (value.length <= 2) {
          formik.setFieldValue(name, value);
        }
        break;

      case "dryBulbCorrected":
      case "wetBulbCorrected":
      case "maxMinTempCorrected": {
        if (value.length <= 3) {
          if (name === "maxMinTempCorrected") {
            if (violatesRule("corr", value)) return;
          }

          formik.setFieldValue(name, value);

          if (
            name === "dryBulbCorrected" &&
            is3(value) &&
            is3(formik.values.maxMinTempCorrected)
          ) {
            if (violatesRule("corr", formik.values.maxMinTempCorrected!)) {
              // optional clear
            }
          }
        }
        break;
      }

      default:
        formik.setFieldValue(name, value);
    }

    // dew point calc
    if (name === "dryBulbAsRead" || name === "wetBulbAsRead") {
      const dryBulb =
        name === "dryBulbAsRead" ? value : formik.values.dryBulbAsRead;
      const wetBulb =
        name === "wetBulbAsRead" ? value : formik.values.wetBulbAsRead;

      if (is3(dryBulb) && is3(wetBulb)) {
        calculateDewPointAndHumidity(dryBulb!, wetBulb!);
      }
    }

    // copy as-read → corrected
    if (
      name === "dryBulbAsRead" ||
      name === "wetBulbAsRead" ||
      name === "maxMinTempAsRead"
    ) {
      if (name === "dryBulbAsRead") {
        formik.setFieldValue("dryBulbCorrected", value);
      }
      if (name === "wetBulbAsRead") {
        formik.setFieldValue("wetBulbCorrected", value);
      }
      if (name === "maxMinTempAsRead") {
        formik.setFieldValue("maxMinTempCorrected", value);
      }
    }

    // pressure calc + 24h change
    if (name === "dryBulbAsRead" || name === "barAsRead") {
      const dryBulb =
        name === "dryBulbAsRead" ? value : formik.values.dryBulbAsRead;
      const barAsRead = name === "barAsRead" ? value : formik.values.barAsRead;

      if (dryBulb && barAsRead) {
        const stationId = session?.user?.station?.stationId;
        if (!stationId) {
          toast.error("Station ID is missing");
          return;
        }

        const pressureData = calculatePressureValues(
          dryBulb,
          barAsRead,
          stationId
        );
        if (pressureData) {
          formik.setFieldValue(
            "stationLevelPressure",
            pressureData.stationLevelPressure
          );
          formik.setFieldValue(
            "heightDifference",
            pressureData.heightDifference
          );

          const prev =
            timeData?.yesterday?.meteorologicalEntry?.[0]
              ?.stationLevelPressure;

          if (!prev) {
            formik.setFieldValue("pressureChange24h", "0000");
          } else {
            const prevN = Number(prev);
            const curN = Number(pressureData.stationLevelPressure);
            const diff = curN - prevN;
            const abs = Math.abs(diff);
            const padded = String(abs).padStart(4, "0");
            const sign = diff >= 0 ? "+" : "-";
            formik.setFieldValue("pressureChange24h", `${sign}${padded}`);
          }

          const seaData = calculateSeaLevelPressure(
            dryBulb,
            pressureData.stationLevelPressure,
            stationId
          );
          if (seaData) {
            formik.setFieldValue(
              "seaLevelReduction",
              seaData.seaLevelReduction
            );
            formik.setFieldValue(
              "correctedSeaLevelPressure",
              seaData.correctedSeaLevelPressure
            );
          }
        }
      }
    }
  };

  const handleReset = () => {
    const resetValues = {
      subIndicator: formik.values.subIndicator,
      presentWeatherWW: "",
      alteredThermometer: "",
      barAsRead: "",
      correctedForIndex: "",
      heightDifference: "",
      stationLevelPressure: "",
      seaLevelReduction: "",
      correctedSeaLevelPressure: "",
      afternoonReading: "",
      pressureChange24h: "",
      dryBulbAsRead: "",
      wetBulbAsRead: "",
      maxMinTempAsRead: "",
      dryBulbCorrected: "",
      wetBulbCorrected: "",
      maxMinTempCorrected: "",
      Td: "",
      relativeHumidity: "",
      squallConfirmed: false,
      squallForce: "",
      squallDirection: "",
      squallTime: "",
      horizontalVisibility: "",
      miscMeteors: "",
      pastWeatherW1: "",
      pastWeatherW2: "",
      cloudCover: "",
      visibility: "",
    };

    formik.resetForm({ values: resetValues });

    setHygrometricData({
      dryBulb: "",
      wetBulb: "",
      difference: "",
      dewPoint: "",
      relativeHumidity: "",
    });

    toast.info("All form data has been cleared.");
    setActiveTab("temperature");
  };

  const nextTab = () => {

    const currentIndex = tabOrder.indexOf(activeTab as any);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const prevTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab as any);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const isFirstTab = tabOrder.indexOf(activeTab as any) === 0;

    const getFieldError = (fieldName: string) => {
    const touched = formik.touched[fieldName as string];
    const error = formik.errors[fieldName as string];

    if (touched && error) {
      return error as string;
    }
    return null;
  };


  return {
    formik,
    activeTab,
    handleTabChange,
    isTabValid,
    nextTab,
    prevTab,
    isFirstTab,
    handleChange,
    handleNumericInput,
    handleReset,
    getFieldError, 
    isSubmitting,
    isLoading,
    firstCardError,
    isHourSelected,
    timeData,
    selectedHour,
    hygrometricData,
  };
};
