import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DailySummaryFieldConfig } from "@/lib/types/dailySummary";

interface DailySummaryFormFieldProps {
  config: DailySummaryFieldConfig;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export const DailySummaryFormField = ({
  config,
  value,
  error,
  onChange,
}: DailySummaryFormFieldProps) => {
  const hasError = Boolean(error);

  return (
    <div
      className={`space-y-1 p-3 rounded-lg ${config.bgClass} border ${
        hasError ? "border-red-300" : "border-white"
      } shadow-sm`}
    >
      <Label htmlFor={config.id} className="text-sm font-medium text-gray-700">
        {config.label}
      </Label>
      <Input
        id={config.id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        className={`w-full bg-white ${
          hasError
            ? "border-red-400 focus:border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:border-indigo-400 focus:ring-indigo-200"
        } focus:ring-2`}
        maxLength={config.length}
        pattern="[0-9]*"
        inputMode="numeric"
        placeholder={`${"0".repeat(config.length)}`}
      />
      {hasError ? (
        <div className="text-xs text-red-600 mt-1 font-medium">{error}</div>
      ) : (
        <div className="text-xs text-gray-500 mt-1">
          Required length: exactly {config.length} digit
          {config.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
};
