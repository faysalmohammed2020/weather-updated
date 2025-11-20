import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface PermissionDeniedDialogProps {
  open: boolean;
  onClose: () => void;
}

export const PermissionDeniedDialog = ({
  open,
  onClose,
}: PermissionDeniedDialogProps) => (
  <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
    <DialogContent className="max-w-md rounded-xl border-0 bg-white p-6 shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Permission Denied
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="text-slate-700">
          You don't have permission to edit this record. This could be because:
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
          <li>The record is too old to edit</li>
          <li>The record belongs to a different station</li>
          <li>You don't have the required role permissions</li>
        </ul>
      </div>
      <DialogFooter>
        <Button
          onClick={onClose}
          className="bg-slate-200 text-slate-800 hover:bg-slate-300"
        >
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
