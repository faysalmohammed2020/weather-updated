// app/dashboard/data-entry/first-card/tabs/PressureTab.tsx

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronRight ,AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  formik: any;
  handleNumericInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getFieldError: (fieldName: string) => string | null;
  nextTab: () => void;
  cardClassName: string;
};

const PressureTab: React.FC<Props> = ({
  formik,
  handleNumericInput,
  handleChange,
  getFieldError,
  nextTab,
  cardClassName,
}) => {
  return (
    <Card className={cn("overflow-hidden", cardClassName)}>
      <div className="p-4 bg-rose-200 text-rose-800">
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart3 className="mr-2" /> Bar Pressure Measurements
        </h3>
      </div>
      <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="subIndicator">1st Card Indicator</Label>
          <Input
            id="subIndicator"
            name="subIndicator"
            value={formik.values.subIndicator || ""}
            onChange={handleChange}
            readOnly
            className="border-slate-600 bg-gray-100 cursor-not-allowed text-gray-700 transition-all focus:border-rose-400 focus:ring-rose-500/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="attachedThermometer">Attached Thermometer</Label>
          <Input
            id="alteredThermometer"
            name="alteredThermometer"
            value={formik.values.alteredThermometer || ""}
            onChange={handleChange}
            className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="barAsRead">Bar As Read(hPa)</Label>
          <Input
            id="barAsRead"
            name="barAsRead"
            value={formik.values.barAsRead || ""}
            onChange={handleNumericInput}
            className={cn(
              "border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30",
              {
                "border-red-500":
                  formik.touched.barAsRead && formik.errors.barAsRead,
              }
            )}
          />
          {(() => {
  const error = getFieldError("barAsRead");
  if (!error) return null;
  return (
    <div className="text-red-500 text-sm mt-1 flex items-start">
      <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
})()}
        </div>

        <div className="space-y-2">
          <Label htmlFor="correctedForIndex">
            Corrected for Index Temp-gravity(hPa)
          </Label>
          <Input
            id="correctedForIndex"
            name="correctedForIndex"
            value={formik.values.correctedForIndex || ""}
            onChange={handleChange}
            className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="heightDifference">
            Height Difference Correction(hPa)
          </Label>
          <Input
            id="heightDifference"
            name="heightDifference"
            value={formik.values.heightDifference || ""}
            onChange={handleChange}
            className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stationLevelPressure">
            Station Level Pressure (P.P.P.P.hpa)
          </Label>
          <Input
            id="stationLevelPressure"
            name="stationLevelPressure"
            value={formik.values.stationLevelPressure || ""}
            onChange={handleChange}
            className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="seaLevelReduction">
            Sea Level Reduction Constant
          </Label>
          <Input
            id="seaLevelReduction"
            name="seaLevelReduction"
            value={formik.values.seaLevelReduction || ""}
            onChange={handleChange}
            className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="correctedSeaLevelPressure">
            Sea-Level Pressure(PPPP)hpa
          </Label>
          <Input
            id="correctedSeaLevelPressure"
            name="correctedSeaLevelPressure"
            value={formik.values.correctedSeaLevelPressure || ""}
            onChange={handleChange}
            className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="afternoonReading">Altimeter setting(QNH)</Label>
          <Input
            id="afternoonReading"
            name="afternoonReading"
            value={formik.values.afternoonReading || ""}
            onChange={handleChange}
            className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="pressureChange24h">24-Hour Pressure Change</Label>
          <Input
            id="pressureChange24h"
            name="pressureChange24h"
            value={formik.values.pressureChange24h || ""}
            onChange={handleChange}
            className="border-slate-600 transition-all focus:border-rose-400 focus:ring-rose-500/30"
            readOnly
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          type="button"
          onClick={nextTab}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PressureTab;
