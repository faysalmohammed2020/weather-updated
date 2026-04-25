// app/dashboard/data-entry/first-card/tabs/WeatherTab.tsx

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Cloud, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  formik: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNumericInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getFieldError: (fieldName: string) => string | null;
  prevTab: () => void;
  nextTab: () => void;
  handleTabChange: (tabName: string) => void;
  cardClassName: string;
};

const WeatherTab: React.FC<Props> = ({
  formik,
  handleChange,
  handleNumericInput,
  getFieldError,
  prevTab,
  nextTab,
  handleTabChange,
  cardClassName,
}) => {
  return (
    <Card className={cn("overflow-hidden", cardClassName)}>
      <div className="p-4 bg-linear-to-r from-cyan-200 to-cyan-300 text-cyan-800">
        <h3 className="text-lg font-semibold flex items-center">
          <Cloud className="mr-2" /> Weather Conditions
        </h3>
      </div>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        <div className="space-y-2">
          <Label htmlFor="pastWeatherW1">Past Weather (W1)</Label>
          <Input
            id="pastWeatherW1"
            name="pastWeatherW1"
            placeholder="Enter past weather code (0-9)"
            value={formik.values.pastWeatherW1 || ""}
            onChange={handleChange}
            onBlur={formik.handleBlur}
            className={cn(
              "border-slate-600 transition-all focus:border-cyan-500 focus:ring-cyan-500/30",
              {
                "border-red-500":
                  formik.touched.pastWeatherW1 && formik.errors.pastWeatherW1,
              },
            )}
          />
          {(() => {
            const error = getFieldError("pastWeatherW1");
            if (!error) return null;
            return (
              <div className="text-red-500 text-sm mt-1 flex items-start">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            );
          })()}
          <p className="text-xs text-muted-foreground mt-1">
            Weather code for the first part of the observation period
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pastWeatherW2">Past Weather (W2)</Label>
          <Input
            id="pastWeatherW2"
            name="pastWeatherW2"
            placeholder="Enter past weather code (0-9)"
            value={formik.values.pastWeatherW2 || ""}
            onChange={handleChange}
            onBlur={formik.handleBlur}
            className={cn(
              "border-slate-600 transition-all focus:border-cyan-500 focus:ring-cyan-500/30",
              {
                "border-red-500":
                  formik.touched.pastWeatherW2 && formik.errors.pastWeatherW2,
              },
            )}
          />
          {(() => {
            const error = getFieldError("pastWeatherW2");
            if (!error) return null;
            return (
              <div className="text-red-500 text-sm mt-1 flex items-start">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            );
          })()}
          <p className="text-xs text-muted-foreground mt-1">
            Weather code for the second part of the observation period
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="presentWeatherWW">Present Weather (WW)</Label>
          <Input
            id="presentWeatherWW"
            name="presentWeatherWW"
            placeholder="Enter present weather"
            value={formik.values.presentWeatherWW || ""}
            onChange={handleNumericInput}
            onBlur={formik.handleBlur}
            className={cn("border-slate-600 text-gray-700", {
              "border-red-500":
                formik.touched.presentWeatherWW &&
                formik.errors.presentWeatherWW,
            })}
          />
          {(() => {
            const error = getFieldError("presentWeatherWW");
            if (!error) return null;
            return (
              <div className="text-red-500 text-sm mt-1 flex items-start">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            );
          })()}
          <p className="text-xs text-muted-foreground mt-1">
            Current weather conditions at time of observation
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between items-center gap-4 p-6">
        <Button type="button" variant="outline" onClick={prevTab}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          type="button"
          onClick={() => handleTabChange("summary")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WeatherTab;
