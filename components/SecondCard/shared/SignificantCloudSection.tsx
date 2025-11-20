// components/SecondCard/shared/SignificantCloudSection.tsx
//Estiak

"use client";

import React, { memo, useMemo } from "react";
import SelectField from "./SelectField";

interface SignificantCloudSectionProps {
  title: string;
  prefix: string;
  color?: string;
  data: Record<string, string>;
  onSelectChange: (name: string, value: string) => void;
  renderError: (field: string) => React.ReactNode;
}

const SignificantCloudSection = memo(function SignificantCloudSection({
  title,
  prefix,
  color = "purple",
  data,
  onSelectChange,
  renderError,
}: SignificantCloudSectionProps) {
  // Height options (00–99)
  const heightOptions = useMemo(
    () => Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0")),
    []
  );

  const cloudFormOptions = useMemo(
    () => [
      { value: "0", label: "0 - Cirrus (Ci)" },
      { value: "1", label: "1 - Cirrocumulus (Cc)" },
      { value: "2", label: "2 - Cirrostratus (Cs)" },
      { value: "3", label: "3 - Altocumulus (Ac)" },
      { value: "4", label: "4 - Altostratus (As)" },
      { value: "5", label: "5 - Nimbostratus (Ns)" },
      { value: "6", label: "6 - Stratocumulus (Sc)" },
      { value: "7", label: "7 - Stratus (St)" },
      { value: "8", label: "8 - Cumulus (Cu)" },
      { value: "9", label: "9 - Cumulonimbus (Cb)" },
      { value: "/", label: "/ - Clouds not visible (darkness, fog, etc.)" },
    ],
    []
  );

  const amountOptions = useMemo(
    () => [
      { value: "0", label: "0 - No cloud" },
      { value: "1", label: "1 - 1 octa or less" },
      { value: "2", label: "2 - 2 octas" },
      { value: "3", label: "3 - 3 octas" },
      { value: "4", label: "4 - 4 octas" },
      { value: "5", label: "5 - 5 octas" },
      { value: "6", label: "6 - 6 octas" },
      { value: "7", label: "7 - 7_octas" },
      { value: "8", label: "8 - 8 octas (full sky)" },
      {
        value: "/",
        label: "/ - Cloud amount cannot be estimated",
      },
    ],
    []
  );

  const NONE = { value: "__NONE__", label: "— Deselect —" };

  const mapValue = (v: string) => (v === "__NONE__" ? "" : v);

  const formValues = [NONE, ...cloudFormOptions].map((o) =>
    "value" in o ? o.value : o
  );
  const formLabels = [NONE, ...cloudFormOptions].map((o) =>
    "label" in o ? o.label : String(o)
  );

  const amountValues = [NONE, ...amountOptions].map((o) =>
    "value" in o ? o.value : o
  );
  const amountLabels = [NONE, ...amountOptions].map((o) =>
    "label" in o ? o.label : String(o)
  );

  const heightValues = ["__NONE__", ...heightOptions];

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className={`text-lg font-semibold mb-4 text-${color}-600`}>
        {title}
      </h3>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Form */}
        <SelectField
          id={`${prefix}-form`}
          name={`${prefix}-form`}
          label="Form (Code)"
          accent={color}
          value={data["form"] || ""}
          onValueChange={(value) =>
            onSelectChange(`${prefix}-form`, mapValue(value))
          }
          options={formValues}
          optionLabels={formLabels}
          error={renderError("form")}
        />

        {/* Amount */}
        <SelectField
          id={`${prefix}-amount`}
          name={`${prefix}-amount`}
          label="Amount (Octa)"
          accent={color}
          value={data["amount"] || ""}
          onValueChange={(value) =>
            onSelectChange(`${prefix}-amount`, mapValue(value))
          }
          options={amountValues}
          optionLabels={amountLabels}
          error={renderError("amount")}
        />

        {/* Height */}
        <SelectField
          id={`${prefix}-height`}
          name={`${prefix}-height`}
          label="Height of Base (Code)"
          accent={color}
          value={data["height"] || ""}
          onValueChange={(value) =>
            onSelectChange(`${prefix}-height`, mapValue(value))
          }
          options={heightValues}
          error={renderError("height")}
        />
      </div>
    </div>
  );
});

export default SignificantCloudSection;
