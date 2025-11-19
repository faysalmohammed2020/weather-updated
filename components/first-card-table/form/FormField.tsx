"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useField } from "formik";

interface FormFieldProps {
  name: string;
  label: string;
  highlightClass?: string;
  readOnly?: boolean;
  type?: string;
}

const FormField = ({
  name,
  label,
  highlightClass = "bg-white",
  readOnly = false,
  type = "text",
}: FormFieldProps) => {
  const [field, meta] = useField(name);
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div
      className={cn(
        "space-y-1 p-3 rounded-lg border border-white shadow-sm",
        highlightClass
      )}
    >
      <Label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {readOnly && (
          <span className="ml-1 text-xs text-gray-500">(Auto-calculated)</span>
        )}
      </Label>
      <Input
        {...field}
        id={name}
        type={type}
        readOnly={readOnly}
        value={field.value ?? ""}
        className={cn(
          "w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200",
          readOnly && "opacity-70 cursor-not-allowed bg-gray-50",
          hasError &&
            "border-red-500 focus:border-red-500 focus:ring-red-200"
        )}
      />
      {hasError && (
        <p className="text-red-500 text-xs mt-1 font-medium">{meta.error}</p>
      )}
    </div>
  );
};

export default FormField;

