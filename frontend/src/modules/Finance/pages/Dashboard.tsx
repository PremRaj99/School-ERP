import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { financeService } from '@/lib/services/finance.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { Wallet, AlertTriangle, TrendingUp, Receipt } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const STATUS_STYLES: Record<string, string> = {
  Paid: 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Pending:
    'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Failed: 'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

export const FinanceDashboard: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.finance.dashboard(),
    queryFn: () => financeService.getDashboard(),
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-2 dark:border-zinc-800">
        <h1 className="text-2xl font-extrabold tracking-tight">Finance Dashboard</h1>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Pending collections, this month's spend, and the latest ledger activity.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : isError || !data ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardContent className="space-y-1.5 p-4">
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Pending Student Fees
                </div>
                <div className="text-2xl font-extrabold">
                  ₹{data.pendingStudentFees.totalAmount.toLocaleString()}
                </div>
                <div className="text-muted-foreground text-[11px]">
                  {data.pendingStudentFees.count} invoice
                  {data.pendingStudentFees.count === 1 ? '' : 's'} outstanding
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardContent className="space-y-1.5 p-4">
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                  Pending Salaries
                </div>
                <div className="text-2xl font-extrabold">
                  ₹{data.pendingTeacherSalaries.totalAmount.toLocaleString()}
                </div>
                <div className="text-muted-foreground text-[11px]">
                  {data.pendingTeacherSalaries.count} payout
                  {data.pendingTeacherSalaries.count === 1 ? '' : 's'} outstanding
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardContent className="space-y-1.5 p-4">
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                  Collected This Month
                </div>
                <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  ₹{data.collectedThisMonth.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardContent className="space-y-1.5 p-4">
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold">
                  <Wallet className="h-3.5 w-3.5 text-amber-600" />
                  Expenses This Month
                </div>
                <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                  ₹{data.expensesThisMonth.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <Receipt className="h-4 w-4 text-indigo-500" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs">
                The most recent ledger entries across fees, salaries, and expenses.
              </CardDescription>
            </CardHeader>
            {data.recentTransactions.length === 0 ? (
              <Empty className="rounded-none border-0 border-t">
                <EmptyMedia variant="icon">
                  <Receipt className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No activity yet</EmptyTitle>
                <EmptyDescription>Nothing has been logged to the ledger yet.</EmptyDescription>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                    <TableHead className="text-xs font-bold">Title</TableHead>
                    <TableHead className="text-xs font-bold">Category</TableHead>
                    <TableHead className="text-xs font-bold">Amount</TableHead>
                    <TableHead className="text-xs font-bold">Status</TableHead>
                    <TableHead className="text-xs font-bold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentTransactions.map((t) => (
                    <TableRow key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <TableCell className="text-xs font-medium">{t.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {t.expenseCategory ?? t.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-bold">
                        ₹{t.finalAmount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${STATUS_STYLES[t.status] ?? ''}`}
                        >
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{t.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default FinanceDashboard;
