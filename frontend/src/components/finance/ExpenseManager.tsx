import React, { useState } from 'react';
import { Controller, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DataTable, ErrorState } from '@/components/data-table';
import { TextField, NumberField } from '@/components/form';
import { FieldShell } from '@/components/form/FieldShell';
import { getErrorMessage } from '@/lib/api';
import {
  CreateTransactionBody,
  type TransactionRecord,
  type TxnStatus,
} from '@schoolerp/contracts';
import { toast } from 'sonner';
import { PiPlus, PiPencil, PiTrash, PiReceipt } from 'react-icons/pi';
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';

const STATUS_OPTIONS: { value: TxnStatus; label: string }[] = [
  { value: 'Paid', label: 'Paid' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Failed', label: 'Failed' },
];

const emptyDefaults: CreateTransactionBody = {
  title: '',
  finalAmount: 0,
  category: 'Other',
  expenseCategory: '',
  status: 'Paid',
};

function toFormValues(t: TransactionRecord): CreateTransactionBody {
  return {
    title: t.title,
    finalAmount: t.finalAmount,
    category: t.category === 'Fee' || t.category === 'Salary' ? 'Other' : t.category,
    expenseCategory: t.expenseCategory ?? '',
    status: t.status,
  };
}

/**
 * Shared between the Admin Finance page (as an "Expenses" tab) and the Finance role's own
 * Expenses page (ALIGNMENT_PLAN.md P4) — same general-ledger `Transaction` data either way, just
 * two different mount points hitting two different (but service-identical) API surfaces. Takes an
 * adapter instead of importing `adminService`/`financeService` directly so the one component works
 * for both without duplicating the combobox/table/form logic.
 *
 * The "Category" field is the point of this component: a free-text `<input>` backed by a
 * `<datalist>` of every previously-used label (fetched via `adapter.categories`), so logging "a new
 * category by typing it in" — books, whiteboards, whatever a school actually spends money on — just
 * works, instead of being locked to `TxnCategory`'s small fixed enum.
 */
export interface ExpenseManagerAdapter {
  list: () => Promise<TransactionRecord[]>;
  create: (body: CreateTransactionBody) => Promise<TransactionRecord>;
  update: (id: string, body: CreateTransactionBody) => Promise<TransactionRecord>;
  remove: (id: string) => Promise<{ id: string }>;
  categories: () => Promise<string[]>;
  listQueryKey: QueryKey;
  categoriesQueryKey: QueryKey;
}

export const ExpenseManager: React.FC<{ adapter: ExpenseManagerAdapter }> = ({ adapter }) => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TransactionRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TransactionRecord | null>(null);

  const {
    data: expenses,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({ queryKey: adapter.listQueryKey, queryFn: adapter.list });

  const { data: categoryOptions } = useQuery({
    queryKey: adapter.categoriesQueryKey,
    queryFn: adapter.categories,
  });

  const { control, handleSubmit, reset } = useForm<CreateTransactionBody>({
    resolver: zodResolver(CreateTransactionBody),
    defaultValues: emptyDefaults,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: adapter.listQueryKey });
    queryClient.invalidateQueries({ queryKey: adapter.categoriesQueryKey });
  };

  const createMutation = useMutation({
    mutationFn: (body: CreateTransactionBody) => adapter.create(body),
    onSuccess: () => {
      toast.success('Expense logged');
      invalidate();
      setIsFormOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (body: CreateTransactionBody) => adapter.update(editTarget!.id, body),
    onSuccess: () => {
      toast.success('Expense updated');
      invalidate();
      setIsFormOpen(false);
      setEditTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adapter.remove(id),
    onSuccess: () => {
      toast.success('Expense removed');
      invalidate();
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const openCreate = () => {
    setEditTarget(null);
    reset(emptyDefaults);
    setIsFormOpen(true);
  };

  const openEdit = (t: TransactionRecord) => {
    setEditTarget(t);
    reset(toFormValues(t));
    setIsFormOpen(true);
  };

  const onSubmit: SubmitHandler<CreateTransactionBody> = (values) => {
    const payload = { ...values, expenseCategory: values.expenseCategory || undefined };
    if (editTarget) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  // Fee/Salary transactions are managed via their own dedicated flows, not this generic ledger —
  // same rule `AdminTransactionService` enforces server-side.
  const nonSystemExpenses = (expenses ?? []).filter(
    (t) => t.category !== 'Fee' && t.category !== 'Salary',
  );

  const columns: ColumnDef<TransactionRecord, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => <span className="text-xs font-medium">{row.original.title}</span>,
    },
    {
      id: 'category',
      header: 'Category',
      accessorFn: (t) => t.expenseCategory ?? t.category,
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-[10px] font-semibold">
          {row.original.expenseCategory ?? row.original.category}
        </Badge>
      ),
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
      cell: ({ row }) => {
        const status = row.original.status;
        const styles: Record<string, string> = {
          Paid: 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
          Pending:
            'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
          Failed:
            'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
        };
        return (
          <Badge variant="outline" className={`text-[10px] ${styles[status] ?? ''}`}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.createdAt}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row.original);
            }}
            title="Edit Expense"
          >
            <PiPencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row.original);
            }}
            title="Delete Expense"
          >
            <PiTrash className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          Log spend on books, whiteboards, supplies, utilities, or anything else — type a new
          category or reuse one you've logged before.
        </p>
        <Button
          onClick={openCreate}
          className="bg-primary h-9 gap-1.5 text-xs text-white shadow-sm hover:opacity-90"
        >
          <PiPlus className="h-3.5 w-3.5" />
          <span>Log Expense</span>
        </Button>
      </div>

      {isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <DataTable
            columns={columns}
            data={nonSystemExpenses}
            isLoading={isLoading}
            emptyTitle="No expenses logged yet"
            emptyDescription="Log the first expense — books, whiteboards, anything the school buys."
            emptyAction={
              <Button size="sm" className="mt-1 text-xs" onClick={openCreate}>
                <PiPlus className="mr-1 h-3.5 w-3.5" />
                Log Expense
              </Button>
            }
            searchPlaceholder="Search by title or category…"
          />
        </Card>
      )}

      {/* Log / Edit Expense */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiReceipt className="h-4 w-4" />
              <span>General Expenses</span>
            </div>
            <DialogTitle className="text-lg font-bold">
              {editTarget ? 'Edit Expense' : 'Log an Expense'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              For anything that isn't a student fee or teacher honorarium — supplies, utilities,
              equipment, repairs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <TextField
              control={control}
              name="title"
              label="Title"
              required
              placeholder="e.g. NCERT textbooks for library"
            />

            <Controller
              control={control}
              name="expenseCategory"
              render={({ field, fieldState }) => (
                <FieldShell
                  htmlFor="expenseCategory"
                  label="Category"
                  required
                  error={fieldState.error}
                  description="Type a new category or pick one you've used before."
                >
                  <Input
                    id="expenseCategory"
                    list="expense-category-suggestions"
                    placeholder="e.g. Books, Whiteboard, Sports Equipment"
                    aria-invalid={!!fieldState.error}
                    {...field}
                    value={field.value ?? ''}
                  />
                  <datalist id="expense-category-suggestions">
                    {(categoryOptions ?? []).map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </FieldShell>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <NumberField
                control={control}
                name="finalAmount"
                label="Amount (₹)"
                required
                min={1}
              />
              <Controller
                control={control}
                name="status"
                render={({ field, fieldState }) => (
                  <FieldShell htmlFor="status" label="Status" required error={fieldState.error}>
                    <NativeSelect
                      id="status"
                      value={field.value ?? 'Paid'}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <NativeSelectOption key={opt.value} value={opt.value}>
                          {opt.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </FieldShell>
                )}
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-primary h-9 text-xs text-white hover:opacity-90"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editTarget
                    ? 'Save Changes'
                    : 'Log Expense'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <PiTrash className="h-4 w-4" />
              <span>Delete Expense</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
            </DialogDescription>
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

export default ExpenseManager;
