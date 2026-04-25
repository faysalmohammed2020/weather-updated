// app/dashboard/data-entry/first-card/tabs/SquallTab.tsx

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Wind, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  formik: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   getFieldError: (fieldName: string) => string | null;
  prevTab: () => void;
  nextTab: () => void;
  cardClassName: string;
};

const SquallTab: React.FC<Props> = ({
  formik,
  handleChange,
  getFieldError,
  prevTab,
  nextTab,
  cardClassName,
}) => {
  return (
    <Card className={cn("overflow-hidden", cardClassName)}>
      <div className="p-4 bg-linear-to-r from-amber-200 to-amber-300 text-amber-800">
        <h3 className="text-lg font-semibold flex items-center">
          <Wind className="mr-2" /> Squall Measurements
        </h3>
      </div>
      <CardContent className="pt-6 space-y-4">
        {formik.values.squallConfirmed === undefined ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800 font-medium mb-3">
              Are you sure you want to fill up squall measurements?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="border-amber-500 text-amber-700 hover:bg-amber-50"
                onClick={() => {
                  formik.setFieldValue("squallConfirmed", false);
                  formik.setFieldValue("squallForce", "");
                  formik.setFieldValue("squallDirection", "");
                  formik.setFieldValue("squallTime", "");
                  nextTab();
                }}
              >
                No, Skip
              </Button>
              <Button
                type="button"
                className="bg-amber-500 hover:bg-amber-600"
                onClick={() => {
                  formik.setFieldValue("squallConfirmed", true);
                }}
              >
                Yes, Continue
              </Button>
            </div>
          </div>
        ) : formik.values.squallConfirmed ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="squallForce">Force (KTS)</Label>
              <Input
                id="squallForce"
                name="squallForce"
                value={formik.values.squallForce || ""}
                onChange={handleChange}
                onBlur={formik.handleBlur}
                className={cn(
                  "border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30",
                  {
                    "border-red-500":
                      formik.touched.squallForce && formik.errors.squallForce,
                  }
                )}
              />
              {(() => {
  const error = getFieldError("squallForce");
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
              <Label htmlFor="squallDirection">Direction (°d)</Label>
              <Input
                id="squallDirection"
                name="squallDirection"
                type="number"
                min="0"
                max="360"
                value={formik.values.squallDirection || ""}
                onChange={handleChange}
                onBlur={formik.handleBlur}
                className={cn(
                  "border-slate-600 transition-all focus:border-amber-500 focus:ring-amber-500/30",
                  {
                    "border-red-500":
                      formik.touched.squallDirection &&
                      formik.errors.squallDirection,
                  }
                )}
              />
              {(() => {
  const error = getFieldError("squallDirection");
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
              <Label htmlFor="squallTime">Time(qt)</Label>
              <select
                id="squallTime"
                name="squallTime"
                value={formik.values.squallTime || ""}
                onChange={(e) =>
                  formik.setFieldValue("squallTime", e.target.value)
                }
                onBlur={formik.handleBlur}
                className={cn(
                  "w-full border border-slate-600 rounded-md px-3 py-2 focus:outline-none focus:border-fuchsia-500 focus:ring-fuchsia-500/30",
                  {
                    "border-red-500":
                      formik.touched.squallTime && formik.errors.squallTime,
                  }
                )}
              >
                <option value="">-- Select Time (qt) --</option>
                <option value="0">
                  0 → 0 to ½ hour before observation
                </option>
                <option value="1">
                  1 → ½ to 1 hour before observation
                </option>
                <option value="2">
                  2 → 1 to 1¼ hour before observation
                </option>
                <option value="3">
                  3 → 1¼ to 2 hour before observation
                </option>
                <option value="4">
                  4 → 2 to 2½ hour before observation
                </option>
                <option value="5">
                  5 → 2½ to 3 hour before observation
                </option>
                <option value="6">
                  6 → 3 to 4 hour before observation
                </option>
                <option value="7">
                  7 → 4 to 5 hour before observation
                </option>
                <option value="8">
                  8 → 5 to 6 hour before observation
                </option>
                <option value="9">
                  9 → More than 6 hour before observation
                </option>
              </select>
              {(() => {
  const error = getFieldError("squallTime");
  if (!error) return null;
  return (
    <div className="text-red-500 text-sm mt-1 flex items-start">
      <AlertCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
})()}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md flex justify-between items-center">
            <p className="text-slate-600">Squall measurements skipped</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                formik.setFieldValue("squallConfirmed", true);
              }}
            >
              Fill Measurements
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-6">
        <Button type="button" variant="outline" onClick={prevTab}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
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

export default SquallTab;
