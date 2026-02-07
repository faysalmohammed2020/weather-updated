// app/dashboard/data-entry/second-card/SecondCard.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  CloudIcon,
  CloudRainIcon,
  Wind,
  User,
  Sun,
  Loader2,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { useWeatherObservationForm } from "@/stores/useWeatherObservationForm";
import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useHour } from "@/contexts/hourContext";
import HourSelector from "@/components/hour-selector";
import { TimeInfo } from "@/lib/data-type";

// 🔹 NEW: shared SecondCard tab components (as you confirmed)
import CloudTab from "@/components/SecondCard/Cloud";
import TotalCloudTab from "@/components/SecondCard/TotalCloud";
import SignificantCloudTab from "@/components/SecondCard/SignificantCloud";
import RainfallTab from "@/components/SecondCard/Rainfall";
import WindTab from "@/components/SecondCard/Wind";
import ObserverTab from "@/components/SecondCard/Observer";
import SecondCardSummary from "@/components/SecondCard/SecondCardSummary";
import RainfallTabSection from "@/components/SecondCard/Rainfall";

// --- TYPES ---
type WeatherObservationFormData = {
  clouds: {
    low: {
      form?: string;
      amount?: string;
      height?: string;
      direction?: string;
    };
    medium: {
      form?: string;
      amount?: string;
      height?: string;
      direction?: string;
    };
    high: {
      form?: string;
      amount?: string;
      height?: string;
      direction?: string;
    };
  };
  totalCloud: {
    "total-cloud-amount"?: string;
  };
  significantClouds: {
    layer1: {
      form?: string;
      amount?: string;
      height?: string;
    };
    layer2: {
      form?: string;
      amount?: string;
      height?: string;
    };
    layer3: {
      form?: string;
      amount?: string;
      height?: string;
    };
    layer4: {
      form?: string;
      amount?: string;
      height?: string;
    };
  };
  rainfall: {
    timeSlots?: { id: string; timeStart: string; timeEnd: string }[];
    "date-start"?: string;
    "date-end"?: string;
    "since-previous"?: string;
    "during-previous"?: string;
    "last-24-hours"?: string;
    rainfallType?: "continuous" | "intermittent" | "";
  };
  wind: {
    "first-anemometer"?: string;
    "second-anemometer"?: string;
    speed?: string;
    "wind-direction"?: string;
  };
  observer: {
    "observer-initial"?: string;
    "observation-time"?: string;
  };
  metadata: {
    stationId?: string;
    submittedAt?: string;
  };
};

// --- VALIDATION SCHEMAS (same logic as your code) ---
const cloudSchema = Yup.object({
  clouds: Yup.object({
    low: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9/]+$/, "Please enter numbers or / only"),

    }),
    medium: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9/]+$/, "Please enter numbers or / only"),

    }),
    high: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9/]+$/, "Please enter numbers or / only"),

    }),
  }),
});

const totalCloudSchema = Yup.object({
  totalCloud: Yup.object(),
});

const significantCloudSchema = Yup.object({
  significantClouds: Yup.object({
    layer1: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9/]+$/, "Please enter numbers or / only"),

    }),
    layer2: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9/]+$/, "Please enter numbers or / only"),

    }),
    layer3: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9/]+$/, "Please enter numbers or / only"),

    }),
    layer4: Yup.object({
      form: Yup.string(),
      amount: Yup.string(),
      height: Yup.string().matches(/^[0-9/]+$/, "Please enter numbers or / only"),

    }),
  }),
});

