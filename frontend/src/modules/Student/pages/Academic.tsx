import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import type { WeekDay } from '@schoolerp/contracts';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const WEEKDAYS: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const CATEGORY_STYLES: Record<string, string> = {
  HOLIDAY: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  EXAM: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
  EVENT: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  OTHER: 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300',
};

export const StudentAcademic: React.FC = () => {
  const {
    data: classSchedules,
    isLoading: timetableLoading,
    isError: timetableErrored,
    error: timetableError,
    refetch: refetchTimetable,
  } = useQuery({
    queryKey: qk.student.timetable(),
    queryFn: () => studentService.getTimetable(),
  });

  const {
    data: events,
    isLoading: calendarLoading,
    isError: calendarErrored,
    error: calendarError,
    refetch: refetchCalendar,
  } = useQuery({
    queryKey: qk.student.calendar(),
    queryFn: () => studentService.getCalendar(),
  });

  const grid = useMemo(() => {
    const map = new Map<string, { subjectName: string; teacherFullName: string }>();
    for (const cls of classSchedules ?? []) {
      for (const day of cls.schedule) {
        for (const period of day.periods) {
          map.set(`${day.weekday}-${period.periodNumber}`, {
            subjectName: period.subjectName,
            teacherFullName: period.teacherFullName,
          });
        }
      }
    }
    return map;
  }, [classSchedules]);

  const classLabel = classSchedules?.[0]
    ? `Class ${classSchedules[0].className}-${classSchedules[0].section}`
    : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Academic Timetable & Events</h1>
            {classLabel && (
              <Badge variant="outline" className="border-indigo-500/30 text-xs text-indigo-600">
                {classLabel}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Your weekly class schedule and the school event holiday calendar.
          </p>
        </div>
      </div>

      <Tabs defaultValue="timetable" className="w-full">
        <TabsList className="h-10 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="timetable" className="rounded-lg px-4 text-xs font-semibold">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
            <span>Weekly Class Timetable</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="rounded-lg px-4 text-xs font-semibold">
            <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            <span>School Event Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timetable" className="pt-4 focus:outline-hidden">
          {timetableLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : timetableErrored ? (
            <ErrorState
              description={getErrorMessage(timetableError)}
              onRetry={() => refetchTimetable()}
            />
          ) : grid.size === 0 ? (
            <Empty className="rounded-none border">
              <EmptyMedia variant="icon">
                <Clock className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No timetable yet</EmptyTitle>
              <EmptyDescription>Your class has no timetable slots scheduled yet.</EmptyDescription>
            </Empty>
          ) : (
            <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/60">
                      <th className="w-20 p-3 font-bold text-slate-800 dark:text-zinc-200">
                        Period
                      </th>
                      {WEEKDAYS.map((day) => (
                        <th key={day} className="p-3 font-bold text-slate-800 dark:text-zinc-200">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {PERIODS.map((period) => (
                      <tr key={period} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                        <td className="bg-slate-50/30 p-3 text-center font-semibold text-indigo-600 dark:bg-zinc-900 dark:text-indigo-400">
                          P{period}
                        </td>
                        {WEEKDAYS.map((day) => {
                          const cell = grid.get(`${day}-${period}`);
                          return (
                            <td key={day} className="p-2.5 align-top">
                              {cell ? (
                                <div className="rounded-lg border border-indigo-100 bg-indigo-50/60 p-2 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                                  <span className="block text-[11px] font-semibold text-indigo-950 dark:text-indigo-200">
                                    {cell.subjectName}
                                  </span>
                                  <span className="text-muted-foreground text-[10px]">
                                    {cell.teacherFullName}
                                  </span>
                                </div>
                              ) : (
                                <div className="h-10 rounded-lg border border-dashed border-slate-200/60 dark:border-zinc-800/60" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="pt-4 focus:outline-hidden">
          {calendarLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : calendarErrored ? (
            <ErrorState
              description={getErrorMessage(calendarError)}
              onRetry={() => refetchCalendar()}
            />
          ) : (events ?? []).length === 0 ? (
            <Empty className="rounded-none border">
              <EmptyMedia variant="icon">
                <CalendarIcon className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No events yet</EmptyTitle>
              <EmptyDescription>
                The academic calendar has no events scheduled yet.
              </EmptyDescription>
            </Empty>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...(events ?? [])]
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((ev) => (
                  <Card
                    key={ev.id}
                    className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold ${CATEGORY_STYLES[ev.category] ?? ''}`}
                        >
                          {ev.category}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
                          <CalendarIcon className="h-3 w-3 text-indigo-500" />
                          <span>{isoToDisplayDate(ev.date)}</span>
                        </span>
                      </div>
                      <CardTitle className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                        {ev.title}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentAcademic;
