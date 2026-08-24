import React, { useEffect, useState } from 'react';
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
import { TextField, DateField } from '@/components/form';
import { ExamWizardSheet } from './ExamWizardSheet';
import { adminService } from '@/lib/services/admin.service';
import { MAX_PAGE_SIZE, UpdateExamBody, type ExamRecord } from '@schoolerp/contracts';
import { getErrorMessage } from '@/lib/api';
import { qk } from '@/lib/query-keys';
import { toast } from 'sonner';
import { Award, Plus, Trash2, Pencil, Calendar, Search, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const AdminExams: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingExam, setEditingExam] = useState<ExamRecord | null>(null);

  const { control, handleSubmit, reset } = useForm<UpdateExamBody>({
    resolver: zodResolver(UpdateExamBody),
    defaultValues: { title: '', dateFrom: '', dateTo: '' },
  });

  useEffect(() => {
    if (editingExam) {
      reset({
        title: editingExam.title,
        dateFrom: editingExam.dateFrom,
        dateTo: editingExam.dateTo ?? undefined,
      });
    }
  }, [editingExam, reset]);

  // pageSize: MAX_PAGE_SIZE — this is a card grid with client-side search, not `<DataTable>`;
  // a school's total exam count comfortably fits in one page (ALIGNMENT_PLAN.md 2C/P1 — the
  // backend now paginates, but a real pagination *UI* here would be over-engineering for how few
  // rows this resource actually has).
  const {
    data: examsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.exams({ pageSize: MAX_PAGE_SIZE }),
    queryFn: () => adminService.getExams({ pageSize: MAX_PAGE_SIZE }),
  });
  const examsList = examsResponse?.data;

  const declareMutation = useMutation({
    mutationFn: ({ examId, isDeclared }: { examId: string; isDeclared: boolean }) =>
      adminService.declareResult(examId, isDeclared),
    onSuccess: () => {
      toast.success('Result publication status updated!');
      queryClient.invalidateQueries({ queryKey: qk.admin.exams() });
      if (selectedExam) {
        setSelectedExam((prev) =>
          prev ? { ...prev, isResultDecleared: !prev.isResultDecleared } : null,
        );
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (examId: string) => adminService.deleteExam(examId),
    onSuccess: () => {
      toast.success('Exam removed');
      queryClient.invalidateQueries({ queryKey: qk.admin.exams() });
      setDeleteConfirmId(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateExamBody) => adminService.updateExam(editingExam!.id, payload),
    onSuccess: () => {
      toast.success('Exam schedule updated');
      queryClient.invalidateQueries({ queryKey: qk.admin.exams() });
      queryClient.invalidateQueries({ queryKey: qk.admin.exam(editingExam!.id) });
      setEditingExam(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const onEditSubmit: SubmitHandler<UpdateExamBody> = (values) => updateMutation.mutate(values);

  const filteredExams = (examsList ?? []).filter((ex) =>
    `${ex.title} ${ex.className || ''}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Examinations & Result Publishing
            </h1>
            <Badge variant="outline" className="text-xs">
              {filteredExams.length} Exam Master Schedules
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Build examination date sheets, monitor subject marks completion, and officially publish
            term results.
          </p>
        </div>

        <Button
          onClick={() => setIsWizardOpen(true)}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Create Examination Schedule</span>
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search by exam title or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Exam Schedules List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : filteredExams.length === 0 ? (
        <Empty className="rounded-none border">
          <EmptyMedia variant="icon">
            <Award className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No exams scheduled yet</EmptyTitle>
          <EmptyDescription>
            {searchTerm ? 'No exams match your search.' : 'Create the first examination schedule.'}
          </EmptyDescription>
          {!searchTerm && (
            <Button size="sm" className="mt-1 text-xs" onClick={() => setIsWizardOpen(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Create Examination Schedule
            </Button>
          )}
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredExams.map((exam, idx) => {
            const examId = exam.id || `exam-${idx}`;

            return (
              <Card
                key={examId}
                onClick={() => navigate(`/admin/exams/${examId}`)}
                className="flex cursor-pointer flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
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
                    <Badge variant="secondary" className="text-[10px]">
                      Class {exam.className || '10'}-{exam.section || 'A'}
                    </Badge>
                  </div>

                  <CardTitle className="mt-2 text-base leading-snug font-bold text-slate-900 dark:text-white">
                    {exam.title}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3 text-indigo-500" />
                    <span>
                      {exam.dateFrom} to {exam.dateTo || 'TBD'}
                    </span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pt-0 text-xs">
                  {/* The list endpoint doesn't return a subject breakdown — that's the exam detail
                    view (GET /admin/exam/:examId isn't wired into a page yet, Phase 5). */}
                  <div className="text-muted-foreground rounded-lg bg-slate-50 p-2.5 text-[11px] dark:bg-zinc-800/50">
                    {exam.isResultDecleared
                      ? 'Results have been published for this exam.'
                      : 'Subject-wise marking status is available on the exam detail view.'}
                  </div>

                  {/* Result Declaration Action Button */}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 dark:border-zinc-800">
                    <Button
                      size="sm"
                      variant={exam.isResultDecleared ? 'outline' : 'default'}
                      className={`h-8 text-xs ${
                        exam.isResultDecleared
                          ? 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        declareMutation.mutate({
                          examId,
                          isDeclared: !exam.isResultDecleared,
                        });
                      }}
                      disabled={declareMutation.isPending}
                    >
                      {exam.isResultDecleared ? (
                        <>
                          <Check className="mr-1 h-3.5 w-3.5 text-emerald-500" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <Award className="mr-1 h-3.5 w-3.5" />
                          <span>Publish Results</span>
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingExam(exam);
                        }}
                        title="Edit Exam"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(examId);
                        }}
                        title="Delete Exam"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Exam Wizard */}
      <ExamWizardSheet open={isWizardOpen} onOpenChange={setIsWizardOpen} />

      {/* Edit Exam Modal — metadata only (title/dates); class/section/subjects are set once at
        creation and not editable here, see `UpdateExamBody`'s doc comment for why. */}
      <Dialog open={!!editingExam} onOpenChange={(open) => !open && setEditingExam(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Edit Exam Schedule</DialogTitle>
            <DialogDescription className="text-xs">
              Update the title or dates for {editingExam?.title}. Class, section, and subjects are
              fixed at creation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 pt-2">
            <TextField control={control} name="title" label="Exam Title" required />
            <div className="grid grid-cols-2 gap-3">
              <DateField control={control} name="dateFrom" label="Start Date" required />
              <DateField control={control} name="dateTo" label="End Date" />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingExam(null)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <Trash2 className="h-4 w-4" />
              <span>Confirm Exam Schedule Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to delete this examination master?
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
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Exam'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExams;
