import React, { useState } from 'react';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
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
import { DataTable, ErrorState } from '@/components/data-table';
import { TextField, NumberField, MonthField, SelectField } from '@/components/form';
import { financeService } from '@/lib/services/finance.service';
import { useFinanceStudentOptions } from '@/hooks/options/useFinanceOptions';
import {
  CreateStudentFeeBody,
  MAX_PAGE_SIZE,
  type StudentFeeRecord,
  type TxnStatus,
} from '@schoolerp/contracts';
import { getErrorMessage } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { toast } from 'sonner';
import { PiPlus, PiSparkle, PiTrash } from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const STATUS_OPTIONS: { value: TxnStatus; label: string }[] = [
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' },
];

const STATUS_STYLES: Record<string, string> = {
  Paid: 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Pending:
    'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Failed: 'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

const emptyFeeDefaults: CreateStudentFeeBody = {
  studentId: '',
  month: '',
  title: 'Term Fee',
  feeBreakdown: [{ feeType: 'Tuition Fee', amount: 0 }],
};

export const FinanceFees: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCollectOpen, setIsCollectOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudentFeeRecord | null>(null);
  const studentOptions = useFinanceStudentOptions();

  const {
    data: feesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.finance.fees({ pageSize: MAX_PAGE_SIZE }),
    queryFn: () => financeService.getStudentFees({ pageSize: MAX_PAGE_SIZE }),
  });
  const fees = feesResponse?.data ?? [];

  const { control, handleSubmit, reset } = useForm<CreateStudentFeeBody>({
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

  const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.finance.fees() });

  const collectMutation = useMutation({
    mutationFn: (body: CreateStudentFeeBody) => financeService.createStudentFee(body),
    onSuccess: () => {
      toast.success('Fee collected');
      invalidate();
      setIsCollectOpen(false);
      reset(emptyFeeDefaults);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ feeId, status }: { feeId: string; status: TxnStatus }) =>
      financeService.updateStudentFeeStatus(feeId, status),
    onSuccess: () => {
      toast.success('Status updated');
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (feeId: string) => financeService.deleteStudentFee(feeId),
    onSuccess: () => {
      toast.success('Fee record removed');
      invalidate();
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onCollectSubmit: SubmitHandler<CreateStudentFeeBody> = (values) =>
    collectMutation.mutate(values);

  const columns: ColumnDef<StudentFeeRecord, unknown>[] = [
    {
      accessorKey: 'studentId',
      header: 'Student',
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-medium">
            {row.original.firstName} {row.original.lastName ?? ''}
          </span>
          <div className="text-muted-foreground font-mono text-[10px]">
            {row.original.studentId}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'month',
      header: 'Month',
      cell: ({ row }) => <span className="text-xs">{row.original.month}</span>,
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <span className="text-xs">{row.original.title}</span>,
    },
    {
      accessorKey: 'finalAmount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="text-xs font-bold">₹{row.original.finalAmount.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <NativeSelect
          value={row.original.status}
          onChange={(e) =>
            statusMutation.mutate({ feeId: row.original.id, status: e.target.value as TxnStatus })
          }
          className={`h-7 w-28 text-[11px] ${STATUS_STYLES[row.original.status] ?? ''}`}
        >
          {STATUS_OPTIONS.map((opt) => (
            <NativeSelectOption key={opt.value} value={opt.value}>
              {opt.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
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
          size="icon"
          className="h-7 w-7 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteTarget(row.original);
          }}
          title="Delete"
        >
          <PiTrash className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Student Fees</h1>
            <Badge variant="outline" className="text-xs">
              {feesResponse?.total ?? 0} Records
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Collect fees, track status, and manage the student fee ledger.
          </p>
        </div>
        <Button
          onClick={() => {
            reset(emptyFeeDefaults);
            setIsCollectOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiPlus className="h-3.5 w-3.5" />
          <span>Collect Fee</span>
        </Button>
      </div>

      {isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <DataTable
            columns={columns}
            data={fees}
            isLoading={isLoading}
            emptyTitle="No fee records yet"
            emptyDescription="Collect the first student fee to get started."
            searchPlaceholder="Search by student name or ID…"
          />
        </Card>
      )}

      <Dialog open={isCollectOpen} onOpenChange={setIsCollectOpen}>
        <DialogContent className="sm:max-w-md">
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
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCollectOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={collectMutation.isPending}
                className="h-9 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              >
                {collectMutation.isPending ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <PiTrash className="h-4 w-4" />
              <span>Delete Fee Record</span>
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceFees;
