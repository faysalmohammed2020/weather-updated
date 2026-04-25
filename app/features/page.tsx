"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CloudRain,
  Compass,
  Droplets,
  Gauge,
  Map,
  Thermometer,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function FeaturesPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden">
          {/* Background gradient matching hero section */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 -z-10"></div>
          
          {/* Animated background elements matching hero section */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <motion.div
              className="absolute top-10 left-10 w-48 h-48 rounded-full bg-cyan-300/20 dark:bg-cyan-700/15 blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-56 h-56 rounded-full bg-blue-400/20 dark:bg-blue-600/15 blur-3xl"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.15, 0.25, 0.15],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col items-center text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 dark:border-cyan-700 dark:bg-gray-900/60 px-3 py-1 text-sm backdrop-blur-sm rounded-lg bg-white/90 border border-cyan-200">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium">Features</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                Comprehensive Weather Monitoring Tools
              </h1>
              <p className="max-w-[700px] text-gray-700 dark:text-gray-300 md:text-xl">
                Explore the powerful features of our weather dashboard designed
                specifically for Bangladesh&apos;s unique climate.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
          {/* Subtle background elements */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <motion.div
              className="absolute top-20 right-20 w-32 h-32 rounded-full bg-cyan-300/10 dark:bg-cyan-700/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 12,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
                  <Thermometer className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Temperature Monitoring</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Real-time temperature data across Bangladesh with historical
                    comparisons and trend analysis.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      High/low temperature alerts
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Temperature heatmaps
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Historical temperature data
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <CloudRain className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Rainfall Analysis</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Detailed precipitation data with forecasts and historical
                    patterns for agricultural planning.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Rainfall intensity monitoring
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Seasonal rainfall predictions
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Flood risk assessment
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg">
                  <Wind className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Wind Conditions</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monitor wind speed and direction with interactive
                    visualizations and historical comparisons.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Wind direction visualization
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Storm warnings
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Cyclone tracking
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Humidity Tracking</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Monitor humidity levels across different regions with
                    comfort index calculations.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Relative humidity monitoring
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Dew point calculations
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Heat index warnings
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                  <Gauge className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Atmospheric Pressure</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Track barometric pressure changes to predict weather shifts
                    and storm formations.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Pressure trend analysis
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Storm prediction
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Weather pattern forecasting
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-700 to-blue-800 shadow-lg">
                  <Map className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Interactive Maps</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Detailed interactive maps with regional weather data and
                    customizable layers.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      District-level data
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Customizable map layers
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Zoom and pan capabilities
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-700 shadow-lg">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Seasonal Forecasts</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Long-term seasonal forecasts to help with agricultural
                    planning and disaster preparedness.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Monsoon predictions
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Drought forecasting
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Seasonal temperature trends
                    </li>
                  </ul>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                variants={item}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Data Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Advanced analytics tools for weather data interpretation and
                    trend analysis.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Customizable charts and graphs
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Data export capabilities
                    </li>
                    <li className="flex items-center">
                      <div className="mr-2 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                      </div>
                      Comparative analysis tools
                    </li>
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-cyan-50 to-white dark:from-gray-900 dark:to-gray-900 relative overflow-hidden">
          {/* Subtle background elements */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <motion.div
              className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-blue-300/15 dark:bg-blue-700/15 blur-3xl"
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </div>
          
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              className="mx-auto max-w-3xl text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                Ready to experience these features?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 md:text-xl">
                Access our comprehensive weather dashboard and start exploring
                Bangladesh's weather patterns today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto px-8 bg-linear-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    Launch Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-8 border-cyan-300 dark:border-cyan-700 hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
