"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PermissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const PermissionDialog = ({ isOpen, onClose }: PermissionDialogProps) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-md rounded-xl border-0 bg-white p-6 shadow-xl">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Permission Denied
        </DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <p className="text-slate-700">
          You do not have permission to edit this record. This can happen when:
        </p>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
          <li>The record is older than your role allows.</li>
          <li>The record belongs to a different station or user.</li>
        </ul>
      </div>
      <DialogFooter>
        <Button onClick={onClose} className="w-full sm:w-auto">
          Got it
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default PermissionDialog;
