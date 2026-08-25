import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DataTable, ErrorState } from '@/components/data-table';
import { TextField, NumberField, MonthField, SelectField } from '@/components/form';
import { ExpenseManager } from '@/components/finance/ExpenseManager';
import { adminService } from '@/lib/services/admin.service';
import { useStudentOptions } from '@/hooks/options/useAdminOptions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  CreateStudentFeeBody,
  type StudentFeeRecord,
  type TeacherSalaryRecord,
  type TxnStatus,
} from '@schoolerp/contracts';
import { getErrorMessage } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { toast } from 'sonner';
import { PiCreditCard, PiPlus, PiPrinter, PiSparkle, PiReceipt, PiTrash } from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STATUS_OPTIONS: { value: TxnStatus; label: string }[] = [
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' },
];

/** Column-id -> the backend's actual sortable field for each ledger (ALIGNMENT_PLAN.md 2C/P1). */
const SORT_FIELD_BY_COLUMN_ID: Record<string, 'month' | 'finalAmount' | 'paidAt'> = {
  month: 'month',
  finalAmount: 'finalAmount',
  paidAt: 'paidAt',
};

const emptyFeeDefaults: CreateStudentFeeBody = {
  studentId: '',
  month: '',
  title: 'Term Fee',
  feeBreakdown: [{ feeType: 'Tuition Fee', amount: 0 }],
};

