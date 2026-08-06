"use client";

import { useEffect, useState } from "react";
import type { AnimationQuality } from "@/lib/weather/grid-types";

export function useAdaptiveQuality() {
  const [quality, setQuality] = useState<AnimationQuality>("medium");
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      const reduce = motionQuery.matches;
      const memory =
        (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
      const cores = navigator.hardwareConcurrency ?? 4;
      const width = window.innerWidth;

      setReducedMotion(reduce);

      if (reduce || width < 640 || memory <= 2 || cores <= 4) {
        setQuality("low");
      } else if (width >= 1280 && memory >= 8 && cores >= 8) {
        setQuality("high");
      } else {
        setQuality("medium");
      }
    };

    update();
    motionQuery.addEventListener("change", update);
    window.addEventListener("resize", update);

    return () => {
      motionQuery.removeEventListener("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return { quality, reducedMotion };
}
