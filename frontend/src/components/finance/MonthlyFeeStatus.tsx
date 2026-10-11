import React, { useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PiCheckCircle, PiPlus, PiReceipt } from 'react-icons/pi';
import type {
  MonthlyStatusFilter,
  StudentMonthlyStatusQuery,
  StudentMonthlyStatusRow,
} from '@schoolerp/contracts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { useClassNameOptions, useSectionOptions } from '@/hooks/options/useAdminOptions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { MonthlyStatusBadge, MonthlySummaryCards, StatusFilterChips } from './monthlyStatus';
import { currentISOMonth, formatMonth, formatRupees, selectClass } from '@/lib/finance-format';

interface Props {
  /** Opens the page's Collect Fee dialog prefilled for this student and month. */
  onCreateInvoice: (studentId: string, month: string) => void;
  onOpenSummary: (studentId: string) => void;
}

/**
 * "Who has / hasn't paid this month" view: every student on the roster for the chosen month with
 * their fee status, including students with no fee record generated yet.
 */
export const MonthlyFeeStatus: React.FC<Props> = ({ onCreateInvoice, onOpenSummary }) => {
  const queryClient = useQueryClient();
  const [month, setMonth] = useState(currentISOMonth);
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [status, setStatus] = useState<MonthlyStatusFilter | ''>('Unpaid');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [pageIndex, setPageIndex] = useState(0);

  const classOptions = useClassNameOptions();
  const sectionOptions = useSectionOptions(className || undefined);

  useEffect(() => {
    queueMicrotask(() => setPageIndex(0));
  }, [month, className, section, status, debouncedSearch]);

  const query: StudentMonthlyStatusQuery = {
    month,
    page: pageIndex + 1,
    pageSize: 15,
    className: className || undefined,
    section: section || undefined,
    status: status || undefined,
    q: debouncedSearch || undefined,
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    enabled: !!month,
    queryKey: qk.admin.studentFeeMonthlyStatus(query),
    queryFn: () => adminService.getStudentFeeMonthlyStatus(query),
    placeholderData: (prev) => prev,
  });

  const markPaid = useMutation({
    mutationFn: (feeId: string) => adminService.updateStudentFeeStatus(feeId, 'Paid'),
    onSuccess: () => {
      toast.success('Marked as paid.');
      queryClient.invalidateQueries({ queryKey: qk.admin.studentFees() });
      queryClient.invalidateQueries({ queryKey: qk.admin.analyticsFinance() });
      queryClient.invalidateQueries({ queryKey: qk.admin.financeAuditLogs() });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const columns: ColumnDef<StudentMonthlyStatusRow, unknown>[] = [
    {
      id: 'student',
      header: 'Student',
      enableSorting: false,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">
              {[s.firstName, s.lastName].filter(Boolean).join(' ')}
            </p>
            <p className="text-primary font-mono text-[10px] font-bold">{s.studentId}</p>
          </div>
        );
      },
    },
    {
      id: 'class',
      header: 'Class',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs whitespace-nowrap">
          {row.original.className ? `${row.original.className}-${row.original.section ?? ''}` : '—'}{' '}
          <span className="text-muted-foreground">· Roll {row.original.rollNo}</span>
        </span>
      ),
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
      cell: ({ row }) => (
        <span className="text-xs font-bold tabular-nums">
          {row.original.amount != null ? formatRupees(row.original.amount) : '—'}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => <MonthlyStatusBadge status={row.original.status} />,
    },
    {
      id: 'paidOn',
      header: 'Paid On',
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
        const s = row.original;
        return (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {s.status === 'NotGenerated' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10 h-7 text-xs"
                onClick={() => onCreateInvoice(s.studentId, month)}
              >
                <PiPlus className="mr-1 h-3.5 w-3.5" />
                Create invoice
              </Button>
            )}
            {(s.status === 'Pending' || s.status === 'Failed') && s.feeId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                disabled={markPaid.isPending}
                onClick={() => markPaid.mutate(s.feeId!)}
              >
                <PiCheckCircle className="mr-1 h-3.5 w-3.5" />
                Mark paid
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onOpenSummary(s.studentId)}
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
        <label className="text-muted-foreground flex flex-col gap-1 text-[11px] font-semibold">
          Month
          <Input
            type="month"
            value={month}
            onChange={(e) => e.target.value && setMonth(e.target.value)}
            className="h-9 w-40 text-xs"
          />
        </label>
        <label className="text-muted-foreground flex flex-col gap-1 text-[11px] font-semibold">
          Class
          <select
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              setSection('');
            }}
            className={selectClass}
          >
            <option value="">All classes</option>
            {classOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-muted-foreground flex flex-col gap-1 text-[11px] font-semibold">
          Section
          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            disabled={!className}
            className={selectClass}
          >
            <option value="">All sections</option>
            {sectionOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <p className="text-muted-foreground ml-auto self-center text-xs">
          Fee status for <span className="text-foreground font-semibold">{formatMonth(month)}</span>
        </p>
      </div>

      <MonthlySummaryCards summary={data?.summary} people="students" paidLabel="Fee submitted" />

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
            emptyTitle={status === 'Unpaid' ? 'Everyone has paid' : 'No students found'}
            emptyDescription={
              status === 'Unpaid'
                ? `No outstanding fees for ${formatMonth(month)} with these filters.`
                : 'Try a different month, class or status filter.'
            }
            searchPlaceholder="Search by student name or ID…"
            onRowClick={(row) => onOpenSummary(row.studentId)}
            exportFilename={`fee-status-${month}`}
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
