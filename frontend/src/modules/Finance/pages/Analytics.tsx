import React, { useState } from 'react';
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
import { financeService } from '@/lib/services/finance.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { CHART_COLORS, chartTooltipStyle } from '@/lib/charts';
import { AlertCircle, PieChartIcon, TrendingUp, Wallet, Receipt } from 'lucide-react';
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

const EmptyChart: React.FC = () => (
  <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
    Not enough data yet.
  </div>
);

/**
 * The Finance role's "complete analytics" page (ALIGNMENT_PLAN.md P4) — deliberately mirrors
 * `Admin/pages/AnalyticsFinanceTab.tsx` closely (same charts, same `AdminFinanceAnalytics` shape,
 * same backend computation via `AdminAnalyticsService.getFinance`) since it's the same data; kept
 * as its own file rather than sharing the component because the two portals have different
 * navigation (Finance has no `/admin/students/:id` to link a defaulter row to) and different data
 * sources (`financeService` vs `adminService`, hitting `/finance/*` vs `/admin/*`).
 *
 * Note: `useSessionOptions` (from `useAdminOptions.ts`) hits `/admin/class` — safe here even
 * though this is the Finance portal, since `adminClassContract.list` has no role restriction
 * beyond `verifyJWT` in the *frontend* sense, but it DOES sit behind `AdminOnly` server-side, so a
 * Finance user would actually get a 403. Use the session list from `AdminFinanceAnalytics.monthly`
 * instead by keeping a small local list of recent sessions rather than depending on that hook.
 */
function recentSessionOptions(): { value: string; label: string }[] {
  const now = new Date();
  const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return Array.from({ length: 3 }, (_, i) => {
    const start = startYear - i;
    const value = `${start}-${start + 1}`;
    return { value, label: value };
  });
}

export const FinanceAnalytics: React.FC = () => {
  const sessionOptions = recentSessionOptions();
  const [session, setSession] = useState(() => sessionOptions[0]?.value ?? '');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.finance.analytics(session),
    queryFn: () => financeService.getAnalytics(session),
    enabled: !!session,
  });

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Financial Analytics</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Collections, payroll, and expenses — the complete picture.
          </p>
        </div>
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

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !data ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
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

            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <PieChartIcon className="h-4 w-4 text-indigo-500" />
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
                            className="h-2.5 w-2.5 shrink-0 rounded-sm"
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
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
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

            <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <Wallet className="h-4 w-4 text-teal-500" />
                  Salary Burn vs. Fee Collection
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
                        name="Salary Burn"
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
            <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/90">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                      <Receipt className="h-4 w-4 text-amber-500" />
                      Expense Breakdown
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Books, whiteboards, supplies, and everything else, by category.
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

          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <AlertCircle className="h-4 w-4 text-rose-500" />
                Fee Defaulters
              </CardTitle>
            </CardHeader>
            {data.defaulters.length === 0 ? (
              <Empty className="rounded-none border-0 border-t">
                <EmptyMedia variant="icon">
                  <AlertCircle className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No pending fees</EmptyTitle>
                <EmptyDescription>
                  Every raised invoice this session has been paid.
                </EmptyDescription>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                    <TableHead className="text-xs font-bold">Student</TableHead>
                    <TableHead className="text-xs font-bold">Class</TableHead>
                    <TableHead className="text-xs font-bold">Month</TableHead>
                    <TableHead className="text-right text-xs font-bold">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.defaulters.map((d, i) => (
                    <TableRow key={`${d.studentId}-${d.month}-${i}`}>
                      <TableCell className="text-xs font-medium">
                        {d.firstName} {d.lastName ?? ''}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge variant="secondary" className="text-[10px]">
                          {d.className}-{d.section}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{d.month}</TableCell>
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
};

export default FinanceAnalytics;
