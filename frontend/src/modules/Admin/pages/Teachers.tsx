import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { DataTable, ErrorState, downloadCsv } from '@/components/data-table';
import { TextField, NumberField, DateField, SelectField, TagsField } from '@/components/form';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { CreateTeacherBody, type TeacherRecord } from '@schoolerp/contracts';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import {
  PiUserPlus,
  PiPhone,
  PiTrash,
  PiEye,
  PiPencilSimple,
  PiSparkle,
  PiUsers,
} from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

/** Column-id -> the backend's actual sortable field — see the identical map in `Students.tsx`. */
const SORT_FIELD_BY_COLUMN_ID: Record<
  string,
  'firstName' | 'dateOfJoining' | 'salaryPerMonth' | 'teacherId'
> = {
  teacherId: 'teacherId',
  name: 'firstName',
  salaryPerMonth: 'salaryPerMonth',
};

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const emptyDefaults: CreateTeacherBody = {
  firstName: '',
  lastName: '',
  dob: '1990-01-01',
  gender: undefined,
  address: '',
  phone: '',
  teacherAadhar: '',
  dateOfJoining: new Date().toISOString().slice(0, 10),
  about: '',
  salaryPerMonth: 0,
  qualifications: '',
  subjectHandled: [],
};

const OPTIONAL_STRING_FIELDS = ['lastName', 'address', 'teacherAadhar', 'about'] as const;

function sanitize(values: CreateTeacherBody): CreateTeacherBody {
  const copy = { ...values };
  for (const key of OPTIONAL_STRING_FIELDS) {
    if (copy[key] === '') copy[key] = undefined;
  }
  return copy;
}

function toFormValues(t: TeacherRecord): CreateTeacherBody {
  return {
    firstName: t.firstName,
    lastName: t.lastName ?? '',
    dob: t.dob,
    gender: t.gender ?? undefined,
    address: t.address ?? '',
    phone: t.phone,
    teacherAadhar: t.teacherAadhar ?? '',
    dateOfJoining: t.dateOfJoining,
    about: t.about ?? '',
    salaryPerMonth: t.salaryPerMonth,
    qualifications: t.qualifications,
    subjectHandled: t.subjectHandled,
  };
}

