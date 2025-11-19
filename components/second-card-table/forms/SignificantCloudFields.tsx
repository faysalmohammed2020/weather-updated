"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeatherFormValues } from "./WeatherForm";

const SignificantCloudFields = () => {
  const { register } = useFormContext<WeatherFormValues>();

  return (
    <>
      {[1, 2, 3, 4].map((layer) => (
        <div
          key={`layer-${layer}`}
          className="space-y-1 p-3 rounded-lg bg-indigo-50 border border-white shadow-sm"
        >
          <Label className="text-sm font-medium text-gray-700">
            Layer {layer} Height
          </Label>
          <Input
            {...register(`layer${layer}Height` as keyof WeatherFormValues)}
            className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 mb-2"
          />
          <Label className="text-sm font-medium text-gray-700">
            Layer {layer} Form
          </Label>
          <Input
            {...register(`layer${layer}Form` as keyof WeatherFormValues)}
            className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 mb-2"
          />
          <Label className="text-sm font-medium text-gray-700">
            Layer {layer} Amount
          </Label>
          <Input
            {...register(`layer${layer}Amount` as keyof WeatherFormValues)}
            className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      ))}
    </>
  );
};

export default SignificantCloudFields;
