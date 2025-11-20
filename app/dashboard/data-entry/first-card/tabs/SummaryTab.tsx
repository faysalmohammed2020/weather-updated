// app/dashboard/data-entry/first-card/tabs/SummaryTab.tsx

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarChart3, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkMinMax } from "../validation";

type Props = {
  formik: any;
  selectedHour: string;
  handleNumericInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
  prevTab: () => void;
  isSubmitting: boolean;
  cardClassName: string;
};

const SummaryTab: React.FC<Props> = ({
  formik,
  selectedHour,
  handleNumericInput,
  handleChange,
  handleReset,
  prevTab,
  isSubmitting,
  cardClassName,
}) => {
  return (
    <Card className={cn("overflow-hidden", cardClassName)}>
      <div className="p-4 bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800">
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart3 className="mr-2" /> Review & Submit
        </h3>
      </div>
      <CardContent className="pt-6 space-y-8">
        {/* Pressure Section */}
        <div>
          <h4 className="font-semibold mb-3">Pressure</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="barAsRead">Bar As Read(hPa)</Label>
              <Input
                id="barAsRead"
                name="barAsRead"
                value={formik.values.barAsRead || ""}
                onChange={handleNumericInput}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correctedForIndex">Corrected for Index</Label>
              <Input
                id="correctedForIndex"
                name="correctedForIndex"
                value={formik.values.correctedForIndex || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightDifference">Height Difference</Label>
              <Input
                id="heightDifference"
                name="heightDifference"
                value={formik.values.heightDifference || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stationLevelPressure">
                Station Level Pressure
              </Label>
              <Input
                id="stationLevelPressure"
                name="stationLevelPressure"
                value={formik.values.stationLevelPressure || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seaLevelReduction">Sea Level Reduction</Label>
              <Input
                id="seaLevelReduction"
                name="seaLevelReduction"
                value={formik.values.seaLevelReduction || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correctedSeaLevelPressure">
                Sea-Level Pressure
              </Label>
              <Input
                id="correctedSeaLevelPressure"
                name="correctedSeaLevelPressure"
                value={formik.values.correctedSeaLevelPressure || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="afternoonReading">
                Altimeter setting (QNH)
              </Label>
              <Input
                id="afternoonReading"
                name="afternoonReading"
                value={formik.values.afternoonReading || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pressureChange24h">
                24-Hour Pressure Change
              </Label>
              <Input
                id="pressureChange24h"
                name="pressureChange24h"
                value={formik.values.pressureChange24h || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Temperature Section */}
        <div>
          <h4 className="font-semibold mb-3">Temperature</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dryBulbAsRead">Dry-bulb (°C)</Label>
              <Input
                id="dryBulbAsRead"
                name="dryBulbAsRead"
                value={formik.values.dryBulbAsRead || ""}
                onChange={handleNumericInput}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wetBulbAsRead">Wet-bulb (°C)</Label>
              <Input
                id="wetBulbAsRead"
                name="wetBulbAsRead"
                value={formik.values.wetBulbAsRead || ""}
                onChange={handleNumericInput}
              />
            </div>
            {checkMinMax(selectedHour) && (
              <div className="space-y-2">
                <Label htmlFor="maxMinTempAsRead">
                  {checkMinMax(selectedHour)} Temperature (°C)
                </Label>
                <Input
                  id="maxMinTempAsRead"
                  name="maxMinTempAsRead"
                  value={formik.values.maxMinTempAsRead || ""}
                  onChange={handleNumericInput}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="dryBulbCorrected">Dry-bulb Corrected (°C)</Label>
              <Input
                id="dryBulbCorrected"
                name="dryBulbCorrected"
                value={formik.values.dryBulbCorrected || ""}
                onChange={handleNumericInput}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wetBulbCorrected">Wet-bulb Corrected (°C)</Label>
              <Input
                id="wetBulbCorrected"
                name="wetBulbCorrected"
                value={formik.values.wetBulbCorrected || ""}
                onChange={handleNumericInput}
              />
            </div>
            {checkMinMax(selectedHour) && (
              <div className="space-y-2">
                <Label htmlFor="maxMinTempCorrected">
                  {checkMinMax(selectedHour)} Corrected (°C)
                </Label>
                <Input
                  id="maxMinTempCorrected"
                  name="maxMinTempCorrected"
                  value={formik.values.maxMinTempCorrected || ""}
                  onChange={handleNumericInput}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="Td">Dew-Point (&deg;C)</Label>
              <Input
                id="Td"
                name="Td"
                value={formik.values.Td || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relativeHumidity">
                Relative Humidity (%)
              </Label>
              <Input
                id="relativeHumidity"
                name="relativeHumidity"
                value={formik.values.relativeHumidity || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Squall Section */}
        <div>
          <h4 className="font-semibold mb-3">Squall</h4>
          {formik.values.squallConfirmed ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="squallForce">Force (KTS)</Label>
                <Input
                  id="squallForce"
                  name="squallForce"
                  value={formik.values.squallForce || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="squallDirection">Direction (°d)</Label>
                <Input
                  id="squallDirection"
                  name="squallDirection"
                  value={formik.values.squallDirection || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="squallTime">Time (qt)</Label>
                <Input
                  id="squallTime"
                  name="squallTime"
                  value={formik.values.squallTime || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          ) : (
            <div className="p-3 text-slate-600 bg-slate-50 border border-slate-200 rounded-md">
              Squall measurements skipped
            </div>
          )}
        </div>

        {/* Visibility Section */}
        <div>
          <h4 className="font-semibold mb-3">Visibility</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="horizontalVisibility">
                Horizontal Visibility
              </Label>
              <Input
                id="horizontalVisibility"
                name="horizontalVisibility"
                value={formik.values.horizontalVisibility || ""}
                onChange={handleNumericInput}
              />
            </div>
          </div>
        </div>

        {/* Meteors Section */}
        <div>
          <h4 className="font-semibold mb-3">Mise Meteors (Code)</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="miscMeteors">Misc Meteors</Label>
              <Input
                id="miscMeteors"
                name="miscMeteors"
                value={formik.values.miscMeteors || ""}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Weather Section */}
        <div>
          <h4 className="font-semibold mb-3">Weather</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pastWeatherW1">Past Weather (W1)</Label>
              <Input
                id="pastWeatherW1"
                name="pastWeatherW1"
                value={formik.values.pastWeatherW1 || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pastWeatherW2">Past Weather (W2)</Label>
              <Input
                id="pastWeatherW2"
                name="pastWeatherW2"
                value={formik.values.pastWeatherW2 || ""}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="presentWeatherWW">Present Weather (WW)</Label>
              <Input
                id="presentWeatherWW"
                name="presentWeatherWW"
                value={formik.values.presentWeatherWW || ""}
                onChange={handleNumericInput}
              />
            </div>
          </div>
        </div>

        {/* Meta Section */}
        <div>
          <h4 className="font-semibold mb-3">Meta</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="subIndicator">1st Card Indicator</Label>
              <Input
                id="subIndicator"
                name="subIndicator"
                value={formik.values.subIndicator || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stationNo">Station No</Label>
              <Input
                id="stationNo"
                name="stationNo"
                value={formik.values.stationNo || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                name="year"
                value={formik.values.year || ""}
                onChange={handleChange}
                readOnly
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-4 p-6">
        <Button
          type="button"
          variant="outline"
          onClick={prevTab}
          className="w-full sm:w-auto"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto border-slate-600 hover:bg-slate-100 transition-all duration-300"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Submit Data"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SummaryTab;