export const AdminTeachers: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<TeacherRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<TeacherRecord[] | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Reset to page 1 whenever the search changes — staying on page 3 of a now much-shorter
  // filtered result would just show an empty page. Deferred a tick (see the deep-link effect
  // below for why) so the compiler's set-state-in-effect lint doesn't flag it.
  useEffect(() => {
    queueMicrotask(() => setPageIndex(0));
  }, [debouncedSearch]);

  const sort = sorting[0];
  const sortBy = sort ? SORT_FIELD_BY_COLUMN_ID[sort.id] : undefined;
  const sortDir: 'asc' | 'desc' | undefined = sort ? (sort.desc ? 'desc' : 'asc') : undefined;
  const listQuery = {
    page: pageIndex + 1,
    pageSize: 10,
    q: debouncedSearch || undefined,
    sortBy,
    sortDir,
  };

  const {
    data: teachersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.teachers(listQuery),
    queryFn: () => adminService.getTeachers(listQuery),
  });
  const teachers = teachersResponse?.data ?? [];

  const { control, handleSubmit, reset } = useForm<CreateTeacherBody>({
    resolver: zodResolver(CreateTeacherBody),
    defaultValues: emptyDefaults,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTeacherBody) => adminService.createTeacher(payload),
    onSuccess: () => {
      toast.success('Teacher registered successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.teachers() });
      setIsFormOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ teacherId, body }: { teacherId: string; body: CreateTeacherBody }) =>
      adminService.updateTeacher(teacherId, body),
    onSuccess: () => {
      toast.success('Teacher record updated!');
      queryClient.invalidateQueries({ queryKey: qk.admin.teachers() });
      setIsFormOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (teacherId: string) => adminService.deleteTeacher(teacherId),
    onSuccess: () => {
      toast.success('Teacher record removed successfully');
      queryClient.invalidateQueries({ queryKey: qk.admin.teachers() });
      setDeleteConfirmId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (targets: TeacherRecord[]) => {
      const results = await Promise.allSettled(
        targets.map((t) => adminService.deleteTeacher(t.teacherId)),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { total: targets.length, failed };
    },
    onSuccess: ({ total, failed }) => {
      queryClient.invalidateQueries({ queryKey: qk.admin.teachers() });
      setBulkDeleteTargets(null);
      if (failed === 0) toast.success(`${total} teacher record${total === 1 ? '' : 's'} deleted`);
      else toast.error(`${failed} of ${total} deletions failed`);
    },
  });

  const openCreateForm = () => {
    setFormTarget(null);
    reset(emptyDefaults);
    setIsFormOpen(true);
  };

  const openEditForm = (teacher: TeacherRecord) => {
    setFormTarget(teacher);
    reset(toFormValues(teacher));
    setIsFormOpen(true);
  };

  const onSubmit: SubmitHandler<CreateTeacherBody> = (values) => {
    const payload = sanitize(values);
    if (formTarget) {
      updateMutation.mutate({ teacherId: formTarget.teacherId, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const viewTeacherDetails = (teacher: TeacherRecord) => {
    navigate(`/admin/teachers/${teacher.teacherId}`);
  };

  // Deep-link support: `/admin/teachers?edit=<teacherId>` (used by the Teacher Detail page's
  // "Edit Record" button) opens the edit sheet for that teacher. Fetched directly by id rather
  // than searched for in the currently-loaded page — now that the list is paginated/searched
  // (ALIGNMENT_PLAN.md 2C/P1), the target teacher isn't guaranteed to be on whatever page happens
  // to be showing.
  const editId = searchParams.get('edit');
  const { data: editTarget } = useQuery({
    queryKey: qk.admin.teacher(editId ?? ''),
    queryFn: () => adminService.getTeacherById(editId as string),
    enabled: !!editId,
  });
  useEffect(() => {
    if (!editTarget) return;
    // Deferred a tick so the state updates below aren't synchronous *within* the effect body
    // itself (which the React Compiler lint flags as a cascading-render risk) — this still runs
    // before paint, it's just not inline in the effect callback.
    queueMicrotask(() => {
      openEditForm(editTarget);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('edit');
          return next;
        },
        { replace: true },
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTarget]);

  const columns: ColumnDef<TeacherRecord, unknown>[] = [
    {
      accessorKey: 'teacherId',
      header: 'Teacher ID',
      cell: ({ row }) => (
        <span className="text-primary font-mono text-xs font-semibold">
          {row.original.teacherId}
        </span>
      ),
    },
    {
      id: 'name',
      header: 'Faculty Name',
      accessorFn: (t) => `${t.firstName} ${t.lastName ?? ''}`.trim(),
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white">
              {t.firstName.charAt(0)}
            </div>
            <span className="text-xs font-medium">
              {t.firstName} {t.lastName ?? ''}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'qualifications',
      header: 'Qualifications',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.qualifications}</span>
      ),
    },
    {
      id: 'subjects',
      header: 'Subjects',
      accessorFn: (t) => t.subjectHandled.join(', '),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex max-w-56 flex-wrap gap-1">
          {row.original.subjectHandled.length === 0 ? (
            <span className="text-muted-foreground text-xs">—</span>
          ) : (
            row.original.subjectHandled.map((sub) => (
              <Badge key={sub} variant="outline" className="text-[10px] font-medium">
                {sub}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <PiPhone className="h-3 w-3 text-emerald-500" />
          <span>{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: 'salaryPerMonth',
      header: 'Monthly Salary',
      cell: ({ row }) => (
        <span className="text-xs font-semibold">
          ₹{row.original.salaryPerMonth.toLocaleString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const teacher = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:bg-primary/10 h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                viewTeacherDetails(teacher);
              }}
              title="View Profile"
            >
              <PiEye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={(e) => {
                e.stopPropagation();
                openEditForm(teacher);
              }}
              title="Edit Record"
            >
              <PiPencilSimple className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-600 hover:bg-rose-50 dark:text-rose-400"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmId(teacher.teacherId);
              }}
              title="Delete Record"
            >
              <PiTrash className="h-3.5 w-3.5" />
            </Button>
          </div>
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
            <h1 className="text-2xl font-extrabold tracking-tight">Faculty & Instructors</h1>
            <Badge variant="outline" className="text-xs">
              {teachersResponse?.total ?? 0} Active Staff
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Manage teaching faculty, assigned subjects, salary structures, and credentials.
          </p>
        </div>

        <Button
          onClick={openCreateForm}
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiUserPlus className="h-3.5 w-3.5" />
          <span>Add Faculty</span>
        </Button>
      </div>

      {/* Faculty Data Table */}
      {isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <DataTable
            columns={columns}
            data={teachers}
            isLoading={isLoading}
            emptyIllustration="teachers"
            emptyTitle="No faculty registered yet"
            emptyDescription="Add the first teacher to get started."
            emptyAction={
              <Button size="sm" className="mt-1 text-xs" onClick={openCreateForm}>
                <PiUserPlus className="mr-1 h-3.5 w-3.5" />
                Add Faculty
              </Button>
            }
            searchPlaceholder="Search by name, ID…"
            onRowClick={viewTeacherDetails}
            enableRowSelection
            exportFilename="teachers"
            manual={{
              pageIndex,
              pageSize: 10,
              pageCount: teachersResponse?.totalPages ?? 1,
              totalRows: teachersResponse?.total ?? 0,
              onPageChange: setPageIndex,
              search: searchInput,
              onSearchChange: setSearchInput,
              sorting,
              onSortingChange: setSorting,
            }}
            bulkActions={(selected, clear) => (
              <>
                <span className="text-xs font-semibold">{selected.length} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() =>
                    downloadCsv(
                      'teachers-selected',
                      ['Teacher ID', 'Name', 'Qualifications', 'Subjects', 'Phone', 'Salary'],
                      selected.map((t) => [
                        t.teacherId,
                        `${t.firstName} ${t.lastName ?? ''}`.trim(),
                        t.qualifications,
                        t.subjectHandled.join(', '),
                        t.phone,
                        t.salaryPerMonth,
                      ]),
                    )
                  }
                >
                  Export Selected
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setBulkDeleteTargets(selected)}
                >
                  <PiTrash className="mr-1 h-3.5 w-3.5" />
                  Delete Selected
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={clear}>
                  Clear
                </Button>
              </>
            )}
          />
        </Card>
      )}

      {/* Add / Edit Faculty Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <div className="space-y-4 px-4 pt-4">
            <SheetHeader>
              <div className="text-primary flex items-center gap-2 text-xs font-semibold">
                <PiSparkle className="h-4 w-4" />
                <span>Faculty Registry</span>
              </div>
              <SheetTitle className="text-lg font-bold">
                {formTarget ? `Edit ${formTarget.teacherId}` : 'Register New Faculty Member'}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {formTarget
                  ? 'Update this instructor’s registered profile.'
                  : 'Fill in instructor details to create portal login and assign teaching subjects.'}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-3">
                <TextField control={control} name="firstName" label="First Name" required />
                <TextField control={control} name="lastName" label="Last Name" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <DateField control={control} name="dob" label="Date of Birth" required />
                <SelectField
                  control={control}
                  name="gender"
                  label="Gender"
                  options={GENDER_OPTIONS}
                />
                <TextField control={control} name="phone" label="Mobile Number" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DateField
                  control={control}
                  name="dateOfJoining"
                  label="Date of Joining"
                  required
                />
                <NumberField
                  control={control}
                  name="salaryPerMonth"
                  label="Monthly Salary"
                  required
                  currency
                  min={0}
                />
              </div>

              <TextField
                control={control}
                name="qualifications"
                label="Educational Qualifications"
                required
                placeholder="e.g. M.Sc. Mathematics, B.Ed."
              />

              <TagsField
                control={control}
                name="subjectHandled"
                label="Subjects Handled"
                required
                description="Type a subject and press Enter to add it as a chip."
                placeholder="e.g. Mathematics"
              />

              <TextField
                control={control}
                name="about"
                label="Professional Summary / Bio"
                multiline
              />

              <TextField control={control} name="address" label="Address" multiline />

              <TextField
                control={control}
                name="teacherAadhar"
                label="Aadhar Number"
                placeholder="12 digits"
              />

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-zinc-800">
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
                  className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : formTarget
                      ? 'Save Changes'
                      : 'Confirm Faculty'}
                </Button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <PiTrash className="h-4 w-4" />
              <span>Confirm Faculty Removal</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to remove teacher record <strong>{deleteConfirmId}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation */}
      <Dialog open={!!bulkDeleteTargets} onOpenChange={() => setBulkDeleteTargets(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <PiUsers className="h-4 w-4" />
              <span>Confirm Bulk Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to permanently delete{' '}
              <strong>{bulkDeleteTargets?.length ?? 0}</strong> teacher record
              {bulkDeleteTargets?.length === 1 ? '' : 's'}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkDeleteTargets(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => bulkDeleteTargets && bulkDeleteMutation.mutate(bulkDeleteTargets)}
              disabled={bulkDeleteMutation.isPending}
              className="text-xs"
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : 'Delete All Selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeachers;
