// components/SecondCard/Observer.tsx

"use client";

import React, { memo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { User, RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputField from "./shared/InputField";
import { cn } from "@/lib/utils";

interface ObserverProps {
  tabStyle: string;
  values: any;
  renderErrorMessage: (path: string) => React.ReactNode;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleReset: () => void;
  isFirstTab: boolean;
}

const ObserverTab = memo(function ObserverTab({
  tabStyle,
  values,
  renderErrorMessage,
  handleInputChange,
  handleNext,
  handlePrevious,
  handleReset,
  isFirstTab,
}: ObserverProps) {
  return (
    <Card className={cn("overflow-hidden", tabStyle)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800">
        <h3 className="text-lg font-semibold flex items-center">
          <User className="mr-2 h-5 w-5" /> Observer Information
        </h3>
      </div>

      {/* Content */}
      <CardContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <InputField
            id="station-id"
            name="metadata.stationId"
            label="Station ID"
            accent="orange"
            value={values.metadata?.stationId || ""}
            onChange={handleInputChange}
            required
            numeric
            error={renderErrorMessage("metadata.stationId")}
          />

          <InputField
            id="observer-initial"
            name="observer-initial"
            label="Observer Initial"
            accent="orange"
            value={values.observer?.["observer-initial"] || ""}
            onChange={handleInputChange}
            required
            error={renderErrorMessage("observer.observer-initial")}
          />
        </div>

        {/* Reset Button */}
        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2 text-orange-700 border-orange-300 hover:bg-orange-100"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset Station & Observer Fields
          </Button>
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

export default ObserverTab;
