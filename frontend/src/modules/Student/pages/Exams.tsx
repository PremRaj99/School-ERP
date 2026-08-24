import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate, dateToIsoDate } from '@/lib/date';
import { PiMedal, PiCalendar, PiArrowRight, PiCheck } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

export const StudentExams: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: exams,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.student.exams(),
    queryFn: () => studentService.getExams(),
  });

  const today = dateToIsoDate(new Date());
  const { upcoming, past } = useMemo(() => {
    const list = exams ?? [];
    return {
      upcoming: list
        .filter((e) => e.dateFrom >= today)
        .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom)),
      past: list
        .filter((e) => e.dateFrom < today)
        .sort((a, b) => b.dateFrom.localeCompare(a.dateFrom)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exams]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Examinations & Marksheets</h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              {(exams ?? []).length} Total
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Upcoming assessment schedules and declared term results.
          </p>
        </div>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold">
          <PiCalendar className="text-primary h-4 w-4" />
          Upcoming Examinations
        </h2>
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground text-xs">No upcoming examinations scheduled.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((exam) => (
              <Card
                key={exam.id}
                className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                    {exam.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isoToDisplayDate(exam.dateFrom)}
                    {exam.dateTo && ` – ${isoToDisplayDate(exam.dateTo)}`}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past / Results */}
      <div>
        <h2 className="mb-3 flex items-center gap-1.5 text-base font-bold">
          <PiMedal className="text-primary h-4 w-4" />
          Past Examinations
        </h2>
        {past.length === 0 ? (
          <Empty className="rounded-md border">
            <EmptyMedia variant="icon">
              <PiMedal className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No past examinations</EmptyTitle>
            <EmptyDescription>Your examination history will show up here.</EmptyDescription>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {past.map((exam) => (
              <Card
                key={exam.id}
                onClick={() =>
                  exam.isResultDecleared && navigate(`/student/exams/${exam.id}/result`)
                }
                className={`flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow dark:border-zinc-800 dark:bg-zinc-900/90 ${
                  exam.isResultDecleared ? 'cursor-pointer hover:shadow-md' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <Badge
                    variant="outline"
                    className={`w-fit text-[10px] font-semibold ${
                      exam.isResultDecleared
                        ? 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {exam.isResultDecleared ? 'Results Declared' : 'Awaiting Results'}
                  </Badge>
                  <CardTitle className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {exam.title}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {isoToDisplayDate(exam.dateFrom)}
                    {exam.dateTo && ` – ${isoToDisplayDate(exam.dateTo)}`}
                  </CardDescription>
                </CardHeader>
                {exam.isResultDecleared && (
                  <CardContent className="pt-0">
                    <span className="text-primary flex items-center gap-1 text-xs font-semibold">
                      <PiCheck className="h-3.5 w-3.5" />
                      View Marksheet
                      <PiArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentExams;
