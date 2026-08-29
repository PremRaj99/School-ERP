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
  UpdateStudentFeeBody,
  UpdateTeacherSalaryBody,
  type StudentFeeRecord,
  type StudentFeeDetail,
  type TeacherSalaryRecord,
  type FinanceAuditLogRecord,
  type TxnStatus,
} from '@schoolerp/contracts';
import { getErrorMessage } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { toast } from 'sonner';
import {
  PiCreditCard,
  PiPlus,
  PiPrinter,
  PiSparkle,
  PiReceipt,
  PiTrash,
  PiPencilSimple,
  PiClockCounterClockwise,
} from 'react-icons/pi';
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

  // Edit fee dialog state
  const [editingFee, setEditingFee] = useState<StudentFeeDetail | null>(null);
  const [isEditFeeOpen, setIsEditFeeOpen] = useState(false);

  // Edit salary dialog state
  const [editingSalary, setEditingSalary] = useState<TeacherSalaryRecord | null>(null);
  const [isEditSalaryOpen, setIsEditSalaryOpen] = useState(false);

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

  // Edit fee form
  const {
    control: editFeeControl,
    handleSubmit: handleEditFeeSubmit,
    watch: watchEditFee,
    reset: resetEditFee,
  } = useForm<UpdateStudentFeeBody>({
    resolver: zodResolver(UpdateStudentFeeBody),
    defaultValues: { month: '', title: '', feeBreakdown: [{ feeType: '', amount: 0 }] },
  });
  const {
    fields: editFeeRows,
    append: appendEditFeeRow,
    remove: removeEditFeeRow,
  } = useFieldArray({
    control: editFeeControl,
    name: 'feeBreakdown',
  });
  const watchedEditFeeBreakdown = watchEditFee('feeBreakdown');
  const editFeeTotal = (watchedEditFeeBreakdown ?? []).reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0,
  );

  // Edit salary form
  const {
    control: editSalaryControl,
    handleSubmit: handleEditSalarySubmit,
    reset: resetEditSalary,
  } = useForm<UpdateTeacherSalaryBody>({
    resolver: zodResolver(UpdateTeacherSalaryBody),
    defaultValues: { month: '', amount: 0 },
  });

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
      queryClient.invalidateQueries({ queryKey: qk.admin.financeAuditLogs() });
      setIsCollectFeeOpen(false);
      reset(emptyFeeDefaults);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const editFeeMutation = useMutation({
    mutationFn: ({ feeId, body }: { feeId: string; body: UpdateStudentFeeBody }) =>
      adminService.updateStudentFee(feeId, body),
    onSuccess: () => {
      toast.success('Fee updated successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.studentFees() });
      queryClient.invalidateQueries({ queryKey: qk.admin.analyticsFinance() });
      queryClient.invalidateQueries({ queryKey: qk.admin.financeAuditLogs() });
      setIsEditFeeOpen(false);
      setEditingFee(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const editSalaryMutation = useMutation({
    mutationFn: ({ salaryId, body }: { salaryId: string; body: UpdateTeacherSalaryBody }) =>
      adminService.updateTeacherSalary(salaryId, body),
    onSuccess: () => {
      toast.success('Salary updated successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.teacherSalaries() });
      queryClient.invalidateQueries({ queryKey: qk.admin.analyticsFinance() });
      queryClient.invalidateQueries({ queryKey: qk.admin.financeAuditLogs() });
      setIsEditSalaryOpen(false);
      setEditingSalary(null);
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
      queryClient.invalidateQueries({ queryKey: qk.admin.financeAuditLogs() });
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
      queryClient.invalidateQueries({ queryKey: qk.admin.financeAuditLogs() });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Audit log tab state
  const [auditPageIndex, setAuditPageIndex] = useState(0);
  const [auditEntityFilter, setAuditEntityFilter] = useState('');

  const auditLogQuery = {
    page: auditPageIndex + 1,
    pageSize: 10,
    entityType: (auditEntityFilter || undefined) as
      'StudentFee' | 'TeacherSalary' | 'Transaction' | undefined,
  };

  const { data: auditLogsResponse, isLoading: auditLogsLoading } = useQuery({
    queryKey: qk.admin.financeAuditLogs(auditLogQuery),
    queryFn: () => adminService.getFinanceAuditLogs(auditLogQuery),
  });
  const auditLogs = auditLogsResponse?.data ?? [];

  useEffect(() => {
    queueMicrotask(() => setAuditPageIndex(0));
  }, [auditEntityFilter]);

  const onCollectSubmit: SubmitHandler<CreateStudentFeeBody> = (values) => {
    collectFeeMutation.mutate(values);
  };

  const openReceiptModal = (fee: StudentFeeRecord) => {
    setSelectedReceipt(fee);
    setIsReceiptOpen(true);
  };

  const openEditFeeModal = async (fee: StudentFeeRecord) => {
    try {
      const detail = await adminService.getStudentFeeById(fee.id);
      setEditingFee(detail);
      resetEditFee({
        month: detail.month,
        title: detail.title,
        feeBreakdown: detail.feeBreakdown,
      });
      setIsEditFeeOpen(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEditSalaryModal = (salary: TeacherSalaryRecord) => {
    setEditingSalary(salary);
    resetEditSalary({
      month: salary.month,
      amount: salary.finalAmount,
    });
    setIsEditSalaryOpen(true);
  };

  const onEditFeeSubmit: SubmitHandler<UpdateStudentFeeBody> = (values) => {
    if (!editingFee) return;
    editFeeMutation.mutate({ feeId: editingFee.id, body: values });
  };

  const onEditSalarySubmit: SubmitHandler<UpdateTeacherSalaryBody> = (values) => {
    if (!editingSalary) return;
    editSalaryMutation.mutate({ salaryId: editingSalary.id, body: values });
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
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const fee = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:bg-primary/10 h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                openEditFeeModal(fee);
              }}
            >
              <PiPencilSimple className="mr-1 h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>
            {fee.status === 'Paid' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10 h-7 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  openReceiptModal(fee);
                }}
              >
                <PiPrinter className="mr-1 h-3.5 w-3.5" />
                <span>Receipt</span>
              </Button>
            )}
          </div>
        );
      },
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
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-primary/10 h-7 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            openEditSalaryModal(row.original);
          }}
        >
          <PiPencilSimple className="mr-1 h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>
      ),
    },
  ];

  const ACTION_BADGE_COLORS: Record<string, string> = {
    CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    UPDATE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    UPDATE_STATUS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    DELETE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  };

  const auditLogColumns: ColumnDef<FinanceAuditLogRecord, unknown>[] = [
    {
      accessorKey: 'createdAt',
      header: 'Timestamp',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.createdAt}</span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      enableSorting: false,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={`border-0 text-[10px] font-semibold ${ACTION_BADGE_COLORS[row.original.action] ?? ''}`}
        >
          {row.original.action.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      accessorKey: 'entityType',
      header: 'Type',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-xs font-medium">
          {row.original.entityType === 'StudentFee'
            ? 'Student Fee'
            : row.original.entityType === 'TeacherSalary'
              ? 'Teacher Salary'
              : 'Transaction'}
        </span>
      ),
    },
    {
      accessorKey: 'actorUsername',
      header: 'Actor',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-primary font-mono text-xs">{row.original.actorUsername}</span>
      ),
    },
    {
      id: 'summary',
      header: 'Summary',
      enableSorting: false,
      cell: ({ row }) => {
        const { action, before, after } = row.original;
        if (action === 'CREATE') {
          const a = after as Record<string, unknown> | null;
          return (
            <span className="text-xs">
              Created — ₹{((a?.finalAmount as number) ?? 0).toLocaleString()}
            </span>
          );
        }
        if (action === 'DELETE') {
          const b = before as Record<string, unknown> | null;
          return (
            <span className="text-xs text-rose-600 dark:text-rose-400">
              Deleted — ₹{((b?.finalAmount as number) ?? 0).toLocaleString()}
            </span>
          );
        }
        if (action === 'UPDATE_STATUS') {
          const b = before as Record<string, unknown> | null;
          const a = after as Record<string, unknown> | null;
          return (
            <span className="text-xs">
              Status: {(b?.status as string) ?? '?'} → {(a?.status as string) ?? '?'}
            </span>
          );
        }
        // UPDATE
        const b = before as Record<string, unknown> | null;
        const a = after as Record<string, unknown> | null;
        const oldAmt = (b?.finalAmount as number) ?? 0;
        const newAmt = (a?.finalAmount as number) ?? 0;
        return (
          <span className="text-xs">
            Edited
            {oldAmt !== newAmt
              ? ` — ₹${oldAmt.toLocaleString()} → ₹${newAmt.toLocaleString()}`
              : ''}
          </span>
        );
      },
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
          <TabsTrigger value="activityLog" className="rounded-md px-4 text-xs font-semibold">
            <PiClockCounterClockwise className="mr-1.5 h-3.5 w-3.5" />
            <span>Activity Log</span>
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

        {/* Activity Log Tab (admin-only) */}
        <TabsContent value="activityLog" className="space-y-4 pt-4 focus:outline-hidden">
          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <DataTable
              columns={auditLogColumns}
              data={auditLogs}
              isLoading={auditLogsLoading}
              emptyTitle="No activity logs yet"
              emptyDescription="Financial actions (create, edit, delete, status change) will be logged here."
              searchPlaceholder=""
              manual={{
                pageIndex: auditPageIndex,
                pageSize: 10,
                pageCount: auditLogsResponse?.totalPages ?? 1,
                totalRows: auditLogsResponse?.total ?? 0,
                onPageChange: setAuditPageIndex,
                search: '',
                onSearchChange: () => {},
                sorting: [],
                onSortingChange: () => {},
              }}
              toolbar={
                <select
                  value={auditEntityFilter}
                  onChange={(e) => setAuditEntityFilter(e.target.value)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="">All Types</option>
                  <option value="StudentFee">Student Fee</option>
                  <option value="TeacherSalary">Teacher Salary</option>
                  <option value="Transaction">Transaction</option>
                </select>
              }
            />
          </Card>
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
                  <div className="flex-2">
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
                      Gyandeep bal vikas vidyamandir
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

      {/* Edit Fee Modal */}
      <Dialog
        open={isEditFeeOpen}
        onOpenChange={(next) => {
          setIsEditFeeOpen(next);
          if (!next) setEditingFee(null);
        }}
      >
        <DialogContent className="sm:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiPencilSimple className="h-4 w-4" />
              <span>Edit Fee</span>
            </div>
            <DialogTitle className="text-lg font-bold">Edit Student Fee</DialogTitle>
          </DialogHeader>

          {editingFee && (
            <form onSubmit={handleEditFeeSubmit(onEditFeeSubmit)} className="space-y-4 pt-2">
              <div className="rounded-md bg-slate-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
                <span className="text-muted-foreground">Student:</span>{' '}
                <span className="font-semibold">
                  {editingFee.firstName} {editingFee.lastName ?? ''} ({editingFee.studentId})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MonthField control={editFeeControl} name="month" label="Billing Month" required />
                <TextField
                  control={editFeeControl}
                  name="title"
                  label="Fee Title"
                  placeholder="Term Fee"
                />
              </div>

              <div className="space-y-2 rounded-md bg-slate-50 p-3 dark:bg-zinc-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Fee Breakdown</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => appendEditFeeRow({ feeType: '', amount: 0 })}
                  >
                    <PiPlus className="mr-1 h-3 w-3" />
                    Add Row
                  </Button>
                </div>

                {editFeeRows.map((row, index) => (
                  <div key={row.id} className="flex items-end gap-2">
                    <div className="flex-2">
                      <TextField
                        control={editFeeControl}
                        name={`feeBreakdown.${index}.feeType`}
                        label={index === 0 ? 'Fee Type' : ''}
                        placeholder="e.g. Tuition Fee"
                      />
                    </div>
                    <div className="flex-1">
                      <NumberField
                        control={editFeeControl}
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
                      disabled={editFeeRows.length === 1}
                      onClick={() => removeEditFeeRow(index)}
                    >
                      <PiTrash className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <div className="flex justify-between border-t pt-2 text-xs font-bold text-slate-900 dark:text-white">
                  <span>Total Payable:</span>
                  <span>₹{editFeeTotal.toLocaleString()}</span>
                </div>
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditFeeOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editFeeMutation.isPending}
                  className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
                >
                  {editFeeMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Salary Modal */}
      <Dialog
        open={isEditSalaryOpen}
        onOpenChange={(next) => {
          setIsEditSalaryOpen(next);
          if (!next) setEditingSalary(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiPencilSimple className="h-4 w-4" />
              <span>Edit Salary</span>
            </div>
            <DialogTitle className="text-lg font-bold">Edit Teacher Salary</DialogTitle>
          </DialogHeader>

          {editingSalary && (
            <form onSubmit={handleEditSalarySubmit(onEditSalarySubmit)} className="space-y-4 pt-2">
              <div className="rounded-md bg-slate-50 px-3 py-2 text-xs dark:bg-zinc-800/50">
                <span className="text-muted-foreground">Teacher:</span>{' '}
                <span className="font-semibold">
                  {editingSalary.firstName} {editingSalary.lastName ?? ''} (
                  {editingSalary.teacherId})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <MonthField
                  control={editSalaryControl}
                  name="month"
                  label="Payroll Month"
                  required
                />
                <NumberField
                  control={editSalaryControl}
                  name="amount"
                  label="Amount"
                  currency
                  min={0}
                />
              </div>

              <DialogFooter className="pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditSalaryOpen(false)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editSalaryMutation.isPending}
                  className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
                >
                  {editSalaryMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinance;
