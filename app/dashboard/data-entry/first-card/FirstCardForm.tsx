// app/dashboard/data-entry/first-card/FirstCardForm.tsx
"use client";

import React, { useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Thermometer, Wind, Eye, Cloud, BarChart3, Flame } from "lucide-react";
import dynamic from "next/dynamic";

import BasicInfoTab from "@/components/basic-info-tab";
import HourSelector from "@/components/hour-selector";
import type { TimeInfo } from "@/lib/data-type";

import { useFirstCardForm } from "./useFirstCardForm";
import FirstCardSkeleton from "./FirstCardSkeleton"; // 👈 skeleton component

// ✅ lazy load heavy tabs (code-splitting)
const PressureTab = dynamic(() => import("./tabs/PressureTab"), {
  loading: () => <FirstCardSkeleton activeTab="pressure" />,
  ssr: false,
});
const TemperatureTab = dynamic(() => import("./tabs/TemperatureTab"), {
  loading: () => <FirstCardSkeleton activeTab="temperature" />,
  ssr: false,
});
const SquallTab = dynamic(() => import("./tabs/SquallTab"), {
  loading: () => <FirstCardSkeleton activeTab="squall" />,
  ssr: false,
});
const VisibilityTab = dynamic(() => import("./tabs/VisibilityTab"), {
  loading: () => <FirstCardSkeleton activeTab="V.V" />,
  ssr: false,
});
const MeteorsTab = dynamic(() => import("./tabs/MeteorsTab"), {
  loading: () => <FirstCardSkeleton activeTab="meteors" />,
  ssr: false,
});
const WeatherTab = dynamic(() => import("./tabs/WeatherTab"), {
  loading: () => <FirstCardSkeleton activeTab="weather" />,
  ssr: false,
});
const SummaryTab = dynamic(() => import("./tabs/SummaryTab"), {
  loading: () => <FirstCardSkeleton activeTab="summary" />,
  ssr: false,
});

const tabStyles = {
    temperature: {
    icon: Thermometer,
    iconColor: "text-blue-500",
    card: "bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-200 shadow-sm",
  },
  pressure: {
    icon: BarChart3,
    iconColor: "text-rose-500",
    card: "bg-gradient-to-br from-rose-50 to-white border-l-4 border-rose-200 shadow-sm",
  },
  squall: {
    icon: Wind,
    iconColor: "text-amber-500",
    card: "bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-200 shadow-sm",
  },
  "V.V": {
    icon: Eye,
    iconColor: "text-orange-500",
    card: "bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-200 shadow-sm",
  },
  meteors: {
    icon: Flame,
    iconColor: "text-emerald-500",
    card: "bg-gradient-to-br from-emerald-50 via-white to-white border-l-4 border-emerald-300 shadow-sm",
  },
  weather: {
    icon: Cloud,
    iconColor: "text-cyan-500",
    card: "bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-200 shadow-sm",
  },
  summary: {
    icon: BarChart3,
    iconColor: "text-slate-600",
    card: "bg-gradient-to-br from-slate-50 to-white border-l-4 border-slate-200 shadow-sm",
  },
} as const;

type TabKey = keyof typeof tabStyles;

