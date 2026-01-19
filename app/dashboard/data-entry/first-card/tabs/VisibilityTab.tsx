// app/dashboard/data-entry/first-card/tabs/VisibilityTab.tsx

import React, { useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  formik: any;
  handleNumericInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getFieldError: (fieldName: string) => string | null;
  prevTab: () => void;
  nextTab: () => void;
  cardClassName: string;
};


const VisibilityTab: React.FC<Props> = ({
  formik,
  handleNumericInput,
  getFieldError,
  prevTab,
  nextTab,
  cardClassName,
}) => {

  return (
    <Card className={cn("overflow-hidden", cardClassName)}>
      <div className="p-4 bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800">
        <h3 className="text-lg font-semibold flex items-center">
          <Eye className="mr-2" /> Visibility Measurements
        </h3>
      </div>

      <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
        {/* ✅ User inputs horizontal visibility directly in km */}
        <div className="space-y-2">
          <Label htmlFor="horizontalVisibility">Horizontal Visibility (km)</Label>
          <Input
            id="horizontalVisibility"
            name="horizontalVisibility"
            value={formik.values.horizontalVisibility || ""}
            onChange={(e) => {
              const value = e.target.value;
              // Only allow numbers and limit to 3 digits
              if (value === '' || (value.length <= 3 && /^\d+$/.test(value))) {
                handleNumericInput(e);
              }
            }}
            onBlur={formik.handleBlur}
            maxLength={3}
            placeholder="000"
            className={cn(
              "border-slate-600 transition-all focus:border-orange-500 focus:ring-orange-500/30",
              {
                "border-red-500":
                  formik.touched.horizontalVisibility &&
                  formik.errors.horizontalVisibility,
              }
            )}
          />
          {(() => {
            const error = getFieldError("horizontalVisibility");
            if (!error && (!formik.values.horizontalVisibility || formik.values.horizontalVisibility.length !== 3)) {
              return (
                <div className="text-orange-500 text-sm mt-1 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                  <span>Must be exactly 3 digits</span>
                </div>
              );
            }
            if (!error) return null;
            return (
              <div className="text-red-500 text-sm mt-1 flex items-start">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            );
          })()}
        </div>

      </CardContent>

      <CardFooter className="flex justify-between p-6">
        <Button type="button" variant="outline" onClick={prevTab}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button
          type="button"
          onClick={() => {
            // Validate horizontal visibility before proceeding
            if (!formik.values.horizontalVisibility || formik.values.horizontalVisibility.length !== 3) {
              // Mark the field as touched to show validation error
              formik.setFieldTouched('horizontalVisibility', true);
              // Optionally show a toast or alert
              return;
            }
            nextTab();
          }}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!formik.values.horizontalVisibility || formik.values.horizontalVisibility.length !== 3}
        >
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VisibilityTab;
