"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Database,
  FileText,
  Globe,
  Satellite,
  Server,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function DataSourcesPage() {
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
                <span className="text-xs font-medium">Data Sources</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                Reliable Weather Information
              </h1>
              <p className="max-w-[700px] text-gray-700 dark:text-gray-300 md:text-xl">
                Learn about the sources and methodologies behind our weather
                data collection and analysis.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="text-center space-y-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                Our Data Collection Network
              </h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-lg">
                We integrate data from multiple reliable sources to provide the
                most accurate and comprehensive weather information for
                Bangladesh.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
                    Bangladesh Meteorological Department
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Official weather data from government meteorological
                    stations across Bangladesh, providing baseline measurements
                    for temperature, rainfall, humidity, and wind.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                  <Satellite className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Satellite Imagery</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    High-resolution satellite data for cloud cover,
                    precipitation, and temperature analysis, providing
                    comprehensive coverage even in remote areas.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-700 shadow-lg">
                  <Server className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
                    International Weather Networks
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Data from global weather monitoring networks for improved
                    forecast accuracy and cross-validation of local
                    measurements.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Historical Archives</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Decades of historical weather data for Bangladesh, enabling
                    trend analysis and seasonal pattern recognition for more
                    accurate forecasting.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 shadow-lg">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Research Partnerships</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Collaborations with universities and research institutions
                    to incorporate the latest climate research and modeling
                    techniques into our forecasting systems.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col space-y-4 rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-700 to-blue-800 shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Agricultural Data</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Integration with agricultural data sources to provide
                    context-specific weather information for farming communities
                    and agricultural planning.
                  </p>
                </div>
              </motion.div>
            </div>
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
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                  Data Processing Methodology
                </h2>
                <p className="text-gray-600 dark:text-gray-400 md:text-lg">
                  Our data processing methodology involves several steps to
                  ensure accuracy and reliability:
                </p>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 md:text-lg">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>
                      <strong>Data Collection:</strong> Gathering raw data from
                      multiple sources
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>
                      <strong>Quality Control:</strong> Filtering and validating
                      data to remove errors
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>
                      <strong>Integration:</strong> Combining data from
                      different sources into a unified format
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>
                      <strong>Analysis:</strong> Applying statistical models and
                      algorithms to interpret data
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>
                      <strong>Forecasting:</strong> Generating predictions based
                      on historical patterns and current conditions
                    </span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>
                      <strong>Visualization:</strong> Presenting data in
                      intuitive and accessible formats
                    </span>
                  </li>
                </ul>
              </motion.div>
              <motion.div
                className="relative rounded-xl overflow-hidden shadow-xl border border-cyan-200 dark:border-cyan-800/50"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Image
                  src="/data-processing-visualization.png"
                  alt="Data processing visualization"
                  width={800}
                  height={600}
                  className="object-cover aspect-video"
                />
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="text-center space-y-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                Data Quality Assurance
              </h2>
              <p className="max-w-[700px] mx-auto text-gray-700 dark:text-gray-300 md:text-lg">
                We maintain rigorous quality control measures to ensure the
                accuracy and reliability of our weather data.
              </p>
            </motion.div>

            <motion.div
              className="grid gap-8 md:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300">
                <h3 className="text-xl font-bold mb-4 text-cyan-700 dark:text-cyan-400">
                  Quality Control Measures
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>Regular calibration of measurement instruments</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>Cross-validation between multiple data sources</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>Automated error detection algorithms</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>Manual review by meteorological experts</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>
                      Continuous improvement based on forecast verification
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-white/90 dark:bg-gray-800/90 p-6 shadow-sm backdrop-blur-sm border-cyan-200 dark:border-cyan-800/50 hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-700 transition-all duration-300">
                <h3 className="text-xl font-bold mb-4 text-cyan-700 dark:text-cyan-400">Data Transparency</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>Clear documentation of data sources</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>Timestamp information for all data points</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>Confidence levels for forecasts and predictions</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>Open access to historical data archives</span>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-2 mt-1 h-4 w-4 rounded-full bg-cyan-100 dark:bg-cyan-900/50 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></div>
                    </div>
                    <span>Regular publication of accuracy metrics</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-linear-to-r from-cyan-700 to-blue-700 text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <motion.div
              className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/15 blur-3xl"
              animate={{
                scale: [1, 1.1, 1],
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
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Experience Our Data in Action
              </h2>
              <p className="text-white/80 md:text-xl">
                Access our weather dashboard to see how we transform raw data
                into actionable insights.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto bg-white text-cyan-700 hover:bg-gray-100 shadow-lg"
                  >
                    Launch Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/20 text-cyan-600 hover:text-white hover:bg-cyan-600/10"
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
