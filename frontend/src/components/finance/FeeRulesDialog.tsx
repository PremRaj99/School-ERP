import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FeeSettings, type LateFineType } from '@schoolerp/contracts';
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
import { FILTER_SELECT_CLASS } from '@/components/filters';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';

const FINE_TYPE_LABEL: Record<LateFineType, string> = {
  None: 'No late fine',
  Flat: 'Flat amount, once',
  PerDay: 'Per day late',
};

/** Admin-only editor for the school's fee due day and late-fine rule. */
export function FeeRulesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: qk.admin.feeSettings(),
    queryFn: adminService.getFeeSettings,
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Fee Rules</DialogTitle>
          <DialogDescription className="text-xs">
            When a month&apos;s fee falls due, and the fine for paying after that. The fine is
            suggested when a payment is recorded — staff can still change or waive it.
          </DialogDescription>
        </DialogHeader>
        {isLoading || !data ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          // Keyed on the loaded values so the form starts from them.
          <FeeRulesForm key={JSON.stringify(data)} initial={data} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function FeeRulesForm({ initial, onClose }: { initial: FeeSettings; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState({
    dueDay: String(initial.dueDay),
    lateFineType: initial.lateFineType,
    lateFineAmount: initial.lateFineAmount ? String(initial.lateFineAmount) : '',
    lateFineCap: initial.lateFineCap !== null ? String(initial.lateFineCap) : '',
  });

  const parsed = FeeSettings.safeParse({
    dueDay: Number(draft.dueDay),
    lateFineType: draft.lateFineType,
    lateFineAmount: draft.lateFineType === 'None' ? 0 : Number(draft.lateFineAmount),
    lateFineCap:
      draft.lateFineType === 'PerDay' && draft.lateFineCap !== ''
        ? Number(draft.lateFineCap)
        : null,
  });
  const error = parsed.success ? null : parsed.error.issues[0]?.message;

  const save = useMutation({
    mutationFn: (body: FeeSettings) => adminService.updateFeeSettings(body),
    onSuccess: () => {
      toast.success('Fee rules saved');
      // Due dates and fines on every fee list come from these rules.
      queryClient.invalidateQueries({ queryKey: qk.admin.feeSettings() });
      // (`studentFees()` is also the prefix of the monthly-status and summary keys.)
      queryClient.invalidateQueries({ queryKey: qk.admin.studentFees() });
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <>
      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold">Fee due on day</span>
          <Input
            type="number"
            min={1}
            max={28}
            value={draft.dueDay}
            onChange={(e) => setDraft({ ...draft, dueDay: e.target.value })}
            className="h-9 w-24 text-xs"
          />
          <span className="text-muted-foreground block text-[11px]">
            of each fee&apos;s own month (1–28).
          </span>
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-semibold">Late fine</span>
          <select
            value={draft.lateFineType}
            onChange={(e) => setDraft({ ...draft, lateFineType: e.target.value as LateFineType })}
            className={`${FILTER_SELECT_CLASS} w-full`}
          >
            {(Object.keys(FINE_TYPE_LABEL) as LateFineType[]).map((t) => (
              <option key={t} value={t}>
                {FINE_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
        {draft.lateFineType !== 'None' && (
          <div className="flex gap-3">
            <label className="block flex-1 space-y-1">
              <span className="text-xs font-semibold">
                {draft.lateFineType === 'PerDay' ? 'Fine per day (₹)' : 'Fine (₹)'}
              </span>
              <Input
                type="number"
                min={0}
                value={draft.lateFineAmount}
                onChange={(e) => setDraft({ ...draft, lateFineAmount: e.target.value })}
                className="h-9 text-xs"
              />
            </label>
            {draft.lateFineType === 'PerDay' && (
              <label className="block flex-1 space-y-1">
                <span className="text-xs font-semibold">
                  Maximum (₹) <span className="text-muted-foreground font-normal">optional</span>
                </span>
                <Input
                  type="number"
                  min={0}
                  value={draft.lateFineCap}
                  onChange={(e) => setDraft({ ...draft, lateFineCap: e.target.value })}
                  className="h-9 text-xs"
                />
              </label>
            )}
          </div>
        )}
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </div>
      <DialogFooter>
        <Button variant="outline" className="h-9 text-xs" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="h-9 text-xs"
          disabled={!parsed.success || save.isPending}
          onClick={() => parsed.success && save.mutate(parsed.data)}
        >
          {save.isPending ? 'Saving…' : 'Save Rules'}
        </Button>
      </DialogFooter>
    </>
  );
}
