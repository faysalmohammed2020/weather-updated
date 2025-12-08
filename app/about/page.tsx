"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Cloud,
  CloudRain,
  Database,
  Globe,
  LineChart,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function AboutPage() {
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
                <span className="text-xs font-medium">About Us</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                Bangladesh Weather Dashboard
              </h1>
              <p className="max-w-[700px] text-gray-700 dark:text-gray-300 md:text-xl">
                Learn about our mission to provide accurate and accessible
                weather information for Bangladesh.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                  Our Mission
                </h2>
                <p className="text-gray-600 dark:text-gray-400 md:text-lg">
                  ICIMOD is developing an integrated information platform
                  linking weather and climate data with agriculture practices in
                  the region. The platform provides data analysis support to
                  professionals responsible for developing response strategies
                  to drought conditions.
                </p>
                <p className="text-gray-600 dark:text-gray-400 md:text-lg">
                  Our mission is to provide accurate, timely, and accessible
                  weather information to help communities, farmers, and
                  decision-makers across Bangladesh prepare for and respond to
                  weather events.
                </p>
              </motion.div>
              <motion.div
                className="relative rounded-xl overflow-hidden shadow-xl border border-cyan-200 dark:border-cyan-800/50"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Image
                  src="/weather_monitoring_station.jpg"
                  alt="Weather monitoring station"
                  width={800}
                  height={600}
                  className="object-cover aspect-video"
                />
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
            <motion.div
              className="text-center space-y-4 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                What We Do
              </h2>
              <p className="max-w-[700px] mx-auto text-gray-700 dark:text-gray-300 md:text-lg">
                Our comprehensive weather platform serves multiple stakeholders
                across Bangladesh with accurate data and analysis.
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
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Data Collection</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We collect weather data from multiple reliable sources
                    including government meteorological stations, satellite
                    imagery, and international weather networks.
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
                  <LineChart className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Analysis & Forecasting</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our team of meteorologists and data scientists analyze
                    weather patterns to provide accurate forecasts and trend
                    analysis for all regions of Bangladesh.
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
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">
                    Information Dissemination
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We make weather information accessible through our
                    interactive dashboard, providing critical data to farmers,
                    emergency services, and the general public.
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
                  <CloudRain className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Disaster Preparedness</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We provide early warnings for extreme weather events like
                    cyclones, floods, and droughts to help communities prepare
                    and minimize impact.
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
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Community Support</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We work with local communities, agricultural extension
                    services, and government agencies to ensure weather
                    information is actionable and beneficial.
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
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-cyan-700 dark:text-cyan-400">Climate Research</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    We contribute to climate research by maintaining historical
                    weather data and analyzing long-term climate trends specific
                    to Bangladesh.
                  </p>
                </div>
              </motion.div>
            </div>
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
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              <motion.div
                className="relative rounded-xl overflow-hidden shadow-xl border border-cyan-200 dark:border-cyan-800/50 order-2 lg:order-1"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Image
                  src="/team_of_meteorologists.jpg"
                  alt="Team of meteorologists"
                  width={800}
                  height={600}
                  className="object-cover aspect-video"
                />
              </motion.div>
              <motion.div
                className="space-y-4 order-1 lg:order-2"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">
                  Our Team
                </h2>
                <p className="text-gray-600 dark:text-gray-400 md:text-lg">
                  Our team consists of experienced meteorologists, data
                  scientists, agricultural experts, and software developers
                  working together to provide the most accurate and useful
                  weather information.
                </p>
                <p className="text-gray-600 dark:text-gray-400 md:text-lg">
                  We collaborate with government agencies, research
                  institutions, and international organizations to continuously
                  improve our data collection, analysis, and forecasting
                  capabilities.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-cyan-700 to-blue-700 text-white relative overflow-hidden">
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
                Join Us in Our Mission
              </h2>
              <p className="text-white/80 md:text-xl">
                Help us make weather information more accessible and actionable
                for communities across Bangladesh.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto bg-white text-cyan-700 hover:bg-gray-100 shadow-lg"
                  >
                    Access Dashboard
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white/20 text-cyan-700 hover:text-white hover:bg-cyan-700/10"
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
