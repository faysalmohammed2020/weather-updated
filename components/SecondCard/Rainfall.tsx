// components/SecondCard/Rainfall.tsx

"use client";

import React, { memo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CloudRainIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RainfallTab from "@/components/weather-form/rainfall-tab";
import { cn } from "@/lib/utils";

interface RainfallProps {
  tabStyle: string;
  formik: any;
  handleNext: () => void;
  handlePrevious: () => void;
  isFirstTab: boolean;
}

const RainfallTabSection = memo(function RainfallTabSection({
  tabStyle,
  formik,
  handleNext,
  handlePrevious,
  isFirstTab,
}: RainfallProps) {
  return (
    <Card className={cn("overflow-hidden", tabStyle)}>
      
      {/* Header */}
      <div className="p-4 bg-linear-to-r from-cyan-200 to-cyan-300 text-cyan-800">
        <h3 className="text-lg font-semibold flex items-center">
          <CloudRainIcon className="mr-2 h-5 w-5" /> Rainfall
        </h3>
      </div>

      {/* Content */}
      <CardContent className="pt-6">
        <RainfallTab/>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-between p-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstTab}
          className="text-xs sm:text-sm"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
});

export default RainfallTabSection;
