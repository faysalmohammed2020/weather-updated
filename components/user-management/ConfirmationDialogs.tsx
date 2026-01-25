/**
 * User Management Confirmation Dialogs
 * Reusable dialogs for delete and role change confirmations
 */

"use client";

import { memo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  customContent?: React.ReactNode;
}

/**
 * Generic confirmation dialog component
 */
export const ConfirmationDialog = memo((props: ConfirmationDialogProps) => {
  const {
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    onCancel,
    isLoading,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDangerous = false,
    customContent,
  } = props;

  const handleCancel = useCallback(() => {
    onCancel?.();
    onOpenChange(false);
  }, [onCancel, onOpenChange]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>
        <div className="p-4 text-center">
          {typeof description === "string" ? (
            <p className="mb-4">{description}</p>
          ) : (
            <div className="mb-4">{description}</div>
          )}
          {customContent}
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={isDangerous ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ConfirmationDialog.displayName = "ConfirmationDialog";

/**
 * Delete confirmation dialog
 */
export const DeleteConfirmationDialog = memo(
  ({
    open,
    onOpenChange,
    onConfirm,
    isLoading,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isLoading?: boolean;
  }) => (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Deactivation"
      description="This will disable the account. You can restore it later."
      onConfirm={onConfirm}
      confirmText="Deactivate"
      isDangerous
      isLoading={isLoading}
    />
  )
);

DeleteConfirmationDialog.displayName = "DeleteConfirmationDialog";

/**
 * Restore confirmation dialog
 */
export const RestoreConfirmationDialog = memo(
  ({
    open,
    onOpenChange,
    onConfirm,
    isLoading,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isLoading?: boolean;
  }) => (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Confirm Restore"
      description="Restore this user and allow them to sign in again."
      onConfirm={onConfirm}
      confirmText="Restore"
      isLoading={isLoading}
    />
  )
);

RestoreConfirmationDialog.displayName = "RestoreConfirmationDialog";

/**
 * Role change confirmation dialog
 */
export const RoleChangeConfirmationDialog = memo(
  ({
    open,
    onOpenChange,
    originalRole,
    newRole,
    onConfirm,
    isLoading,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    originalRole: string | null;
    newRole: string | null;
    onConfirm: () => void;
    isLoading?: boolean;
  }) => {
    const customContent = (
      <p className="mb-4 text-amber-600">
        Changing user roles affects their permissions and access levels in the
        system.
      </p>
    );

    return (
      <ConfirmationDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Confirm Role Change"
        description={
          <>
            <p className="mb-2">
              Are you sure you want to change this user&apos;s role from{" "}
              <strong>{originalRole}</strong> to <strong>{newRole}</strong>?
            </p>
          </>
        }
        customContent={customContent}
        onConfirm={onConfirm}
        confirmText="Confirm Change"
        isLoading={isLoading}
      />
    );
  }
);

RoleChangeConfirmationDialog.displayName = "RoleChangeConfirmationDialog";
