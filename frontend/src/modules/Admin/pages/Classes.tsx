import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SelectField, SessionField } from '@/components/form';
import { adminService } from '@/lib/services/admin.service';
import { CreateClassBody, MAX_PAGE_SIZE, type ClassRecord } from '@schoolerp/contracts';
import { getErrorMessage } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { toast } from 'sonner';
import {
  PiPlus,
  PiTrash,
  PiPencilSimple,
  PiUsers,
  PiSparkle,
  PiMagnifyingGlass,
  PiLock,
  PiEye,
} from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const value = String(i + 1);
  return { value, label: `Grade ${value}` };
});
const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'].map((s) => ({
  value: s,
  label: `Section ${s}`,
}));

const emptyDefaults: CreateClassBody = { className: '', section: '', session: '' };

export const AdminClasses: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    className: string;
    section: string;
  } | null>(null);

  const [editingClass, setEditingClass] = useState<ClassRecord | null>(null);

  const { control, handleSubmit, reset } = useForm<CreateClassBody>({
    resolver: zodResolver(CreateClassBody),
    defaultValues: emptyDefaults,
  });

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
  } = useForm<CreateClassBody>({
    resolver: zodResolver(CreateClassBody),
    defaultValues: emptyDefaults,
  });

  useEffect(() => {
    if (editingClass) {
      resetEdit({
        className: editingClass.className,
        section: editingClass.section,
        session: editingClass.session,
      });
    }
  }, [editingClass, resetEdit]);

  const {
    data: classesList,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.classes(),
    queryFn: () => adminService.getClasses(),
  });

  // pageSize: MAX_PAGE_SIZE — counting enrolled students across every class needs the full roster,
  // not one page of the (now server-paginated, ALIGNMENT_PLAN.md 2C/P1) list endpoint.
  const { data: studentsResponse } = useQuery({
    queryKey: qk.admin.students({ pageSize: MAX_PAGE_SIZE }),
    queryFn: () => adminService.getStudents({ pageSize: MAX_PAGE_SIZE }),
  });
  const studentsList = studentsResponse?.data;

  const studentCountByClass = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of studentsList ?? []) {
      const key = `${s.className}-${s.section}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
  }, [studentsList]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateClassBody) => adminService.createClass(payload),
    onSuccess: () => {
      toast.success('Class created successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.classes() });
      setIsCreateOpen(false);
      reset(emptyDefaults);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (classId: string) => adminService.deleteClass(classId),
    onSuccess: () => {
      toast.success('Class section removed');
      queryClient.invalidateQueries({ queryKey: qk.admin.classes() });
      setDeleteTarget(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: CreateClassBody) => adminService.updateClass(editingClass!.id, payload),
    onSuccess: () => {
      toast.success('Class updated successfully!');
      queryClient.invalidateQueries({ queryKey: qk.admin.classes() });
      setEditingClass(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onSubmit: SubmitHandler<CreateClassBody> = (values) => createMutation.mutate(values);
  const onEditSubmit: SubmitHandler<CreateClassBody> = (values) => updateMutation.mutate(values);

  const filteredClasses = (classesList ?? []).filter((c) =>
    `Class ${c.className}-${c.section} ${c.session}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const deleteTargetStudentCount = deleteTarget
    ? (studentCountByClass.get(`${deleteTarget.className}-${deleteTarget.section}`) ?? 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Classes & Sections</h1>
            <Badge variant="outline" className="text-xs">
              {filteredClasses.length} Active Sections
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Configure academic class tiers, sections, and active operational academic sessions.
          </p>
        </div>

        <Button
          onClick={() => {
            reset(emptyDefaults);
            setIsCreateOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiPlus className="h-3.5 w-3.5" />
          <span>Add New Class Section</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="p-4">
          <div className="relative w-full">
            <PiMagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search class sections (e.g. Class 10-A, 2025-2026)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Class Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredClasses.length === 0 ? (
        <Empty className="rounded-md border p-8">
          <EmptyMedia illustration="users" illustrationSize={120} />
          <EmptyTitle>No class sections yet</EmptyTitle>
          <EmptyDescription>
            {searchTerm
              ? 'No class sections match your search.'
              : 'Add the first class section to get started.'}
          </EmptyDescription>
          {!searchTerm && (
            <Button size="sm" className="mt-1 text-xs" onClick={() => setIsCreateOpen(true)}>
              <PiPlus className="mr-1 h-3.5 w-3.5" />
              Add Class Section
            </Button>
          )}
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredClasses.map((cls, idx) => {
            const classId = cls.id || `class-${idx}`;
            const enrolled = studentCountByClass.get(`${cls.className}-${cls.section}`) ?? 0;
            return (
              <Card
                key={classId}
                onClick={() => navigate(`/admin/classes/${classId}`)}
                className="group relative cursor-pointer overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <div className="bg-primary h-2 w-full" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-mono text-xs">{cls.session}</span>
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground text-[10px] font-semibold"
                    >
                      Sec {cls.section}
                    </Badge>
                  </div>
                  <CardTitle className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                    Class {cls.className} - {cls.section}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Academic Session: {cls.session}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  <div className="flex items-center justify-between rounded-md bg-slate-50 p-2.5 text-xs dark:bg-zinc-800/50">
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <PiUsers className="text-primary h-3.5 w-3.5" />
                      <span>Enrolled Students</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-zinc-100">
                      {enrolled} Enrolled
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/classes/${classId}`);
                      }}
                    >
                      <PiEye className="mr-1 h-3.5 w-3.5" />
                      <span>View</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingClass(cls);
                      }}
                    >
                      <PiPencilSimple className="mr-1 h-3.5 w-3.5" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({
                          id: classId,
                          className: cls.className,
                          section: cls.section,
                        });
                      }}
                    >
                      <PiTrash className="mr-1 h-3.5 w-3.5" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Class Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="text-primary flex items-center gap-2 text-xs font-semibold">
              <PiSparkle className="h-4 w-4" />
              <span>Curriculum Setup</span>
            </div>
            <DialogTitle className="text-lg font-bold">Create Class Section</DialogTitle>
            <DialogDescription className="text-xs">
              Add a new class and section pair to the institutional database.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <SelectField
              control={control}
              name="className"
              label="Class Grade"
              required
              options={GRADE_OPTIONS}
            />
            <SelectField
              control={control}
              name="section"
              label="Section"
              required
              options={SECTION_OPTIONS}
            />
            <SessionField control={control} name="session" label="Academic Session" required />

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Class'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Class Modal */}
      <Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Class Section</DialogTitle>
            <DialogDescription className="text-xs">
              Update the grade, section, or academic session for this class.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4 pt-2">
            <SelectField
              control={editControl}
              name="className"
              label="Class Grade"
              required
              options={GRADE_OPTIONS}
            />
            <SelectField
              control={editControl}
              name="section"
              label="Section"
              required
              options={SECTION_OPTIONS}
            />
            <SessionField control={editControl} name="session" label="Academic Session" required />

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingClass(null)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
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
              <span>Confirm Class Section Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              {deleteTargetStudentCount > 0
                ? `This class section can't be deleted while it has students enrolled.`
                : 'Are you sure you want to delete this class section?'}
            </DialogDescription>
          </DialogHeader>

          {deleteTargetStudentCount > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300/60 bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300">
              <PiLock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {deleteTargetStudentCount} student{deleteTargetStudentCount === 1 ? ' is' : 's are'}{' '}
                still enrolled in Class {deleteTarget?.className}-{deleteTarget?.section}. Transfer
                or remove them first.
              </span>
            </div>
          )}

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
              disabled={deleteMutation.isPending || deleteTargetStudentCount > 0}
              className="text-xs"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Class'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClasses;
