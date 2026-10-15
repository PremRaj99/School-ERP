import { useState } from 'react';
import { PaymentModeEnum, type PaymentMode } from '@schoolerp/contracts';
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
import { PAYMENT_MODE_LABEL, formatMonth, formatRupees } from '@/lib/finance-format';
import { FILTER_SELECT_CLASS } from '@/components/filters';

export interface PaymentTarget {
  /** Also the form's reset key — any id unique to this payment works for a not-yet-created fee. */
  feeId: string;
  studentName: string;
  month: string;
  amount: number;
  /** Fine owed today under the fee rules — pre-filled, editable, 0 = waive. */
  lateFine?: number;
  /**
   * Accepting a fee that hasn't been generated yet: `amount` is only the suggested (class) fee,
   * and staff can change it before accepting.
   */
  isNewFee?: boolean;
}

interface RecordPaymentDialogProps {
  /** The fee being marked Paid; null closes the dialog. */
  target: PaymentTarget | null;
  onClose: () => void;
  onConfirm: (payment: {
    paymentMode: PaymentMode;
    paymentRef?: string;
    lateFine?: number;
    /** The amount being collected (only differs from `target.amount` for a new fee). */
    amount: number;
  }) => void;
  pending?: boolean;
}

const REF_LABEL: Partial<Record<PaymentMode, string>> = {
  UPI: 'UPI transaction ID',
  Cheque: 'Cheque number',
  BankTransfer: 'Bank reference / UTR',
  Card: 'Card transaction ID',
  Online: 'Payment ID',
};

/** Asks how a fee was paid before marking it Paid (which also assigns its receipt number). */
export function RecordPaymentDialog({
  target,
  onClose,
  onConfirm,
  pending,
}: RecordPaymentDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        {/* Keyed so each fee starts with a fresh form. */}
        {target && (
          <PaymentForm
            key={target.feeId}
            target={target}
            onClose={onClose}
            onConfirm={onConfirm}
            pending={pending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PaymentForm({
  target,
  onClose,
  onConfirm,
  pending,
}: Omit<RecordPaymentDialogProps, 'target'> & { target: PaymentTarget }) {
  const [mode, setMode] = useState<PaymentMode>('Cash');
  const [ref, setRef] = useState('');
  const suggestedFine = target.lateFine ?? 0;
  const [fine, setFine] = useState(suggestedFine ? String(suggestedFine) : '');
  const fineAmount = Number(fine) || 0;
  const fineInvalid = fine !== '' && (Number.isNaN(Number(fine)) || Number(fine) < 0);
  const refLabel = REF_LABEL[mode];
  const [amountInput, setAmountInput] = useState(String(target.amount));
  const amount = target.isNewFee ? Number(amountInput) : target.amount;
  const amountInvalid =
    target.isNewFee && (amountInput === '' || Number.isNaN(amount) || amount <= 0);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg font-bold">
          {target.isNewFee ? 'Accept Fee' : 'Record Payment'}
        </DialogTitle>
        <DialogDescription className="text-xs">
          {target.studentName} · {formatMonth(target.month)}
          {!target.isNewFee && (
            <>
              {' '}
              · <span className="font-semibold">{formatRupees(target.amount)}</span>
            </>
          )}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        {target.isNewFee && (
          <label className="block space-y-1">
            <span className="text-xs font-semibold">
              Amount (₹){' '}
              <span className="text-muted-foreground font-normal">
                — class fee {formatRupees(target.amount)}
              </span>
            </span>
            <Input
              type="number"
              min={0}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="h-9 w-32 text-xs"
            />
          </label>
        )}
        <label className="block space-y-1">
          <span className="text-xs font-semibold">Payment mode</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as PaymentMode)}
            className={`${FILTER_SELECT_CLASS} w-full`}
          >
            {PaymentModeEnum.options.map((m) => (
              <option key={m} value={m}>
                {PAYMENT_MODE_LABEL[m]}
              </option>
            ))}
          </select>
        </label>
        {refLabel && (
          <label className="block space-y-1">
            <span className="text-xs font-semibold">
              {refLabel} <span className="text-muted-foreground font-normal">(optional)</span>
            </span>
            <Input
              value={ref}
              maxLength={60}
              onChange={(e) => setRef(e.target.value)}
              className="h-9 text-xs"
            />
          </label>
        )}
        {suggestedFine > 0 && (
          <div className="space-y-1 rounded-md border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900 dark:bg-rose-950/30">
            <label className="block space-y-1">
              <span className="text-xs font-semibold">
                Late fine (₹){' '}
                <span className="text-muted-foreground font-normal">
                  — overdue, {formatRupees(suggestedFine)} as per fee rules
                </span>
              </span>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={0}
                  value={fine}
                  onChange={(e) => setFine(e.target.value)}
                  className="h-9 w-32 text-xs"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs"
                  onClick={() => setFine('0')}
                >
                  Waive
                </Button>
              </div>
            </label>
            <p className="pt-1 text-xs">
              Total to collect:{' '}
              <span className="font-bold">{formatRupees(amount + fineAmount)}</span>
            </p>
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" className="h-9 text-xs" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="h-9 text-xs"
          disabled={pending || fineInvalid || amountInvalid}
          onClick={() =>
            onConfirm({
              paymentMode: mode,
              paymentRef: refLabel && ref.trim() ? ref.trim() : undefined,
              // Only sent when a fine applied, so an explicit 0 records the waiver.
              lateFine: suggestedFine > 0 ? fineAmount : undefined,
              amount,
            })
          }
        >
          {pending
            ? 'Saving…'
            : target.isNewFee
              ? 'Accept Fee & Get Receipt'
              : 'Mark Paid & Get Receipt'}
        </Button>
      </DialogFooter>
    </>
  );
}
