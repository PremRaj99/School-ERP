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
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { CHART_COLORS, chartTooltipStyle } from '@/lib/charts';
import { useClassFilter } from '@/hooks/useClassFilter';
import { ClassFilterBar, ExportButton, FILTER_SELECT_CLASS } from '@/components/filters';
import { compareClassSection, monthLabel } from '@/lib/session';
import { PiWarningCircle, PiChartPie, PiTrendUp, PiWallet, PiReceipt } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { EmptyChart } from './AnalyticsOverviewTab';

export function AnalyticsFinanceTab() {
  const navigate = useNavigate();
  // Session scopes the whole tab; class/section/month only narrow the defaulters list.
  const filter = useClassFilter();
  const { session } = filter;
  const [defaulterMonth, setDefaulterMonth] = useState('');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.admin.analyticsFinance(session),
    queryFn: () => adminService.getAnalyticsFinance(session),
    enabled: !!session,
  });

  const defaulters = useMemo(
    () =>
      (data?.defaulters ?? [])
        .filter(
          (d) =>
            (!filter.className || d.className === filter.className) &&
            (!filter.section || d.section === filter.section) &&
            (!defaulterMonth || d.month === defaulterMonth),
        )
        .sort((a, b) => compareClassSection(a, b) || a.month.localeCompare(b.month)),
    [data, filter.className, filter.section, defaulterMonth],
  );
  const defaulterTotal = defaulters.reduce((sum, d) => sum + d.amount, 0);
  const defaulterStudents = new Set(defaulters.map((d) => d.studentId)).size;
  const defaulterMonths = [...new Set((data?.defaulters ?? []).map((d) => d.month))].sort();

  const categoryPieData = (data?.categorySplit ?? [])
    .filter((c) => c.amount > 0)
    .map((c, i) => ({
      name: c.category,
      value: c.amount,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  const expensePieData = (data?.expenseBreakdown ?? [])
    .filter((e) => e.amount > 0)
    .map((e, i) => ({
      name: e.label,
      value: e.amount,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ClassFilterBar filter={filter} showClass={false} compact />
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Collected vs Pending */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Fee Collected vs. Pending</CardTitle>
                <CardDescription className="text-xs">Per month, session {session}.</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                {data.monthly.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthly}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar
                        dataKey="collected"
                        name="Collected"
                        fill="#10b981"
                        radius={[3, 3, 0, 0]}
                      />
                      <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Category Split */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <PiChartPie className="text-primary h-4 w-4" />
                  Category Split
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {categoryPieData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <div className="h-32 w-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={54}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryPieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={chartTooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {categoryPieData.map((d) => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-md"
                            style={{ backgroundColor: d.color }}
                          />
                          <span className="text-muted-foreground">{d.name}</span>
                          <span className="ml-auto font-bold">₹{d.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Cumulative Collection */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <PiTrendUp className="h-4 w-4 text-emerald-500" />
                  Cumulative Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {data.cumulativeCollection.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.cumulativeCollection}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="cumulative"
                        stroke={CHART_COLORS[0]}
                        fill={CHART_COLORS[0]}
                        fillOpacity={0.25}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Honorarium vs Fee Collection */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <PiWallet className="text-primary h-4 w-4" />
                  Honorarium vs. Fee Collection
                </CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {data.salaryVsCollection.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.salaryVsCollection}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line
                        type="monotone"
                        dataKey="salaryBurn"
                        name="Honorarium"
                        stroke="#f43f5e"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="feeCollection"
                        name="Fee Collection"
                        stroke="#10b981"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Expense Breakdown (books, whiteboards, ...) */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                      <PiReceipt className="h-4 w-4 text-amber-500" />
                      Expense Breakdown
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Manually logged expenses (books, whiteboards, supplies, ...) by category.
                    </CardDescription>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    ₹{(data.totalExpenses ?? 0).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="h-64">
                {expensePieData.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensePieData} layout="vertical" margin={{ left: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Bar dataKey="value" name="Amount" radius={[0, 3, 3, 0]}>
                        {expensePieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Monthly Expense Trend */}
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold">Monthly Spend</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {(data.monthlyExpenses ?? []).length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.monthlyExpenses}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.25}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Defaulters */}
          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="space-y-3 pb-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                    <PiWarningCircle className="h-4 w-4 text-rose-500" />
                    Fee Defaulters
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {defaulterStudents} student{defaulterStudents === 1 ? '' : 's'} ·{' '}
                    {defaulters.length} unpaid invoice{defaulters.length === 1 ? '' : 's'} · ₹
                    {defaulterTotal.toLocaleString()} due
                  </CardDescription>
                </div>
                <ExportButton
                  filename={`fee-defaulters-${session}`}
                  headers={['Student ID', 'Name', 'Class', 'Section', 'Month', 'Amount']}
                  rows={defaulters.map((d) => [
                    d.studentId,
                    `${d.firstName} ${d.lastName ?? ''}`.trim(),
                    d.className,
                    d.section,
                    d.month,
                    d.amount,
                  ])}
                />
              </div>
              <ClassFilterBar filter={filter} allowAllClasses compact showSession={false}>
                <label>
                  <span className="sr-only">Month</span>
                  <select
                    value={defaulterMonth}
                    onChange={(e) => setDefaulterMonth(e.target.value)}
                    className={FILTER_SELECT_CLASS}
                  >
                    <option value="">All months</option>
                    {defaulterMonths.map((m) => (
                      <option key={m} value={m}>
                        {monthLabel(m)}
                      </option>
                    ))}
                  </select>
                </label>
              </ClassFilterBar>
            </CardHeader>
            {defaulters.length === 0 ? (
              <Empty className="rounded-md border-0 border-t">
                <EmptyMedia variant="icon">
                  <PiWarningCircle className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No pending fees</EmptyTitle>
                <EmptyDescription>
                  {data.defaulters.length === 0
                    ? 'Every raised invoice this session has been paid.'
                    : 'No unpaid invoices match these filters.'}
                </EmptyDescription>
              </Empty>
            ) : (
              <Table containerClassName="max-h-[28rem]">
                <TableHeader sticky>
                  <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                    <TableHead className="text-xs font-bold">Student</TableHead>
                    <TableHead className="text-xs font-bold">Class</TableHead>
                    <TableHead className="text-xs font-bold">Month</TableHead>
                    <TableHead className="text-right text-xs font-bold">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {defaulters.map((d, i) => (
                    <TableRow
                      key={`${d.studentId}-${d.month}-${i}`}
                      className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                      onClick={() => navigate(`/admin/students/${d.studentId}`)}
                    >
                      <TableCell className="text-xs font-medium">
                        {d.firstName} {d.lastName ?? ''}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-[10px]">
                          {d.className}-{d.section}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{monthLabel(d.month)}</TableCell>
                      <TableCell className="text-right text-xs font-bold text-rose-600 dark:text-rose-400">
                        ₹{d.amount.toLocaleString()}
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
