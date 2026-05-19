// components/SecondCard/SecondCardSummary.tsx

"use client";

import React, { memo, useMemo } from "react";
import {
  CloudIcon,
  CloudRainIcon,
  Wind,
  User,
  Sun,
  BarChart3,
  Loader2,
  ChevronLeft,
} from "lucide-react";

import SectionCard from "./shared/SectionCard";
import CloudLevelSection from "./shared/CloudLevelSection";
import SignificantCloudSection from "./shared/SignificantCloudSection";
import InputField from "./shared/InputField";
import SelectField from "./shared/SelectField";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SecondCardSummaryProps {
  formik: any;
  session: any;
  renderErrorMessage: (field: string) => React.ReactNode;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handlePrevious: () => void;
  handleReset: () => void;
  isSubmitting: boolean;
  selectedHour?: string;
}

const SecondCardSummary = memo(function SecondCardSummary({
  formik,
  session,
  renderErrorMessage,
  handleInputChange,
  handleSelectChange,
  handlePrevious,
  handleReset,
  isSubmitting,
  selectedHour,
}: SecondCardSummaryProps) {
  // Check if current hour is 00, 06, 12, or 18 UTC
  const isSixHourReport = useMemo(() => {
    if (!selectedHour) return false;
    const hour = Number.parseInt(selectedHour, 10);
    if (Number.isNaN(hour)) return false;
    return [0, 6, 12, 18].includes(hour);
  }, [selectedHour]);

  const isMidnightReport = useMemo(() => {
    if (!selectedHour) return false;
    const hour = Number.parseInt(selectedHour, 10);
    return !Number.isNaN(hour) && hour === 0;
  }, [selectedHour]);

  // Memoized Cloud Amount Options (shared with parent)
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
    <div className="space-y-6">
      {/* CLOUD SECTION */}
      <SectionCard
        title="Cloud Observation"
        icon={<CloudIcon className="h-5 w-5 text-blue-500" />}
        className="border-blue-200"
      >
        <div className="space-y-6">
          <CloudLevelSection
            title="Low Cloud"
            prefix="low-cloud"
            color="blue"
            data={formik.values.clouds.low}
            onChange={handleInputChange}
            onSelectChange={handleSelectChange}
            renderError={(field) => renderErrorMessage(`clouds.low.${field}`)}
          />
          <CloudLevelSection
            title="Medium Cloud"
            prefix="medium-cloud"
            color="purple"
            data={formik.values.clouds.medium}
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
            data={formik.values.clouds.high}
            onChange={handleInputChange}
            onSelectChange={handleSelectChange}
            renderError={(field) => renderErrorMessage(`clouds.high.${field}`)}
          />
        </div>
      </SectionCard>

      {/* TOTAL CLOUD */}
      <SectionCard
        title="Total Cloud Amount"
        icon={<Sun className="h-5 w-5 text-yellow-500" />}
        className="border-yellow-200"
      >
        <div className="grid gap-4 sm:gap-6">
          <SelectField
            id="summary-total-cloud-amount"
            name="total-cloud-amount"
            label="Total Cloud Amount (Octa)"
            accent="yellow"
            value={formik.values.totalCloud["total-cloud-amount"] || ""}
            onValueChange={(value) =>
              handleSelectChange("total-cloud-amount", value)
            }
            options={cloudAmountOptions.map((opt) => opt.value)}
            optionLabels={cloudAmountOptions.map((opt) => opt.label)}
            error={renderErrorMessage("totalCloud.total-cloud-amount")}
            required
          />
        </div>
      </SectionCard>

      {/* SIGNIFICANT CLOUD */}
      <SectionCard
        title="Significant Clouds"
        icon={<CloudIcon className="h-5 w-5 text-purple-500" />}
        className="border-purple-200"
      >
        <div className="space-y-6">
          <SignificantCloudSection
            title="1st Layer"
            prefix="layer1"
            color="purple"
            data={formik.values.significantClouds.layer1}
            onSelectChange={handleSelectChange}
            renderError={(field) =>
              renderErrorMessage(`significantClouds.layer1.${field}`)
            }
          />
          <SignificantCloudSection
            title="2nd Layer"
            prefix="layer2"
            color="fuchsia"
            data={formik.values.significantClouds.layer2}
            onSelectChange={handleSelectChange}
            renderError={(field) =>
              renderErrorMessage(`significantClouds.layer2.${field}`)
            }
          />
          <SignificantCloudSection
            title="3rd Layer"
            prefix="layer3"
            color="violet"
            data={formik.values.significantClouds.layer3}
            onSelectChange={handleSelectChange}
            renderError={(field) =>
              renderErrorMessage(`significantClouds.layer3.${field}`)
            }
          />
          <SignificantCloudSection
            title="4th Layer"
            prefix="layer4"
            color="indigo"
            data={formik.values.significantClouds.layer4}
            onSelectChange={handleSelectChange}
            renderError={(field) =>
              renderErrorMessage(`significantClouds.layer4.${field}`)
            }
          />
        </div>
      </SectionCard>

      {/* RAINFALL */}
      <SectionCard
        title="Rainfall"
        icon={<CloudRainIcon className="h-5 w-5 text-cyan-500" />}
        className="border-cyan-200"
      >
        {/* Rainfall Type Badge */}
        {formik.values.rainfall.rainfallType && (
          <div className="mb-3">
            <span
              className={cn(
                "inline-flex items-center px-2 py-1 rounded text-white text-xs",
                formik.values.rainfall.rainfallType === "continuous"
                  ? "bg-green-600"
                  : "bg-orange-600"
              )}
            >
              {formik.values.rainfall.rainfallType === "continuous"
                ? "Continuous Rain"
                : "Intermittent Rain"}
            </span>
          </div>
        )}

        {/* Time Slots */}
        <div className="space-y-2 mb-4">
          {(formik.values.rainfall.timeSlots || []).map(
            (
              slot: { id: string; timeStart: string; timeEnd: string },
              i: number
            ) => (
              <div key={slot.id || i} className="text-sm">
                Slot {i + 1}: {slot.timeStart || "--:--"} –{" "}
                {slot.timeEnd || "--:--"} (UTC)
              </div>
            )
          )}
          {(!formik.values.rainfall.timeSlots ||
            formik.values.rainfall.timeSlots.length === 0) && (
            <div className="text-sm text-slate-500">No time slots added</div>
          )}
        </div>

        {/* Numeric Fields */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <InputField
            id="summary-since-previous"
            name="since-previous"
            label="Since Previous Observation"
            accent="cyan"
            value={formik.values.rainfall["since-previous"] || ""}
            onChange={handleInputChange}
            error={renderErrorMessage("rainfall.since-previous")}
            required
            numeric
          />

          {/* During Previous 6 Hours - Only visible at 00, 06, 12, 18 UTC */}
          {isSixHourReport && (
            <InputField
              id="summary-during-previous"
              name="during-previous"
              label="During Previous 6 Hours Rainfall (At 00, 06, 12, 18 UTC)"
              accent="cyan"
              value={formik.values.rainfall["during-previous"] || ""}
              onChange={handleInputChange}
              error={renderErrorMessage("rainfall.during-previous")}
              required
            />
          )}
          <div>
            <InputField
              id="summary-last-24-hours"
              name="last-24-hours"
              label={`Last 24 Hours Precipitation${
                isMidnightReport ? " (Auto-calculated at 00 UTC)" : ""
              }`}
              accent="cyan"
              value={formik.values.rainfall["last-24-hours"] || ""}
              onChange={handleInputChange}
              error={renderErrorMessage("rainfall.last-24-hours")}
              required
              numeric
            />
          </div>
        </div>
      </SectionCard>

      {/* WIND */}
      <SectionCard
        title="Wind"
        icon={<Wind className="h-5 w-5 text-green-500" />}
        className="border-green-200"
      >
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <InputField
            id="summary-first-anemometer"
            name="first-anemometer"
            label="First Anemometer"
            accent="green"
            value={formik.values.wind["first-anemometer"] || ""}
            onChange={handleInputChange}
            error={renderErrorMessage("wind.first-anemometer")}
            required
          />
          <InputField
            id="summary-second-anemometer"
            name="second-anemometer"
            label="Second Anemometer"
            accent="green"
            value={formik.values.wind["second-anemometer"] || ""}
            onChange={handleInputChange}
            error={renderErrorMessage("wind.second-anemometer")}
            required
          />
          <InputField
            id="summary-speed"
            name="speed"
            label="Speed (KTS)"
            accent="green"
            value={formik.values.wind["speed"] || ""}
            onChange={handleInputChange}
            error={renderErrorMessage("wind.speed")}
            required
            numeric
          />
          <InputField
            id="summary-wind-direction"
            name="wind-direction"
            label="Direction (Degrees)"
            accent="green"
            value={formik.values.wind["wind-direction"] || ""}
            onChange={handleInputChange}
            error={renderErrorMessage("wind.wind-direction")}
            required
            numeric
          />
        </div>
      </SectionCard>

      {/* OBSERVER */}
      <SectionCard
        title="Observer"
        icon={<User className="h-5 w-5 text-orange-500" />}
        className="border-orange-200"
      >
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <InputField
            id="summary-observer-initial"
            name="observer-initial"
            label="Observer Initials"
            accent="orange"
            value={formik.values.observer["observer-initial"] || ""}
            onChange={handleInputChange}
            error={renderErrorMessage("observer.observer-initial")}
            required
          />
          <InputField
            id="summary-station-id"
            name="station-id"
            label="Station ID"
            accent="orange"
            value={session?.user?.station?.stationId || ""}
            onChange={handleInputChange}
            disabled
          />
        </div>
      </SectionCard>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between p-4 sm:p-6 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          className="text-xs sm:text-sm w-full sm:w-auto flex justify-center items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="border-slate-600 hover:bg-slate-100 text-xs sm:text-sm w-full sm:w-auto"
          >
            Reset
          </Button>

          <Button
            type="submit"
            className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-sm text-xs sm:text-sm w-full sm:w-auto flex justify-center items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CloudIcon className="h-5 w-5 mr-2" />
                Submit Observation
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default SecondCardSummary;
