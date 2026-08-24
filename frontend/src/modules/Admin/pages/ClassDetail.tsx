import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SelectField, SessionField } from '@/components/form';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { MAX_PAGE_SIZE, PromoteClassBody, type WeekDay } from '@schoolerp/contracts';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Trash2,
  Users,
  BookOpen,
  CalendarClock,
  Lock,
  GraduationCap,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const GRADE_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const value = String(i + 1);
  return { value, label: `Grade ${value}` };
});
const SECTION_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'].map((s) => ({
  value: s,
  label: `Section ${s}`,
}));

const WEEKDAYS: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const WEEKDAY_LABELS: Record<WeekDay, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
};

export const AdminClassDetail: React.FC = () => {
  const { classId = '' } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [graduatingIds, setGraduatingIds] = useState<Set<string>>(new Set());

  const {
    control: promoteControl,
    handleSubmit: handlePromoteSubmit,
    reset: resetPromote,
  } = useForm<Omit<PromoteClassBody, 'fromClassId' | 'graduatingStudentIds'>>({
    resolver: zodResolver(PromoteClassBody.omit({ fromClassId: true, graduatingStudentIds: true })),
    defaultValues: { toClassName: '', toSection: '', toSession: '' },
  });

  const {
    data: classesList,
    isLoading: classLoading,
    isError: classErrored,
    error: classError,
    refetch,
  } = useQuery({
    queryKey: qk.admin.classes(),
    queryFn: () => adminService.getClasses(),
  });

  const { data: groupedSubjects, isLoading: subjectsLoading } = useQuery({
    queryKey: qk.admin.subjectsGrouped(),
    queryFn: () => adminService.getAllClassSubjects(),
  });

  const { data: classSchedules, isLoading: timetableLoading } = useQuery({
    queryKey: qk.admin.timetable(),
    queryFn: () => adminService.getTimetable(),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminService.deleteClass(classId),
    onSuccess: () => {
      toast.success('Class section removed');
      queryClient.invalidateQueries({ queryKey: qk.admin.classes() });
      navigate('/admin/classes');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const cls = classesList?.find((c) => c.id === classId);

  const promoteMutation = useMutation({
    mutationFn: (values: Omit<PromoteClassBody, 'fromClassId' | 'graduatingStudentIds'>) =>
      adminService.promoteClass({
        fromClassId: classId,
        graduatingStudentIds: Array.from(graduatingIds),
        ...values,
      }),
    onSuccess: (result) => {
      if (result.failures.length > 0) {
        toast.warning(
          `Promoted ${result.promotedCount}, graduated ${result.graduatedCount} — ${result.failures.length} student(s) could not be moved (roll number collision in the target class).`,
        );
      } else {
        toast.success(
          `Promoted ${result.promotedCount} student(s) to Class ${result.toClass.className}-${result.toClass.section}` +
            (result.graduatedCount > 0 ? `, graduated ${result.graduatedCount}.` : '.'),
        );
      }
      queryClient.invalidateQueries({ queryKey: qk.admin.classes() });
      queryClient.invalidateQueries({ queryKey: qk.admin.students() });
      setIsPromoteOpen(false);
      setGraduatingIds(new Set());
      if (result.fromClass.isArchived) {
        navigate('/admin/classes');
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const onPromoteSubmit: SubmitHandler<
    Omit<PromoteClassBody, 'fromClassId' | 'graduatingStudentIds'>
  > = (values) => promoteMutation.mutate(values);

  // Filtered server-side by class+section now that the list endpoint supports it
  // (ALIGNMENT_PLAN.md 2C/P1) — pageSize: MAX_PAGE_SIZE since this roster view wants every
  // student in the section, not one page of it.
  const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: qk.admin.students({
      className: cls?.className,
      section: cls?.section,
      pageSize: MAX_PAGE_SIZE,
      sortBy: 'rollNo',
    }),
    queryFn: () =>
      adminService.getStudents({
        className: cls!.className,
        section: cls!.section,
        pageSize: MAX_PAGE_SIZE,
        sortBy: 'rollNo',
      }),
    enabled: !!cls,
  });
  const roster = studentsResponse?.data ?? [];

  const assignedSubjects = useMemo(
    () =>
      groupedSubjects?.assignedSubjects.find((g) => g.className === cls?.className)?.subjects ?? [],
    [groupedSubjects, cls],
  );

  const schedule = useMemo(
    () =>
      classSchedules?.find((c) => c.className === cls?.className && c.section === cls?.section)
        ?.schedule ?? [],
    [classSchedules, cls],
  );

  const isLoading = classLoading || studentsLoading || subjectsLoading || timetableLoading;

  if (classLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (classErrored || !cls) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => navigate('/admin/classes')}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Classes
        </Button>
        <ErrorState
          title={classErrored ? undefined : 'Class section not found'}
          description={
            classErrored ? getErrorMessage(classError) : `No class section matches this id.`
          }
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 -ml-2 text-xs"
            onClick={() => navigate('/admin/classes')}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Classes
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Class {cls.className} - {cls.section}
            </h1>
            <Badge variant="outline" className="text-xs">
              {cls.session}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {roster.length} student{roster.length === 1 ? '' : 's'} enrolled ·{' '}
            {assignedSubjects.length} subject{assignedSubjects.length === 1 ? '' : 's'} assigned
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
            disabled={roster.length === 0}
            onClick={() => {
              resetPromote({ toClassName: '', toSection: '', toSession: '' });
              setGraduatingIds(new Set());
              setIsPromoteOpen(true);
            }}
          >
            <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
            Promote Class
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-9 text-xs"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Remove Section
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Roster */}
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <Users className="h-4 w-4 text-indigo-500" />
              Class Roster
            </CardTitle>
            <CardDescription className="text-xs">
              Students enrolled in this section.
            </CardDescription>
          </CardHeader>
          {studentsLoading ? (
            <div className="space-y-1.5 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : roster.length === 0 ? (
            <Empty className="rounded-none border-0 border-t">
              <EmptyMedia variant="icon">
                <Users className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No students enrolled</EmptyTitle>
              <EmptyDescription>No student is currently enrolled in this section.</EmptyDescription>
            </Empty>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                    <TableHead className="text-xs font-bold">Roll No</TableHead>
                    <TableHead className="text-xs font-bold">Name</TableHead>
                    <TableHead className="text-xs font-bold">Student ID</TableHead>
                    <TableHead className="text-xs font-bold">Phone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((s) => (
                    <TableRow
                      key={s.studentId}
                      className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                      onClick={() => navigate(`/admin/students/${s.studentId}`)}
                    >
                      <TableCell className="text-xs font-semibold">#{s.rollNo}</TableCell>
                      <TableCell className="text-xs font-medium">
                        {s.firstName} {s.lastName ?? ''}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
                        {s.studentId}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{s.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Subjects */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              Assigned Subjects
            </CardTitle>
            <CardDescription className="text-xs">
              Subjects taught to Class {cls.className}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subjectsLoading ? (
              <div className="space-y-1.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : assignedSubjects.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                No subjects assigned to this class yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {assignedSubjects.map((sub) => (
                  <Badge
                    key={sub.subjectCode}
                    variant="outline"
                    className="text-[10px] font-medium"
                  >
                    {sub.subjectName} ({sub.subjectCode})
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timetable */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
            <CalendarClock className="h-4 w-4 text-indigo-500" />
            Weekly Timetable
          </CardTitle>
          <CardDescription className="text-xs">
            Read-only view — edit slots from{' '}
            <button
              className="text-indigo-600 hover:underline dark:text-indigo-400"
              onClick={() => navigate('/admin/academic')}
            >
              Academic → Timetable
            </button>
            .
          </CardDescription>
        </CardHeader>
        {timetableLoading ? (
          <div className="space-y-1.5 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : schedule.length === 0 ? (
          <Empty className="rounded-none border-0 border-t">
            <EmptyMedia variant="icon">
              <CalendarClock className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No timetable slots yet</EmptyTitle>
            <EmptyDescription>No periods have been scheduled for this section.</EmptyDescription>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                  <TableHead className="text-xs font-bold">Day</TableHead>
                  <TableHead className="text-xs font-bold">Periods</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {WEEKDAYS.map((day) => {
                  const periods = schedule.find((d) => d.weekday === day)?.periods ?? [];
                  if (periods.length === 0) return null;
                  return (
                    <TableRow key={day} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <TableCell className="text-xs font-bold">{WEEKDAY_LABELS[day]}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1.5">
                          {[...periods]
                            .sort((a, b) => a.periodNumber - b.periodNumber)
                            .map((p) => (
                              <Badge
                                key={p.periodNumber}
                                variant="secondary"
                                className="text-[10px] font-medium"
                              >
                                P{p.periodNumber}: {p.subjectName} · {p.teacherFullName}
                              </Badge>
                            ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Promote Class */}
      <Dialog open={isPromoteOpen} onOpenChange={setIsPromoteOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Promote Class {cls.className}-{cls.section}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Moves every active student below into the target class. Check a student to graduate
              them instead — they stay on record but drop off the active roster. This class is
              archived automatically once nothing active is left in it.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePromoteSubmit(onPromoteSubmit)} className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-3">
              <SelectField
                control={promoteControl}
                name="toClassName"
                label="Target Grade"
                required
                options={GRADE_OPTIONS}
              />
              <SelectField
                control={promoteControl}
                name="toSection"
                label="Target Section"
                required
                options={SECTION_OPTIONS}
              />
              <SessionField
                control={promoteControl}
                name="toSession"
                label="Target Session"
                required
              />
            </div>

            <div className="max-h-56 overflow-y-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                    <TableHead className="w-10" />
                    <TableHead className="text-xs font-bold">Roll No</TableHead>
                    <TableHead className="text-xs font-bold">Name</TableHead>
                    <TableHead className="text-xs font-bold">Graduate instead?</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roster.map((s) => (
                    <TableRow key={s.studentId}>
                      <TableCell />
                      <TableCell className="text-xs font-semibold">#{s.rollNo}</TableCell>
                      <TableCell className="text-xs">
                        {s.firstName} {s.lastName ?? ''}
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={graduatingIds.has(s.studentId)}
                          onCheckedChange={(checked) =>
                            setGraduatingIds((prev) => {
                              const next = new Set(prev);
                              if (checked) next.add(s.studentId);
                              else next.delete(s.studentId);
                              return next;
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <DialogFooter className="pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPromoteOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={promoteMutation.isPending}
                className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
              >
                {promoteMutation.isPending ? 'Promoting...' : 'Promote Class'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <Trash2 className="h-4 w-4" />
              <span>Confirm Class Section Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              {roster.length > 0
                ? `This class section can't be deleted while it has students enrolled.`
                : 'Are you sure you want to delete this class section?'}
            </DialogDescription>
          </DialogHeader>

          {roster.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-50 p-2.5 text-[11px] text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-300">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                {roster.length} student{roster.length === 1 ? ' is' : 's are'} still enrolled in
                Class {cls.className}-{cls.section}. Transfer or remove them first.
              </span>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending || roster.length > 0 || isLoading}
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

export default AdminClassDetail;
