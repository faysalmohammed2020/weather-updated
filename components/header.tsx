"use client";

import Link from "next/link";
import { Cloud, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur transition-all duration-300 ${
        isScrolled ? "bg-background/95 border-b shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Cloud className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-blue-700 dark:from-cyan-400 dark:to-blue-400">BD Weather</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-all duration-300 relative py-1 px-2 rounded-md ${
              isActive("/") 
                ? "text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 shadow-sm" 
                : "text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            }`}
          >
            {isActive("/") && (
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-blue-500/10 rounded-md"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Home</span>
          </Link>
          <Link
            href="/features"
            className={`text-sm font-medium transition-all duration-300 relative py-1 px-2 rounded-md ${
              isActive("/features") 
                ? "text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 shadow-sm" 
                : "text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            }`}
          >
            {isActive("/features") && (
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-blue-500/10 rounded-md"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Features</span>
          </Link>
          <Link
            href="/about"
            className={`text-sm font-medium transition-all duration-300 relative py-1 px-2 rounded-md ${
              isActive("/about") 
                ? "text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 shadow-sm" 
                : "text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            }`}
          >
            {isActive("/about") && (
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-blue-500/10 rounded-md"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">About</span>
          </Link>
          <Link
            href="/data-sources"
            className={`text-sm font-medium transition-all duration-300 relative py-1 px-2 rounded-md ${
              isActive("/data-sources") 
                ? "text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 shadow-sm" 
                : "text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            }`}
          >
            {isActive("/data-sources") && (
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-blue-500/10 rounded-md"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Data Sources</span>
          </Link>
          <Link
            href="/contact"
            className={`text-sm font-medium transition-all duration-300 relative py-1 px-2 rounded-md ${
              isActive("/contact") 
                ? "text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30 shadow-sm" 
                : "text-gray-700 dark:text-gray-300 hover:text-cyan-700 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
            }`}
          >
            {isActive("/contact") && (
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-blue-500/10 rounded-md"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">Contact</span>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="hidden md:block">
            <Button className="bg-linear-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
              Access Dashboard
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-cyan-200 dark:border-cyan-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
              <nav className="container flex flex-col py-4 gap-2">
                <Link
                  href="/"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    isActive("/")
                      ? "text-cyan-700 dark:text-cyan-400 bg-linear-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 shadow-sm border border-cyan-300 dark:border-cyan-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    {isActive("/") && (
                      <div className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse"></div>
                    )}
                    Home
                  </span>
                </Link>
                <Link
                  href="/features"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    isActive("/features")
                      ? "text-cyan-700 dark:text-cyan-400 bg-linear-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 shadow-sm border border-cyan-300 dark:border-cyan-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    {isActive("/features") && (
                      <div className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse"></div>
                    )}
                    Features
                  </span>
                </Link>
                <Link
                  href="/about"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    isActive("/about")
                      ? "text-cyan-700 dark:text-cyan-400 bg-linear-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 shadow-sm border border-cyan-300 dark:border-cyan-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    {isActive("/about") && (
                      <div className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse"></div>
                    )}
                    About
                  </span>
                </Link>
                <Link
                  href="/data-sources"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    isActive("/data-sources")
                      ? "text-cyan-700 dark:text-cyan-400 bg-linear-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 shadow-sm border border-cyan-300 dark:border-cyan-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    {isActive("/data-sources") && (
                      <div className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse"></div>
                    )}
                    Data Sources
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 ${
                    isActive("/contact")
                      ? "text-cyan-700 dark:text-cyan-400 bg-linear-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 shadow-sm border border-cyan-300 dark:border-cyan-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-700 dark:hover:text-cyan-400"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    {isActive("/contact") && (
                      <div className="w-2 h-2 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse"></div>
                    )}
                    Contact
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  className="mt-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-linear-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 shadow-lg hover:shadow-blue-500/25 transition-all duration-300">Access Dashboard</Button>
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
