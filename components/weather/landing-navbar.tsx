"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CloudSun, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { landingCopy } from "@/lib/weather-platform-data";

type LandingNavbarProps = {
  isDark: boolean;
  onThemeToggle: () => void;
};

const navLinks = [
  { href: "/", label: landingCopy.nav[0] },
  { href: "/features", label: landingCopy.nav[1] },
  { href: "/about", label: landingCopy.nav[2] },
  { href: "/data-sources", label: landingCopy.nav[3] },
  { href: "/contact", label: landingCopy.nav[4] },
];

export function LandingNavbar({ isDark, onThemeToggle }: LandingNavbarProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-[1200] border-b transition-all duration-300",
        isScrolled
          ? "border-slate-200/70 bg-white/78 shadow-lg shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/72"
          : "border-transparent bg-white/52 backdrop-blur-md dark:bg-slate-950/52"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-cyan-500 text-white shadow-lg shadow-cyan-500/25">
            <CloudSun className="size-5" />
          </span>
          <span className="truncate text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
            {landingCopy.brand}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-cyan-700 dark:text-cyan-300"
                    : "text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="landing-active-nav"
                    className="absolute inset-0 rounded-md bg-cyan-500/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg"
            onClick={onThemeToggle}
            aria-label={landingCopy.theme}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Link href="/sign-in" className="hidden md:block">
            <Button className="h-9 rounded-lg bg-slate-950 px-4 text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              {landingCopy.signIn}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg md:hidden"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            aria-label={
              isMobileMenuOpen ? landingCopy.closeMenu : landingCopy.mobileMenu
            }
          >
            {isMobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-slate-200/70 bg-white/92 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/92 md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium",
                    pathname === link.href
                      ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300"
                      : "text-slate-700 dark:text-slate-300"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="mt-2 w-full rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                  {landingCopy.signIn}
                </Button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
