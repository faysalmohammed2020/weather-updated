// app/dashboard/data-entry/first-card/tabs/TemperatureTab.tsx

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Thermometer, ChevronLeft, ChevronRight ,AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkMinMax } from "../validation";

type Props = {
  formik: any;
  selectedHour: string;
  hygrometricData: {
    dryBulb: string;
    wetBulb: string;
    difference: string;
    dewPoint: string;
    relativeHumidity: string;
  };
  handleNumericInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   getFieldError: (fieldName: string) => string | null;
  prevTab: () => void;
  nextTab: () => void;
  isFirstTab: boolean;
  cardClassName: string;
};

const TemperatureTab: React.FC<Props> = ({
  formik,
  selectedHour,
  hygrometricData,
  handleNumericInput,
  handleChange,
  getFieldError,
  prevTab,
  nextTab,
  isFirstTab,
  cardClassName,
}) => {
  return (
    <Card className={cn("overflow-hidden", cardClassName)}>
      <div className="p-4 bg-linear-to-r from-blue-200 to-blue-300 text-blue-800">
        <h3 className="text-lg font-semibold flex items-center">
          <Thermometer className="mr-2" /> Temperature
        </h3>
      </div>
      <CardContent className="pt-6">
        <Tabs defaultValue="temperature" className="w-full">
          <TabsContent value="temperature" className="mt-4">
            <Tabs defaultValue="as-read" className="w-full">
              <TabsList className="grid w-full grid-cols-2 gap-5 bg-blue-50/50 rounded-lg">
                <TabsTrigger
                  value="as-read"
                  className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800 border border-blue-300"
                >
                  As Read
                </TabsTrigger>
                <TabsTrigger
                  value="corrected"
                  className="data-[state=active]:bg-blue-200 data-[state=active]:text-blue-800 border border-blue-300"
                >
                  Corrected
                </TabsTrigger>
              </TabsList>

              {/* As Read */}
              <TabsContent value="as-read" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dryBulbAsRead">Dry-bulb (°C)</Label>
                    <Input
                      id="dryBulbAsRead"
                      name="dryBulbAsRead"
                      value={formik.values.dryBulbAsRead || ""}
                      onChange={handleNumericInput}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                        {
                          "border-red-500":
                            formik.touched.dryBulbAsRead &&
                            formik.errors.dryBulbAsRead,
                        }
                      )}
                    />
                    {(() => {
  const error = getFieldError("dryBulbAsRead");
  if (!error) return null;
  return (
    <div className="text-red-500 text-sm mt-1 flex items-start">
      <AlertCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
})()}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wetBulbAsRead">Wet-bulb (°C)</Label>
                    <Input
                      id="wetBulbAsRead"
                      name="wetBulbAsRead"
                      value={formik.values.wetBulbAsRead || ""}
                      onChange={handleNumericInput}
                      onBlur={formik.handleBlur}
                      className={cn(
                        "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                        {
                          "border-red-500":
                            formik.touched.wetBulbAsRead &&
                            formik.errors.wetBulbAsRead,
                        }
                      )}
                    />
                    {(() => {
  const error = getFieldError("wetBulbAsRead");
  if (!error) return null;
  return (
    <div className="text-red-500 text-sm mt-1 flex items-start">
      <AlertCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
})()}
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
                        onBlur={formik.handleBlur}
                        className={cn(
                          "border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30",
                          {
                            "border-red-500":
                              formik.touched.maxMinTempAsRead &&
                              formik.errors.maxMinTempAsRead,
                          }
                        )}
                      />
                      {(() => {
  const error = getFieldError("maxMinTempAsRead");
  if (!error) return null;
  return (
    <div className="text-red-500 text-sm mt-1 flex items-start">
      <AlertCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
})()}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Corrected */}
              <TabsContent value="corrected" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dryBulbCorrected">Dry-bulb (°C)</Label>
                    <Input
                      id="dryBulbCorrected"
                      name="dryBulbCorrected"
                      value={formik.values.dryBulbCorrected || ""}
                      onChange={handleNumericInput}
                      className="transition-all focus:border-blue-400 focus:ring-blue-500/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wetBulbCorrected">Wet-bulb (°C)</Label>
                    <Input
                      id="wetBulbCorrected"
                      name="wetBulbCorrected"
                      value={formik.values.wetBulbCorrected || ""}
                      onChange={handleNumericInput}
                      className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                    />
                  </div>

                  {checkMinMax(selectedHour) && (
                    <div className="space-y-2">
                      <Label htmlFor="maxMinTempCorrected">
                        {checkMinMax(selectedHour)} Temperature (°C)
                      </Label>
                      <Input
                        id="maxMinTempCorrected"
                        name="maxMinTempCorrected"
                        value={formik.values.maxMinTempCorrected || ""}
                        onChange={handleNumericInput}
                        className="border-slate-600 transition-all focus:border-blue-400 focus:ring-blue-500/30"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-linear-to-r from-blue-200 to-blue-300 text-blue-800">
                <h3 className="text-lg font-semibold flex items-center">
                  <Thermometer className="mr-2" /> Dew-Point & Humidity
                </h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="Td">Dew-Point Temperature (&deg;C)</Label>
                  <Input
                    id="Td"
                    name="Td"
                    value={formik.values.Td || ""}
                    onChange={handleChange}
                    className="border-slate-600 transition-all focus:border-emerald-500 focus:ring-emerald-500/30"
                    readOnly
                  />
                  {hygrometricData.difference && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculated from Dry-bulb: {hygrometricData.dryBulb}°C,
                      Wet-bulb: {hygrometricData.wetBulb}°C, Difference:{" "}
                      {hygrometricData.difference}°C
                    </p>
                  )}
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
                    className="border-slate-600 transition-all focus:border-violet-500 focus:ring-violet-500/30"
                    readOnly
                  />
                  {hygrometricData.difference && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculated from Dry-bulb: {hygrometricData.dryBulb}°C,
                      Wet-bulb: {hygrometricData.wetBulb}°C, Difference:{" "}
                      {hygrometricData.difference}°C
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end p-6">
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

export default TemperatureTab;
