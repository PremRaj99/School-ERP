import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { teacherService } from '@/lib/services/teacher.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { PiMedal, PiArrowRight, PiCalendarDots } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

export const TeacherExams: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: exams,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.teacher.exams(),
    queryFn: () => teacherService.getExams(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Exams & Grading</h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              Marking Schedule
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Exams that include a subject assigned to you.
          </p>
        </div>

        <Button
          onClick={() => navigate('/teacher/results')}
          className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
        >
          <PiMedal className="h-3.5 w-3.5" />
          <span>Open Grading Sheet</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (exams ?? []).length === 0 ? (
        <Empty className="rounded-md border p-8">
          <EmptyMedia illustration="exams" illustrationSize={120} />
          <EmptyTitle>No exams assigned yet</EmptyTitle>
          <EmptyDescription>None of your subjects appear in an examination yet.</EmptyDescription>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(exams ?? []).map((exam) => (
            <Card
              key={exam.id}
              className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-[10px]">
                    Class {exam.className}-{exam.section}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      exam.isResultDecleared
                        ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {exam.isResultDecleared ? 'Results Declared' : 'In Progress'}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                  {exam.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <PiCalendarDots className="text-primary h-3 w-3" />
                  <span>
                    {isoToDisplayDate(exam.dateFrom)} to{' '}
                    {exam.dateTo ? isoToDisplayDate(exam.dateTo) : 'TBD'}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 h-8 w-full text-xs text-white"
                  onClick={() => navigate(`/teacher/results?examId=${exam.id}`)}
                >
                  <span>Evaluate & Enter Marks</span>
                  <PiArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherExams;
