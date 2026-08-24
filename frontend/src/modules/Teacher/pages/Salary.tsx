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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { teacherService } from '@/lib/services/teacher.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import type { MySalaryRecord } from '@schoolerp/contracts';
import { PiPrinter, PiWallet } from 'react-icons/pi';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const statusStyles: Record<MySalaryRecord['status'], string> = {
  Paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Failed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

export const TeacherSalary: React.FC = () => {
  const [selectedSlip, setSelectedSlip] = useState<MySalaryRecord | null>(null);

  const {
    data: slips,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.teacher.salary(),
    queryFn: () => teacherService.getSalaryTransactions(),
  });

  const { list, totalPaid, latest } = useMemo(() => {
    const l = slips ?? [];
    const paid = l.filter((s) => s.status === 'Paid');
    return {
      list: l,
      totalPaid: paid.reduce((sum, s) => sum + s.finalAmount, 0),
      latest: [...l].sort((a, b) => b.month.localeCompare(a.month))[0],
    };
  }, [slips]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Faculty Compensation & Payslips
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              Salary History
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Review monthly salary payments and their disbursement status.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Most Recent Payment</span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {latest ? `₹${latest.finalAmount.toLocaleString()}` : '—'}
            </p>
            <span className="text-muted-foreground text-[11px]">
              {latest ? latest.month : 'No records yet'}
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Total Paid to Date</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{totalPaid.toLocaleString()}
            </p>
            <span className="text-muted-foreground text-[11px]">Across all recorded months</span>
          </CardContent>
        </Card>
      </div>

      {/* Payslip History Table */}
      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : list.length === 0 ? (
        <Empty className="rounded-md border">
          <EmptyMedia variant="icon">
            <PiWallet className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No salary records yet</EmptyTitle>
          <EmptyDescription>Payments will show up here once processed.</EmptyDescription>
        </Empty>
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                <TableHead className="text-xs font-bold">Month</TableHead>
                <TableHead className="text-xs font-bold">Amount</TableHead>
                <TableHead className="text-xs font-bold">Paid On</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
                <TableHead className="text-right text-xs font-bold">Statement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...list]
                .sort((a, b) => b.month.localeCompare(a.month))
                .map((slip) => (
                  <TableRow
                    key={slip.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                  >
                    <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                      {slip.month}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{slip.finalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{slip.paidAt}</TableCell>
                    <TableCell className="text-xs">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold ${statusStyles[slip.status]}`}
                      >
                        {slip.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary hover:bg-primary/10 h-7 text-xs"
                        onClick={() => setSelectedSlip(slip)}
                      >
                        <PiPrinter className="mr-1 h-3.5 w-3.5" />
                        <span>View</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Payslip View Modal */}
      <Dialog open={!!selectedSlip} onOpenChange={() => setSelectedSlip(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedSlip && (
            <div className="space-y-4 pt-2">
              <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-5 text-xs dark:border-zinc-700 dark:bg-zinc-800/60">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Salary Statement
                    </h3>
                    <p className="text-muted-foreground text-[10px]">{selectedSlip.month}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] ${statusStyles[selectedSlip.status]}`}
                  >
                    {selectedSlip.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground text-[10px]">Paid On:</span>
                    <p className="font-semibold">{selectedSlip.paidAt}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Record ID:</span>
                    <p className="font-mono font-bold">{selectedSlip.id}</p>
                  </div>
                </div>

                <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-900 dark:text-white">
                  <span>Amount:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    ₹{selectedSlip.finalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <Button
                className="bg-primary hover:bg-primary/90 w-full text-xs text-white"
                onClick={() => toast.success('Sending statement to printer...')}
              >
                <PiPrinter className="mr-1.5 h-3.5 w-3.5" />
                <span>Print Statement</span>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherSalary;
