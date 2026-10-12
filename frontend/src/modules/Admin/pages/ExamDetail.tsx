import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { formatTimeRange, isoToDisplayDate } from '@/lib/date';
import { Input } from '@/components/ui/input';
import type { UpdateExamScheduleBody } from '@schoolerp/contracts';
import { toast } from 'sonner';
import {
  PiArrowLeft,
  PiTrash,
  PiMedal,
  PiCheck,
  PiCalendarDots,
  PiListChecks,
  PiIdentificationCard,
} from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type ScheduleRow = UpdateExamScheduleBody['subjects'][number];

export const AdminExamDetail: React.FC = () => {
  const { examId = '' } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  // Date-sheet editor draft — `null` while the dialog is closed.
  const [scheduleDraft, setScheduleDraft] = useState<ScheduleRow[] | null>(null);

  const {
    data: exam,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.exam(examId),
    queryFn: () => adminService.getExamById(examId),
    enabled: !!examId,
  });

  const scheduleMutation = useMutation({
    mutationFn: (subjects: ScheduleRow[]) => adminService.updateExamSchedule(examId, { subjects }),
    onSuccess: (updated) => {
      toast.success('Date sheet updated');
      queryClient.setQueryData(qk.admin.exam(examId), updated);
      setScheduleDraft(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const declareMutation = useMutation({
    mutationFn: (isDeclared: boolean) => adminService.declareResult(examId, isDeclared),
    onSuccess: () => {
      toast.success('Result publication status updated!');
      queryClient.invalidateQueries({ queryKey: qk.admin.exam(examId) });
      queryClient.invalidateQueries({ queryKey: qk.admin.exams() });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminService.deleteExam(examId),
    onSuccess: () => {
      toast.success('Exam removed');
      queryClient.invalidateQueries({ queryKey: qk.admin.exams() });
      navigate('/admin/exams');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => navigate('/admin/exams')}
        >
          <PiArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Examinations
        </Button>
        <ErrorState
          title={isError ? undefined : 'Exam not found'}
          description={isError ? getErrorMessage(error) : `No examination matches this ID.`}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const markedCount = exam.subjects.filter((s) => s.isMarked).length;
  // The API already returns papers in date-sheet order (date, then start time).
  const sortedSubjects = exam.subjects;
  const lastDay = exam.dateTo ?? exam.dateFrom;
  const updateDraftRow = (examSubjectId: string, patch: Partial<ScheduleRow>) =>
    setScheduleDraft((rows) =>
      rows ? rows.map((r) => (r.examSubjectId === examSubjectId ? { ...r, ...patch } : r)) : rows,
    );
  const draftInvalid = (scheduleDraft ?? []).some(
    (r) =>
      !r.date ||
      r.date < exam.dateFrom ||
      r.date > lastDay ||
      (r.startTime !== null && r.endTime !== null && r.endTime <= r.startTime),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 -ml-2 text-xs"
            onClick={() => navigate('/admin/exams')}
          >
            <PiArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Examinations
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">{exam.title}</h1>
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold ${
                exam.isResultDecleared
                  ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {exam.isResultDecleared ? 'Results Declared' : 'Marking In Progress'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-xs">
            <span>
              Class {exam.className}-{exam.section}
            </span>
            <span>·</span>
            <PiCalendarDots className="h-3 w-3" />
            <span>
              {isoToDisplayDate(exam.dateFrom)} to{' '}
              {exam.dateTo ? isoToDisplayDate(exam.dateTo) : 'TBD'}
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-9 text-xs"
            disabled={exam.subjects.length === 0}
            onClick={() => navigate(`/admin/exams/${examId}/report-cards`)}
          >
            <PiIdentificationCard className="mr-1.5 h-3.5 w-3.5" />
            Report Cards
          </Button>
          <Button
            size="sm"
            variant={exam.isResultDecleared ? 'outline' : 'default'}
            className={`h-9 text-xs ${
              exam.isResultDecleared
                ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
            onClick={() => declareMutation.mutate(!exam.isResultDecleared)}
            disabled={declareMutation.isPending}
          >
            {exam.isResultDecleared ? (
              <>
                <PiCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                Published
              </>
            ) : (
              <>
                <PiMedal className="mr-1.5 h-3.5 w-3.5" />
                Publish Results
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-9 text-xs"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <PiTrash className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Subjects Breakdown */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <PiListChecks className="text-primary h-4 w-4" />
                Date Sheet & Marking Status
              </CardTitle>
              <CardDescription className="text-xs">
                {markedCount} of {exam.subjects.length} subject
                {exam.subjects.length === 1 ? '' : 's'} marked.
              </CardDescription>
            </div>
            {exam.subjects.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs"
                onClick={() =>
                  setScheduleDraft(
                    exam.subjects.map((s) => ({
                      examSubjectId: s.examSubjectId,
                      date: s.date,
                      startTime: s.startTime,
                      endTime: s.endTime,
                    })),
                  )
                }
              >
                <PiCalendarDots className="mr-1 h-3.5 w-3.5" />
                Edit Date Sheet
              </Button>
            )}
          </div>
        </CardHeader>
        {exam.subjects.length === 0 ? (
          <Empty className="rounded-md border-0 border-t">
            <EmptyMedia variant="icon">
              <PiListChecks className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No subjects scheduled</EmptyTitle>
            <EmptyDescription>No subjects have been added to this exam yet.</EmptyDescription>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                <TableHead className="text-xs font-bold">Subject</TableHead>
                <TableHead className="text-xs font-bold">Teacher</TableHead>
                <TableHead className="text-xs font-bold">Exam Date</TableHead>
                <TableHead className="text-xs font-bold">Time</TableHead>
                <TableHead className="text-xs font-bold">Full Marks</TableHead>
                <TableHead className="text-right text-xs font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSubjects.map((s) => (
                <TableRow
                  key={s.examSubjectId}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                >
                  <TableCell className="text-xs font-semibold">
                    {s.subjectName}{' '}
                    <span className="text-muted-foreground font-mono">({s.subjectCode})</span>
                  </TableCell>
                  <TableCell
                    className="text-primary cursor-pointer text-xs hover:underline"
                    onClick={() => navigate(`/admin/teachers/${s.teacherId}`)}
                  >
                    {s.teacherFullName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {isoToDisplayDate(s.date)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatTimeRange(s.startTime, s.endTime) || 'Not set'}
                  </TableCell>
                  <TableCell className="text-xs font-semibold">{s.fullMarks}</TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        s.isMarked
                          ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'border-slate-300 text-slate-600 dark:border-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      {s.isMarked ? 'Marked' : 'Pending'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Date sheet editor */}
      <Dialog open={!!scheduleDraft} onOpenChange={(open) => !open && setScheduleDraft(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Date Sheet</DialogTitle>
            <DialogDescription className="text-xs">
              Every paper must fall between {isoToDisplayDate(exam.dateFrom)} and{' '}
              {isoToDisplayDate(lastDay)}. Times are optional.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {(scheduleDraft ?? []).map((row) => {
              const subject = exam.subjects.find((s) => s.examSubjectId === row.examSubjectId);
              const badTime =
                row.startTime !== null && row.endTime !== null && row.endTime <= row.startTime;
              return (
                <div key={row.examSubjectId} className="flex flex-wrap items-center gap-2">
                  <span className="min-w-36 flex-1 text-xs font-semibold">
                    {subject?.subjectName}
                  </span>
                  <Input
                    type="date"
                    aria-label={`${subject?.subjectName} date`}
                    value={row.date}
                    min={exam.dateFrom}
                    max={lastDay}
                    onChange={(e) => updateDraftRow(row.examSubjectId, { date: e.target.value })}
                    className="h-8 w-36 text-xs"
                  />
                  <Input
                    type="time"
                    aria-label={`${subject?.subjectName} start time`}
                    value={row.startTime ?? ''}
                    onChange={(e) =>
                      updateDraftRow(row.examSubjectId, { startTime: e.target.value || null })
                    }
                    className="h-8 w-28 text-xs"
                  />
                  <span className="text-muted-foreground text-xs">to</span>
                  <Input
                    type="time"
                    aria-label={`${subject?.subjectName} end time`}
                    aria-invalid={badTime}
                    value={row.endTime ?? ''}
                    onChange={(e) =>
                      updateDraftRow(row.examSubjectId, { endTime: e.target.value || null })
                    }
                    className="h-8 w-28 text-xs"
                  />
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-9 text-xs"
              onClick={() => setScheduleDraft(null)}
            >
              Cancel
            </Button>
            <Button
              className="h-9 text-xs"
              disabled={draftInvalid || scheduleMutation.isPending}
              onClick={() => scheduleDraft && scheduleMutation.mutate(scheduleDraft)}
            >
              {scheduleMutation.isPending ? 'Saving…' : 'Save Date Sheet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <PiTrash className="h-4 w-4" />
              <span>Delete Exam</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to delete this exam? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
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
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Exam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExamDetail;
