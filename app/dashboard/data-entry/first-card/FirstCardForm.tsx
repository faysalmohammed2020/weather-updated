// app/dashboard/data-entry/first-card/FirstCardForm.tsx

"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Thermometer,
  Wind,
  Eye,
  Cloud,
  BarChart3,
  AlertCircle,
  Flame,
} from "lucide-react";

import BasicInfoTab from "@/components/basic-info-tab";
import HourSelector from "@/components/hour-selector";
import type { TimeInfo } from "@/lib/data-type";

import { useFirstCardForm, tabOrder } from "./useFirstCardForm";
import PressureTab from "./tabs/PressureTab";
import TemperatureTab from "./tabs/TemperatureTab";
import SquallTab from "./tabs/SquallTab";
import VisibilityTab from "./tabs/VisibilityTab";
import MeteorsTab from "./tabs/MeteorsTab";
import WeatherTab from "./tabs/WeatherTab";
import SummaryTab from "./tabs/SummaryTab";

const tabStyles = {
  pressure: {
    icon: <BarChart3 className="w-4 h-4" />,
    iconColor: "text-rose-500",
    card: "bg-gradient-to-br from-rose-50 to-white border-l-4 border-rose-200 shadow-sm",
  },
  temperature: {
    icon: <Thermometer className="w-4 h-4" />,
    iconColor: "text-blue-500",
    card: "bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-200 shadow-sm",
  },
  squall: {
    icon: <Wind className="w-4 h-4" />,
    iconColor: "text-amber-500",
    card: "bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-200 shadow-sm",
  },
  "V.V": {
    icon: <Eye className="w-4 h-4" />,
    iconColor: "text-orange-500",
    card: "bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-200 shadow-sm",
  },
  meteors: {
    icon: <Flame className="w-4 h-4 text-emerald-500" />,
    iconColor: "text-emerald-500",
    card: "bg-gradient-to-br from-emerald-50 via-white to-white border-l-4 border-emerald-300 shadow-sm",
  },
  weather: {
    icon: <Cloud className="w-4 h-4" />,
    iconColor: "text-cyan-500",
    card: "bg-gradient-to-br from-cyan-50 to-white border-l-4 border-cyan-200 shadow-sm",
  },
  summary: {
    icon: <BarChart3 className="w-4 h-4" />,
    iconColor: "text-slate-600",
    card: "bg-gradient-to-br from-slate-50 to-white border-l-4 border-slate-200 shadow-sm",
  },
} as const;

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

  // 🔹 লোকাল helper: error string নিয়ে JSX বানায়
  // const getfielderror = (field: string) => {
  //   const error = getFieldError(field);
  //   if (!error) return null;

  //   return (
  //     <div className="text-red-500 text-sm mt-1 flex items-start">
  //       <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
  //       <span>{error}</span>
  //     </div>
  //   );
  // };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading || firstCardError || !isHourSelected ? (
          <motion.div
            key="hour-selector"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
            transition={{ duration: 0.3 }}
            onSubmit={formik.handleSubmit}
            className="w-full mx-auto"
          >
            <BasicInfoTab
              onFieldChange={(name, value) => {
                formik.setFieldValue(name, value);
              }}
            />

            <div className="relative rounded-xl">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                {/* Top pill tab selector */}
                <div className="relative mb-8 p-4">
                  <div className="relative p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 max-w-max mx-auto">
                    <div className="relative flex flex-wrap justify-center items-center gap-1 p-1.5 rounded-full bg-gray-100/50">
                      {Object.entries(tabStyles).map(([key, style], index) => {
                        const isActive = activeTab === key;

                        return (
                          <motion.button
                            key={key}
                            type="button"
                            onClick={() => handleTabChange(key)}
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
                                    [style.iconColor]: !isActive,
                                    "bg-white/20": isActive,
                                  }
                                )}
                              >
                                {React.cloneElement(style.icon, {
                                  className: cn("w-4 h-4", {
                                    "text-blue-500": isActive,
                                    [style.iconColor]: !isActive,
                                  }),
                                })}
                              </div>
                              <span className="text-base capitalize font-medium">
                                {key === "V.V" ? "VV" : key}
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
                      })}
                    </div>
                  </div>
                </div>

                {/* Tabs content */}
                <TabsContent value="pressure" className="mt-6">
                  <PressureTab
                    formik={formik}
                    handleNumericInput={handleNumericInput}
                    handleChange={handleChange}
                    getFieldError={getFieldError}
                    nextTab={nextTab}
                    cardClassName={tabStyles.pressure.card}
                  />
                </TabsContent>

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
    </>
  );
}
