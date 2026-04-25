// components/SecondCard/Wind.tsx
// Estiak

"use client";

import React, { memo, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Wind, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputField from "./shared/InputField";
import { cn } from "@/lib/utils";

interface WindProps {
  tabStyle: string;
  values: any;
  renderErrorMessage: (path: string) => React.ReactNode;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  isFirstTab: boolean;
}

const WindTab = memo(function WindTab({
  tabStyle,
  values,
  renderErrorMessage,
  handleInputChange,
  handleNext,
  handlePrevious,
  isFirstTab,
}: WindProps) {

  // // ✅ Auto-calculate wind speed
  // useEffect(() => {
  //   const first = Number(values.wind?.["first-anemometer"]);
  //   const second = Number(values.wind?.["second-anemometer"]);

  //   if (!isNaN(first) && !isNaN(second)) {
  //     const speed = ((second - first) * 60) / 10;
  //     const roundedSpeed = Math.round(speed);
      
  //     // Add leading zeros: 00 for 1-digit, 0 for 2-digit values
  //     let formattedSpeed = roundedSpeed.toString();
  //     if (roundedSpeed < 10) {
  //       formattedSpeed = "00" + formattedSpeed;
  //     } else if (roundedSpeed < 100) {
  //       formattedSpeed = "0" + formattedSpeed;
  //     }

  //     handleInputChange({
  //       target: {
  //         name: "speed",
  //         value: formattedSpeed,
  //       },
  //     } as React.ChangeEvent<HTMLInputElement>);
  //   }
  // }, [
  //   values.wind?.["first-anemometer"],
  //   values.wind?.["second-anemometer"],
  // ]);

  return (
    <Card className={cn("overflow-hidden", tabStyle)}>
      {/* Header */}
      <div className="p-4 bg-linear-to-r from-green-200 to-green-300 text-green-800">
        <h3 className="text-lg font-semibold flex items-center">
          <Wind className="mr-2 h-5 w-5" /> Wind Measurement
        </h3>
      </div>

      {/* Content */}
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            id="first-anemometer"
            name="first-anemometer"
            label="First Anemometer"
            accent="green"
            value={values.wind?.["first-anemometer"] || ""}
            onChange={handleInputChange}
            required
            numeric
            error={renderErrorMessage("wind.first-anemometer")}
          />

          <InputField
            id="second-anemometer"
            name="second-anemometer"
            label="Second Anemometer"
            accent="green"
            value={values.wind?.["second-anemometer"] || ""}
            onChange={handleInputChange}
            required
            numeric
            error={renderErrorMessage("wind.second-anemometer")}
          />

          <InputField
            id="speed"
            name="speed"
            label="Speed (KTS)"
            accent="green"
            value={values.wind?.["speed"] || ""}
            onChange={handleInputChange}
            required
            numeric
            error={renderErrorMessage("wind.speed")}
          />

          <InputField
            id="wind-direction"
            name="wind-direction"
            label="Direction (Degrees)"
            accent="green"
            value={values.wind?.["wind-direction"] || ""}
            onChange={handleInputChange}
            required
            numeric
            error={renderErrorMessage("wind.wind-direction")}
          />
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex justify-between p-6">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstTab}
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
});

export default WindTab;
