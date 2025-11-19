"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  children: ReactNode;
}

const WeekNavigation = ({
  onPrevious,
  onNext,
  children,
}: WeekNavigationProps) => (
  <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-3 md:gap-2">
    <Button
      variant="outline"
      size="icon"
      onClick={onPrevious}
      className="hover:bg-slate-200 flex-shrink-0 bg-transparent"
      aria-label="Show previous range"
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>
    <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
      {children}
    </div>
    <Button
      variant="outline"
      size="icon"
      onClick={onNext}
      className="hover:bg-slate-200 flex-shrink-0 bg-transparent"
      aria-label="Show next range"
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
);

export default WeekNavigation;
