import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DEFAULT_FEE_SETTINGS, type ClassFee } from '@schoolerp/contracts';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { getCurrentSessionYear } from '@/lib/session';

/** Admin-only editor for each class's monthly fee (blank = the school's default fee). */
export function ClassFeesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const classFees = useQuery({
    queryKey: qk.admin.classFees(),
    queryFn: adminService.getClassFees,
    enabled: open,
  });
  const settings = useQuery({
    queryKey: qk.admin.feeSettings(),
    queryFn: adminService.getFeeSettings,
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Class Fees</DialogTitle>
          <DialogDescription className="text-xs">
            Monthly fee per student for each class in the {getCurrentSessionYear()} session. Leave a
            class blank to use the school default of ₹
            {settings.data?.defaultMonthlyFee ?? DEFAULT_FEE_SETTINGS.defaultMonthlyFee} (set in Fee
            Rules).
          </DialogDescription>
        </DialogHeader>
        {classFees.isLoading || !classFees.data ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          // Keyed on the loaded values so the form starts from them.
          <ClassFeesForm
            key={JSON.stringify(classFees.data)}
            initial={classFees.data}
            defaultFee={settings.data?.defaultMonthlyFee ?? DEFAULT_FEE_SETTINGS.defaultMonthlyFee}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ClassFeesForm({
  initial,
  defaultFee,
  onClose,
}: {
  initial: ClassFee[];
  defaultFee: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initial.map((c) => [c.classId, c.monthlyFee !== null ? String(c.monthlyFee) : '']),
    ),
  );

  const changes = initial
    .map((c) => {
      const raw = draft[c.classId] ?? '';
      return { classId: c.classId, before: c.monthlyFee, after: raw === '' ? null : Number(raw) };
    })
    .filter((c) => c.after !== c.before);
  const invalid = changes.some((c) => c.after !== null && (Number.isNaN(c.after) || c.after < 0));

  const save = useMutation({
    mutationFn: () =>
      Promise.all(changes.map((c) => adminService.updateClassFee(c.classId, c.after))),
    onSuccess: () => {
      toast.success('Class fees saved');
      queryClient.invalidateQueries({ queryKey: qk.admin.classFees() });
      queryClient.invalidateQueries({ queryKey: qk.admin.dashboard() });
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      {initial.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-xs">
          No classes in the {getCurrentSessionYear()} session yet.
        </p>
      ) : (
        <div className="max-h-[50vh] space-y-1.5 overflow-y-auto pr-1">
          {initial.map((c) => (
            <label
              key={c.classId}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-100 px-3 py-1.5 dark:border-zinc-800"
            >
              <span className="text-xs">
                <span className="font-semibold">
                  Class {c.className}-{c.section}
                </span>{' '}
                <span className="text-muted-foreground">· {c.session}</span>
              </span>
              <div className="relative w-32">
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-xs">
                  ₹
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder={String(defaultFee)}
                  value={draft[c.classId] ?? ''}
                  onChange={(e) => setDraft({ ...draft, [c.classId]: e.target.value })}
                  className="h-8 pl-6 text-xs"
                />
              </div>
            </label>
          ))}
        </div>
      )}
      {invalid && <p className="text-xs text-rose-600">Fees cannot be negative.</p>}
      <DialogFooter>
        <Button variant="outline" className="h-9 text-xs" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="h-9 text-xs"
          disabled={changes.length === 0 || invalid || save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? 'Saving…' : 'Save Fees'}
        </Button>
      </DialogFooter>
    </>
  );
}
