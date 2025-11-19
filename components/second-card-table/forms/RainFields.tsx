"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeatherFormValues } from "./WeatherForm";

const RainFields = () => {
  const { register } = useFormContext<WeatherFormValues>();

  return (
    <>
      <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Rainfall Start Time
        </Label>
        <Input
          {...register("rainfallTimeStart")}
          className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Rainfall End Time
        </Label>
        <Input
          {...register("rainfallTimeEnd")}
          className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Rainfall Since Previous
        </Label>
        <Input
          {...register("rainfallSincePrevious")}
          className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Rainfall During Previous
        </Label>
        <Input
          {...register("rainfallDuringPrevious")}
          className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        />
      </div>
      <div className="space-y-1 p-3 rounded-lg bg-emerald-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Rainfall Last 24 Hours
        </Label>
        <Input
          {...register("rainfallLast24Hours")}
          className="w-full bg-white border-gray-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200"
        />
      </div>
    </>
  );
};

export default RainFields;
