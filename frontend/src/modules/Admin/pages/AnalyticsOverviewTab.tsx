import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { CHART_COLORS, chartTooltipStyle } from '@/lib/charts';
import { useSessionOptions } from '@/hooks/options/useAdminOptions';
import {
  PiUsers,
  PiGraduationCap,
  PiBookOpen,
  PiStack,
  PiWallet,
  PiUserCheck,
  PiChartBar,
} from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const KPI_TILE_STYLE = 'bg-primary/10 text-primary';

export function AnalyticsOverviewTab() {
  const navigate = useNavigate();
  const sessionOptions = useSessionOptions();
  const [session, setSession] = useState(() => sessionOptions[1]?.value ?? '');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.admin.analyticsOverview(session),
    queryFn: () => adminService.getAnalyticsOverview(session),
    enabled: !!session,
  });

  const studentsByClassSeries = useMemo(() => {
    const sections = Array.from(new Set((data?.studentsByClass ?? []).map((r) => r.section)));
    const byClass = new Map<string, Record<string, number | string>>();
    for (const r of data?.studentsByClass ?? []) {
      const row = byClass.get(r.className) ?? { className: `Class ${r.className}` };
      row[r.section] = r.count;
      byClass.set(r.className, row);
    }
    return { sections, rows: Array.from(byClass.values()) };
  }, [data]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />;
  }

  const kpis = [
    {
      label: 'Students',
      value: data.kpis.totalStudents,
      icon: PiGraduationCap,
      href: '/admin/students',
    },
    {
      label: 'Teachers',
      value: data.kpis.totalTeachers,
      icon: PiUsers,
      href: '/admin/teachers',
    },
    {
      label: 'Classes',
      value: data.kpis.totalClasses,
      icon: PiStack,
      href: '/admin/classes',
    },
    {
      label: 'Subjects',
      value: data.kpis.totalSubjects,
      icon: PiBookOpen,
      href: '/admin/subjects',
    },
    {
      label: 'Fee Collection',
      value:
        data.kpis.collectionRatePct !== null ? `${Math.round(data.kpis.collectionRatePct)}%` : '—',
      icon: PiWallet,
      href: '/admin/finance',
    },
    {
      label: 'Attendance (Month)',
      value:
        data.kpis.attendanceRatePct !== null ? `${Math.round(data.kpis.attendanceRatePct)}%` : '—',
      icon: PiUserCheck,
      href: '/admin/attendance',
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select
          value={session}
          onChange={(e) => setSession(e.target.value)}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
        >
          {sessionOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Session {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <button
              key={kpi.label}
              onClick={() => navigate(kpi.href)}
              className="rounded-md border border-slate-200/80 bg-white/90 p-4 text-left shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
            >
              <div
                className={`mb-2 flex h-8 w-8 items-center justify-center rounded-md ${KPI_TILE_STYLE}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{kpi.value}</p>
              <span className="text-muted-foreground text-[11px] font-semibold">{kpi.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Enrollment by Session */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Enrollment by Session</CardTitle>
            <CardDescription className="text-xs">
              Total students enrolled per academic session.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {data.enrollmentBySession.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.enrollmentBySession}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="session" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar
                    dataKey="count"
                    name="Students"
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Students Per Class */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Students Per Class</CardTitle>
            <CardDescription className="text-xs">
              Enrolled count, stacked by section.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {studentsByClassSeries.rows.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsByClassSeries.rows}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="className" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  {studentsByClassSeries.sections.map((s, i) => (
                    <Bar
                      key={s}
                      dataKey={s}
                      name={`Section ${s}`}
                      stackId="students"
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Admissions Per Month */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Admissions Per Month</CardTitle>
            <CardDescription className="text-xs">
              New admissions in this session, by month.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {data.admissionsByMonth.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.admissionsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar
                    dataKey="count"
                    name="Admissions"
                    fill={CHART_COLORS[2]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function EmptyChart() {
  return (
    <Empty className="h-full rounded-md border-0">
      <EmptyMedia variant="icon">
        <PiChartBar className="size-5" />
      </EmptyMedia>
      <EmptyTitle>No data yet</EmptyTitle>
      <EmptyDescription>Nothing to show here yet.</EmptyDescription>
    </Empty>
  );
}
