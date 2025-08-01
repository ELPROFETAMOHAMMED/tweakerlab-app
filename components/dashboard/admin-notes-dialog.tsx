"use client";

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Download, Ban } from 'lucide-react';

interface AdminNotesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  adminNotes?: string;
  tweakTitle: string;
  isDisabled?: boolean;
  disableReason?: string;
  onConfirmDownload: () => void;
}

export default function AdminNotesDialog({
  isOpen,
  onOpenChange,
  adminNotes,
  tweakTitle,
  isDisabled = false,
  disableReason,
  onConfirmDownload
}: AdminNotesDialogProps) {

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirmDownload();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isDisabled ? (
              <>
                <Ban className="h-5 w-5 text-destructive" />
                Tweak Disabled
              </>
            ) : (
              <>
                <Info className="h-5 w-5 text-blue-500" />
                Important Information
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{tweakTitle}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Disable Reason */}
          {isDisabled && disableReason && (
            <Alert className="border-destructive/20 bg-destructive/5">
              <Ban className="h-4 w-4 text-destructive" />
              <AlertDescription className="text-sm text-destructive">
                <strong>Reason:</strong> {disableReason}
              </AlertDescription>
            </Alert>
          )}

          {/* Admin Notes */}
          {adminNotes && (
            <Alert className={isDisabled ? "border-destructive/20 bg-destructive/5" : ""}>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                {adminNotes}
              </AlertDescription>
            </Alert>
          )}

          {/* Download Warning */}
          {!isDisabled && (
            <p className="text-sm text-muted-foreground">
              Do you want to proceed with the download?
            </p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {!isDisabled && (
            <AlertDialogAction onClick={handleConfirm} className="gap-2">
              <Download className="h-4 w-4" />
              Download
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
