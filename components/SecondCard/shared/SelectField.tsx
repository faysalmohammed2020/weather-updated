// components/SecondCard/shared/SelectField.tsx
//Estiak

"use client";

import React, { memo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  id: string;
  name: string;
  label: string;
  accent?: string;
  value: string;
  required?: boolean;
  error?: React.ReactNode;
  options: string[];
  optionLabels?: string[];
  onValueChange: (value: string) => void;
}

const accentColors: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50/50 focus-within:ring-blue-500 focus-within:border-blue-500",
  yellow:
    "border-yellow-200 bg-yellow-50/50 focus-within:ring-yellow-500 focus-within:border-yellow-500",
  purple:
    "border-purple-200 bg-purple-50/50 focus-within:ring-purple-500 focus-within:border-purple-500",
  cyan: "border-cyan-200 bg-cyan-50/50 focus-within:ring-cyan-500 focus-within:border-cyan-500",
  green:
    "border-green-200 bg-green-50/50 focus-within:ring-green-500 focus-within:border-green-500",
  orange:
    "border-orange-200 bg-orange-50/50 focus-within:ring-orange-500 focus-within:border-orange-500",
  fuchsia:
    "border-fuchsia-200 bg-fuchsia-50/50 focus-within:ring-fuchsia-500 focus-within:border-fuchsia-500",
  violet:
    "border-violet-200 bg-violet-50/50 focus-within:ring-violet-500 focus-within:border-violet-500",
  indigo:
    "border-indigo-200 bg-indigo-50/50 focus-within:ring-indigo-500 focus-within:border-indigo-500",
};

const SelectField = memo(function SelectField({
  id,
  name,
  label,
  accent = "blue",
  value,
  required = false,
  error,
  options,
  optionLabels,
  onValueChange,
}: SelectFieldProps) {
  return (
    <div className="grid gap-2 w-full">
      {/* Label */}
      <Label htmlFor={id} className="font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {/* Select Control */}
      <Select name={name} value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={cn(
            `w-full border-2 ${accentColors[accent]} rounded-lg py-2.5 px-4 transition-all duration-200 shadow-sm hover:bg-white focus:shadow-md`,
            {
              "border-red-500": error,
            }
          )}
        >
          <SelectValue placeholder="Select..." className="text-gray-600" />
        </SelectTrigger>

        <SelectContent className="max-h-80 overflow-y-auto rounded-lg border-2 border-gray-200 shadow-lg">
          {options.map((option, index) => (
            <SelectItem
              key={option}
              value={option}
              className="py-2.5 px-4 focus:bg-gray-100 focus:text-gray-900 rounded-md cursor-pointer"
            >
              {optionLabels ? optionLabels[index] : option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Error */}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
});

export default SelectField;
