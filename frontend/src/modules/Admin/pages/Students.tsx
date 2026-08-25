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
import { DataTable, ErrorState, downloadCsv } from '@/components/data-table';
import { TextField, NumberField, DateField, SelectField, SessionField } from '@/components/form';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import {
  useClassNameOptions,
  useSectionOptions,
  useSessionOptions,
} from '@/hooks/options/useAdminOptions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { CreateStudentBody, type StudentRecord } from '@schoolerp/contracts';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import {
  PiPlus,
  PiEye,
  PiPencilSimple,
  PiTrash,
  PiPhone,
  PiSparkle,
  PiUsers,
  PiCloudArrowUp,
} from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BulkImportStudentsDialog } from './BulkImportStudentsDialog';

/** Column-id -> the backend's actual sortable field. Columns not listed here (composite/derived,
 * like the "Class & Sec" badge) have `enableSorting: false` — the list endpoint only sorts by a
 * real column (ALIGNMENT_PLAN.md 2C/P1), not a client-side derived label. */
const SORT_FIELD_BY_COLUMN_ID: Record<
  string,
  'rollNo' | 'firstName' | 'dateOfAdmission' | 'studentId'
> = {
  studentId: 'studentId',
  name: 'firstName',
  rollNo: 'rollNo',
};

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const emptyDefaults: CreateStudentBody = {
  firstName: '',
  lastName: '',
  dob: '2010-01-01',
  gender: undefined,
  address: '',
  phone: '',
  fatherName: '',
  motherName: '',
  fatherOccupation: '',
  motherOccupation: '',
  studentAadhar: '',
  fatherAadhar: '',
  motherAadhar: '',
  className: '',
  section: '',
  session: '',
  dateOfAdmission: new Date().toISOString().slice(0, 10),
  rollNo: 1,
  appId: '',
  penNumber: '',
};

/** Optional fields on `CreateStudentBody` that must become `undefined`, not `''`, on the wire —
 * several are regex-validated (`Aadhar`) and reject an empty string outright. */
const OPTIONAL_STRING_FIELDS = [
  'lastName',
  'address',
  'fatherName',
  'motherName',
  'fatherOccupation',
  'motherOccupation',
  'studentAadhar',
  'fatherAadhar',
  'motherAadhar',
  'appId',
  'penNumber',
] as const;

function sanitize(values: CreateStudentBody): CreateStudentBody {
  const copy = { ...values };
  for (const key of OPTIONAL_STRING_FIELDS) {
    if (copy[key] === '') copy[key] = undefined;
  }
  return copy;
}

function toFormValues(s: StudentRecord): CreateStudentBody {
  return {
    firstName: s.firstName,
    lastName: s.lastName ?? '',
    dob: s.dob,
    gender: s.gender ?? undefined,
    address: s.address ?? '',
    phone: s.phone,
    fatherName: s.fatherName ?? '',
    motherName: s.motherName ?? '',
    fatherOccupation: s.fatherOccupation ?? '',
    motherOccupation: s.motherOccupation ?? '',
    studentAadhar: s.studentAadhar ?? '',
    fatherAadhar: s.fatherAadhar ?? '',
    motherAadhar: s.motherAadhar ?? '',
    className: s.className,
    section: s.section,
    session: s.session,
    dateOfAdmission: s.dateOfAdmission,
    rollNo: s.rollNo,
    appId: s.appId ?? '',
    penNumber: s.penNumber ?? '',
  };
}

