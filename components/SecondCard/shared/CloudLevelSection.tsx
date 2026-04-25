// components/SecondCard/shared/CloudLevelSection.tsx

"use client";

import React, { memo, useMemo } from "react";
import SelectField from "./SelectField";
import { cn } from "@/lib/utils";

interface CloudLevelSectionProps {
  title: string;
  prefix: string;
  color?: string;
  data: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  renderError: (field: string) => React.ReactNode;
}

const CloudLevelSection = memo(function CloudLevelSection({
  title,
  prefix,
  color = "blue",
  data,
  onSelectChange,
  renderError,
}: CloudLevelSectionProps) {
  // ------------------ FORM OPTIONS ------------------
  const lowCloudFormOptions = useMemo(
    () => [
      { value: "0", label: "0 - No Sc, St, Cu or Cb" },
      { value: "1", label: "1 - Cu with little vertical extent" },
      { value: "2", label: "2 - Cu of moderate/strong vertical extent" },
      { value: "3", label: "3 - Cb lacking sharp outlines" },
      { value: "4", label: "4 - Sc formed from spreading Cu" },
      { value: "5", label: "5 - Sc not from spreading Cu" },
      { value: "6", label: "6 - St in continuous sheet or ragged shreds" },
      { value: "7", label: "7 - Stratus/Cu fractus of bad weather" },
      { value: "8", label: "8 - Cu and Sc at different levels" },
      { value: "9", label: "9 - Cb with fibrous upper part / anvil" },
      { value: "/", label: "/ - Not visible" },
    ],
    []
  );

  const mediumCloudFormOptions = useMemo(
    () => [
      { value: "0", label: "0 - No Ac, As or Ns" },
      { value: "1", label: "1 - Altostratus translucidus..." },
      { value: "2", label: "2 - As sufficiently dense to hide sun/moon..." },
      { value: "3", label: "3 - Ac semi-transparent, single level..." },
      { value: "4", label: "4 - Patches of Ac, semi-transparent..." },
      { value: "5", label: "5 - Semi-transparent Ac in bands..." },
      { value: "6", label: "6 - Ac from spreading out of Cu or Cb" },
      { value: "7", label: "7 - Ac in multiple layers, or with As/Ns" },
      { value: "8", label: "8 - Ac with sproutings / cumuliform tufts" },
      { value: "9", label: "9 - Ac of chaotic sky" },
      { value: "/", label: "/ - Ac, As, Ns invisible due to other causes" },
    ],
    []
  );

  const highCloudFormOptions = useMemo(
    () => [
      { value: "0", label: "0 - No Ci, Cc, or Cs" },
      { value: "1", label: "1 - Ci in filaments, not invading" },
      { value: "2", label: "2 - Dense Ci patches / sproutings" },
      { value: "3", label: "3 - Dense Ci, remains of Cb" },
      { value: "4", label: "4 - Ci hooks/filaments invading" },
      { value: "5", label: "5 - Ci + Cs, veil not reaching 45°" },
      { value: "6", label: "6 - Ci + Cs, veil extends >45°" },
      { value: "7", label: "7 - Veil of Cs covering dome" },
      { value: "8", label: "8 - Cs not invading, not full dome" },
      { value: "9", label: "9 - Cc predominant" },
      { value: "/", label: "/ - Ci, Cc, Cs invisible due to other causes" },
    ],
    []
  );

  const cloudDirectionOptions = useMemo(
    () => [
      { value: "0", label: "0 - Stationary / no direction" },
      { value: "1", label: "1 - From NE" },
      { value: "2", label: "2 - From E" },
      { value: "3", label: "3 - From SE" },
      { value: "4", label: "4 - From S" },
      { value: "5", label: "5 - From SW" },
      { value: "6", label: "6 - From W" },
      { value: "7", label: "7 - From NW" },
      { value: "8", label: "8 - From N" },
      { value: "9", label: "9 - No definite / unknown" },
    ],
    []
  );

  const cloudHeightOptions = useMemo(
    () => [
      { value: "0", label: "0 - 0 to 50 m" },
      { value: "1", label: "1 - 50 to 100 m" },
      { value: "2", label: "2 - 100 to 200 m" },
      { value: "3", label: "3 - 200 to 300 m" },
      { value: "4", label: "4 - 300 to 600 m" },
      { value: "5", label: "5 - 600 to 1000 m" },
      { value: "6", label: "6 - 1000 to 1500 m" },
      { value: "7", label: "7 - 1500 to 2000 m" },
      { value: "8", label: "8 - 2000 to 2500 m" },
      { value: "9", label: "9 - 2500 m+ or no cloud" },
      { value: "/", label: "/ - Height not known" },
    ],
    []
  );

  const cloudAmountOptions = useMemo(
    () => [
      { value: "0", label: "0 - No cloud" },
      { value: "1", label: "1 - 1 octa or less" },
      { value: "2", label: "2 - 2 octas" },
      { value: "3", label: "3 - 3 octas" },
      { value: "4", label: "4 - 4 octas" },
      { value: "5", label: "5 - 5 octas" },
      { value: "6", label: "6 - 6 octas" },
      { value: "7", label: "7 - 7 octas" },
      { value: "8", label: "8 - 8 octas (full sky)" },
      { value: "9", label: "9 - Sky obscured" },
      { value: "/", label: "/ - Obscured / cannot be estimated" },
    ],
    []
  );

  // choose form options based on prefix
  const formOptions = useMemo(() => {
    if (prefix === "medium-cloud") return mediumCloudFormOptions;
    if (prefix === "high-cloud") return highCloudFormOptions;
    return lowCloudFormOptions;
  }, [prefix]);

  // prepend deselect option
  const withDeselect = (options: { value: string; label: string }[]) => [
    { value: "__none__", label: "— Deselect —" },
    ...options,
  ];

  return (
    <div className="bg-linear-to-r from-white to-gray-50 p-4 rounded-lg border border-gray-200">
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
            onSelectChange(`${prefix}-form`, value === "__none__" ? "" : value)
          }
          options={withDeselect(formOptions).map((o) => o.value)}
          optionLabels={withDeselect(formOptions).map((o) =>
            o.label.length > 73 ? o.label.slice(0, 73) + "..." : o.label
          )}
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
            onSelectChange(
              `${prefix}-amount`,
              value === "__none__" ? "" : value
            )
          }
          options={withDeselect(cloudAmountOptions).map((o) => o.value)}
          optionLabels={withDeselect(cloudAmountOptions).map((o) => o.label)}
          error={renderError("amount")}
        />

        {/* Height — hidden for high cloud */}
        {prefix !== "high-cloud" && (
          <SelectField
            id={`${prefix}-height`}
            name={`${prefix}-height`}
            label="Height of Base (Code)"
            accent={color}
            value={data["height"] || ""}
            onValueChange={(value) =>
              onSelectChange(
                `${prefix}-height`,
                value === "__none__" ? "" : value
              )
            }
            options={withDeselect(cloudHeightOptions).map((o) => o.value)}
            optionLabels={withDeselect(cloudHeightOptions).map((o) => o.label)}
            error={renderError("height")}
          />
        )}

        {/* Direction */}
        <SelectField
          id={`${prefix}-direction`}
          name={`${prefix}-direction`}
          label="Direction (Code)"
          accent={color}
          value={data["direction"] || ""}
          onValueChange={(value) =>
            onSelectChange(
              `${prefix}-direction`,
              value === "__none__" ? "" : value
            )
          }
          options={withDeselect(cloudDirectionOptions).map((o) => o.value)}
          optionLabels={withDeselect(cloudDirectionOptions).map((o) => o.label)}
          error={renderError("direction")}
        />
      </div>
    </div>
  );
});

export default CloudLevelSection;
