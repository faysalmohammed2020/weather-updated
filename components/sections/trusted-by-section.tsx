"use client";

import { motion } from "framer-motion";

export default function TrustedBySection() {
  const partners = [
    "Bangladesh Met Dept",
    "Ministry of Agriculture",
    "Dhaka University",
    "ICIMOD",
    "World Bank",
  ];

  return (
    <section className="relative w-full py-16 md:py-24 overflow-hidden">
      {/* Background gradient matching other sections */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-cyan-50/30 to-blue-50/20 dark:from-gray-900 dark:via-cyan-950/20 dark:to-blue-950/10 -z-10"></div>

      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          className="absolute top-20 left-1/4 w-48 h-48 rounded-full bg-cyan-300/10 dark:bg-cyan-700/5 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-1/4 w-56 h-56 rounded-full bg-blue-300/10 dark:bg-blue-700/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center justify-center text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 dark:border-cyan-700 dark:bg-gray-900/60 px-3 py-1 text-sm backdrop-blur-sm border border-cyan-200 bg-white/90 rounded-full"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
            <span className="text-xs font-medium text-cyan-700 dark:text-cyan-300 uppercase tracking-widest">
              Trusted by
            </span>
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400"
          >
            Leading Institutions & Global Partners
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-2xl text-gray-700 dark:text-gray-300 text-lg"
          >
            We proudly collaborate with esteemed organizations to deliver
            reliable and innovative weather solutions across Bangladesh and
            beyond.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-8"
          >
            {partners.map((name, idx) => (
              <motion.div
                key={idx}
                className="px-6 py-4 rounded-2xl bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-200 font-semibold text-sm md:text-base shadow-lg backdrop-blur-sm border border-cyan-200 dark:border-cyan-800/50 transition-all"
                whileHover={{
                  y: -8,
                  scale: 1.05,
                  backgroundColor: "rgba(6,182,212,0.1)",
                  boxShadow: "0 25px 50px -12px rgba(6, 182, 212, 0.25)",
                  borderColor: "rgba(6,182,212,0.3)",
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
