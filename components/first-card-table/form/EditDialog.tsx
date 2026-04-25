"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  MeteorologicalEntry,
  ObservingTimeEntry,
} from "@/types/meteorological";
import { format } from "date-fns";
import MeteorologicalForm, {
  MeteorologicalFormValues,
} from "./MeteorologicalForm";

interface EditDialogProps {
  isOpen: boolean;
  record: MeteorologicalEntry | null;
  observingTime: ObservingTimeEntry | null;
  onClose: () => void;
  onSubmit: (values: MeteorologicalFormValues) => Promise<void> | void;
  isSaving: boolean;
}

const EditDialog = ({
  isOpen,
  record,
  observingTime,
  onClose,
  onSubmit,
  isSaving,
}: EditDialogProps) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Meteorological Data
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Editing record from{" "}
            {observingTime?.station?.name || "Unknown Station"} (
            {observingTime?.station?.stationId || "Unknown"}) on{" "}
            {observingTime?.utcTime
              ? format(new Date(observingTime.utcTime), "MMMM d, yyyy")
              : "Unknown Date"}
          </DialogDescription>
          <div className="h-1 w-20 rounded-full bg-linear-to-r from-indigo-400 to-blue-400 mt-2" />
        </DialogHeader>

        {record && observingTime ? (
          <MeteorologicalForm
            record={record}
            observingTime={observingTime}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSaving={isSaving}
          />
        ) : (
          <p className="text-sm text-slate-500">Select a record to edit.</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;

