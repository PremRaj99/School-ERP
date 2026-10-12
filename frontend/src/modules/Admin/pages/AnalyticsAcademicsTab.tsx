import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { CHART_COLORS, chartTooltipStyle, GRADE_COLORS } from '@/lib/charts';
import { MAX_PAGE_SIZE } from '@schoolerp/contracts';
import { PiQuestion, PiTrophy, PiTrendDown, PiChartPie, PiClipboardText } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { EmptyChart } from './AnalyticsOverviewTab';
import { useClassFilter } from '@/hooks/useClassFilter';
import { ClassFilterBar, FILTER_LABEL_CLASS, FILTER_SELECT_CLASS } from '@/components/filters';

export function AnalyticsAcademicsTab() {
  const navigate = useNavigate();
  const filter = useClassFilter();
  const [pickedExamId, setExamId] = useState('');

  // pageSize: MAX_PAGE_SIZE — the exam picker needs every exam in the chosen session/class, not
  // one page of the (now server-paginated, ALIGNMENT_PLAN.md 2C/P1) list endpoint.
  const examQuery = {
    pageSize: MAX_PAGE_SIZE,
    session: filter.session,
    className: filter.className || undefined,
    section: filter.section || undefined,
  };
  const { data: examsResponse, isLoading: examsLoading } = useQuery({
    queryKey: qk.admin.exams(examQuery),
    queryFn: () => adminService.getExams(examQuery),
  });
  const exams = examsResponse?.data;
  // A picked exam that the session/class filter no longer lists counts as no pick.
  const examId = exams?.some((ex) => ex.id === pickedExamId) ? pickedExamId : '';

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.admin.analyticsAcademics(examId),
    queryFn: () => adminService.getAnalyticsAcademics(examId),
    enabled: !!examId,
  });

  const passFailData =
    data?.passRatePct !== null && data?.passRatePct !== undefined
      ? [
          { name: 'Pass', value: Math.round(data.passRatePct), color: '#10b981' },
          { name: 'Fail', value: Math.round(100 - data.passRatePct), color: '#f43f5e' },
        ]
      : [];

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="p-4">
          <ClassFilterBar filter={filter} allowAllClasses>
            <label>
              <span className={FILTER_LABEL_CLASS}>Examination</span>
              <select
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
                disabled={examsLoading || !exams?.length}
                className={`${FILTER_SELECT_CLASS} min-w-56`}
              >
                <option value="">
                  {examsLoading
                    ? 'Loading…'
                    : exams?.length
                      ? 'Select an examination'
                      : 'No exams in this session'}
                </option>
                {(exams ?? []).map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.title}
                    {filter.section ? '' : ` — Class ${ex.className}-${ex.section}`}
                  </option>
                ))}
              </select>
            </label>
          </ClassFilterBar>
        </CardContent>
      </Card>

      {!examId ? (
        <Empty className="rounded-md border">
          <EmptyMedia variant="icon">
            <PiQuestion className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Pick an examination</EmptyTitle>
          <EmptyDescription>Select an exam above to see its academic analytics.</EmptyDescription>
        </Empty>
      ) : isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Grade Distribution */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Grade Distribution</CardTitle>
                <CardDescription className="text-xs">{data.examTitle}</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {data.gradeDistribution.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.gradeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="grade" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>
                        {data.gradeDistribution.map((g) => (
                          <Cell key={g.grade} fill={GRADE_COLORS[g.grade] ?? CHART_COLORS[0]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Subject Averages */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Subject-wise Class Average</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {data.subjectAverages.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.subjectAverages}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="subjectCode" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar
                        dataKey="averagePct"
                        name="Average %"
                        fill={CHART_COLORS[1]}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Pass/Fail */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <PiChartPie className="text-primary h-4 w-4" />
                  Pass Rate
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {passFailData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <div className="h-36 w-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={passFailData}
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={58}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {passFailData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={chartTooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {Math.round(data.passRatePct ?? 0)}% Passed
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <PiClipboardText className="h-4 w-4 text-emerald-500" />
                Exam Marking Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.round(data.markingCompletionPct)} className="max-w-md">
                <div className="flex justify-between">
                  <ProgressLabel>Subjects marked</ProgressLabel>
                  <ProgressValue />
                </div>
              </Progress>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Top Performers */}
            <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <PiTrophy className="h-4 w-4 text-amber-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              {data.topPerformers.length === 0 ? (
                <p className="text-muted-foreground p-4 text-xs">No results entered yet.</p>
              ) : (
                <Table>
                  <TableBody>
                    {data.topPerformers.map((p, i) => (
                      <TableRow
                        key={p.studentId}
                        className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                        onClick={() => navigate(`/admin/students/${p.studentId}`)}
                      >
                        <TableCell className="w-8 text-xs font-bold text-slate-400">
                          #{i + 1}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {p.firstName} {p.lastName ?? ''}
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {Math.round(p.totalPct)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>

            {/* Bottom Performers */}
            <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <PiTrendDown className="h-4 w-4 text-rose-500" />
                  Needs Attention
                </CardTitle>
              </CardHeader>
              {data.bottomPerformers.length === 0 ? (
                <p className="text-muted-foreground p-4 text-xs">
                  Not enough students to rank separately.
                </p>
              ) : (
                <Table>
                  <TableBody>
                    {data.bottomPerformers.map((p) => (
                      <TableRow
                        key={p.studentId}
                        className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                        onClick={() => navigate(`/admin/students/${p.studentId}`)}
                      >
                        <TableCell className="text-xs font-medium">
                          {p.firstName} {p.lastName ?? ''}
                        </TableCell>
                        <TableCell className="text-right text-xs font-bold text-rose-600 dark:text-rose-400">
                          {Math.round(p.totalPct)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
