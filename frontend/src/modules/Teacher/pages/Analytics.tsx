import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { ErrorState } from '@/components/data-table';
import { teacherService } from '@/lib/services/teacher.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { CHART_COLORS, chartTooltipStyle, GRADE_COLORS } from '@/lib/charts';
import { PiChartBar, PiTrendUp, PiMedal, PiClipboardText } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';

export const TeacherAnalytics: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.teacher.analytics(),
    queryFn: () => teacherService.getAnalytics(),
  });

  // Pivot classAttendanceTrend (rows of {className, section, month, presentPct}) into one row per
  // month with one column per class-section, for a multi-line chart.
  const classAttendanceSeries = useMemo(() => {
    const classKeys = Array.from(
      new Set((data?.classAttendanceTrend ?? []).map((r) => `${r.className}-${r.section}`)),
    );
    const byMonth = new Map<string, Record<string, number | string>>();
    for (const r of data?.classAttendanceTrend ?? []) {
      const key = `${r.className}-${r.section}`;
      const row = byMonth.get(r.month) ?? { month: r.month };
      row[key] = Math.round(r.presentPct);
      byMonth.set(r.month, row);
    }
    return {
      classKeys,
      rows: Array.from(byMonth.values()).sort((a, b) =>
        String(a.month).localeCompare(String(b.month)),
      ),
    };
  }, [data]);

  const subjectAverageSeries = useMemo(() => {
    const subjects = Array.from(new Set((data?.subjectAverages ?? []).map((r) => r.subjectCode)));
    const byExam = new Map<string, Record<string, number | string>>();
    for (const r of data?.subjectAverages ?? []) {
      const row = byExam.get(r.examTitle) ?? { examTitle: r.examTitle };
      row[r.subjectCode] = Math.round(r.averagePct);
      byExam.set(r.examTitle, row);
    }
    return { subjects, rows: Array.from(byExam.values()) };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  const markingPct =
    data.markingBacklog.total > 0
      ? Math.round((data.markingBacklog.marked / data.markingBacklog.total) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">My Analytics</h1>
          <Badge variant="outline" className="border-primary/30 text-primary text-xs">
            <PiChartBar className="mr-1 h-3 w-3" />
            Performance Insights
          </Badge>
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Your attendance record, class performance trends, and marking progress.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Own Attendance Trend */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <PiTrendUp className="text-primary h-4 w-4" />
              My Attendance Trend
            </CardTitle>
            <CardDescription className="text-xs">Monthly attendance percentage.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {data.ownAttendanceTrend.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.ownAttendanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
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

        {/* Class Attendance Trend */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <PiTrendUp className="text-primary h-4 w-4" />
              Class Attendance Trend
            </CardTitle>
            <CardDescription className="text-xs">
              Attendance % per class you teach, by month.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {classAttendanceSeries.rows.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={classAttendanceSeries.rows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {classAttendanceSeries.classKeys.map((key, i) => (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
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

        {/* Per-Subject Class Average Across Exams */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <PiMedal className="text-primary h-4 w-4" />
              Subject Averages Across Exams
            </CardTitle>
            <CardDescription className="text-xs">
              Class average % per subject you've marked, by exam.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {subjectAverageSeries.rows.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAverageSeries.rows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="examTitle" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  {subjectAverageSeries.subjects.map((s, i) => (
                    <Bar
                      key={s}
                      dataKey={s}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      radius={[3, 3, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Last Exam Grade Distribution */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <PiMedal className="text-primary h-4 w-4" />
              Last Marked Exam — Grade Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {!data.lastExamGradeDistribution || data.lastExamGradeDistribution.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.lastExamGradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                    {data.lastExamGradeDistribution.map((g) => (
                      <Cell key={g.grade} fill={GRADE_COLORS[g.grade] ?? CHART_COLORS[0]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Marking Backlog */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
            <PiClipboardText className="text-primary h-4 w-4" />
            Marking Backlog
          </CardTitle>
          <CardDescription className="text-xs">
            {data.markingBacklog.marked} of {data.markingBacklog.total} assigned exam-subjects
            marked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={markingPct} className="max-w-md">
            <div className="flex justify-between">
              <ProgressLabel>Marking completion</ProgressLabel>
              <ProgressValue />
            </div>
          </Progress>
        </CardContent>
      </Card>
    </div>
  );
};

function EmptyChart() {
  return (
    <Empty className="h-full rounded-md border-0">
      <EmptyMedia variant="icon">
        <PiChartBar className="size-5" />
      </EmptyMedia>
      <EmptyTitle>No data yet</EmptyTitle>
      <EmptyDescription>There isn't enough data to chart yet.</EmptyDescription>
    </Empty>
  );
}

export default TeacherAnalytics;
