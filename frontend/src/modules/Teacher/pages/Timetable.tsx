import React, { useMemo } from 'react';
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
import type { WeekDay } from '@schoolerp/contracts';
import { PiCalendarDots, PiUserCheck, PiMedal, PiBookOpen } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

const WEEKDAYS: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const WEEKDAY_LABELS: Record<WeekDay, string> = {
  MON: 'Mon',
  TUE: 'Tue',
  WED: 'Wed',
  THU: 'Thu',
  FRI: 'Fri',
  SAT: 'Sat',
};
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const TODAY_WEEKDAY = WEEKDAYS[[6, 0, 1, 2, 3, 4, 5][new Date().getDay()]] as WeekDay | undefined;
// getDay(): 0=Sun..6=Sat. Map to our MON-SAT index (Sunday has no column, falls through to undefined).

export const TeacherTimetable: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: classSchedules,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.teacher.timetable(),
    queryFn: () => teacherService.getTimetable(),
  });

  const grid = useMemo(() => {
    const map = new Map<
      string,
      { className: string; section: string; subjectName: string; subjectCode: string }
    >();
    for (const cls of classSchedules ?? []) {
      for (const day of cls.schedule) {
        for (const period of day.periods) {
          map.set(`${day.weekday}-${period.periodNumber}`, {
            className: cls.className,
            section: cls.section,
            subjectName: period.subjectName,
            subjectCode: period.subjectCode,
          });
        }
      }
    }
    return map;
  }, [classSchedules]);

  const myClasses = useMemo(() => {
    const map = new Map<
      string,
      { className: string; section: string; subjects: Set<string>; periodCount: number }
    >();
    for (const cls of classSchedules ?? []) {
      const key = `${cls.className}|${cls.section}`;
      const entry = map.get(key) ?? {
        className: cls.className,
        section: cls.section,
        subjects: new Set<string>(),
        periodCount: 0,
      };
      for (const day of cls.schedule) {
        for (const period of day.periods) {
          entry.subjects.add(period.subjectName);
          entry.periodCount += 1;
        }
      }
      map.set(key, entry);
    }
    return Array.from(map.values());
  }, [classSchedules]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-96 w-full" />
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
            <h1 className="text-2xl font-extrabold tracking-tight">My Weekly Timetable</h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              <PiCalendarDots className="mr-1 h-3 w-3" />
              Teaching Schedule
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Every period you're scheduled to teach this week.
          </p>
        </div>
      </div>

      {/* Weekly Grid */}
      {grid.size === 0 ? (
        <Empty className="rounded-md border p-8">
          <EmptyMedia illustration="timetable" illustrationSize={120} />
          <EmptyTitle>No periods scheduled</EmptyTitle>
          <EmptyDescription>You have no timetable slots assigned yet.</EmptyDescription>
        </Empty>
      ) : (
        <Card className="overflow-x-auto border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <table className="w-full min-w-[720px] border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-16 text-left text-[11px] font-bold text-slate-500">Period</th>
                {WEEKDAYS.map((day) => (
                  <th
                    key={day}
                    className={`text-center text-[11px] font-bold ${
                      day === TODAY_WEEKDAY ? 'text-primary' : 'text-slate-500 dark:text-zinc-400'
                    }`}
                  >
                    {WEEKDAY_LABELS[day]}
                    {day === TODAY_WEEKDAY && <span className="ml-1">•</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period}>
                  <td className="text-muted-foreground text-center text-[11px] font-bold">
                    P{period}
                  </td>
                  {WEEKDAYS.map((day) => {
                    const cell = grid.get(`${day}-${period}`);
                    const isToday = day === TODAY_WEEKDAY;
                    return (
                      <td key={day} className="p-0">
                        {cell ? (
                          <div
                            className={`rounded-md border p-2 text-center text-[10px] leading-tight ${
                              isToday
                                ? 'border-primary/40 bg-primary/10'
                                : 'border-slate-200/80 bg-slate-50/60 dark:border-zinc-800 dark:bg-zinc-800/40'
                            }`}
                          >
                            <div className="font-bold text-slate-900 dark:text-white">
                              {cell.className}-{cell.section}
                            </div>
                            <div className="text-primary">{cell.subjectCode}</div>
                          </div>
                        ) : (
                          <div className="h-11 rounded-md border border-dashed border-slate-200/60 dark:border-zinc-800/60" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* My Classes */}
      <div>
        <h2 className="mb-3 text-base font-bold">My Classes</h2>
        {myClasses.length === 0 ? (
          <p className="text-muted-foreground text-xs">No classes assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myClasses.map((cls) => (
              <Card
                key={`${cls.className}-${cls.section}`}
                className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold">
                    Class {cls.className}-{cls.section}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <PiBookOpen className="text-primary h-3 w-3" />
                    {Array.from(cls.subjects).join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <p className="text-muted-foreground text-[11px]">
                    {cls.periodCount} period{cls.periodCount === 1 ? '' : 's'} / week
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full text-xs"
                    onClick={() =>
                      navigate(`/teacher/attendance?class=${cls.className}|${cls.section}`)
                    }
                  >
                    <PiUserCheck className="text-primary mr-1.5 h-3.5 w-3.5" />
                    Take Attendance
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-full text-xs"
                    onClick={() => navigate('/teacher/exams')}
                  >
                    <PiMedal className="text-primary mr-1.5 h-3.5 w-3.5" />
                    Enter Marks
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherTimetable;
