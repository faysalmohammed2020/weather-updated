// components/SecondCard/TotalCloud.tsx
//Estiak

"use client";

import React, { memo, useMemo } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SelectField from "./shared/SelectField";
import { cn } from "@/lib/utils";

interface TotalCloudProps {
  tabStyle: string;
  values: any;
  renderErrorMessage: (path: string) => React.ReactNode;
  handleSelectChange: (name: string, value: string) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  isFirstTab: boolean;
}

const TotalCloudTab = memo(function TotalCloudTab({
  tabStyle,
  values,
  renderErrorMessage,
  handleSelectChange,
  handleNext,
  handlePrevious,
  isFirstTab,
}: TotalCloudProps) {
  // Cloud amount dropdown options
  const cloudAmountOptions = useMemo(
    () => [
      { value: "0", label: "0 - No cloud" },
      { value: "1", label: "1 - 1 octa or less (1/10 or less but not zero)" },
      { value: "2", label: "2 - 2 octas (2/10 to 3/10)" },
      { value: "3", label: "3 - 3 octas (4/10)" },
      { value: "4", label: "4 - 4 octas (5/10)" },
      { value: "5", label: "5 - 5 octas (6/10)" },
      { value: "6", label: "6 - 6 octas (7/10 to 8/10)" },
      { value: "7", label: "7 - 7 octas (9/10 or more but not 10/10)" },
      { value: "8", label: "8 - 8 octas (10/10)" },
      {
        value: "9",
        label: "9 - Sky obscured or cloud amount cannot be estimated.",
      },
      {
        value: "/",
        label: "/ - Key obscured or cloud amount cannot be estimated",
      },
    ],
    []
  );

  return (
    <Card className={cn("overflow-hidden", tabStyle)}>
      {/* Header */}
      <div className="p-4 bg-linear-to-r from-yellow-200 to-yellow-300 text-yellow-800">
        <h3 className="text-lg font-semibold flex items-center">
          <Sun className="mr-2 h-5 w-5" /> Total Cloud Amount
        </h3>
      </div>

      {/* Content */}
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <SelectField
            id="total-cloud-amount"
            name="total-cloud-amount"
            label="Total Cloud Amount (Octa)"
            accent="yellow"
            value={values.totalCloud["total-cloud-amount"] || ""}
            onValueChange={(value) =>
              handleSelectChange("total-cloud-amount", value)
            }
            options={cloudAmountOptions.map((opt) => opt.value)}
            optionLabels={cloudAmountOptions.map((opt) => opt.label)}
            error={renderErrorMessage("totalCloud.total-cloud-amount")}
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

export default TotalCloudTab;
