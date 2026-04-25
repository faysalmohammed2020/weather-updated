"use client";

import React, { useState } from "react";
import { AgroclimatologicalForm } from "./agroclimatological-form";
import SunshineTracker from "./SunshineTracker/sunshineTracker";
import { SoilMoistureForm } from "./SoilMoistureForm/SoilMoistureForm";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sun, Thermometer, Droplets } from "lucide-react";
import { motion } from "framer-motion";

const AgroclimatologicalPage = () => {
  const [activeTab, setActiveTab] = useState("sunshine");

  const tabStyles = {
    sunshine: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-amber-50 via-white to-orange-50 border-l-4 border-amber-400 shadow-xl shadow-amber-500/10",
      icon: <Sun className="size-5 mr-2 text-amber-600" />,
      header: "bg-linear-to-r from-amber-500 to-orange-500 text-white",
      color: "amber",
    },
    soil: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-l-4 border-emerald-400 shadow-xl shadow-emerald-500/10",
      icon: <Thermometer className="size-5 mr-2 text-emerald-600" />,
      header: "bg-linear-to-r from-emerald-500 to-teal-500 text-white",
      color: "emerald",
    },
    agro: {
      tab: "relative overflow-hidden",
      card: "bg-gradient-to-br from-violet-50 via-white to-purple-50 border-l-4 border-violet-400 shadow-xl shadow-violet-500/10",
      icon: <Droplets className="size-5 mr-2 text-violet-600" />,
      header: "bg-linear-to-r from-violet-500 to-purple-600 text-white",
      color: "violet",
    },
  };

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <div className="min-h-screen p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-violet-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <Thermometer className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Agroclimatological Data Collection
          </h1>
          <div className="w-24 h-1 bg-linear-to-r from-violet-500 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full mx-auto"
        >
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Waterdrop Navigation */}
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
                            className={cn("transition-transform duration-200", {
                              "scale-110": isActive,
                            })}
                          >
                            {style.icon}
                          </div>
                          <span className="text-base capitalize font-medium">
                            {key === 'sunshine' ? 'Sunshine' : key === 'soil' ? 'Soil Moisture' : 'Agroclimatological'}
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
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Sunshine Tracker Tab */}
            <TabsContent value="sunshine">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.sunshine.card)}>
                <div className={cn("p-6", tabStyles.sunshine.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Sun className="mr-3 w-6 h-6" /> Sunshine Tracker Data
                  </h3>
                </div>
                <Card className="mx-8 my-6">
                  <SunshineTracker />
                </Card>
              </Card>
            </TabsContent>

            {/* Soil Moisture Tab */}
            <TabsContent value="soil">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.soil.card)}>
                <div className={cn("p-6", tabStyles.soil.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Thermometer className="mr-3 w-6 h-6" /> Soil Moisture Data
                  </h3>
                </div>
                <Card className="mx-8 my-6">
                  <SoilMoistureForm />
                </Card>
              </Card>
            </TabsContent>

            {/* Agroclimatological Form Tab */}
            <TabsContent value="agro">
              <Card className={cn("overflow-hidden rounded-2xl border-0", tabStyles.agro.card)}>
                <div className={cn("p-6", tabStyles.agro.header)}>
                  <h3 className="text-xl font-bold flex items-center">
                    <Droplets className="mr-3 w-6 h-6" /> Agroclimatological Data
                  </h3>
                </div>
                <Card className="mx-8 my-6">
                  <AgroclimatologicalForm />
                </Card>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
  );
};

export default AgroclimatologicalPage;