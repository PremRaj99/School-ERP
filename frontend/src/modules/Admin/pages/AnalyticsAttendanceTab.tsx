import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { dateToIsoDate, isoToDisplayDate } from '@/lib/date';
import { ATTENDANCE_STATUS_COLORS, CHART_COLORS, chartTooltipStyle } from '@/lib/charts';
import { useClassNameOptions } from '@/hooks/options/useAdminOptions';
import { AlertTriangle, Grid3x3, PieChartIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { EmptyChart } from './AnalyticsOverviewTab';

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;

function heatColor(pct: number): string {
  // 0% -> rose-500, 100% -> emerald-500, interpolated through amber-500 at 50%.
  if (pct >= 75) return `rgba(16, 185, 129, ${0.25 + (pct - 75) / 100})`;
  if (pct >= 50) return `rgba(245, 158, 11, ${0.25 + (pct - 50) / 100})`;
  return `rgba(244, 63, 94, ${0.25 + pct / 100})`;
}

function monthAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return dateToIsoDate(d);
}

export function AnalyticsAttendanceTab() {
  const navigate = useNavigate();
  const classNameOptions = useClassNameOptions();
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(() => dateToIsoDate(new Date()));
  const [className, setClassName] = useState('');

  const classFilterValue = className || undefined;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.admin.analyticsAttendance(from, to, classFilterValue),
    queryFn: () => adminService.getAnalyticsAttendance(from, to, classFilterValue),
  });

  const heatmapRows = useMemo(() => {
    const classes = Array.from(
      new Set((data?.classHeatmap ?? []).map((r) => `${r.className}-${r.section}`)),
    ).sort();
    const map = new Map<string, Record<string, number>>();
    for (const r of data?.classHeatmap ?? []) {
      const key = `${r.className}-${r.section}`;
      const row = map.get(key) ?? {};
      row[r.weekday] = r.presentPct;
      map.set(key, row);
    }
    return classes.map((key) => ({ key, cells: map.get(key) ?? {} }));
  }, [data]);

  const statusPieData = data
    ? [
        {
          name: 'Present',
          value: data.statusSplit.present,
          color: ATTENDANCE_STATUS_COLORS.Present,
        },
        { name: 'Absent', value: data.statusSplit.absent, color: ATTENDANCE_STATUS_COLORS.Absent },
        { name: 'Leave', value: data.statusSplit.leave, color: ATTENDANCE_STATUS_COLORS.Leave },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">From</span>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border-input h-9 rounded-md border bg-transparent px-2.5 text-xs font-semibold"
            />
          </div>
          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">To</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border-input h-9 rounded-md border bg-transparent px-2.5 text-xs font-semibold"
            />
          </div>
          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Class
            </span>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">All classes</option>
              {classNameOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Daily Attendance % */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Daily Attendance %</CardTitle>
                <CardDescription className="text-xs">
                  School-wide present rate, {isoToDisplayDate(from)} – {isoToDisplayDate(to)}.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {data.dailyAttendancePct.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyAttendancePct}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 9 }}
                        tickFormatter={isoToDisplayDate}
                      />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        labelFormatter={(v) => isoToDisplayDate(String(v))}
                      />
                      <Line
                        type="monotone"
                        dataKey="presentPct"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Status Split */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <PieChartIcon className="h-4 w-4 text-indigo-500" />
                  Status Split
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {statusPieData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <div className="h-36 w-36">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={58}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {statusPieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={chartTooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {statusPieData.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-muted-foreground">{d.name}</span>
                          <span className="ml-auto font-bold">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Class × Weekday Heatmap */}
          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <Grid3x3 className="h-4 w-4 text-indigo-500" />
                Class × Weekday Attendance Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              {heatmapRows.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No attendance recorded in this range.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-separate border-spacing-1 text-xs">
                    <thead>
                      <tr>
                        <th className="text-left text-[11px] font-bold">Class</th>
                        {WEEKDAYS.map((d) => (
                          <th key={d} className="text-[11px] font-bold">
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {heatmapRows.map((row) => (
                        <tr key={row.key}>
                          <td className="font-bold whitespace-nowrap">{row.key}</td>
                          {WEEKDAYS.map((d) => {
                            const pct = row.cells[d];
                            return (
                              <td key={d} className="p-0">
                                <div
                                  className="flex h-9 items-center justify-center rounded-md font-semibold text-slate-900 dark:text-white"
                                  style={{
                                    backgroundColor: pct !== undefined ? heatColor(pct) : undefined,
                                  }}
                                >
                                  {pct !== undefined ? `${Math.round(pct)}%` : '—'}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chronic Absentees */}
          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <AlertTriangle className="h-4 w-4 text-rose-500" />
                Chronic Absentees (&lt;75%)
              </CardTitle>
            </CardHeader>
            {data.chronicAbsentees.length === 0 ? (
              <Empty className="rounded-none border-0 border-t">
                <EmptyMedia variant="icon">
                  <AlertTriangle className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No chronic absentees</EmptyTitle>
                <EmptyDescription>
                  Every student is above the 75% threshold in this range.
                </EmptyDescription>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                    <TableHead className="text-xs font-bold">Student</TableHead>
                    <TableHead className="text-xs font-bold">Class</TableHead>
                    <TableHead className="text-right text-xs font-bold">Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.chronicAbsentees.map((s) => (
                    <TableRow
                      key={s.studentId}
                      className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                      onClick={() => navigate(`/admin/students/${s.studentId}`)}
                    >
                      <TableCell className="text-xs font-medium">
                        {s.firstName} {s.lastName ?? ''}{' '}
                        <span className="text-muted-foreground font-mono">({s.studentId})</span>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-[10px]">
                          {s.className}-{s.section}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs font-bold text-rose-600 dark:text-rose-400">
                        {Math.round(s.attendancePct)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
