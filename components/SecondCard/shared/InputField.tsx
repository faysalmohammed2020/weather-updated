// components/SecondCard/shared/InputField.tsx

"use client";

import React, { memo, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  accent?: string;
  value: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  error?: React.ReactNode;
  numeric?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const accentRing: Record<string, string> = {
  blue: "focus:ring-blue-500 focus:border-blue-500",
  yellow: "focus:ring-yellow-500 focus:border-yellow-500",
  purple: "focus:ring-purple-500 focus:border-purple-500",
  cyan: "focus:ring-cyan-500 focus:border-cyan-500",
  green: "focus:ring-green-500 focus:border-green-500",
  orange: "focus:ring-orange-500 focus:border-orange-500",
  fuchsia: "focus:ring-fuchsia-500 focus:border-fuchsia-500",
  violet: "focus:ring-violet-500 focus:border-violet-500",
  indigo: "focus:ring-indigo-500 focus:border-indigo-500",
};

const InputField = memo(function InputField({
  id,
  name,
  label,
  type = "text",
  accent = "blue",
  value,
  disabled = false,
  readOnly = false,
  required = false,
  numeric = false,
  error,
  onChange,
}: InputFieldProps) {
  const handleInputValidation = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;

      if (numeric && value !== "" && !/^[0-9]+(\.[0-9]+)?$/.test(value)) {
        e.target.classList.add("border-red-500");
      } else {
        e.target.classList.remove("border-red-500");
      }

      onChange(e);
    },
    [numeric, onChange]
  );

  return (
    <div className="grid gap-2">
      <Label htmlFor={id} className="font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        readOnly={readOnly}
        onChange={numeric ? handleInputValidation : onChange}
        inputMode={numeric ? "decimal" : "text"}
        required={required}
        className={cn(
          `${accentRing[accent]} border-gray-300 rounded-lg py-2 px-3`,
          {
            "bg-gray-100 cursor-not-allowed": disabled,
            "bg-slate-50": readOnly && !disabled,
            "border-red-500": error,
          }
        )}
      />

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
});

export default InputField;
