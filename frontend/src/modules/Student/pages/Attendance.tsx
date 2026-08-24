import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { PiFire } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

const currentMonthString = () => new Date().toISOString().slice(0, 7);

const ATTENDANCE_DAY_STYLES: Record<string, string> = {
  Present: 'bg-emerald-500 text-white',
  Absent: 'bg-rose-500 text-white',
  Leave: 'bg-amber-500 text-white',
};

export const StudentAttendance: React.FC = () => {
  const [month, setMonth] = useState(currentMonthString);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.student.attendance(month),
    queryFn: () => studentService.getAttendance(month),
  });

  const statusByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of data ?? []) map.set(d.date, d.status);
    return map;
  }, [data]);

  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const firstWeekday = new Date(year, mon - 1, 1).getDay();

  const present = (data ?? []).filter((d) => d.status === 'Present').length;
  const absent = (data ?? []).filter((d) => d.status === 'Absent').length;
  const leave = (data ?? []).filter((d) => d.status === 'Leave').length;
  const total = present + absent + leave;
  const pct = total > 0 ? Math.round((present / total) * 100) : null;

  // Current streak: consecutive "Present" days counting back from today (or the most recent
  // marked day), stopping at the first non-Present day.
  const currentStreak = useMemo(() => {
    const sorted = [...(data ?? [])].sort((a, b) => b.date.localeCompare(a.date));
    let streak = 0;
    for (const day of sorted) {
      if (day.status === 'Present') streak += 1;
      else break;
    }
    return streak;
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Attendance & Calendar</h1>
            {pct !== null && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  pct >= 75
                    ? 'border-emerald-500/30 text-emerald-600'
                    : 'border-rose-500/30 text-rose-600'
                }`}
              >
                {pct}% This Month
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Minimum 75% overall attendance is required to sit for final examinations.
          </p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border-input h-9 rounded-md border bg-transparent px-2.5 text-xs font-semibold"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Present</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {present} Days
            </p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Absent</span>
            <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
              {absent} Days
            </p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Leave</span>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
              {leave} Days
            </p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Current Streak</span>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {currentStreak} Days
              </p>
            </div>
            <PiFire className="text-primary h-5 w-5" />
          </CardContent>
        </Card>
      </div>

      {/* Calendar Heatmap */}
      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-muted-foreground pb-1 text-[10px] font-bold">
                {d}
              </div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = `${month}-${String(day).padStart(2, '0')}`;
              const status = statusByDate.get(dateStr);
              return (
                <div
                  key={day}
                  className={`flex h-9 items-center justify-center rounded-md text-[11px] font-semibold ${
                    status
                      ? ATTENDANCE_DAY_STYLES[status]
                      : 'bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-600'
                  }`}
                  title={status ?? 'No record'}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default StudentAttendance;
