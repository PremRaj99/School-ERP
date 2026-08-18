import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { adminService } from '@/lib/services/admin.service';
import type { Exam, CreateExamPayload } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import { Award, Plus, Trash2, Calendar, Sparkles, Search, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const sampleExams: Exam[] = [
  {
    id: 'exam-1',
    title: 'Mid-Term Assessment 2025-2026',
    dateFrom: '15-10-2025',
    dateTo: '25-10-2025',
    isResultDecleared: true,
    className: '10',
    section: 'A',
    examSubjects: [
      {
        subjectCode: 'MATH101',
        subjectName: 'Mathematics',
        fullMarks: 100,
        teacherId: 'TCH-001',
        date: '15-10-2025',
        isMarked: true,
      },
      {
        subjectCode: 'PHY201',
        subjectName: 'Physics',
        fullMarks: 100,
        teacherId: 'TCH-002',
        date: '17-10-2025',
        isMarked: true,
      },
      {
        subjectCode: 'CHEM301',
        subjectName: 'Chemistry',
        fullMarks: 100,
        teacherId: 'TCH-004',
        date: '20-10-2025',
        isMarked: true,
      },
      {
        subjectCode: 'ENG001',
        subjectName: 'English',
        fullMarks: 100,
        teacherId: 'TCH-003',
        date: '22-10-2025',
        isMarked: true,
      },
    ],
  },
  {
    id: 'exam-2',
    title: 'Pre-Board Examination Series 1',
    dateFrom: '10-12-2025',
    dateTo: '20-12-2025',
    isResultDecleared: false,
    className: '10',
    section: 'A',
    examSubjects: [
      {
        subjectCode: 'MATH101',
        subjectName: 'Mathematics',
        fullMarks: 100,
        teacherId: 'TCH-001',
        date: '10-12-2025',
        isMarked: true,
      },
      {
        subjectCode: 'PHY201',
        subjectName: 'Physics',
        fullMarks: 100,
        teacherId: 'TCH-002',
        date: '12-12-2025',
        isMarked: false,
      },
      {
        subjectCode: 'CHEM301',
        subjectName: 'Chemistry',
        fullMarks: 100,
        teacherId: 'TCH-004',
        date: '15-12-2025',
        isMarked: false,
      },
    ],
  },
  {
    id: 'exam-3',
    title: 'Annual Final Examination 2026',
    dateFrom: '01-03-2026',
    dateTo: '15-03-2026',
    isResultDecleared: false,
    className: '9',
    section: 'A',
    examSubjects: [
      {
        subjectCode: 'MATH101',
        subjectName: 'Mathematics',
        fullMarks: 100,
        teacherId: 'TCH-001',
        date: '01-03-2026',
        isMarked: false,
      },
      {
        subjectCode: 'PHY201',
        subjectName: 'Physics',
        fullMarks: 100,
        teacherId: 'TCH-002',
        date: '04-03-2026',
        isMarked: false,
      },
    ],
  },
];

export const AdminExams: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateExamPayload>({
    title: '',
    dateFrom: '15-11-2025',
    dateTo: '25-11-2025',
    className: '10',
    section: 'A',
    session: '2025-2026',
    subjects: [
      { subjectCode: 'MATH101', fullMarks: 100, teacherId: 'TCH-001', date: '15-11-2025' },
      { subjectCode: 'PHY201', fullMarks: 100, teacherId: 'TCH-002', date: '18-11-2025' },
    ],
  });

  const { data: apiExams } = useQuery({
    queryKey: ['adminExams'],
    queryFn: () => adminService.getExams(),
  });

  const examsList: Exam[] = useMemo(() => {
    if (apiExams?.data && Array.isArray(apiExams.data) && apiExams.data.length > 0) {
      return apiExams.data;
    }
    return sampleExams;
  }, [apiExams]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateExamPayload) => adminService.createExam(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Exam schedule published successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminExams'] });
      setIsCreateOpen(false);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const declareMutation = useMutation({
    mutationFn: ({ examId, isDeclared }: { examId: string; isDeclared: boolean }) =>
      adminService.declareResult(examId, isDeclared),
    onSuccess: (res) => {
      toast.success(res.message || 'Result publication status updated!');
      queryClient.invalidateQueries({ queryKey: ['adminExams'] });
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
      queryClient.invalidateQueries({ queryKey: ['adminExams'] });
      setDeleteConfirmId(null);
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredExams = examsList.filter((ex) =>
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
          onClick={() => setIsCreateOpen(true)}
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
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredExams.map((exam, idx) => {
          const examId = exam.id || exam._id || `exam-${idx}`;
          const subjects = exam.examSubjects || [];
          const allMarked = subjects.length > 0 && subjects.every((s) => s.isMarked);

          return (
            <Card
              key={examId}
              className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${
                        exam.isResultDecleared
                          ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : allMarked
                            ? 'border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {exam.isResultDecleared
                        ? 'Results Declared'
                        : allMarked
                          ? 'Ready to Declare'
                          : 'Marking In Progress'}
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
                <div className="space-y-1.5 rounded-lg bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                    Scheduled Subjects ({subjects.length})
                  </span>
                  <div className="space-y-1">
                    {subjects.slice(0, 3).map((sub, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          {sub.subjectName || sub.subjectCode}
                        </span>
                        <span className="text-muted-foreground text-[10px]">{sub.date}</span>
                      </div>
                    ))}
                    {subjects.length > 3 && (
                      <p className="text-muted-foreground pt-0.5 text-[10px]">
                        +{subjects.length - 3} more subjects
                      </p>
                    )}
                  </div>
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
                    onClick={() =>
                      declareMutation.mutate({
                        examId,
                        isDeclared: !exam.isResultDecleared,
                      })
                    }
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

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                    onClick={() => setDeleteConfirmId(examId)}
                    title="Delete Exam"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Exam Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>Exam Controller Office</span>
            </div>
            <DialogTitle className="text-lg font-bold">Schedule Term Examination</DialogTitle>
            <DialogDescription className="text-xs">
              Define the examination title, target class, and scheduled dates.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label htmlFor="examTitle" className="text-xs font-semibold">
                Exam Title <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="examTitle"
                placeholder="e.g. Mid-Term Examination 2025-2026"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="eDateFrom" className="text-xs font-semibold">
                  Start Date (DD-MM-YYYY) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="eDateFrom"
                  placeholder="15-11-2025"
                  value={formData.dateFrom}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dateFrom: e.target.value }))}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="eDateTo" className="text-xs font-semibold">
                  End Date (DD-MM-YYYY)
                </Label>
                <Input
                  id="eDateTo"
                  placeholder="25-11-2025"
                  value={formData.dateTo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dateTo: e.target.value }))}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="eClass" className="text-xs font-semibold">
                  Class <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="eClass"
                  placeholder="10"
                  value={formData.className}
                  onChange={(e) => setFormData((prev) => ({ ...prev, className: e.target.value }))}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="eSection" className="text-xs font-semibold">
                  Section <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="eSection"
                  placeholder="A"
                  value={formData.section}
                  onChange={(e) => setFormData((prev) => ({ ...prev, section: e.target.value }))}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="eSession" className="text-xs font-semibold">
                  Session <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="eSession"
                  placeholder="2025-2026"
                  value={formData.session}
                  onChange={(e) => setFormData((prev) => ({ ...prev, session: e.target.value }))}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

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
                className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
              >
                {createMutation.isPending ? 'Scheduling...' : 'Confirm Schedule'}
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
