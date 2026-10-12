import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PiPrinter } from 'react-icons/pi';
import type { FeeBreakdownItem, FeeReceiptFields, TxnStatus } from '@schoolerp/contracts';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { printElement } from '@/lib/print';
import {
  PAYMENT_MODE_LABEL,
  SCHOOL_NAME,
  amountInWords,
  formatMonth,
  formatRupees,
} from '@/lib/finance-format';

/** What a receipt needs — `StudentFeeDetail` (admin/finance) and `MyFeeDetail` (student) both fit. */
export interface FeeReceiptData extends FeeReceiptFields {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string | null;
  className?: string;
  section?: string;
  rollNo: number;
  session?: string;
  month: string;
  title: string;
  finalAmount: number;
  status: TxnStatus;
  feeBreakdown: FeeBreakdownItem[];
}

/** Fees paid before receipt numbers existed get a stable stand-in derived from the record id. */
const receiptNoOf = (fee: FeeReceiptData) =>
  fee.receiptNo ?? `OLD/${fee.id.slice(-8).toUpperCase()}`;

/** A printable fee receipt — always "paper" (white, dark text) so the screen matches the printout. */
export const FeeReceipt = React.forwardRef<HTMLDivElement, { fee: FeeReceiptData }>(
  ({ fee }, ref) => {
    const info: [string, string][] = [
      ['Receipt No.', receiptNoOf(fee)],
      ['Date', fee.paidOn ? isoToDisplayDate(fee.paidOn) : '—'],
      ['Student Name', `${fee.firstName} ${fee.lastName ?? ''}`.trim()],
      ['Student ID', fee.studentId],
      ['Class', fee.className ? `${fee.className}${fee.section ? ` - ${fee.section}` : ''}` : '—'],
      ['Roll No.', String(fee.rollNo)],
      ['Fee Month', formatMonth(fee.month)],
      [
        'Paid By',
        fee.paymentMode
          ? `${PAYMENT_MODE_LABEL[fee.paymentMode]}${fee.paymentRef ? ` (Ref: ${fee.paymentRef})` : ''}`
          : '—',
      ],
    ];

    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-[160mm] rounded-md border border-slate-300 bg-white p-6 text-[12px] text-slate-900 print:border-0"
      >
        <div className="border-b-2 border-slate-800 pb-2 text-center">
          <h3 className="text-base font-extrabold uppercase">{SCHOOL_NAME}</h3>
          <p className="text-xs font-bold tracking-widest">FEE RECEIPT</p>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-5 gap-y-1">
          {info.map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
              <dd className="font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="w-10 border border-slate-300 px-2 py-1 text-left">#</th>
              <th className="border border-slate-300 px-2 py-1 text-left">Particulars</th>
              <th className="w-32 border border-slate-300 px-2 py-1 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(fee.feeBreakdown.length > 0
              ? fee.feeBreakdown
              : [{ feeType: fee.title, amount: fee.finalAmount }]
            ).map((item, i) => (
              <tr key={i}>
                <td className="border border-slate-300 px-2 py-1">{i + 1}</td>
                <td className="border border-slate-300 px-2 py-1">{item.feeType}</td>
                <td className="border border-slate-300 px-2 py-1 text-right">
                  {formatRupees(item.amount)}
                </td>
              </tr>
            ))}
            <tr className="font-bold">
              <td className="border border-slate-300 px-2 py-1" />
              <td className="border border-slate-300 px-2 py-1 text-right">Total Paid</td>
              <td className="border border-slate-300 px-2 py-1 text-right">
                {formatRupees(fee.finalAmount)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="mt-2 text-[11px]">
          <span className="text-slate-500">In words: </span>
          <span className="font-semibold">{amountInWords(fee.finalAmount)}</span>
        </p>

        <div className="mt-12 flex items-end justify-between text-[11px]">
          <p className="text-slate-400">This is a computer-generated receipt.</p>
          <p className="border-t border-slate-500 px-6 pt-1 font-semibold">Authorised Signatory</p>
        </div>
      </div>
    );
  },
);
FeeReceipt.displayName = 'FeeReceipt';

interface FeeReceiptDialogProps {
  /** The fee to show; null closes the dialog. */
  feeId: string | null;
  onClose: () => void;
  queryKey: readonly unknown[];
  load: (feeId: string) => Promise<FeeReceiptData>;
}

/** Loads a fee's detail and shows its receipt with a Print button. */
export function FeeReceiptDialog({ feeId, onClose, queryKey, load }: FeeReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => load(feeId!),
    enabled: !!feeId,
  });

  return (
    <Dialog open={!!feeId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle className="sr-only">Fee receipt</DialogTitle>
        {isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : isError || !data ? (
          <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
        ) : data.status !== 'Paid' ? (
          <p className="text-muted-foreground p-6 text-center text-sm">
            This fee hasn&apos;t been paid yet, so there is no receipt.
          </p>
        ) : (
          <div className="space-y-4 pt-4">
            <FeeReceipt ref={receiptRef} fee={data} />
            <Button
              className="w-full text-xs"
              onClick={() => printElement(receiptRef.current, `Fee receipt ${receiptNoOf(data)}`)}
            >
              <PiPrinter className="mr-1.5 h-3.5 w-3.5" />
              Print Receipt
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
