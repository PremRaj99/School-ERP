import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { CHART_COLORS, chartTooltipStyle } from '@/lib/charts';
import { Users, Clock, CheckCircle2, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { EmptyChart } from './AnalyticsOverviewTab';

const currentMonthString = () => new Date().toISOString().slice(0, 7);

export function AnalyticsStaffTab() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonthString);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.admin.analyticsStaff(month),
    queryFn: () => adminService.getAnalyticsStaff(month),
  });

  const attendanceChartData = (data?.attendanceLeaderboard ?? []).map((t) => ({
    name: `${t.firstName} ${t.lastName ?? ''}`.trim(),
    pct: Math.round(t.attendancePct),
  }));
  const workloadChartData = (data?.workload ?? []).map((t) => ({
    name: `${t.firstName} ${t.lastName ?? ''}`.trim(),
    periods: t.periodsPerWeek,
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border-input h-9 rounded-none border bg-transparent px-2.5 text-xs font-semibold"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Attendance Leaderboard */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Attendance Leaderboard
                </CardTitle>
                <CardDescription className="text-xs">Present % this month.</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {attendanceChartData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceChartData} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar
                        dataKey="pct"
                        name="Attendance %"
                        fill={CHART_COLORS[0]}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Workload */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <Clock className="h-4 w-4 text-indigo-500" />
                  Weekly Workload
                </CardTitle>
                <CardDescription className="text-xs">
                  Periods per week, per teacher.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {workloadChartData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={workloadChartData} layout="vertical" margin={{ left: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar
                        dataKey="periods"
                        name="Periods/Week"
                        fill={CHART_COLORS[1]}
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Marking Completion */}
          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <Users className="h-4 w-4 text-emerald-500" />
                Marking Completion by Teacher
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.markingCompletion.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No exam subjects assigned to any teacher yet.
                </p>
              ) : (
                data.markingCompletion.map((t) => (
                  <button
                    key={t.teacherId}
                    onClick={() => navigate(`/admin/teachers/${t.teacherId}`)}
                    className="block w-full text-left"
                  >
                    <Progress value={Math.round(t.completionPct)} className="max-w-lg">
                      <div className="flex justify-between">
                        <ProgressLabel>
                          {t.firstName} {t.lastName ?? ''}
                        </ProgressLabel>
                        <ProgressValue />
                      </div>
                    </Progress>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Subject Coverage Gaps */}
          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <BookOpen className="h-4 w-4 text-amber-500" />
                Subject Coverage Gaps
              </CardTitle>
              <CardDescription className="text-xs">
                Subjects with zero timetable periods assigned to any class.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.subjectCoverageGaps.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  Every subject has at least one scheduled period.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {data.subjectCoverageGaps.map((s) => (
                    <Badge
                      key={s.subjectCode}
                      variant="outline"
                      className="border-amber-500/30 text-[10px] text-amber-700 dark:text-amber-300"
                    >
                      {s.subjectName} ({s.subjectCode})
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
