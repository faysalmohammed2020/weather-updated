"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DailySummaryFormField } from "@/components/dailySummary/Form/DailySummaryFormField";
import {
  DAILY_SUMMARY_FIELDS,
  DAILY_SUMMARY_FIELD_VALIDATIONS,
  buildInitialDailyFormData,
  sanitizeDailyNumericInput,
  validateDailyFieldValue,
  validateDailyForm,
} from "@/lib/utils/validate-utils";
import type {
  DailySummaryFormData,
  DailySummaryRecord,
} from "@/lib/types/dailySummary";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateDailySummary } from "@/lib/api/dailySummary";
import { format } from "date-fns";

interface EditDailySummaryDialogProps {
  open: boolean;
  record: DailySummaryRecord | null;
  onClose: () => void;
  onRecordUpdated: (record: DailySummaryRecord) => void;
}

export const EditDailySummaryDialog = ({
  open,
  record,
  onClose,
  onRecordUpdated,
}: EditDailySummaryDialogProps) => {
  const [formData, setFormData] = useState<DailySummaryFormData>(() =>
    buildInitialDailyFormData()
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData(buildInitialDailyFormData(record));
      setFieldErrors({});
    }
  }, [record]);

  const handleFieldChange = (fieldId: keyof DailySummaryFormData, value: string) => {
    const length = DAILY_SUMMARY_FIELD_VALIDATIONS[fieldId];
    const sanitized = sanitizeDailyNumericInput(value, length);
    setFormData((prev) => ({
      ...prev,
      [fieldId]: sanitized,
    }));
    const error = sanitized
      ? validateDailyFieldValue(sanitized, length)
      : "This field is required";
    setFieldErrors((prev) => ({
      ...prev,
      [fieldId]: error ?? "",
    }));
  };

  const handleSave = async () => {
    if (!record) {
      return;
    }

    const { errors, isValid } = validateDailyForm(formData);
    setFieldErrors(errors);

    if (!isValid) {
      toast.error("Please fix validation errors before saving");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateDailySummary(record.id, formData);
      onRecordUpdated(updated);
      toast.success("Record updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating record:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update record"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-[50vw] !max-w-[90vw] rounded-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-800">
            Edit Daily Summary Data
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Editing record from{" "}
            {record?.ObservingTime?.station?.name || "Unknown Station"}{" "}
            {record?.createdAt
              ? format(new Date(record.createdAt), "MMMM d, yyyy")
              : "Unknown Date"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
          {DAILY_SUMMARY_FIELDS.map((field) => (
            <DailySummaryFormField
              key={field.id}
              config={field}
              value={formData[field.id] || ""}
              error={fieldErrors[field.id]}
              onChange={(value) => handleFieldChange(field.id, value)}
            />
          ))}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              isSaving ||
              Object.values(fieldErrors).some((error) => Boolean(error))
            }
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