export const AdminFinance: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<StudentFeeRecord | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Student fee ledger — search/sort/page/status all server-side now.
  const [feeSearch, setFeeSearch] = useState('');
  const debouncedFeeSearch = useDebouncedValue(feeSearch);
  const [feePageIndex, setFeePageIndex] = useState(0);
  const [feeSorting, setFeeSorting] = useState<SortingState>([]);
  const [feeStatusFilter, setFeeStatusFilter] = useState('');

  // Teacher payroll ledger — same treatment, independent state.
  const [salarySearch, setSalarySearch] = useState('');
  const debouncedSalarySearch = useDebouncedValue(salarySearch);
  const [salaryPageIndex, setSalaryPageIndex] = useState(0);
  const [salarySorting, setSalarySorting] = useState<SortingState>([]);
  const [salaryStatusFilter, setSalaryStatusFilter] = useState('');

  useEffect(() => {
    queueMicrotask(() => setFeePageIndex(0));
  }, [debouncedFeeSearch, feeStatusFilter]);
  useEffect(() => {
    queueMicrotask(() => setSalaryPageIndex(0));
  }, [debouncedSalarySearch, salaryStatusFilter]);

  const studentOptions = useStudentOptions();

  const { control, handleSubmit, watch, reset } = useForm<CreateStudentFeeBody>({
    resolver: zodResolver(CreateStudentFeeBody),
    defaultValues: emptyFeeDefaults,
  });
  const {
    fields: feeRows,
    append: appendFeeRow,
    remove: removeFeeRow,
  } = useFieldArray({
    control,
    name: 'feeBreakdown',
  });
  const watchedFeeBreakdown = watch('feeBreakdown');
  const feeTotal = watchedFeeBreakdown.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);

  const feeSort = feeSorting[0];
  const feeListQuery = {
    page: feePageIndex + 1,
    pageSize: 10,
    q: debouncedFeeSearch || undefined,
    status: (feeStatusFilter || undefined) as TxnStatus | undefined,
    sortBy: feeSort ? SORT_FIELD_BY_COLUMN_ID[feeSort.id] : undefined,
    sortDir: feeSort ? ((feeSort.desc ? 'desc' : 'asc') as 'asc' | 'desc') : undefined,
  };

  const salarySort = salarySorting[0];
  const salaryListQuery = {
    page: salaryPageIndex + 1,
    pageSize: 10,
    q: debouncedSalarySearch || undefined,
    status: (salaryStatusFilter || undefined) as TxnStatus | undefined,
    sortBy: salarySort ? SORT_FIELD_BY_COLUMN_ID[salarySort.id] : undefined,
    sortDir: salarySort ? ((salarySort.desc ? 'desc' : 'asc') as 'asc' | 'desc') : undefined,
  };

  const {
    data: feesResponse,
    isLoading: feesLoading,
    isError: feesErrored,
    error: feesError,
    refetch: refetchFees,
  } = useQuery({
    queryKey: qk.admin.studentFees(feeListQuery),
    queryFn: () => adminService.getStudentFees(feeListQuery),
  });
  const studentFees = feesResponse?.data ?? [];

  const {
    data: salariesResponse,
    isLoading: salariesLoading,
    isError: salariesErrored,
    error: salariesError,
    refetch: refetchSalaries,
  } = useQuery({
    queryKey: qk.admin.teacherSalaries(salaryListQuery),
    queryFn: () => adminService.getTeacherSalaries(salaryListQuery),
  });
  const teacherSalaries = salariesResponse?.data ?? [];

  // Summary strip needs real totals across every record, not just the current page — sourced from
  // the same aggregate the Analytics → Finance tab already computes correctly, rather than summing
  // a page of paginated rows (ALIGNMENT_PLAN.md 2C/P1 broke the old "sum the loaded array" approach
  // the moment this list stopped returning everything in one response).
  const { data: financeAnalytics } = useQuery({
    queryKey: qk.admin.analyticsFinance(),
    queryFn: () => adminService.getAnalyticsFinance(),
  });
  const feesRealized = (financeAnalytics?.monthly ?? []).reduce((sum, m) => sum + m.collected, 0);
  const feesPending = (financeAnalytics?.monthly ?? []).reduce((sum, m) => sum + m.pending, 0);
  const payrollDisbursed = (financeAnalytics?.salaryVsCollection ?? []).reduce(
    (sum, m) => sum + m.salaryBurn,
    0,
  );
  const pendingFeeCount = financeAnalytics?.defaulters.length ?? 0;

  const collectFeeMutation = useMutation({
    mutationFn: (payload: CreateStudentFeeBody) => adminService.createStudentFee(payload),
    onSuccess: () => {
      toast.success('Fee payment recorded successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.studentFees() });
      queryClient.invalidateQueries({ queryKey: qk.admin.analyticsFinance() });
      setIsCollectFeeOpen(false);
      reset(emptyFeeDefaults);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateFeeStatusMutation = useMutation({
    mutationFn: ({ feeId, status }: { feeId: string; status: TxnStatus }) =>
      adminService.updateStudentFeeStatus(feeId, status),
    onSuccess: () => {
      toast.success('Fee status updated!');
      queryClient.invalidateQueries({ queryKey: qk.admin.studentFees() });
      queryClient.invalidateQueries({ queryKey: qk.admin.analyticsFinance() });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateSalaryStatusMutation = useMutation({
    mutationFn: ({ salaryId, status }: { salaryId: string; status: TxnStatus }) =>
      adminService.updateTeacherSalaryStatus(salaryId, status),
    onSuccess: () => {
      toast.success('Salary status updated!');
      queryClient.invalidateQueries({ queryKey: qk.admin.teacherSalaries() });
      queryClient.invalidateQueries({ queryKey: qk.admin.analyticsFinance() });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onCollectSubmit: SubmitHandler<CreateStudentFeeBody> = (values) => {
    collectFeeMutation.mutate(values);
  };

  const openReceiptModal = (fee: StudentFeeRecord) => {
    setSelectedReceipt(fee);
    setIsReceiptOpen(true);
  };

  const feeColumns: ColumnDef<StudentFeeRecord, unknown>[] = [
    {
      accessorKey: 'studentId',
      header: 'Student ID',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-primary font-mono text-xs font-bold">{row.original.studentId}</span>
      ),
    },
    {
      accessorKey: 'month',
      header: 'Billing Month',
      cell: ({ row }) => <span className="text-xs">{row.original.month}</span>,
    },
    {
      accessorKey: 'finalAmount',
      header: 'Total Amount',
      cell: ({ row }) => (
        <span className="text-xs font-bold">₹{row.original.finalAmount.toLocaleString()}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        const fee = row.original;
        const isPaid = fee.status === 'Paid';
        return (
          <NativeSelect
            value={fee.status}
            onChange={(e) =>
              updateFeeStatusMutation.mutate({ feeId: fee.id, status: e.target.value as TxnStatus })
            }
            disabled={updateFeeStatusMutation.isPending}
            className={`h-7 w-28 text-[11px] font-semibold ${
              isPaid
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <NativeSelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        );
      },
    },
    {
      accessorKey: 'paidAt',
      header: 'Payment Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.paidAt}</span>
      ),
    },
    {
      id: 'receipt',
      header: 'Receipt',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) =>
        row.original.status === 'Paid' ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:bg-primary/10 h-7 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              openReceiptModal(row.original);
            }}
          >
            <PiPrinter className="mr-1 h-3.5 w-3.5" />
            <span>Print Receipt</span>
          </Button>
        ) : null,
    },
  ];

  const salaryColumns: ColumnDef<TeacherSalaryRecord, unknown>[] = [
    {
      accessorKey: 'teacherId',
      header: 'Teacher ID',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {row.original.teacherId}
        </span>
      ),
    },
    {
      accessorKey: 'month',
      header: 'Payroll Month',
      cell: ({ row }) => <span className="text-xs">{row.original.month}</span>,
    },
    {
      accessorKey: 'finalAmount',
      header: 'Salary Amount',
      cell: ({ row }) => (
        <span className="text-xs font-bold">₹{row.original.finalAmount.toLocaleString()}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      enableSorting: false,
      cell: ({ row }) => {
        const sal = row.original;
        const isPaid = sal.status === 'Paid';
        return (
          <NativeSelect
            value={sal.status}
            onChange={(e) =>
              updateSalaryStatusMutation.mutate({
                salaryId: sal.id,
                status: e.target.value as TxnStatus,
              })
            }
            disabled={updateSalaryStatusMutation.isPending}
            className={`h-7 w-28 text-[11px] font-semibold ${
              isPaid
                ? 'text-emerald-700 dark:text-emerald-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}
          >
            {STATUS_OPTIONS.map((opt) => (
              <NativeSelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        );
      },
    },
    {
      accessorKey: 'paidAt',
      header: 'Disbursed Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.paidAt}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Institutional Finance & Fee Ledger
            </h1>
            <Badge variant="outline" className="text-xs">
              Audit Session 2025-2026
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Real-time tuition fee collections, payment receipts, and faculty payroll disbursements.
          </p>
        </div>

        <Button
          onClick={() => setIsCollectFeeOpen(true)}
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiPlus className="h-3.5 w-3.5" />
          <span>Collect Student Fee</span>
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">
              Term Fee Realization
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              ₹{feesRealized.toLocaleString()}
            </p>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {feesResponse?.total ?? 0} records
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">
              Faculty Payroll Disbursed
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              ₹{payrollDisbursed.toLocaleString()}
            </p>
            <span className="text-primary text-[11px] font-semibold">
              {salariesResponse?.total ?? 0} records
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">
              Pending Student Dues
            </span>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{feesPending.toLocaleString()}
            </p>
            <span className="text-muted-foreground text-[11px]">
              {pendingFeeCount} invoice{pendingFeeCount === 1 ? '' : 's'} outstanding
            </span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="studentFees" className="w-full">
        <TabsList className="h-10 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="studentFees" className="rounded-md px-4 text-xs font-semibold">
            <PiReceipt className="mr-1.5 h-3.5 w-3.5" />
            <span>Student Fee Collection</span>
          </TabsTrigger>
          <TabsTrigger value="teacherSalary" className="rounded-md px-4 text-xs font-semibold">
            <PiCreditCard className="mr-1.5 h-3.5 w-3.5" />
            <span>Faculty Payroll Ledger</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="rounded-md px-4 text-xs font-semibold">
            <PiReceipt className="mr-1.5 h-3.5 w-3.5" />
            <span>Expenses</span>
          </TabsTrigger>
        </TabsList>

        {/* Student Fee Ledger Tab */}
        <TabsContent value="studentFees" className="space-y-4 pt-4 focus:outline-hidden">
          {feesErrored ? (
            <ErrorState description={getErrorMessage(feesError)} onRetry={() => refetchFees()} />
          ) : (
            <Card className="overflow-hidden border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <DataTable
                columns={feeColumns}
                data={studentFees}
                isLoading={feesLoading}
                emptyTitle="No fee records yet"
                emptyDescription={
                  feeStatusFilter || feeSearch
                    ? 'No fees match this filter.'
                    : 'Collect the first student fee payment.'
                }
                emptyAction={
                  !feeStatusFilter &&
                  !feeSearch && (
                    <Button
                      size="sm"
                      className="mt-1 text-xs"
                      onClick={() => setIsCollectFeeOpen(true)}
                    >
                      <PiPlus className="mr-1 h-3.5 w-3.5" />
                      Collect Student Fee
                    </Button>
                  )
                }
                searchPlaceholder="Search by student name or ID…"
                manual={{
                  pageIndex: feePageIndex,
                  pageSize: 10,
                  pageCount: feesResponse?.totalPages ?? 1,
                  totalRows: feesResponse?.total ?? 0,
                  onPageChange: setFeePageIndex,
                  search: feeSearch,
                  onSearchChange: setFeeSearch,
                  sorting: feeSorting,
                  onSortingChange: setFeeSorting,
                }}
                toolbar={
                  <select
                    value={feeStatusFilter}
                    onChange={(e) => setFeeStatusFilter(e.target.value)}
                    className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                }
              />
            </Card>
          )}
        </TabsContent>

        {/* Teacher Payroll Tab */}
        <TabsContent value="teacherSalary" className="space-y-4 pt-4 focus:outline-hidden">
          {salariesErrored ? (
            <ErrorState
              description={getErrorMessage(salariesError)}
              onRetry={() => refetchSalaries()}
            />
          ) : (
            <Card className="overflow-hidden border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <DataTable
                columns={salaryColumns}
                data={teacherSalaries}
                isLoading={salariesLoading}
                emptyTitle="No payroll records yet"
                emptyDescription={
                  salaryStatusFilter || salarySearch
                    ? 'No salary records match this filter.'
                    : 'Salary records will show up here once created.'
                }
                searchPlaceholder="Search by teacher name or ID…"
                manual={{
                  pageIndex: salaryPageIndex,
                  pageSize: 10,
                  pageCount: salariesResponse?.totalPages ?? 1,
                  totalRows: salariesResponse?.total ?? 0,
                  onPageChange: setSalaryPageIndex,
                  search: salarySearch,
                  onSearchChange: setSalarySearch,
                  sorting: salarySorting,
                  onSortingChange: setSalarySorting,
                }}
                toolbar={
                  <select
                    value={salaryStatusFilter}
                    onChange={(e) => setSalaryStatusFilter(e.target.value)}
                    className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                }
              />
            </Card>
          )}
        </TabsContent>

        {/* Expenses Tab (books, whiteboards, supplies, ... — ALIGNMENT_PLAN.md P4) */}
        <TabsContent value="expenses" className="pt-4 focus:outline-hidden">
          <ExpenseManager
            adapter={{
              list: () => adminService.getTransactions(),
              create: (body) => adminService.createTransaction(body),
              update: (id, body) => adminService.updateTransaction(id, body),
              remove: (id) => adminService.deleteTransaction(id),
              categories: () => adminService.getExpenseCategories(),
              listQueryKey: qk.admin.transactions(),
              categoriesQueryKey: qk.admin.expenseCategories(),
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Collect Fee Modal */}
      <Dialog
        open={isCollectFeeOpen}
        onOpenChange={(next) => {
          setIsCollectFeeOpen(next);
          if (!next) reset(emptyFeeDefaults);
        }}
      >
        <DialogContent className="sm:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiSparkle className="h-4 w-4" />
              <span>Accounts Desk</span>
            </div>
            <DialogTitle className="text-lg font-bold">Collect Student Term Fee</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onCollectSubmit)} className="space-y-4 pt-2">
            <SelectField
              control={control}
              name="studentId"
              label="Student"
              required
              options={studentOptions}
              placeholder="Select a student…"
            />

            <div className="grid grid-cols-2 gap-3">
              <MonthField control={control} name="month" label="Billing Month" required />
              <TextField control={control} name="title" label="Fee Title" placeholder="Term Fee" />
            </div>

            <div className="space-y-2 rounded-md bg-slate-50 p-3 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Fee Breakdown</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => appendFeeRow({ feeType: '', amount: 0 })}
                >
                  <PiPlus className="mr-1 h-3 w-3" />
                  Add Row
                </Button>
              </div>

              {feeRows.map((row, index) => (
                <div key={row.id} className="flex items-end gap-2">
                  <div className="flex-[2]">
                    <TextField
                      control={control}
                      name={`feeBreakdown.${index}.feeType`}
                      label={index === 0 ? 'Fee Type' : ''}
                      placeholder="e.g. Tuition Fee"
                    />
                  </div>
                  <div className="flex-1">
                    <NumberField
                      control={control}
                      name={`feeBreakdown.${index}.amount`}
                      label={index === 0 ? 'Amount' : ''}
                      currency
                      min={0}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mb-1 h-8 w-8 shrink-0 text-rose-600"
                    disabled={feeRows.length === 1}
                    onClick={() => removeFeeRow(index)}
                  >
                    <PiTrash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}

              <div className="flex justify-between border-t pt-2 text-xs font-bold text-slate-900 dark:text-white">
                <span>Total Payable:</span>
                <span>₹{feeTotal.toLocaleString()}</span>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCollectFeeOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={collectFeeMutation.isPending}
                className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
              >
                {collectFeeMutation.isPending ? 'Processing...' : 'Confirm Payment & Receipt'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Payment Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-lg lg:max-w-xl">
          {selectedReceipt && (
            <div className="space-y-4 pt-2">
              <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-5 text-xs dark:border-zinc-700 dark:bg-zinc-800/60">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      GYAN DEEP BAAL VIKAS VIDYA MANDIR
                    </h3>
                    <p className="text-muted-foreground text-[10px]">Official Fee Receipt</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-[9px] text-emerald-600"
                  >
                    PAID
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground text-[10px]">Student ID:</span>
                    <p className="font-mono font-bold">{selectedReceipt.studentId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Receipt #:</span>
                    <p className="font-mono font-bold">{selectedReceipt.id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Month:</span>
                    <p className="font-semibold">{selectedReceipt.month}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Payment Date:</span>
                    <p className="font-semibold">{selectedReceipt.paidAt}</p>
                  </div>
                </div>

                <div className="space-y-1 border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{selectedReceipt.title}:</span>
                    <span className="font-semibold">
                      ₹{selectedReceipt.finalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span>Total Paid:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ₹{selectedReceipt.finalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="bg-primary hover:bg-primary/90 w-full text-xs text-white"
                  onClick={() => toast.success('Sending receipt to printer...')}
                >
                  <PiPrinter className="mr-1.5 h-3.5 w-3.5" />
                  <span>Print Formal Receipt</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinance;