export const AdminStudents: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<StudentRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteTargets, setBulkDeleteTargets] = useState<StudentRecord[] | null>(null);
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [sessionFilter, setSessionFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput);
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);

  // Reset to page 1 whenever a filter/search changes — staying on page 3 of a now much-shorter
  // filtered result would just show an empty page. Deferred a tick (see the deep-link effect
  // below for why) so the compiler's set-state-in-effect lint doesn't flag it.
  useEffect(() => {
    queueMicrotask(() => setPageIndex(0));
  }, [classFilter, sectionFilter, sessionFilter, debouncedSearch]);

  const sort = sorting[0];
  const sortBy = sort ? SORT_FIELD_BY_COLUMN_ID[sort.id] : undefined;
  const sortDir: 'asc' | 'desc' | undefined = sort ? (sort.desc ? 'desc' : 'asc') : undefined;
  const listQuery = {
    page: pageIndex + 1,
    pageSize: 10,
    q: debouncedSearch || undefined,
    className: classFilter || undefined,
    section: sectionFilter || undefined,
    session: sessionFilter || undefined,
    sortBy,
    sortDir,
  };

  const {
    data: studentsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.students(listQuery),
    queryFn: () => adminService.getStudents(listQuery),
  });
  const students = studentsResponse?.data ?? [];

  const { control, handleSubmit, watch, reset } = useForm<CreateStudentBody>({
    resolver: zodResolver(CreateStudentBody),
    defaultValues: emptyDefaults,
  });
  const watchedClassName = watch('className');
  const classNameOptions = useClassNameOptions();
  const sectionOptions = useSectionOptions(watchedClassName);
  const filterClassOptions = useClassNameOptions();
  const filterSectionOptions = useSectionOptions(classFilter || undefined);
  const sessionOptions = useSessionOptions();

  const createMutation = useMutation({
    mutationFn: (payload: CreateStudentBody) => adminService.createStudent(payload),
    onSuccess: () => {
      toast.success('Student enrolled successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.students() });
      setIsFormOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ studentId, body }: { studentId: string; body: CreateStudentBody }) =>
      adminService.updateStudent(studentId, body),
    onSuccess: () => {
      toast.success('Student record updated!');
      queryClient.invalidateQueries({ queryKey: qk.admin.students() });
      setIsFormOpen(false);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (studentId: string) => adminService.deleteStudent(studentId),
    onSuccess: () => {
      toast.success('Student record deleted successfully');
      queryClient.invalidateQueries({ queryKey: qk.admin.students() });
      setDeleteConfirmId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (targets: StudentRecord[]) => {
      const results = await Promise.allSettled(
        targets.map((t) => adminService.deleteStudent(t.studentId)),
      );
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { total: targets.length, failed };
    },
    onSuccess: ({ total, failed }) => {
      queryClient.invalidateQueries({ queryKey: qk.admin.students() });
      setBulkDeleteTargets(null);
      if (failed === 0) toast.success(`${total} student record${total === 1 ? '' : 's'} deleted`);
      else toast.error(`${failed} of ${total} deletions failed`);
    },
  });

  const openCreateForm = () => {
    setFormTarget(null);
    reset(emptyDefaults);
    setIsFormOpen(true);
  };

  const openEditForm = (student: StudentRecord) => {
    setFormTarget(student);
    reset(toFormValues(student));
    setIsFormOpen(true);
  };

  const onSubmit: SubmitHandler<CreateStudentBody> = (values) => {
    const payload = sanitize(values);
    if (formTarget) {
      updateMutation.mutate({ studentId: formTarget.studentId, body: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const viewStudentDetails = (student: StudentRecord) => {
    navigate(`/admin/students/${student.studentId}`);
  };

  // Deep-link support: `/admin/students?edit=<studentId>` (used by the Student Detail page's
  // "Edit Record" button) opens the edit sheet for that student. Fetched directly by id rather
  // than searched for in the currently-loaded page — now that the list is paginated/filtered
  // (ALIGNMENT_PLAN.md 2C/P1), the target student isn't guaranteed to be on whatever page/filter
  // happens to be showing.
  const editId = searchParams.get('edit');
  const { data: editTarget } = useQuery({
    queryKey: qk.admin.student(editId ?? ''),
    queryFn: () => adminService.getStudentById(editId as string),
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

  const columns: ColumnDef<StudentRecord, unknown>[] = [
    {
      accessorKey: 'studentId',
      header: 'Student ID',
      cell: ({ row }) => (
        <span className="text-primary font-mono text-xs font-semibold">
          {row.original.studentId}
        </span>
      ),
    },
    {
      id: 'name',
      header: 'Full Name',
      accessorFn: (s) => `${s.firstName} ${s.lastName ?? ''}`.trim(),
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-2">
            <div className="bg-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white">
              {s.firstName.charAt(0)}
            </div>
            <span className="text-xs font-medium">
              {s.firstName} {s.lastName ?? ''}
            </span>
          </div>
        );
      },
    },
    {
      id: 'classSection',
      header: 'Class & Sec',
      accessorFn: (s) => `${s.className}-${s.section}`,
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-[10px] font-semibold">
          Class {row.original.className}-{row.original.section}
        </Badge>
      ),
    },
    {
      accessorKey: 'rollNo',
      header: 'Roll No',
      cell: ({ row }) => <span className="text-xs font-semibold">#{row.original.rollNo}</span>,
    },
    {
      accessorKey: 'phone',
      header: 'Guardian Contact',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <PiPhone className="h-3 w-3 text-emerald-500" />
          <span>{row.original.phone}</span>
        </div>
      ),
    },
    {
      accessorKey: 'session',
      header: 'Session',
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">{row.original.session}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-primary hover:bg-primary/10 h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                viewStudentDetails(student);
              }}
              title="View Full Profile"
            >
              <PiEye className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              onClick={(e) => {
                e.stopPropagation();
                openEditForm(student);
              }}
              title="Edit Record"
            >
              <PiPencilSimple className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmId(student.studentId);
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
            <h1 className="text-2xl font-extrabold tracking-tight">Student Enrollment Roster</h1>
            <Badge variant="outline" className="text-xs">
              {studentsResponse?.total ?? 0} Active Records
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Manage student registrations, personal profiles, parent records, and digital identity
            cards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            className="h-9 gap-1.5 text-xs"
          >
            <PiCloudArrowUp className="h-3.5 w-3.5" />
            <span>Bulk Import</span>
          </Button>
          <Button
            onClick={openCreateForm}
            className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
          >
            <PiPlus className="h-3.5 w-3.5" />
            <span>Admit New Student</span>
          </Button>
        </div>
      </div>

      {/* Student Data Table */}
      {isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <DataTable
            columns={columns}
            data={students}
            isLoading={isLoading}
            emptyIllustration="students"
            emptyTitle="No Students Enrolled"
            emptyDescription="No student records found matching the active filter criteria."
            emptyAction={
              <Button size="sm" className="mt-1 text-xs" onClick={openCreateForm}>
                <PiPlus className="mr-1 h-3.5 w-3.5" />
                Admit New Student
              </Button>
            }
            searchPlaceholder="Search by name, ID, or phone…"
            onRowClick={viewStudentDetails}
            enableRowSelection
            exportFilename="students"
            manual={{
              pageIndex,
              pageSize: 10,
              pageCount: studentsResponse?.totalPages ?? 1,
              totalRows: studentsResponse?.total ?? 0,
              onPageChange: setPageIndex,
              search: searchInput,
              onSearchChange: setSearchInput,
              sorting,
              onSortingChange: setSorting,
            }}
            toolbar={
              <>
                <select
                  value={classFilter}
                  onChange={(e) => {
                    setClassFilter(e.target.value);
                    setSectionFilter('');
                  }}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="">All Classes</option>
                  {filterClassOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  disabled={!classFilter}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="">All Sections</option>
                  {filterSectionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sessionFilter}
                  onChange={(e) => setSessionFilter(e.target.value)}
                  className="h-9 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <option value="">All Sessions</option>
                  {sessionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </>
            }
            bulkActions={(selected, clear) => (
              <>
                <span className="text-xs font-semibold">{selected.length} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() =>
                    downloadCsv(
                      'students-selected',
                      [
                        'Student ID',
                        'Name',
                        'Class',
                        'Section',
                        'Roll No',
                        'Phone',
                        'APAAR ID',
                        'PEN Number',
                        'Session',
                      ],
                      selected.map((s) => [
                        s.studentId,
                        `${s.firstName} ${s.lastName ?? ''}`.trim(),
                        s.className,
                        s.section,
                        s.rollNo,
                        s.phone,
                        s.appId ?? '',
                        s.penNumber ?? '',
                        s.session,
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

      {/* Admit / Edit Student Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-3xl lg:max-w-4xl">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiSparkle className="h-4 w-4" />
              <span>Admissions Office</span>
            </div>
            <DialogTitle className="text-lg font-bold">
              {formTarget ? `Edit ${formTarget.studentId}` : 'New Student Admission Form'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {formTarget
                ? 'Update this student’s registered profile.'
                : 'Complete the admission profile. Auto-creates student credentials for portal login.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField control={control} name="firstName" label="First Name" required />
              <TextField control={control} name="lastName" label="Last Name" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <SelectField
                control={control}
                name="className"
                label="Class"
                required
                options={classNameOptions}
              />
              <SelectField
                control={control}
                name="section"
                label="Section"
                required
                options={sectionOptions}
                placeholder={watchedClassName ? 'Select…' : 'Pick a class first'}
              />
              <NumberField control={control} name="rollNo" label="Roll No" required min={1} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DateField control={control} name="dob" label="Date of Birth" required />
              <SelectField
                control={control}
                name="gender"
                label="Gender"
                options={GENDER_OPTIONS}
              />
              <TextField control={control} name="phone" label="Primary Mobile" required />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <SessionField control={control} name="session" label="Academic Session" required />
              <DateField
                control={control}
                name="dateOfAdmission"
                label="Date of Admission"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField control={control} name="fatherName" label="Father's Name" />
              <TextField control={control} name="motherName" label="Mother's Name" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField control={control} name="fatherOccupation" label="Father's Occupation" />
              <TextField control={control} name="motherOccupation" label="Mother's Occupation" />
            </div>

            <TextField control={control} name="address" label="Residential Address" multiline />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <TextField
                control={control}
                name="studentAadhar"
                label="Student Aadhar"
                placeholder="12-digit Aadhar number"
              />
              <TextField
                control={control}
                name="fatherAadhar"
                label="Father Aadhar"
                placeholder="12-digit Aadhar number"
              />
              <TextField
                control={control}
                name="motherAadhar"
                label="Mother Aadhar"
                placeholder="12-digit Aadhar number"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <TextField
                control={control}
                name="appId"
                label="APAAR Number (APAAR ID)"
                placeholder="e.g. 12-digit APAAR ID"
              />
              <TextField
                control={control}
                name="penNumber"
                label="PEN Number (UDISE+ PEN)"
                placeholder="e.g. 11-digit PEN Number"
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
                className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : formTarget
                    ? 'Save Changes'
                    : 'Confirm Admission'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <PiTrash className="h-4 w-4" />
              <span>Confirm Student Record Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to delete student record <strong>{deleteConfirmId}</strong>?
              This action will also revoke linked login credentials.
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

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={!!bulkDeleteTargets} onOpenChange={() => setBulkDeleteTargets(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <PiUsers className="h-4 w-4" />
              <span>Confirm Bulk Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to permanently delete{' '}
              <strong>{bulkDeleteTargets?.length ?? 0}</strong> student record
              {bulkDeleteTargets?.length === 1 ? '' : 's'}? This also revokes their login
              credentials.
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

      <BulkImportStudentsDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </div>
  );
};

export default AdminStudents;
