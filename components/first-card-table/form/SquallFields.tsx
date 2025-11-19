"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ErrorMessage, Field } from "formik";

const squallOptions = [
  { value: "0", label: "0 — 0 to 0.5 hour before observation" },
  { value: "1", label: "1 — 0.5 to 1 hour before observation" },
  { value: "2", label: "2 — 1 to 1.5 hour before observation" },
  { value: "3", label: "3 — 1.5 to 2 hours before observation" },
  { value: "4", label: "4 — 2 to 2.5 hours before observation" },
  { value: "5", label: "5 — 2.5 to 3 hours before observation" },
  { value: "6", label: "6 — 3 to 4 hours before observation" },
  { value: "7", label: "7 — 4 to 5 hours before observation" },
  { value: "8", label: "8 — 5 to 6 hours before observation" },
  { value: "9", label: "9 — More than 6 hours before observation" },
];

const SquallFields = () => (
  <>
    <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
      <Label htmlFor="squallTime" className="text-sm font-medium text-gray-700">
        Squall Time (qt)
      </Label>
      <Field name="squallTime">
        {({ field, form }: any) => (
          <select
            id="squallTime"
            name="squallTime"
            value={field.value || ""}
            onChange={(event) =>
              form.setFieldValue("squallTime", event.target.value)
            }
            onBlur={field.onBlur}
            className={cn(
              "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-white",
              form.errors.squallTime &&
                form.touched.squallTime &&
                "border-red-500 focus:border-red-500 focus:ring-red-200"
            )}
          >
            <option value="">-- Select Time (qt) --</option>
            {squallOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      </Field>
      <ErrorMessage
        name="squallTime"
        component="div"
        className="text-red-500 text-xs mt-1 font-medium"
      />
    </div>

    <div className="space-y-1 p-3 rounded-lg bg-amber-50 border border-white shadow-sm">
      <Label
        htmlFor="squallConfirmed"
        className="text-sm font-medium text-gray-700"
      >
        Squall Confirmed
      </Label>
      <div className="flex items-center space-x-2">
        <Field
          type="checkbox"
          id="squallConfirmed"
          name="squallConfirmed"
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <Label htmlFor="squallConfirmed" className="text-sm text-gray-600">
          Check if squall is confirmed
        </Label>
      </div>
      <ErrorMessage
        name="squallConfirmed"
        component="div"
        className="text-red-500 text-xs mt-1 font-medium"
      />
    </div>
  </>
);

export default SquallFields;

