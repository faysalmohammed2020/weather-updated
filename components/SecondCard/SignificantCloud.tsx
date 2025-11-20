// components/SecondCard/SignificantCloud.tsx
//Estiak

"use client";

import React, { memo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CloudIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SignificantCloudSection from "./shared/SignificantCloudSection";
import { cn } from "@/lib/utils";

interface SignificantCloudProps {
  tabStyle: string;
  values: any;
  renderErrorMessage: (path: string) => React.ReactNode;
  handleSelectChange: (name: string, value: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  isFirstTab: boolean;
}

const SignificantCloudTab = memo(function SignificantCloudTab({
  tabStyle,
  values,
  renderErrorMessage,
  handleSelectChange,
  handleNext,
  handlePrevious,
  isFirstTab,
}: SignificantCloudProps) {
  return (
    <Card className={cn("overflow-hidden", tabStyle)}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-200 to-purple-300 text-purple-800">
        <h3 className="text-lg font-semibold flex items-center">
          <CloudIcon className="mr-2 h-5 w-5" /> Significant Cloud
        </h3>
      </div>

      {/* Content */}
      <CardContent className="pt-6">
        <div className="space-y-8">
          <SignificantCloudSection
            title="1st Layer"
            prefix="layer1"
            color="purple"
            data={values.significantClouds.layer1}
            onSelectChange={handleSelectChange}
            renderError={(field) =>
              renderErrorMessage(`significantClouds.layer1.${field}`)
            }
          />

          <SignificantCloudSection
            title="2nd Layer"
            prefix="layer2"
            color="fuchsia"
            data={values.significantClouds.layer2}
            onSelectChange={handleSelectChange}
            renderError={(field) =>
              renderErrorMessage(`significantClouds.layer2.${field}`)
            }
          />

          <SignificantCloudSection
            title="3rd Layer"
            prefix="layer3"
            color="violet"
            data={values.significantClouds.layer3}
            onSelectChange={handleSelectChange}
            renderError={(field) =>
              renderErrorMessage(`significantClouds.layer3.${field}`)
            }
          />

          <SignificantCloudSection
            title="4th Layer"
            prefix="layer4"
            color="indigo"
            data={values.significantClouds.layer4}
            onSelectChange={handleSelectChange}
            renderError={(field) =>
              renderErrorMessage(`significantClouds.layer4.${field}`)
            }
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

export default SignificantCloudTab;