const windSchema = Yup.object({
  wind: Yup.object({
    "first-anemometer": Yup.string()
      .required("1st Anemometer reading is required")
      .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10123)"),

    "second-anemometer": Yup.string()
      .required("2nd Anemometer reading is required")
      .matches(/^\d{5}$/, "Must be exactly 5 digits (e.g., 10123)"),

    speed: Yup.string()
      .required("Wind speed is required")
      .matches(/^\d{3}$/, "Must be exactly 3 digits (e.g., 025, 100)"),

    "wind-direction": Yup.string()
      .required("Wind direction is required")
      .test(
        "is-valid-direction",
        "Must be wind direction between 5 to 360 degrees",
        (value) => {
          if (!value) return false;
          if (value === "00") return true;
          const num = Number(value);
          return Number.isInteger(num) && num >= 5 && num <= 360;
        }
      ),
  }),
});

const observerSchema = Yup.object({
  observer: Yup.object({
    "observer-initial": Yup.string().required("Observer initials are required"),
    "observation-time": Yup.string().required("Observation time is required"),
  }),
});

// --- MAIN COMPONENT ---
export default function SecondCardForm({ timeInfo }: { timeInfo: TimeInfo[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("cloud");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  const { data: session } = useSession();

  const {
    isHourSelected,
    secondCardError,
    selectedHour,
    isLoading,
    resetStates,
  } = useHour();

  // Check if current hour is 00, 06, 12, or 18 UTC
  const isSixHourReport = useMemo(() => {
    if (!selectedHour) return false;
    const hour = Number.parseInt(selectedHour, 10);
    if (Number.isNaN(hour)) return false;
    return [0, 6, 12, 18].includes(hour);
  }, [selectedHour]);

  const { formData, updateFields, resetForm } = useWeatherObservationForm();

  // Dynamic validation schema based on isSixHourReport
  const validationSchema = useMemo(() => {

    return Yup.object({
      ...cloudSchema.fields,
      ...totalCloudSchema.fields,
      ...significantCloudSchema.fields,
      ...windSchema.fields,
      ...observerSchema.fields,
    });
  }, [isSixHourReport]);

  // Tab styles only for the top pills (design same as your version)
  const tabStyles = {
    cloud: {
      icon: <CloudIcon className="w-4 h-4" />,
      iconColor: "text-blue-500",
      card: "bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-200 shadow-sm",
    },
    n: {
      icon: <Sun className="w-4 h-4" />,
      iconColor: "text-yellow-500",
      card: "bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-200 shadow-sm",
    },
    "significant-cloud": {
      icon: <CloudIcon className="w-4 h-4" />,
      iconColor: "text-purple-500",
      card: "bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-200 shadow-sm",
    },
    rainfall: {
      icon: <CloudRainIcon className="w-4 h-4" />,
      iconColor: "text-cyan-500",
      card: "bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-200 shadow-sm",
    },
    wind: {
      icon: <Wind className="w-4 h-4" />,
      iconColor: "text-green-500",
      card: "bg-gradient-to-br from-green-50 to-white border-l-4 border-green-200 shadow-sm",
    },
    observer: {
      icon: <User className="w-4 h-4" />,
      iconColor: "text-orange-500",
      card: "bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-200 shadow-sm",
    },
    summary: {
      icon: <BarChart3 className="w-4 h-4" />,
      iconColor: "text-slate-600",
      card: "bg-gradient-to-br from-slate-50 to-white border-l-4 border-slate-200 shadow-sm",
    },
  };

  // --- FORMIK ---
  const formik = useFormik<WeatherObservationFormData>({
    initialValues: {
      clouds: {
        low: formData?.clouds?.low || {},
        medium: formData?.clouds?.medium || {},
        high: formData?.clouds?.high || {},
      },
      totalCloud: formData?.totalCloud || {},
      significantClouds: {
        layer1: formData?.significantClouds?.layer1 || {},
        layer2: formData?.significantClouds?.layer2 || {},
        layer3: formData?.significantClouds?.layer3 || {},
        layer4: formData?.significantClouds?.layer4 || {},
      },
      rainfall: {
        timeSlots: [],
        "date-start": formData?.rainfall?.["date-start"] || "",
        "date-end": formData?.rainfall?.["date-end"] || "",
        "since-previous": formData?.rainfall?.["since-previous"] || "",
        "during-previous": formData?.rainfall?.["during-previous"] || "",
        "last-24-hours": formData?.rainfall?.["last-24-hours"] || "",
        rainfallType: "",
      },
      wind: formData?.wind || {},
      observer: {
        "observer-initial": session?.user?.name || "",
        "observation-time": new Date()
          .getUTCHours()
          .toString()
          .padStart(2, "0"),
        ...formData?.observer,
      },
      metadata: {
        stationId: session?.user?.station?.stationId || "",
        ...formData?.metadata,
      },
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  // --- HELPERS ---
  const isTabValid = (tabName: string) => {
    const errors = formik.errors;
    const touched = formik.touched;

    switch (tabName) {
      case "cloud":
        return !(
          (touched.clouds?.low && errors.clouds?.low) ||
          (touched.clouds?.medium && errors.clouds?.medium) ||
          (touched.clouds?.high && errors.clouds?.high)
        );
      case "n":
        return !(
          touched.totalCloud?.["total-cloud-amount"] &&
          errors.totalCloud?.["total-cloud-amount"]
        );
      case "significant-cloud":
        return !(
          touched.significantClouds?.layer1 && errors.significantClouds?.layer1
        );
      case "rainfall":
        return !(
          (touched.rainfall?.["since-previous"] &&
            errors.rainfall?.["since-previous"]) ||
          (touched.rainfall?.["during-previous"] &&
            errors.rainfall?.["during-previous"]) ||
          (touched.rainfall?.["last-24-hours"] &&
            errors.rainfall?.["last-24-hours"])
        );
      case "wind":
        return !(
          (touched.wind?.["first-anemometer"] &&
            errors.wind?.["first-anemometer"]) ||
          (touched.wind?.["second-anemometer"] &&
            errors.wind?.["second-anemometer"]) ||
          (touched.wind?.speed && errors.wind?.speed) ||
          (touched.wind?.["wind-direction"] && errors.wind?.["wind-direction"])
        );
      case "observer":
        return !(
          (touched.observer?.["observer-initial"] &&
            errors.observer?.["observer-initial"]) ||
          (touched.observer?.["observation-time"] &&
            errors.observer?.["observation-time"])
        );
      default:
        return true;
    }
  };

  const validateTab = (tabName: string) => {
    let fieldsToValidate: string[] = [];

    switch (tabName) {
      case "cloud":
        fieldsToValidate = [
          "clouds.low.form",
          "clouds.low.amount",
          "clouds.low.height",
          "clouds.low.direction",
          "clouds.medium.form",
          "clouds.medium.amount",
          "clouds.medium.height",
          "clouds.medium.direction",
          "clouds.high.form",
          "clouds.high.amount",
          "clouds.high.height",
          "clouds.high.direction",
        ];
        break;
      case "n":
        fieldsToValidate = ["totalCloud.total-cloud-amount"];
        break;
      case "significant-cloud":
        fieldsToValidate = [
          "significantClouds.layer1.form",
          "significantClouds.layer1.amount",
          "significantClouds.layer1.height",
          "significantClouds.layer2.height",
          "significantClouds.layer3.height",
          "significantClouds.layer4.height",
        ];
        break;
      case "rainfall":
        fieldsToValidate = [
          "rainfall.since-previous",
          "rainfall.during-previous",
        ];
        break;
      case "wind":
        fieldsToValidate = [
          "wind.first-anemometer",
          "wind.second-anemometer",
          "wind.speed",
          "wind.wind-direction",
        ];
        break;
      case "observer":
        fieldsToValidate = [
          "observer.observer-initial",
          "observer.observation-time",
        ];
        break;
    }

    const touchedFields: any = {};

    fieldsToValidate.forEach((fieldPath) => {
      const parts = fieldPath.split(".");

      let cursor = touchedFields;

      parts.forEach((key, index) => {
        // If last segment → mark as touched
        if (index === parts.length - 1) {
          cursor[key] = true;
          return;
        }

        // Build nested structure
        if (!cursor[key] || typeof cursor[key] !== "object") {
          cursor[key] = {};
        }

        cursor = cursor[key];
      });
    });

    // Apply touched updates
    formik.setTouched(
      {
        ...formik.touched,
        ...touchedFields,
      },
      true
    );

    formik.setTouched({ ...formik.touched, ...touchedFields }, true);

    return !fieldsToValidate.some((field) => {
      const fieldParts = field.split(".");
      if (fieldParts.length === 2) {
        // @ts-expect-error
        return formik.errors[fieldParts[0]]?.[fieldParts[1]];
      } else if (fieldParts.length === 3) {
        // @ts-expect-error
        return formik.errors[fieldParts[0]]?.[fieldParts[1]]?.[fieldParts[2]];
      }
      return false;
    });
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

  const getTabForStep = (step: number) => {
    const steps = [
      "cloud",
      "n",
      "significant-cloud",
      "rainfall",
      "wind",
      "observer",
      "summary",
    ];
    return steps[step - 1] || "cloud";
  };

  const handleNext = () => {
    if (validateTab(activeTab)) {
      const nextStep = Math.min(currentStep + 1, totalSteps);
      setCurrentStep(nextStep);
      setActiveTab(getTabForStep(nextStep));
    } else {
      toast.error("Please fill in all required fields correctly", {
        description: "You need to complete the current tab before proceeding",
      });
    }
  };

  const handlePrevious = () => {
    const prevStep = Math.max(currentStep - 1, 1);
    setCurrentStep(prevStep);
    setActiveTab(getTabForStep(prevStep));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    formik.setFieldTouched(name, true, true);

    const numericFields = [
      "since-previous",
      "during-previous",
      "last-24-hours",
      "first-anemometer",
      "second-anemometer",
      "speed",
      "wind-direction",
    ];

    const isNumericField = numericFields.some((field) => name.includes(field));
    if (isNumericField && value !== "" && !/^[0-9]+(\.[0-9]+)?$/.test(value)) {
      toast.error("Please enter numbers only", {
        description: `${name} field should contain numbers only`,
        duration: 3000,
      });
    }

    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "");
      formik.setFieldValue(`clouds.low.${field}`, value);
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "");
      formik.setFieldValue(`clouds.medium.${field}`, value);
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "");
      formik.setFieldValue(`clouds.high.${field}`, value);
    } else if (name.startsWith("sig-cloud-layer1-")) {
      const field = name.replace("sig-cloud-layer1-", "");
      formik.setFieldValue(`significantClouds.layer1.${field}`, value);
    } else if (name.startsWith("sig-cloud-layer2-")) {
      const field = name.replace("sig-cloud-layer2-", "");
      formik.setFieldValue(`significantClouds.layer2.${field}`, value);
    } else if (name.startsWith("sig-cloud-layer3-")) {
      const field = name.replace("sig-cloud-layer3-", "");
      formik.setFieldValue(`significantClouds.layer3.${field}`, value);
    } else if (name.startsWith("sig-cloud-layer4-")) {
      const field = name.replace("sig-cloud-layer4-", "");
      formik.setFieldValue(`significantClouds.layer4.${field}`, value);
    } else if (
      name === "since-previous" ||
      name === "during-previous" ||
      name === "last-24-hours"
    ) {
      const field = name.startsWith("rainfall-")
        ? name.replace("rainfall-", "")
        : name;
      formik.setFieldValue(`rainfall.${field}`, value);
    } else if (
      name === "first-anemometer" ||
      name === "second-anemometer" ||
      name === "speed" ||
      name === "wind-direction"
    ) {
      formik.setFieldValue(`wind.${name}`, value);
    } else if (name === "observer-initial") {
      formik.setFieldValue("observer.observer-initial", value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name.startsWith("low-cloud-")) {
      const field = name.replace("low-cloud-", "");
      formik.setFieldValue(`clouds.low.${field}`, value);
    } else if (name.startsWith("medium-cloud-")) {
      const field = name.replace("medium-cloud-", "");
      formik.setFieldValue(`clouds.medium.${field}`, value);
    } else if (name.startsWith("high-cloud-")) {
      const field = name.replace("high-cloud-", "");
      formik.setFieldValue(`clouds.high.${field}`, value);
    } else if (name.startsWith("layer1-")) {
      const field = name.replace("layer1-", "");
      formik.setFieldValue(`significantClouds.layer1.${field}`, value);
    } else if (name.startsWith("layer2-")) {
      const field = name.replace("layer2-", "");
      formik.setFieldValue(`significantClouds.layer2.${field}`, value);
    } else if (name.startsWith("layer3-")) {
      const field = name.replace("layer3-", "");
      formik.setFieldValue(`significantClouds.layer3.${field}`, value);
    } else if (name.startsWith("layer4-")) {
      const field = name.replace("layer4-", "");
      formik.setFieldValue(`significantClouds.layer4.${field}`, value);
    } else if (name === "total-cloud-amount") {
      formik.setFieldValue("totalCloud.total-cloud-amount", value);
    } else if (name === "observation-time") {
      formik.setFieldValue("observer.observation-time", value);
    }
  };

  const handleReset = () => {
    const resetValues: WeatherObservationFormData = {
      clouds: {
        low: {},
        medium: {},
        high: {},
      },
      totalCloud: {},
      significantClouds: {
        layer1: {},
        layer2: {},
        layer3: {},
        layer4: {},
      },
      rainfall: {
        timeSlots: [],
        "date-start": "",
        "date-end": "",
        "since-previous": "",
        "during-previous": "",
        "last-24-hours": "",
        rainfallType: "",
      },
      wind: {},
      observer: {
        "observer-initial": session?.user?.name || "",
        "observation-time": new Date()
          .getUTCHours()
          .toString()
          .padStart(2, "0"),
      },
      metadata: {
        stationId: session?.user?.station?.stationId || "",
      },
    };

    formik.resetForm({ values: resetValues });
    resetForm();
    toast.info("All form data has been cleared.");
    setCurrentStep(1);
    setActiveTab("cloud");
  };

  async function handleSubmit(values: WeatherObservationFormData) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Check if session is valid before submitting
      if (!session?.user?.id) {
        toast.error("Authentication required", {
          description: "Please log in again to submit your observation",
        });
        setIsSubmitting(false);
        return;
      }

      const submissionData = {
        ...values,
        observingTimeId: selectedHour || "",
        metadata: {
          ...values.metadata,
          submittedAt: new Date().toISOString(),
          stationId: session?.user?.station?.id || "",
        },
      };

      const response = await fetch("/api/save-observation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired", {
            description: "Please log in again to continue",
          });
          // Optionally redirect to login page
          window.location.href = "/login";
          return;
        }
        toast.error(data.message || "Submission failed");
        return;
      }

      if (data.error) {
        toast.error(data.message);
        return;
      }

      toast.success(data.message, {
        description: `Entry #${data.dataCount} saved`,
      });

      resetForm();
      formik.resetForm();
      resetStates();
      setCurrentStep(1);
      setActiveTab("cloud");
      updateFields({});
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderErrorMessage = (fieldPath: string) => {
    const parts = fieldPath.split(".") as string[];

    const get = (obj: any, path: string[]) =>
      path.reduce((acc, key) => (acc ? acc[key] : undefined), obj);

    const touched = get(formik.touched, parts);
    const error = get(formik.errors, parts);

    return touched && error ? (
      <span className="text-red-500 text-sm mt-1 inline-flex items-start">
        <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
        {error}
      </span>
    ) : null;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const isFirstTab = currentStep === 1;

  // --- EFFECTS ---
  useEffect(() => {
    if (session?.user) {
      formik.setFieldValue(
        "observer.observer-initial",
        session.user.name || ""
      );
      formik.setFieldValue(
        "metadata.stationId",
        session.user.station?.stationId || ""
      );
    }
  }, [session]);

  useEffect(() => {
    if (!formik.values.observer["observation-time"]) {
      const utcHour = new Date().getUTCHours().toString().padStart(2, "0");
      formik.setFieldValue("observer.observation-time", utcHour);
    }
  }, []);

  useEffect(() => {
    const flattenedValues: Record<string, string> = {
      "observer.observation-time":
        formik.values.observer?.["observation-time"] || "",

      ...(formik.values.rainfall
        ? {
            "rainfall.date-start": formik.values.rainfall["date-start"] || "",
            "rainfall.date-end": formik.values.rainfall["date-end"] || "",
          }
        : {}),
    };

    updateFields(flattenedValues);
  }, [formik.values]);

  // --- RENDER ---
  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading || secondCardError || !isHourSelected ? (
          <motion.div
            key="hour-selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-white backdrop-blur-sm z-[5] px-6"
          >
            <HourSelector type="second" timeInfo={timeInfo} />
          </motion.div>
        ) : (
          <FormikProvider value={formik}>
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={formik.handleSubmit}
              className="w-full"
              onKeyDown={handleKeyDown}
            >
              <div className="relative rounded-xl">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => {
                    const keys = Object.keys(tabStyles);
                    const currentTabIndex = keys.indexOf(activeTab);
                    const newTabIndex = keys.indexOf(value);

                    if (
                      newTabIndex <= currentTabIndex ||
                      validateTab(activeTab)
                    ) {
                      setActiveTab(value);
                      setCurrentStep(newTabIndex + 1);
                    } else {
                      toast.error(
                        "Please fill in all required fields correctly",
                        {
                          description:
                            "You need to complete the current tab before proceeding",
                        }
                      );
                    }
                  }}
                  className="w-full"
                >
                  {/* Top tab pills (same style as before) */}
                  <div className="relative">
                    <div className="relative p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 max-w-max mx-auto">
                      <div className="relative flex flex-wrap justify-center items-center gap-1 p-1.5 rounded-full bg-gray-100/50">
                        {Object.entries(tabStyles).map(
                          ([key, style], index) => {
                            const isActive = activeTab === key;
                            const iconColor =
                              style.iconColor || "text-blue-500";

                            return (
                              <motion.button
                                key={key}
                                type="button"
                                onClick={() => {
                                  if (
                                    activeTab !== key &&
                                    !validateTab(activeTab)
                                  ) {
                                    toast.error("Complete required fields", {
                                      description:
                                        "Please fill all required information before switching tabs",
                                    });
                                    return;
                                  }
                                  handleTabChange(key);
                                  const keys = Object.keys(tabStyles);
                                  setCurrentStep(keys.indexOf(key) + 1);
                                }}
                                className={cn(
                                  "relative flex items-center justify-center px-6 py-2 rounded-full transition-all duration-300 transform",
                                  "focus:outline-none min-w-[80px]",
                                  isActive
                                    ? "bg-white shadow shadow-blue-300 text-gray-900 font-semibold"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50",
                                  !isTabValid(key) &&
                                    formik.submitCount > 0 &&
                                    "!border-2 !border-red-400 !bg-red-50"
                                )}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{
                                  opacity: 1,
                                  x: 0,
                                  scale: isActive ? 1.05 : 1,
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20,
                                  delay: index * 0.05,
                                }}
                              >
                                <div className="relative z-10 flex items-center gap-1">
                                  <div
                                    className={cn(
                                      "p-1.5 rounded-full transition-all duration-200",
                                      {
                                        "scale-110": isActive,
                                        [iconColor]: !isActive,
                                        "bg-white/20": isActive,
                                      }
                                    )}
                                  >
                                    {React.cloneElement(style.icon, {
                                      className: cn("w-4 h-4", {
                                        "text-blue-500": isActive,
                                        [iconColor]: !isActive,
                                      }),
                                    })}
                                  </div>
                                  <span className="text-base capitalize font-medium">
                                    {key === "n"
                                      ? "Total Cloud"
                                      : key === "V.V"
                                        ? "VV"
                                        : key}
                                  </span>
                                </div>

                                {isActive && (
                                  <motion.div
                                    className="absolute inset-0 bg-white rounded-full border border-gray-200 z-0"
                                    layoutId="activePill"
                                    transition={{
                                      type: "spring",
                                      bounce: 0.2,
                                      duration: 0.6,
                                    }}
                                  />
                                )}
                              </motion.button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>

                  {/* TAB CONTENTS – now using your shared components */}
                  <div className="p-4 sm:p-6">
                    <TabsContent value="cloud" className="mt-4 sm:mt-6">
                      <CloudTab
                        tabStyle={tabStyles.cloud.card} // REQUIRED
                        values={formik.values} // REQUIRED (CloudTab uses values.clouds)
                        renderErrorMessage={renderErrorMessage}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                        handleNext={handleNext}
                        handlePrevious={handlePrevious}
                        isFirstTab={isFirstTab}
                      />
                    </TabsContent>

                    <TabsContent value="n" className="mt-4 sm:mt-6">
                      <TotalCloudTab
                        tabStyle={tabStyles.n.card}
                        values={formik.values}
                        renderErrorMessage={renderErrorMessage}
                        handleSelectChange={handleSelectChange}
                        handleNext={handleNext}
                        handlePrevious={handlePrevious}
                        isFirstTab={isFirstTab}
                      />
                    </TabsContent>

                    <TabsContent
                      value="significant-cloud"
                      className="mt-4 sm:mt-6"
                    >
                      <SignificantCloudTab
                        tabStyle={tabStyles["significant-cloud"].card}
                        values={formik.values}
                        renderErrorMessage={renderErrorMessage}
                        handleSelectChange={handleSelectChange}
                        handleNext={handleNext}
                        handlePrevious={handlePrevious}
                        isFirstTab={isFirstTab}
                      />
                    </TabsContent>

                    <TabsContent value="rainfall" className="mt-4 sm:mt-6">
                      <RainfallTabSection
                        tabStyle={tabStyles.rainfall.card}
                        formik={formik}
                        handleNext={handleNext}
                        handlePrevious={handlePrevious}
                        isFirstTab={isFirstTab}
                      />
                    </TabsContent>

                    <TabsContent value="wind" className="mt-4 sm:mt-6">
                      <WindTab
                        tabStyle={tabStyles.wind.card}
                        values={formik.values}
                        renderErrorMessage={renderErrorMessage}
                        handleInputChange={handleInputChange}
                        handleNext={handleNext}
                        handlePrevious={handlePrevious}
                        isFirstTab={isFirstTab}
                      />
                    </TabsContent>

                    <TabsContent value="observer" className="mt-4 sm:mt-6">
                      <ObserverTab
                        tabStyle={tabStyles.observer.card}
                        values={formik.values}
                        renderErrorMessage={renderErrorMessage}
                        handleInputChange={handleInputChange}
                        handleNext={handleNext}
                        handlePrevious={handlePrevious}
                        handleReset={handleReset}
                        isFirstTab={isFirstTab}
                      />
                    </TabsContent>

                    <TabsContent value="summary" className="mt-4 sm:mt-6">
                      <SecondCardSummary
                        formik={formik}
                        session={session}
                        renderErrorMessage={renderErrorMessage}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                        handlePrevious={handlePrevious}
                        handleReset={handleReset}
                        isSubmitting={isSubmitting}
                        selectedHour={selectedHour}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </motion.form>
          </FormikProvider>
        )}
      </AnimatePresence>
    </>
  );
}