export function FirstCardForm({ timeInfo }: { timeInfo: TimeInfo[] }) {
  const {
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
    selectedHour,
    hygrometricData,
  } = useFirstCardForm();

  // ✅ stable tab change handler
  const onTabClick = useCallback(
    (key: string) => handleTabChange(key),
    [handleTabChange]
  );

  // ✅ memoized tabs list
  const tabsList = useMemo(
    () => Object.entries(tabStyles) as [TabKey, (typeof tabStyles)[TabKey]][],
    []
  );

  const showHourSelector = isLoading || firstCardError || !isHourSelected;
  const showSkeletonOverlay = isSubmitting; // submit-time skeleton

  return (
    <AnimatePresence mode="wait">
      {showHourSelector ? (
        <motion.div
          key="hour-selector"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 flex items-center justify-center bg-white backdrop-blur-sm z-[5] px-6"
        >
          <HourSelector type="first" timeInfo={timeInfo} />
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onSubmit={formik.handleSubmit}
          className="w-full mx-auto relative"
        >
          {/* ✅ skeleton overlay on submit */}
          {showSkeletonOverlay && (
            <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-sm rounded-xl">
              <FirstCardSkeleton activeTab={activeTab as TabKey} />
            </div>
          )}

          <BasicInfoTab
            onFieldChange={(name, value) => formik.setFieldValue(name, value)}
            isLoading={isLoading}
          />

          <div className="relative rounded-xl">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              {/* ✅ Top pill tab selector */}
              <div className="relative mb-8 p-4">
                <div className="relative p-1 bg-slate-50/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm max-w-max mx-auto">
                  <div className="relative flex flex-wrap justify-center items-center gap-2 p-1 rounded-full">
                    {tabsList.map(([key, style], index) => {
                      const isActive = activeTab === key;
                      const Icon = style.icon;

                      return (
                        <motion.button
                          key={key}
                          type="button"
                          onClick={() => onTabClick(key)}
                          className={cn(
                            "relative flex items-center justify-center h-11 px-4 rounded-full border border-transparent text-slate-600 font-semibold transition-all duration-200 shadow-none",
                            "hover:bg-white/70 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-0 min-w-[90px]",
                            isActive
                              ? "bg-white text-slate-900 border border-blue-200 shadow-[0_10px_30px_rgba(37,99,235,0.12)] shadow-blue-200/70"
                              : "bg-transparent",
                            !isTabValid(key) &&
                              formik.submitCount > 0 &&
                              "!border-2 !border-red-400 !bg-red-50 !text-red-700"
                          )}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            scale: isActive ? 1.0 : 1,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            delay: index * 0.04,
                          }}
                        >
                          <div className="relative z-10 flex items-center gap-1">
                            <div
                              className={cn(
                                "p-1.5 rounded-full transition-colors duration-200",
                                {
                                  "bg-blue-50 text-blue-600": isActive,
                                  "bg-transparent text-slate-500": !isActive,
                                }
                              )}
                            >
                              <Icon
                                className={cn("w-4 h-4", {
                                  "text-blue-600": isActive,
                                  [style.iconColor]: !isActive,
                                })}
                              />
                            </div>
                            <span className="text-sm capitalize font-medium">
                              {key === "V.V" ? "VV" : key}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ✅ Tabs content */}

              <TabsContent value="temperature" className="mt-6">
                <TemperatureTab
                  formik={formik}
                  selectedHour={selectedHour}
                  hygrometricData={hygrometricData}
                  handleNumericInput={handleNumericInput}
                  handleChange={handleChange}
                  getFieldError={getFieldError}
                  prevTab={prevTab}
                  nextTab={nextTab}
                  isFirstTab={isFirstTab}
                  cardClassName={tabStyles.temperature.card}
                />
              </TabsContent>

              <TabsContent value="pressure" className="mt-6">
                <PressureTab
                  formik={formik}
                  handleNumericInput={handleNumericInput}
                  handleChange={handleChange}
                  getFieldError={getFieldError}
                  prevTab={prevTab}
                  nextTab={nextTab}
                  isFirstTab={isFirstTab}
                  cardClassName={tabStyles.pressure.card}
                />
              </TabsContent>

              <TabsContent value="squall" className="mt-6">
                <SquallTab
                  formik={formik}
                  handleChange={handleChange}
                  getFieldError={getFieldError}
                  prevTab={prevTab}
                  nextTab={nextTab}
                  cardClassName={tabStyles.squall.card}
                />
              </TabsContent>

              <TabsContent value="V.V" className="mt-6">
                <VisibilityTab
                  formik={formik}
                  handleNumericInput={handleNumericInput}
                  getFieldError={getFieldError}
                  prevTab={prevTab}
                  nextTab={nextTab}
                  cardClassName={tabStyles["V.V"].card}
                />
              </TabsContent>

              <TabsContent value="meteors" className="mt-6">
                <MeteorsTab
                  formik={formik}
                  handleChange={handleChange}
                  prevTab={prevTab}
                  nextTab={nextTab}
                  cardClassName={tabStyles.meteors.card}
                />
              </TabsContent>

              <TabsContent value="weather" className="mt-6">
                <WeatherTab
                  formik={formik}
                  handleChange={handleChange}
                  handleNumericInput={handleNumericInput}
                  getFieldError={getFieldError}
                  prevTab={prevTab}
                  nextTab={nextTab}
                  handleTabChange={handleTabChange}
                  cardClassName={tabStyles.weather.card}
                />
              </TabsContent>

              <TabsContent value="summary" className="mt-6">
                <SummaryTab
                  formik={formik}
                  selectedHour={selectedHour}
                  handleNumericInput={handleNumericInput}
                  handleChange={handleChange}
                  handleReset={handleReset}
                  prevTab={prevTab}
                  isSubmitting={isSubmitting}
                  cardClassName={tabStyles.summary.card}
                />
              </TabsContent>
            </Tabs>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
