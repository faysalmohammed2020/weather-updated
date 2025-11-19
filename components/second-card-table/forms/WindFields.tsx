"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeatherFormValues } from "./WeatherForm";

const WindFields = () => {
  const { register } = useFormContext<WeatherFormValues>();

  return (
    <>
      <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Wind First Anemometer
        </Label>
        <Input
          {...register("windFirstAnemometer")}
          className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Wind Second Anemometer
        </Label>
        <Input
          {...register("windSecondAnemometer")}
          className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Wind Speed
        </Label>
        <Input
          {...register("windSpeed")}
          className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Wind Direction
        </Label>
        <Input
          {...register("windDirection")}
          className="w-full bg-white border-gray-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <div className="space-y-1 p-3 rounded-lg bg-gray-50 border border-white shadow-sm">
        <Label className="text-sm font-medium text-gray-700">
          Observer Initial (Readonly)
        </Label>
        <Input
          {...register("observerInitial")}
          readOnly
          className="w-full bg-gray-100 border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 cursor-not-allowed"
        />
      </div>
    </>
  );
};

export default WindFields;
