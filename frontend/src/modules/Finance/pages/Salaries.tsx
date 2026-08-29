import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
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
import { NumberField, MonthField, SelectField } from '@/components/form';
import { financeService } from '@/lib/services/finance.service';
import { useFinanceTeacherOptions } from '@/hooks/options/useFinanceOptions';
import {
  CreateTeacherSalaryBody,
  MAX_PAGE_SIZE,
  type TeacherSalaryRecord,
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

const emptyDefaults: CreateTeacherSalaryBody = { teacherId: '', month: '', amount: undefined };

export const FinanceSalaries: React.FC = () => {
  const queryClient = useQueryClient();
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TeacherSalaryRecord | null>(null);
  const teacherOptions = useFinanceTeacherOptions();

  const {
    data: salariesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.finance.salaries({ pageSize: MAX_PAGE_SIZE }),
    queryFn: () => financeService.getTeacherSalaries({ pageSize: MAX_PAGE_SIZE }),
  });
  const salaries = salariesResponse?.data ?? [];

  const { control, handleSubmit, reset } = useForm<CreateTeacherSalaryBody>({
    resolver: zodResolver(CreateTeacherSalaryBody),
    defaultValues: emptyDefaults,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: qk.finance.salaries() });

  const processMutation = useMutation({
    mutationFn: (body: CreateTeacherSalaryBody) => financeService.createTeacherSalary(body),
    onSuccess: () => {
      toast.success('Honorarium prepared successfully');
      invalidate();
      setIsProcessOpen(false);
      reset(emptyDefaults);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ salaryId, status }: { salaryId: string; status: TxnStatus }) =>
      financeService.updateTeacherSalaryStatus(salaryId, status),
    onSuccess: () => {
      toast.success('Status updated');
      invalidate();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (salaryId: string) => financeService.deleteTeacherSalary(salaryId),
    onSuccess: () => {
      toast.success('Honorarium record removed');
      invalidate();
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit: SubmitHandler<CreateTeacherSalaryBody> = (values) =>
    processMutation.mutate(values);

  const columns: ColumnDef<TeacherSalaryRecord, unknown>[] = [
    {
      accessorKey: 'teacherId',
      header: 'Teacher',
      cell: ({ row }) => (
        <div>
          <span className="text-xs font-medium">
            {row.original.firstName} {row.original.lastName ?? ''}
          </span>
          <div className="text-muted-foreground font-mono text-[10px]">
            {row.original.teacherId}
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
      accessorKey: 'finalAmount',
      header: 'Honorarium Amount',
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
            statusMutation.mutate({
              salaryId: row.original.id,
              status: e.target.value as TxnStatus,
            })
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
            <h1 className="text-2xl font-extrabold tracking-tight">Teacher Honorarium</h1>
            <Badge variant="outline" className="text-xs">
              {salariesResponse?.total ?? 0} Records
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Prepare honorarium payouts and track the faculty honorarium ledger.
          </p>
        </div>
        <Button
          onClick={() => {
            reset(emptyDefaults);
            setIsProcessOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiPlus className="h-3.5 w-3.5" />
          <span>Prepare Honorarium</span>
        </Button>
      </div>

      {isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <DataTable
            columns={columns}
            data={salaries}
            isLoading={isLoading}
            emptyIllustration="fees"
            emptyTitle="No honorarium records yet"
            emptyDescription="Prepare the first honorarium payout to get started."
            searchPlaceholder="Search by teacher name or ID…"
          />
        </Card>
      )}

      <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
        <DialogContent className="sm:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiSparkle className="h-4 w-4" />
              <span>Honorarium Desk</span>
            </div>
            <DialogTitle className="text-lg font-bold">Prepare Teacher Honorarium</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <SelectField
              control={control}
              name="teacherId"
              label="Teacher"
              required
              options={teacherOptions}
              placeholder="Select a teacher…"
            />
            <div className="grid grid-cols-2 gap-3">
              <MonthField control={control} name="month" label="Honorarium Month" required />
              <NumberField
                control={control}
                name="amount"
                label="Amount (optional)"
                description="Leave blank to use the teacher's configured monthly honorarium."
                currency
                min={0}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProcessOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={processMutation.isPending}
                className="h-9 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              >
                {processMutation.isPending ? 'Processing...' : 'Confirm Payout'}
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
              <span>Delete Honorarium Record</span>
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

export default FinanceSalaries;
