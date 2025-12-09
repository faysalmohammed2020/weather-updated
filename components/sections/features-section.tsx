"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Thermometer, CloudRain, Wind, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, RadialChart, DonutChart } from "@/components/charts";

type HomeWeatherPayload = {
  station: {
    id: string;
    stationId: string;
    name: string;
  } | null;
  observedAt: string | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  totalPrecipitation: number | null;
  windSpeed: number | null;
  avRelativeHumidity: number | null;
};

type FeatureCard = {
  icon: ReactNode;
  title: string;
  description: string;
  chart: ReactNode;
};

export default function FeaturesSection() {
  const [payload, setPayload] = useState<HomeWeatherPayload | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const res = await fetch("/api/home-weather", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok || !json?.data) {
          throw new Error(json?.message || "Failed to load feature data");
        }

        if (!active) return;
        setPayload(json.data);
        setStatus("ready");
      } catch (error) {
        console.error("FeaturesSection: live data fetch failed", error);
        if (active) setStatus("error");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const formatValue = (value: number | null | undefined, unit = "") => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return "N/A";
    }
    return `${value}${unit}`;
  };

  const observedLabel = useMemo(() => {
    if (!payload?.observedAt) return "Awaiting latest reading";
    return new Date(payload.observedAt).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }, [payload?.observedAt]);

  const stationLabel = payload?.station?.name || "Bangladesh Network";

  const safeChartValue = (value: number | null | undefined, fallback = 1) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return fallback;
    }
    if (value <= 0) return fallback;
    return value;
  };

  const maxTemp = payload?.maxTemperature ?? null;
  const minTemp = payload?.minTemperature ?? null;
  const avgTemp =
    maxTemp !== null && minTemp !== null
      ? Number(((maxTemp + minTemp) / 2).toFixed(1))
      : null;

  const totalRain = payload?.totalPrecipitation ?? null;
  const windSpeed = payload?.windSpeed ?? null;
  const humidity = payload?.avRelativeHumidity ?? null;

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 12,
        mass: 0.5,
      },
    },
  };

  const features: FeatureCard[] = [
    {
      icon: (
        <Thermometer className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      ),
      title: "Temperature Analytics",
      description: `Latest observation from ${stationLabel}. Max ${formatValue(
        maxTemp,
        " degC"
      )}, Min ${formatValue(minTemp, " degC")}.`,
      chart: (
        <LineChart
          data={[
            { name: "Min", value: safeChartValue(minTemp) },
            { name: "Avg", value: safeChartValue(avgTemp) },
            { name: "Max", value: safeChartValue(maxTemp) },
          ]}
          color="indigo"
          className="h-32 w-full mt-4"
        />
      ),
    },
    {
      icon: (
        <CloudRain className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      ),
      title: "Rainfall Patterns",
      description: `Last reading: ${formatValue(totalRain, " mm")} recorded.`,
      chart: (
        <BarChart
          data={[
            {
              name: "Morning",
              value: safeChartValue(
                totalRain !== null ? totalRain * 0.4 : null
              ),
            },
            {
              name: "Afternoon",
              value: safeChartValue(
                totalRain !== null ? totalRain * 0.35 : null
              ),
            },
            {
              name: "Evening",
              value: safeChartValue(totalRain !== null ? totalRain * 0.25 : null),
            },
          ]}
          color="blue"
          className="h-32 w-full mt-4"
        />
      ),
    },
    {
      icon: <Wind className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Wind Conditions",
      description: `Current wind: ${formatValue(windSpeed, " kt")} average.`,
      chart: (
        <RadialChart
          value={safeChartValue(windSpeed)}
          maxValue={100}
          color="purple"
          label="kt"
          className="h-32 w-full mt-4"
        />
      ),
    },
    {
      icon: <Map className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
      title: "Humidity Snapshot",
      description: `Relative humidity at ${formatValue(humidity, "%")}.`,
      chart: (
        <DonutChart
          data={[
            { name: "Moist", value: safeChartValue(humidity, 50) },
            {
              name: "Dry Air",
              value: safeChartValue(
                humidity !== null ? Math.max(100 - humidity, 5) : null,
                50
              ),
            },
          ]}
          colors={["indigo", "blue"]}
          className="h-32 w-full mt-4"
        />
      ),
    },
  ];

  return (
    <section className="relative w-full py-16 bg-slate-50 dark:bg-gray-900 overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/20 to-transparent dark:from-indigo-900/10"></div>
      </div>

      <div className=" px-4 md:px-6  relative z-10">
        <motion.div
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
          >
            Weather Intelligence
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight md:text-4xl text-gray-900 dark:text-white"
          >
            Advanced Meteorological Data
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-2xl text-gray-600 dark:text-gray-300"
          >
            {status === "error"
              ? "Live feature data unavailable right now."
              : "Precise weather analytics and forecasting tools for informed decision making across Bangladesh."}
            <span className="block text-sm text-indigo-600 dark:text-indigo-300 mt-2">
              {status === "ready"
                ? `Updated - ${observedLabel}`
                : "Loading latest data..."}
            </span>
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto grid max-w-5xl items-center gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-all duration-300"
              variants={item}
              whileHover={{
                y: -5,
                boxShadow: "0 10px 20px -5px rgba(79, 70, 229, 0.1)",
                transition: { duration: 0.2, ease: "easeOut" },
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30 p-2">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                {feature.description}
              </p>
              {feature.chart}
              <Link
                href="/features"
                className="mt-4 inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors group"
              >
                Explore data
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Link href="/features">
            <Button
              variant="default"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors shadow-sm hover:shadow-md"
            >
              <span className="flex items-center">
                View Full Dashboard
                <ArrowRight className="ml-3 h-4 w-4" />
              </span>
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
