import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { formatMonth, formatRupees as rupees } from '@/lib/finance-format';
import { getErrorMessage } from '@/lib/api';
import { getCurrentSessionYear } from '@/lib/session';
import {
  PiUsers,
  PiGraduationCap,
  PiBookOpen,
  PiStack,
  PiCreditCard,
  PiUserPlus,
  PiBell,
  PiArrowRight,
  PiArrowClockwise,
  PiCalendar,
  PiUserCheck,
  PiChalkboardTeacher,
} from 'react-icons/pi';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const ATTENDANCE_COLORS = {
  present: '#10b981',
  absent: '#f43f5e',
  leave: '#f59e0b',
  unmarked: '#94a3b8',
};

/** Every KPI card shares the same brand-tinted icon chip and CTA color. */
const KPI_STYLE = {
  icon: 'bg-primary/10 text-primary',
  cta: 'text-primary',
} as const;

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: qk.admin.dashboard(),
    queryFn: () => adminService.getDashboard(),
  });

  const classFees = dashboardData?.classWiseFees;
  const feeTotals = (classFees?.classes ?? []).reduce(
    (t, c) => ({
      students: t.students + c.students,
      paidCount: t.paidCount + c.paidCount,
      collected: t.collected + c.collected,
      pending: t.pending + c.pending,
      expected: t.expected + c.expected,
    }),
    { students: 0, paidCount: 0, collected: 0, pending: 0, expected: 0 },
  );

  const attendancePieData = dashboardData
    ? [
        {
          name: 'Present',
          value: dashboardData.todayTeacherAttendance.present,
          color: ATTENDANCE_COLORS.present,
        },
        {
          name: 'Absent',
          value: dashboardData.todayTeacherAttendance.absent,
          color: ATTENDANCE_COLORS.absent,
        },
        {
          name: 'Leave',
          value: dashboardData.todayTeacherAttendance.leave,
          color: ATTENDANCE_COLORS.leave,
        },
        {
          name: 'Unmarked',
          value: dashboardData.todayTeacherAttendance.unmarked,
          color: ATTENDANCE_COLORS.unmarked,
        },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header with Quick Actions */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Institutional Overview
            </h1>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            A quick view of today's attendance, admissions, fee collection, and academic notices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="h-9 gap-1.5 text-xs"
          >
            <PiArrowClockwise className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Syncing...' : 'Sync Data'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/admin/students')}
            className="bg-primary hover:bg-primary/90 h-9 gap-1.5 text-xs text-white shadow-sm"
          >
            <PiUserPlus className="h-3.5 w-3.5" />
            <span>Admit Student</span>
          </Button>
        </div>
      </div>

      {isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : (
        dashboardData && (
          <>
            {/* KPI Metric Cards — the 4 real counts */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  {
                    label: 'Enrolled Students',
                    value: dashboardData.counts.students,
                    icon: PiGraduationCap,
                    path: '/admin/students',
                    cta: 'Directory',
                  },
                  {
                    label: 'Teaching Faculty',
                    value: dashboardData.counts.teachers,
                    icon: PiUsers,
                    path: '/admin/teachers',
                    cta: 'Faculty',
                  },
                  {
                    label: 'Class Sections',
                    value: dashboardData.counts.classes,
                    icon: PiBookOpen,
                    path: '/admin/classes',
                    cta: 'Classes',
                  },
                  {
                    label: 'Subjects',
                    value: dashboardData.counts.subjects,
                    icon: PiStack,
                    path: '/admin/subjects',
                    cta: 'Curriculum',
                  },
                ] as const
              ).map((kpi) => (
                <Card
                  key={kpi.label}
                  className="border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-semibold">
                        {kpi.label}
                      </span>
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-md ${KPI_STYLE.icon}`}
                      >
                        <kpi.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {kpi.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-end border-t border-slate-100 pt-3 text-xs dark:border-zinc-800/80">
                      <button
                        onClick={() => navigate(kpi.path)}
                        className={`flex items-center gap-0.5 font-semibold hover:underline ${KPI_STYLE.cta}`}
                      >
                        <span>{kpi.cta}</span>
                        <PiArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Attendance + Finance */}
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Today's Teacher Attendance */}
              <Card className="min-w-0 overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-5 dark:border-zinc-800 dark:bg-zinc-900/90">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                        <PiUserCheck className="text-primary h-4 w-4" />
                        Today's Faculty Attendance
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {dashboardData.todayTeacherAttendance.date} ·{' '}
                        {dashboardData.todayTeacherAttendance.total} teachers
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => navigate('/admin/attendance')}
                      className="text-primary text-xs font-semibold hover:underline"
                    >
                      Mark
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {attendancePieData.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center text-xs">
                      No attendance marked for today yet.
                    </p>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="h-36 w-36 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={attendancePieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={38}
                              outerRadius={60}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {attendancePieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'rgba(18, 20, 29, 0.9)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '11px',
                                border: 'none',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="grid flex-1 grid-cols-2 gap-2 text-xs">
                        {attendancePieData.map((item) => (
                          <div key={item.name} className="flex items-center gap-1.5">
                            <div
                              className="h-2.5 w-2.5 shrink-0 rounded-md"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className="ml-auto font-bold">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Finance Snapshot */}
              <Card className="min-w-0 overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-7 dark:border-zinc-800 dark:bg-zinc-900/90">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                      <PiCreditCard className="text-primary h-4 w-4" />
                      Finance Snapshot
                    </CardTitle>
                    <button
                      onClick={() => navigate('/admin/finance')}
                      className="text-primary text-xs font-semibold hover:underline"
                    >
                      Full Ledger
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border border-amber-200/60 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <span className="text-muted-foreground text-xs font-semibold">
                      Pending Student Fees
                      <span className="font-normal">
                        {' '}
                        · {formatMonth(dashboardData.classWiseFees.month)}
                      </span>
                    </span>
                    {/* This month's dues, incl. students whose fee isn't generated yet. */}
                    <p className="mt-1 text-xl font-black text-amber-700 dark:text-amber-300">
                      {rupees(feeTotals.expected - feeTotals.collected)}
                    </p>
                    <span className="text-muted-foreground block text-[11px]">
                      {feeTotals.students - feeTotals.paidCount} student
                      {feeTotals.students - feeTotals.paidCount === 1 ? '' : 's'} yet to pay
                    </span>
                    {/* Whole session so far (April → this month), same counting. */}
                    <div className="mt-2 border-t border-amber-200/60 pt-2 dark:border-amber-900/40">
                      <span className="text-muted-foreground block text-[11px] font-semibold">
                        Session {dashboardData.sessionFeeDues.session} so far
                      </span>
                      <p className="text-base font-black text-amber-700 dark:text-amber-300">
                        {rupees(dashboardData.sessionFeeDues.totalLeft)}
                      </p>
                      <span className="text-muted-foreground block text-[11px]">
                        {dashboardData.sessionFeeDues.studentsWithDues} student
                        {dashboardData.sessionFeeDues.studentsWithDues === 1 ? '' : 's'} with dues ·{' '}
                        {rupees(dashboardData.sessionFeeDues.paidAmount)} collected
                      </span>
                    </div>
                  </div>
                  <div className="border-primary/20 bg-primary/5 dark:bg-primary/10 rounded-md border p-4">
                    <span className="text-muted-foreground text-xs font-semibold">
                      Pending Honorarium
                    </span>
                    <p className="text-primary mt-1 text-xl font-black">
                      ₹{dashboardData.finance.pendingTeacherSalaries.totalAmount.toLocaleString()}
                    </p>
                    <span className="text-muted-foreground text-[11px]">
                      {dashboardData.finance.pendingTeacherSalaries.count} record
                      {dashboardData.finance.pendingTeacherSalaries.count === 1 ? '' : 's'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Class-wise Fees (current month) */}
            {classFees && (
              <Card className="min-w-0 overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                        <PiChalkboardTeacher className="text-primary h-4 w-4" />
                        Class-wise Fees
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {formatMonth(classFees.month)} · {getCurrentSessionYear()} session · default{' '}
                        {rupees(classFees.defaultMonthlyFee)}/student, unless a class has its own
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => navigate('/admin/finance')}
                      className="text-primary text-xs font-semibold hover:underline"
                    >
                      Collect
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  {classFees.classes.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-xs">
                      No classes with students in this session yet.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-xs">
                        <thead>
                          <tr className="text-muted-foreground border-b border-slate-100 text-left dark:border-zinc-800">
                            <th className="py-2 pr-3 font-semibold">Class</th>
                            <th className="py-2 pr-3 text-right font-semibold">Fee/mo</th>
                            <th className="py-2 pr-3 text-right font-semibold">Students</th>
                            <th className="py-2 pr-3 text-right font-semibold">Paid</th>
                            <th className="py-2 pr-3 text-right font-semibold">Collected</th>
                            <th className="py-2 pr-3 text-right font-semibold">Pending</th>
                            <th className="py-2 pr-3 text-right font-semibold">Expected</th>
                            <th className="w-32 py-2 font-semibold">Progress</th>
                          </tr>
                        </thead>
                        <tbody>
                          {classFees.classes.map((c) => {
                            const pct = c.expected > 0 ? (c.collected / c.expected) * 100 : 0;
                            return (
                              <tr
                                key={c.classId}
                                className="border-b border-slate-100 last:border-0 dark:border-zinc-800/80"
                              >
                                <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-zinc-200">
                                  {c.className}-{c.section}
                                </td>
                                <td className="py-2 pr-3 text-right">{rupees(c.monthlyFee)}</td>
                                <td className="py-2 pr-3 text-right">{c.students}</td>
                                <td className="py-2 pr-3 text-right">
                                  {c.paidCount}/{c.students}
                                </td>
                                <td className="py-2 pr-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                                  {rupees(c.collected)}
                                </td>
                                <td className="py-2 pr-3 text-right text-amber-700 dark:text-amber-300">
                                  {rupees(c.pending)}
                                  {c.notGeneratedCount > 0 && (
                                    <span className="text-muted-foreground ml-1 text-[10px]">
                                      +{c.notGeneratedCount} not generated
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 pr-3 text-right">{rupees(c.expected)}</td>
                                <td className="py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                                      <div
                                        className="h-full rounded-full bg-emerald-500"
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-muted-foreground w-8 text-right text-[10px]">
                                      {Math.round(pct)}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-200 font-bold dark:border-zinc-700">
                            <td className="py-2 pr-3">Total</td>
                            <td className="py-2 pr-3" />
                            <td className="py-2 pr-3 text-right">{feeTotals.students}</td>
                            <td className="py-2 pr-3 text-right">
                              {feeTotals.paidCount}/{feeTotals.students}
                            </td>
                            <td className="py-2 pr-3 text-right text-emerald-700 dark:text-emerald-400">
                              {rupees(feeTotals.collected)}
                            </td>
                            <td className="py-2 pr-3 text-right text-amber-700 dark:text-amber-300">
                              {rupees(feeTotals.pending)}
                            </td>
                            <td className="py-2 pr-3 text-right">{rupees(feeTotals.expected)}</td>
                            <td className="text-muted-foreground py-2 text-[10px]">
                              {feeTotals.expected > 0 &&
                                `${Math.round((feeTotals.collected / feeTotals.expected) * 100)}% collected`}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Exams + Recent Notices */}
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Upcoming Exams */}
              <Card className="min-w-0 border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-6 dark:border-zinc-800 dark:bg-zinc-900/90">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                      <PiCalendar className="text-primary h-4 w-4" />
                      Upcoming Exams
                    </CardTitle>
                    <button
                      onClick={() => navigate('/admin/exams')}
                      className="text-primary text-xs hover:underline"
                    >
                      View all
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dashboardData.upcomingExams.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-xs">
                      No upcoming exams scheduled.
                    </p>
                  ) : (
                    dashboardData.upcomingExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-800/50"
                      >
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-zinc-200">
                            {exam.title}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            Class {exam.className}-{exam.section} · {exam.dateFrom}
                            {exam.dateTo ? ` to ${exam.dateTo}` : ''}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Recent Bulletins */}
              <Card className="flex min-w-0 flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-6 dark:border-zinc-800 dark:bg-zinc-900/90">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                      <PiBell className="text-primary h-4 w-4" />
                      <span>Notice Bulletin</span>
                    </CardTitle>
                    <button
                      onClick={() => navigate('/admin/notices')}
                      className="text-primary text-xs hover:underline"
                    >
                      View all
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  {dashboardData.recentNotices.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-xs">
                      No notices published yet.
                    </p>
                  ) : (
                    dashboardData.recentNotices.map((notice) => (
                      <div
                        key={notice.id}
                        className="rounded-md border border-slate-100 bg-slate-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-zinc-200">
                          <span className="truncate">{notice.title}</span>
                          <Badge variant="outline" className="ml-2 h-4 shrink-0 text-[9px]">
                            {notice.targetRole}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-0.5 text-[11px]">{notice.date}</p>
                      </div>
                    ))
                  )}
                </CardContent>
                <div className="p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => navigate('/admin/notices')}
                  >
                    <PiBell className="text-primary mr-1.5 h-3.5 w-3.5" />
                    <span>Broadcast New Circular</span>
                  </Button>
                </div>
              </Card>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default AdminDashboard;
