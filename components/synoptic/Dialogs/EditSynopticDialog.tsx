import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { updateSynoptic } from "@/lib/api/synoptic";
import type { SynopticFormData, SynopticRecord } from "@/lib/types/synoptic";
import { toast } from "sonner";

interface EditSynopticDialogProps {
  open: boolean;
  record: SynopticRecord | null;
  onClose: () => void;
  onRecordUpdated: (record: SynopticRecord) => void;
}

const EDIT_FIELDS = [
  { id: "C1", label: "C1 Indicator", bg: "bg-blue-50" },
  { id: "Iliii", label: "Station Identifier", bg: "bg-indigo-50" },
  { id: "iRiXhvv", label: "iRiXhvv", bg: "bg-blue-50" },
  { id: "Nddff", label: "Nddff", bg: "bg-indigo-50" },
  { id: "S1nTTT", label: "1SnTTT", bg: "bg-blue-50" },
  { id: "S2nTddTddTdd", label: "2SnTdTdTd", bg: "bg-indigo-50" },
  { id: "P3PPP4PPPP", label: "3PPP/4PPP", bg: "bg-blue-50" },
  { id: "RRRtR6", label: "6RRRtR", bg: "bg-indigo-50" },
  { id: "wwW1W2", label: "7wwW1W2", bg: "bg-blue-50" },
  { id: "NhClCmCh", label: "8NhClCmCh", bg: "bg-indigo-50" },
  {
    id: "S2nTnTnTnInInInIn",
    label: "2SnTnTnTn/InInInIn",
    bg: "bg-blue-50",
  },
  { id: "D56DLDMDH", label: "56DlDmDh", bg: "bg-indigo-50" },
  { id: "CD57DaEc", label: "57CDaEc", bg: "bg-blue-50" },
  { id: "C2", label: "C2", bg: "bg-indigo-50" },
  { id: "GG", label: "GG", bg: "bg-blue-50" },
  { id: "P24Group58_59", label: "58/59P24", bg: "bg-indigo-50" },
  { id: "R24Group6_7", label: "(6RRRtR)/7R24R24R24R24", bg: "bg-blue-50" },
  { id: "NsChshs", label: "8N5Ch5h5", bg: "bg-indigo-50" },
  { id: "dqqqt90", label: "90dqqqt", bg: "bg-blue-50" },
  { id: "fqfqfq91", label: "91fqfqfq", bg: "bg-indigo-50" },
  {
    id: "weatherRemark",
    label: "Weather Remarks",
    bg: "bg-blue-50",
  },
];

export const EditSynopticDialog = ({
  open,
  record,
  onClose,
  onRecordUpdated,
}: EditSynopticDialogProps) => {
  const [formData, setFormData] = useState<SynopticFormData>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (record) {
      const initialData = EDIT_FIELDS.reduce<SynopticFormData>((acc, field) => {
        acc[field.id as keyof SynopticFormData] = (record as any)[field.id] || "";
        return acc;
      }, {});
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [record]);

  const dialogDescription = useMemo(() => {
    if (!record?.ObservingTime?.utcTime) {
      return "Editing selected record";
    }

    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(record.ObservingTime.utcTime));
  }, [record]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSave = async () => {
    if (!record) {
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateSynoptic(record.id, formData);
      onRecordUpdated(updated || { ...record, ...formData });
      toast.success("Record updated successfully");
      onClose();
    } catch (error) {
      console.error("Error updating record:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to update record: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="w-[90vw] !max-w-[95vw] rounded-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-indigo-800">
            Edit Synoptic Code Data
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Editing record from{" "}
            {record?.ObservingTime?.station?.name || "Unknown Station"} on{" "}
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[65vh] overflow-y-auto pr-2">
          {EDIT_FIELDS.map((field) => (
            <div
              key={field.id}
              className={`space-y-1 p-3 rounded-lg ${field.bg} border border-white shadow-sm`}
            >
              <Label
                htmlFor={field.id}
                className="text-sm font-medium text-gray-700"
              >
                {field.label}
              </Label>
              <Input
                id={field.id}
                value={formData[field.id as keyof SynopticFormData] || ""}
                onChange={(event) =>
                  handleInputChange(field.id, event.currentTarget.value)
                }
                className="w-full bg-white border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
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
            disabled={isSaving}
            className="bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md transition-all"
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
