"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WeatherFormValues } from "./WeatherForm";

const FieldWrapper = ({
  label,
  name,
  bgClass,
}: {
  label: string;
  name: keyof WeatherFormValues;
  bgClass: string;
}) => {
  const { register } = useFormContext<WeatherFormValues>();
  return (
    <div className={`space-y-1 p-3 rounded-lg border border-white shadow-sm ${bgClass}`}>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input
        {...register(name)}
        className="w-full bg-white border-gray-300 focus:ring-2"
      />
    </div>
  );
};

const CloudFields = () => (
  <>
    <FieldWrapper
      label="Total Cloud Amount"
      name="totalCloudAmount"
      bgClass="bg-sky-50"
    />
    {[
      ["Low Cloud Direction", "lowCloudDirection"],
      ["Low Cloud Height", "lowCloudHeight"],
      ["Low Cloud Form", "lowCloudForm"],
      ["Low Cloud Amount", "lowCloudAmount"],
      ["Medium Cloud Direction", "mediumCloudDirection"],
      ["Medium Cloud Height", "mediumCloudHeight"],
      ["Medium Cloud Form", "mediumCloudForm"],
      ["Medium Cloud Amount", "mediumCloudAmount"],
      ["High Cloud Direction", "highCloudDirection"],
      ["High Cloud Height", "highCloudHeight"],
      ["High Cloud Form", "highCloudForm"],
      ["High Cloud Amount", "highCloudAmount"],
    ].map(([label, name]) => (
      <FieldWrapper
        key={name}
        label={label}
        name={name as keyof WeatherFormValues}
        bgClass="bg-blue-50"
      />
    ))}
  </>
);

export default CloudFields;
