import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { CHART_COLORS, chartTooltipStyle } from '@/lib/charts';
import { BarChart3, TrendingUp, Award, Trophy, CreditCard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

export const StudentAnalytics: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.student.analytics(),
    queryFn: () => studentService.getAnalytics(),
  });

  const subjectMarksSeries = useMemo(() => {
    const subjects = Array.from(new Set((data?.subjectMarks ?? []).map((r) => r.subjectCode)));
    const byExam = new Map<string, Record<string, number | string>>();
    for (const r of data?.subjectMarks ?? []) {
      const row = byExam.get(r.examTitle) ?? { examTitle: r.examTitle };
      row[r.subjectCode] = Math.round(r.pct);
      byExam.set(r.examTitle, row);
    }
    return { subjects, rows: Array.from(byExam.values()) };
  }, [data]);

  const rankSeries = useMemo(
    () =>
      (data?.rankTrend ?? []).map((r) => ({
        examTitle: r.examTitle,
        percentile:
          r.classSize > 0 ? Math.round(((r.classSize - r.rank + 1) / r.classSize) * 100) : 0,
        rank: r.rank,
        classSize: r.classSize,
      })),
    [data],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">My Analytics</h1>
          <Badge variant="outline" className="border-sky-500/30 text-xs text-sky-600">
            <BarChart3 className="mr-1 h-3 w-3" />
            Performance Insights
          </Badge>
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Your attendance, academic performance across exams, and fee payment history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Attendance Trend */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Attendance Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Monthly attendance % against the 75% minimum (dashed line).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {data.attendanceTrend.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.attendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <ReferenceLine y={75} stroke="#f43f5e" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="presentPct"
                    name="Present %"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Marks Per Subject Across Exams */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <Award className="h-4 w-4 text-indigo-500" />
              Marks Per Subject
            </CardTitle>
            <CardDescription className="text-xs">
              Score % per subject, across exams.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {subjectMarksSeries.rows.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={subjectMarksSeries.rows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="examTitle" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {subjectMarksSeries.subjects.map((s, i) => (
                    <Line
                      key={s}
                      type="monotone"
                      dataKey={s}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Latest Exam Breakdown (Radar) */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <Award className="h-4 w-4 text-amber-500" />
              Latest Exam — Subject Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {!data.latestExamBreakdown || data.latestExamBreakdown.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data.latestExamBreakdown}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subjectName" tick={{ fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar
                    dataKey="pct"
                    stroke={CHART_COLORS[0]}
                    fill={CHART_COLORS[0]}
                    fillOpacity={0.4}
                  />
                  <Tooltip contentStyle={chartTooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Class Rank / Percentile Trend */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <Trophy className="h-4 w-4 text-amber-500" />
              Class Rank Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Percentile within your class (higher is better).
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {rankSeries.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rankSeries}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="examTitle" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value, _name, item) => [
                      `${value}th percentile (Rank #${item.payload.rank} of ${item.payload.classSize})`,
                      'Standing',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentile"
                    stroke={CHART_COLORS[1]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fee Payment History */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
            <CreditCard className="h-4 w-4 text-teal-500" />
            Fee Payment History
          </CardTitle>
          <CardDescription className="text-xs">Paid vs. pending amount, by month.</CardDescription>
        </CardHeader>
        <CardContent className="h-64">
          {data.feeHistory.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.feeHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function EmptyChart() {
  return (
    <Empty className="h-full rounded-none border-0">
      <EmptyMedia variant="icon">
        <BarChart3 className="size-5" />
      </EmptyMedia>
      <EmptyTitle>No data yet</EmptyTitle>
      <EmptyDescription>Nothing to show here yet.</EmptyDescription>
    </Empty>
  );
}

export default StudentAnalytics;
