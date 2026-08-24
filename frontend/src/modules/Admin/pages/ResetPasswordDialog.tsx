import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PiCopy, PiCheck, PiKeyhole } from 'react-icons/pi';
import { toast } from 'sonner';

/**
 * Shows a freshly-generated temporary password exactly once, right after
 * `adminService.resetStudentPassword` / `resetTeacherPassword` succeeds (ALIGNMENT_PLAN.md P3) —
 * there's no email/SMS integration in this codebase (see CLAUDE.md), so this is the only place the
 * admin ever sees it. Shared between `StudentDetail.tsx` and `TeacherDetail.tsx` since the flow is
 * identical for both.
 */
export const ResetPasswordDialog: React.FC<{
  result: { username: string; temporaryPassword: string } | null;
  onClose: () => void;
}> = ({ result, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.temporaryPassword);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy — select and copy the password manually.');
    }
  };

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="text-primary flex items-center gap-2 text-xs font-semibold">
            <PiKeyhole className="h-4 w-4" />
            <span>Password Reset</span>
          </div>
          <DialogTitle className="text-lg font-bold">New Temporary Password</DialogTitle>
          <DialogDescription className="text-xs">
            This password is shown only once — copy it now and hand it to{' '}
            <strong>{result?.username}</strong> directly. There's no email/SMS delivery for this
            yet, so once you close this dialog it cannot be retrieved again (you'd need to reset it
            once more).
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
          <code className="font-mono text-sm font-bold tracking-wide text-slate-900 dark:text-zinc-100">
            {result?.temporaryPassword}
          </code>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <PiCheck className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                Copied
              </>
            ) : (
              <>
                <PiCopy className="mr-1 h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>

        <DialogFooter className="pt-2">
          <Button type="button" onClick={onClose} className="h-9 w-full text-xs">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
