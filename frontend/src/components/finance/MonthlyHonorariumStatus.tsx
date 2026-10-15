import React, { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PiCheckCircle, PiLightning, PiPlus, PiReceipt } from 'react-icons/pi';
import type {
  MonthlyStatusFilter,
  TeacherMonthlyStatusQuery,
  TeacherMonthlyStatusRow,
} from '@schoolerp/contracts';
import { MAX_PAGE_SIZE } from '@schoolerp/contracts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable, ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { MonthlyStatusBadge, MonthlySummaryCards, StatusFilterChips } from './monthlyStatus';
import { SessionMonthPicker } from '@/components/filters';
import { defaultMonth } from '@/lib/session';
import { formatMonth, formatRupees } from '@/lib/finance-format';

interface Props {
  /** The Finance page's session — the month picker stays inside it. */
  session: string;
  onOpenSummary: (teacherId: string) => void;
}

/**
 * "Who has / hasn't been paid this month" view for staff honorarium: every teacher on the roster
 * for the chosen month, including those with no honorarium record generated yet.
 */
export const MonthlyHonorariumStatus: React.FC<Props> = ({ session, onOpenSummary }) => {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(() => defaultMonth(session));
  const [status, setStatus] = useState<MonthlyStatusFilter | ''>('Unpaid');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    queueMicrotask(() => setPageIndex(0));
  }, [month, status, debouncedSearch]);

  const query: TeacherMonthlyStatusQuery = {
    month,
    page: pageIndex + 1,
    pageSize: 15,
    status: status || undefined,
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    enabled: !!month,
    queryKey: qk.admin.teacherSalaryMonthlyStatus(query),
    queryFn: () => adminService.getTeacherSalaryMonthlyStatus(query),
    placeholderData: (prev) => prev,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.admin.teacherSalaries() });
    queryClient.invalidateQueries({ queryKey: qk.admin.analyticsFinance() });
    queryClient.invalidateQueries({ queryKey: qk.admin.dashboard() });
    queryClient.invalidateQueries({ queryKey: qk.admin.financeAuditLogs() });
  };

  const markPaid = useMutation({
    mutationFn: (salaryId: string) => adminService.updateTeacherSalaryStatus(salaryId, 'Paid'),
    onSuccess: () => {
      toast.success('Marked as disbursed.');
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const generateOne = useMutation({
    mutationFn: (teacherId: string) => adminService.createTeacherSalary({ teacherId, month }),
    onSuccess: () => {
      toast.success('Honorarium record created (Pending).');
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Creates a Pending record at each teacher's standard monthly honorarium for everyone who
  // doesn't have one for this month yet.
  const generateMissing = useMutation({
    mutationFn: async () => {
      const missing = await adminService.getTeacherSalaryMonthlyStatus({
        month,
        status: 'NotGenerated',
        pageSize: MAX_PAGE_SIZE,
      });
      const results = await Promise.allSettled(
        missing.data.map((t) =>
          adminService.createTeacherSalary({ teacherId: t.teacherId, month }),
        ),
      );
      return {
        created: results.filter((r) => r.status === 'fulfilled').length,
        failed: results.filter((r) => r.status === 'rejected').length,
      };
    },
    onSuccess: ({ created, failed }) => {
      if (created === 0 && failed === 0) toast.info('Every teacher already has a record.');
      else if (failed > 0) toast.warning(`Created ${created}, failed ${failed}.`);
      else toast.success(`Created ${created} honorarium record${created === 1 ? '' : 's'}.`);
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const notGenerated = data?.summary.notGeneratedCount ?? 0;

  const columns: ColumnDef<TeacherMonthlyStatusRow, unknown>[] = [
    {
      id: 'teacher',
      header: 'Staff Member',
      enableSorting: false,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {[t.firstName, t.lastName].filter(Boolean).join(' ')}
            </p>
            <p className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {t.teacherId}
            </p>
          </div>
        );
      },
    },
    {
      id: 'phone',
      header: 'Phone',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.phone ?? '—'}</span>
      ),
    },
    {
      id: 'amount',
      header: 'Amount',
      enableSorting: false,
      cell: ({ row }) => {
        const t = row.original;
        return t.amount != null ? (
          <span className="text-xs font-bold tabular-nums">{formatRupees(t.amount)}</span>
        ) : (
          <span className="text-muted-foreground text-xs tabular-nums">
            {formatRupees(t.salaryPerMonth)} <span className="text-[10px]">(standard)</span>
          </span>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => <MonthlyStatusBadge status={row.original.status} />,
    },
    {
      id: 'paidOn',
      header: 'Disbursed On',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {row.original.paidOn ? isoToDisplayDate(row.original.paidOn) : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {t.status === 'NotGenerated' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10 h-7 text-xs"
                disabled={generateOne.isPending}
                onClick={() => generateOne.mutate(t.teacherId)}
              >
                <PiPlus className="mr-1 h-3.5 w-3.5" />
                Generate
              </Button>
            )}
            {(t.status === 'Pending' || t.status === 'Failed') && t.salaryId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                disabled={markPaid.isPending}
                onClick={() => markPaid.mutate(t.salaryId!)}
              >
                <PiCheckCircle className="mr-1 h-3.5 w-3.5" />
                Mark disbursed
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onOpenSummary(t.teacherId)}
            >
              <PiReceipt className="mr-1 h-3.5 w-3.5" />
              Summary
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <SessionMonthPicker value={month} onChange={setMonth} session={session} />
        <Button
          size="sm"
          variant="outline"
          className="h-9 text-xs"
          disabled={notGenerated === 0 || generateMissing.isPending}
          onClick={() => {
            if (
              window.confirm(
                `Create Pending honorarium records for ${notGenerated} staff member${
                  notGenerated === 1 ? '' : 's'
                } for ${formatMonth(month)} at their standard monthly amount?`,
              )
            ) {
              generateMissing.mutate();
            }
          }}
        >
          <PiLightning className="mr-1 h-3.5 w-3.5" />
          {generateMissing.isPending ? 'Generating…' : `Generate missing (${notGenerated})`}
        </Button>
        <p className="text-muted-foreground ml-auto self-center text-xs">
          Honorarium status for{' '}
          <span className="text-foreground font-semibold">{formatMonth(month)}</span>
        </p>
      </div>

      <MonthlySummaryCards
        summary={data?.summary}
        people="staff"
        paidLabel="Honorarium disbursed"
      />

      {isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="mb-3">
            <StatusFilterChips value={status} onChange={setStatus} summary={data?.summary} />
          </div>
          <DataTable
            columns={columns}
            data={data?.data ?? []}
            isLoading={isLoading}
            emptyTitle={status === 'Unpaid' ? 'Everyone has been paid' : 'No staff found'}
            emptyDescription={
              status === 'Unpaid'
                ? `No outstanding honorarium for ${formatMonth(month)}.`
                : 'Try a different month or status filter.'
            }
            searchPlaceholder="Search by staff name or ID…"
            onRowClick={(row) => onOpenSummary(row.teacherId)}
            exportFilename={`honorarium-status-${month}`}
            manual={{
              pageIndex,
              pageSize: 15,
              pageCount: data?.totalPages ?? 1,
              totalRows: data?.total ?? 0,
              onPageChange: setPageIndex,
              search,
              onSearchChange: setSearch,
              sorting: [],
              onSortingChange: () => {},
            }}
          />
        </Card>
      )}
    </div>
  );
};
