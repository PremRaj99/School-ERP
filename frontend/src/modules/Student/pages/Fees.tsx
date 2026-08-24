import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { PiReceipt } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

/** Matches `useSessionOptions()` (`hooks/options/useAdminOptions.ts`) — a session starts in April.
 * Duplicated locally rather than imported since that hook lives in the Admin-scoped options file
 * and this is a pure client-side generator, not an API call. */
function sessionOptions(): string[] {
  const now = new Date();
  const currentStartYear = now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  return [currentStartYear - 1, currentStartYear, currentStartYear + 1].map(
    (year) => `${year}-${year + 1}`,
  );
}

const STATUS_STYLES: Record<string, string> = {
  Paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

const YEARS = sessionOptions();
const defaultYear = YEARS[1];

export const StudentFees: React.FC = () => {
  const [year, setYear] = useState(defaultYear);
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);

  const {
    data: fees,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.student.fees(year),
    queryFn: () => studentService.getTransactions(year),
  });

  const { data: feeDetail, isLoading: detailLoading } = useQuery({
    queryKey: qk.student.fee(selectedFeeId ?? ''),
    queryFn: () => studentService.getTransactionById(selectedFeeId as string),
    enabled: !!selectedFeeId,
  });

  const { pendingCount, pendingTotal, paidTotal } = useMemo(() => {
    const list = fees ?? [];
    const pending = list.filter((f) => f.status === 'Pending');
    const paid = list.filter((f) => f.status === 'Paid');
    return {
      pendingCount: pending.length,
      pendingTotal: pending.reduce((sum, f) => sum + f.finalAmount, 0),
      paidTotal: paid.reduce((sum, f) => sum + f.finalAmount, 0),
    };
  }, [fees]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Fee Invoices & Receipts</h1>
            <Badge
              variant="outline"
              className={`text-xs ${
                pendingCount === 0
                  ? 'border-emerald-500/30 text-emerald-600'
                  : 'border-amber-500/30 text-amber-600'
              }`}
            >
              {pendingCount === 0 ? 'Account Clear' : `${pendingCount} Pending`}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Review fee invoices and payment receipts for the selected session.
          </p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              Session {y}
            </option>
          ))}
        </select>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Pending Balance</span>
            <p
              className={`mt-1 text-2xl font-bold ${
                pendingCount === 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              ₹{pendingTotal.toLocaleString()}
            </p>
            <span className="text-muted-foreground text-[11px]">
              {pendingCount === 0 ? 'No overdue charges' : `${pendingCount} invoice(s) pending`}
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Total Paid</span>
            <p className="text-primary mt-1 text-2xl font-bold">₹{paidTotal.toLocaleString()}</p>
            <span className="text-muted-foreground text-[11px]">Session {year}</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Total Invoices</span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {(fees ?? []).length}
            </p>
            <span className="text-muted-foreground text-[11px]">Session {year}</span>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (fees ?? []).length === 0 ? (
        <Empty className="rounded-md border p-8">
          <EmptyMedia illustration="fees" illustrationSize={120} />
          <EmptyTitle>No fee invoices</EmptyTitle>
          <EmptyDescription>No fee has been raised for session {year} yet.</EmptyDescription>
        </Empty>
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                <TableHead className="text-xs font-bold">Billing Month</TableHead>
                <TableHead className="text-xs font-bold">Amount</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
                <TableHead className="text-right text-xs font-bold">Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...(fees ?? [])]
                .sort((a, b) => b.month.localeCompare(a.month))
                .map((fee) => (
                  <TableRow key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                    <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                      {fee.month}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                      ₹{fee.finalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold ${STATUS_STYLES[fee.status] ?? ''}`}
                      >
                        {fee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10 h-7 text-xs"
                        onClick={() => setSelectedFeeId(fee.id)}
                      >
                        <PiReceipt className="mr-1 h-3.5 w-3.5" />
                        <span>View Receipt</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Receipt Detail Sheet */}
      <Sheet open={!!selectedFeeId} onOpenChange={() => setSelectedFeeId(null)}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <div className="space-y-4 px-4 pt-4">
            {detailLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : feeDetail ? (
              <>
                <SheetHeader>
                  <div className="text-primary flex items-center gap-2 text-xs font-semibold">
                    <PiReceipt className="h-4 w-4" />
                    <span>Fee Receipt</span>
                  </div>
                  <SheetTitle className="text-lg font-bold">{feeDetail.month}</SheetTitle>
                  <SheetDescription className="text-xs">
                    {feeDetail.firstName} {feeDetail.lastName || ''} · Class {feeDetail.className}-
                    {feeDetail.section} · Roll #{feeDetail.rollNo}
                  </SheetDescription>
                </SheetHeader>

                <div className="space-y-1 rounded-md border bg-slate-50 p-3 text-xs dark:bg-zinc-800/50">
                  {feeDetail.feeBreakdown.length === 0 ? (
                    <p className="text-muted-foreground">No fee breakdown recorded.</p>
                  ) : (
                    feeDetail.feeBreakdown.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-muted-foreground">{item.feeType}:</span>
                        <span className="font-semibold">₹{item.amount.toLocaleString()}</span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span>Total Amount:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ₹{feeDetail.finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] ${STATUS_STYLES[feeDetail.status] ?? ''}`}
                >
                  {feeDetail.status}
                </Badge>
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StudentFees;
