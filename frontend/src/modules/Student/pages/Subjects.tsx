import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { PiUser, PiClock } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

export const StudentSubjects: React.FC = () => {
  const {
    data: subjects,
    isLoading: subjectsLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.student.subjects(),
    queryFn: () => studentService.getSubjects(),
  });

  const { data: classSchedules, isLoading: timetableLoading } = useQuery({
    queryKey: qk.student.timetable(),
    queryFn: () => studentService.getTimetable(),
  });

  const bySubjectCode = useMemo(() => {
    const map = new Map<string, { teacherFullName: string; periodCount: number }>();
    for (const cls of classSchedules ?? []) {
      for (const day of cls.schedule) {
        for (const period of day.periods) {
          const entry = map.get(period.subjectCode) ?? {
            teacherFullName: period.teacherFullName,
            periodCount: 0,
          };
          entry.periodCount += 1;
          map.set(period.subjectCode, entry);
        }
      }
    }
    return map;
  }, [classSchedules]);

  const isLoading = subjectsLoading || timetableLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Enrolled Subjects</h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              {(subjects ?? []).length} Subjects
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Subjects on your class timetable, with the assigned instructor and weekly period load.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (subjects ?? []).length === 0 ? (
        <Empty className="rounded-md border p-8">
          <EmptyMedia illustration="subjects" illustrationSize={120} />
          <EmptyTitle>No subjects yet</EmptyTitle>
          <EmptyDescription>Your class has no subjects on its timetable yet.</EmptyDescription>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(subjects ?? []).map((sub) => {
            const info = bySubjectCode.get(sub.subjectCode);
            return (
              <Card
                key={sub.subjectCode}
                className="border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <CardHeader className="pb-3">
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary font-mono text-[10px] font-bold"
                  >
                    {sub.subjectCode}
                  </Badge>
                  <CardTitle className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {sub.subjectName}
                  </CardTitle>
                  {info?.teacherFullName && (
                    <CardDescription className="text-primary mt-0.5 flex items-center gap-1.5 text-xs font-medium">
                      <PiUser className="h-3 w-3" />
                      <span>{info.teacherFullName}</span>
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="text-muted-foreground flex items-center gap-1.5 pt-0 text-[11px]">
                  <PiClock className="h-3 w-3" />
                  <span>
                    {info?.periodCount ?? 0} period{info?.periodCount === 1 ? '' : 's'} / week
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentSubjects;
