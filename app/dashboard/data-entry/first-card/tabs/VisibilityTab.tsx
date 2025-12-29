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

// ✅ Code (0..80) -> Visibility (km)
// Note: 51..55 are "Not used"
const codeToKm = (code: number): number | null => {
  if (code === 0) return 0; // means "< 0.1 km" (we store 0 in DB)
  if (code >= 1 && code <= 50) return Number((code / 10).toFixed(1)); // 0.1 .. 5.0
  if (code >= 51 && code <= 55) return null; // not used
  if (code >= 56 && code <= 80) return code - 50; // 6 .. 30
  return null;
};

const VisibilityTab: React.FC<Props> = ({
  formik,
  handleNumericInput,
  getFieldError,
  prevTab,
  nextTab,
  cardClassName,
}) => {
  // ✅ Auto fill KM field (db save value) from code figure
  useEffect(() => {
    const raw = formik.values.horizontalVisibilityCode;
    if (raw === undefined || raw === null || raw === "") {
      formik.setFieldValue("horizontalVisibility", "");
      return;
    }

    const code = Number(raw);
    if (Number.isNaN(code)) {
      formik.setFieldValue("horizontalVisibility", "");
      return;
    }

    const km = codeToKm(code);

    if (km === null) {
      // invalid/not used -> keep km empty
      formik.setFieldValue("horizontalVisibility", "");
      return;
    }

    formik.setFieldValue("horizontalVisibility", km?.toString() || "");
  }, [formik.values.horizontalVisibilityCode]);

  return (
    <Card className={cn("overflow-hidden", cardClassName)}>
      <div className="p-4 bg-gradient-to-r from-orange-200 to-orange-300 text-orange-800">
        <h3 className="text-lg font-semibold flex items-center">
          <Eye className="mr-2" /> Visibility Measurements
        </h3>
      </div>

      <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
        {/* ✅ User inputs code figure */}
        <div className="space-y-2">
          <Label htmlFor="horizontalVisibilityCode">VV Code Figure (0 - 80)</Label>
          <Input
            id="horizontalVisibilityCode"
            name="horizontalVisibilityCode"
            value={formik.values.horizontalVisibilityCode || ""}
            onChange={handleNumericInput}
            onBlur={formik.handleBlur}
            className={cn(
              "border-slate-600 transition-all focus:border-orange-500 focus:ring-orange-500/30",
              {
                "border-red-500":
                  formik.touched.horizontalVisibilityCode &&
                  formik.errors.horizontalVisibilityCode,
              }
            )}
          />
          {(() => {
            const error = getFieldError("horizontalVisibilityCode");
            if (!error) return null;
            return (
              <div className="text-red-500 text-sm mt-1 flex items-start">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            );
          })()}
        </div>

        {/* ✅ Auto filled KM (saved in DB) */}
        <div className="space-y-2">
          <Label htmlFor="horizontalVisibility">Horizontal Visibility (km)</Label>
          <Input
            id="horizontalVisibility"
            name="horizontalVisibility"
            value={formik.values.horizontalVisibility ?? ""}
            disabled
            className="bg-slate-100 border-slate-600 font-semibold"
          />
          {/* Optional hint for code 0 */}
          {Number(formik.values.horizontalVisibilityCode) === 0 && (
            <p className="text-xs text-slate-500">Code 0 means "&lt; 0.1 km"</p>
          )}
          {/* Optional hint for not used */}
          {(() => {
            const code = Number(formik.values.horizontalVisibilityCode);
            if ([51, 52, 53, 54, 55].includes(code)) {
              return (
                <p className="text-xs text-red-500">
                  Code {code} is not used. Please use another code.
                </p>
              );
            }
            return null;
          })()}
        </div>
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

export default VisibilityTab;
