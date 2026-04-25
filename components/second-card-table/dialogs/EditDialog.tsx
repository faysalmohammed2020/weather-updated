"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormProvider, type UseFormReturn } from "react-hook-form";
import WeatherForm, { type WeatherFormValues } from "../forms/WeatherForm";
import type { WeatherObservationRecord } from "@/types/weather-observation";
import { formatUtcLong } from "@/lib/utils/formatUtcDate";

interface EditDialogProps {
  isOpen: boolean;
  record: WeatherObservationRecord | null;
  form: UseFormReturn<WeatherFormValues>;
  isSaving: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: WeatherFormValues) => void;
  onCancel: () => void;
}

const EditDialog = ({
  isOpen,
  record,
  form,
  isSaving,
  onOpenChange,
  onSubmit,
  onCancel,
}: EditDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="w-[90vw] !max-w-[95vw] rounded-xl border-0 bg-gradient-to-br from-sky-50 to-blue-50 p-6 shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-sky-800">
          Edit Weather Observation
        </DialogTitle>
        {record && (
          <DialogDescription className="text-slate-600">
            Editing record from {record.station?.name || "Unknown Station"} on{" "}
            {record.utcTime ? formatUtcLong(record.utcTime) : "Unknown Date"}
          </DialogDescription>
        )}
        <div className="h-1 w-20 rounded-full bg-linear-to-r from-sky-400 to-blue-400 mt-2" />
      </DialogHeader>

      {record && (
        <FormProvider {...form}>
          <WeatherForm
            onSubmit={form.handleSubmit(onSubmit)}
            onCancel={onCancel}
            isSaving={isSaving}
          />
        </FormProvider>
      )}
    </DialogContent>
  </Dialog>
);

export default EditDialog;
