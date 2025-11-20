// components/SecondCard/Cloud.tsx
//Estiak

"use client";

import React, { memo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CloudIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import CloudLevelSection from "./shared/CloudLevelSection";
import { cn } from "@/lib/utils";

interface CloudTabProps {
  tabStyle: string;
  values: any;
  renderErrorMessage: (path: string) => React.ReactNode;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  isFirstTab: boolean;
}

const CloudTab = memo(function CloudTab({
  tabStyle,
  values,
  renderErrorMessage,
  handleInputChange,
  handleSelectChange,
  handleNext,
  handlePrevious,
  isFirstTab,
}: CloudTabProps) {
  return (
    <Card className={cn("overflow-hidden", tabStyle)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-200 to-blue-300 text-blue-800">
        <h3 className="text-lg font-semibold flex items-center">
          <CloudIcon className="mr-2 h-5 w-5" /> Cloud Observation
        </h3>
      </div>

      {/* Content */}
      <CardContent className="pt-6">
        <div className="space-y-8">
          <CloudLevelSection
            title="Low Cloud"
            prefix="low-cloud"
            color="blue"
            data={values.clouds.low}
            onChange={handleInputChange}
            onSelectChange={handleSelectChange}
            renderError={(field) => renderErrorMessage(`clouds.low.${field}`)}
          />

          <CloudLevelSection
            title="Medium Cloud"
            prefix="medium-cloud"
            color="purple"
            data={values.clouds.medium}
            onChange={handleInputChange}
            onSelectChange={handleSelectChange}
            renderError={(field) =>
              renderErrorMessage(`clouds.medium.${field}`)
            }
          />

          <CloudLevelSection
            title="High Cloud"
            prefix="high-cloud"
            color="cyan"
            data={values.clouds.high}
            onChange={handleInputChange}
            onSelectChange={handleSelectChange}
            renderError={(field) => renderErrorMessage(`clouds.high.${field}`)}
          />
        </div>
      </CardContent>

      {/* Footer Buttons */}
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

export default CloudTab;
