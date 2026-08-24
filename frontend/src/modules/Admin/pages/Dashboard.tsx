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
import { getErrorMessage } from '@/lib/api';
import {
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  CreditCard,
  UserPlus,
  Bell,
  ArrowRight,
  RefreshCw,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const ATTENDANCE_COLORS = {
  present: '#10b981',
  absent: '#f43f5e',
  leave: '#f59e0b',
  unmarked: '#94a3b8',
};

/**
 * Tailwind's JIT compiler can't see class names built via string interpolation
 * (`` `bg-${color}-500/10` ``) — they'd never make it into the generated CSS. Each KPI card's
 * palette is a static, fully-spelled-out class string instead.
 */
const KPI_STYLES = {
  blue: {
    icon: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    cta: 'text-blue-600 dark:text-blue-400',
  },
  emerald: {
    icon: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    cta: 'text-emerald-600 dark:text-emerald-400',
  },
  violet: {
    icon: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    cta: 'text-violet-600 dark:text-violet-400',
  },
  amber: {
    icon: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    cta: 'text-amber-600 dark:text-amber-400',
  },
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
            Live enrollment, faculty attendance, finance, and academic notices.
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
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
            <span>{isRefetching ? 'Syncing...' : 'Sync Data'}</span>
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/admin/students')}
            className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
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
                    icon: GraduationCap,
                    color: 'blue',
                    path: '/admin/students',
                    cta: 'Directory',
                  },
                  {
                    label: 'Teaching Faculty',
                    value: dashboardData.counts.teachers,
                    icon: Users,
                    color: 'emerald',
                    path: '/admin/teachers',
                    cta: 'Faculty',
                  },
                  {
                    label: 'Class Sections',
                    value: dashboardData.counts.classes,
                    icon: BookOpen,
                    color: 'violet',
                    path: '/admin/classes',
                    cta: 'Classes',
                  },
                  {
                    label: 'Subjects',
                    value: dashboardData.counts.subjects,
                    icon: Layers,
                    color: 'amber',
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
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${KPI_STYLES[kpi.color].icon}`}
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
                        className={`flex items-center gap-0.5 font-semibold hover:underline ${KPI_STYLES[kpi.color].cta}`}
                      >
                        <span>{kpi.cta}</span>
                        <ArrowRight className="h-3 w-3" />
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
                        <UserCheck className="h-4 w-4 text-emerald-500" />
                        Today's Faculty Attendance
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {dashboardData.todayTeacherAttendance.date} ·{' '}
                        {dashboardData.todayTeacherAttendance.total} teachers
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => navigate('/admin/attendance')}
                      className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
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
                              className="h-2.5 w-2.5 shrink-0 rounded-sm"
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
                      <CreditCard className="h-4 w-4 text-amber-500" />
                      Finance Snapshot
                    </CardTitle>
                    <button
                      onClick={() => navigate('/admin/finance')}
                      className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Full Ledger
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-amber-200/60 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <span className="text-muted-foreground text-xs font-semibold">
                      Pending Student Fees
                    </span>
                    <p className="mt-1 text-xl font-black text-amber-700 dark:text-amber-300">
                      ₹{dashboardData.finance.pendingStudentFees.totalAmount.toLocaleString()}
                    </p>
                    <span className="text-muted-foreground text-[11px]">
                      {dashboardData.finance.pendingStudentFees.count} invoice
                      {dashboardData.finance.pendingStudentFees.count === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="rounded-lg border border-indigo-200/60 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                    <span className="text-muted-foreground text-xs font-semibold">
                      Pending Salaries
                    </span>
                    <p className="mt-1 text-xl font-black text-indigo-700 dark:text-indigo-300">
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

            {/* Upcoming Exams + Recent Notices */}
            <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Upcoming Exams */}
              <Card className="min-w-0 border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-6 dark:border-zinc-800 dark:bg-zinc-900/90">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                      <Calendar className="h-4 w-4 text-violet-500" />
                      Upcoming Exams
                    </CardTitle>
                    <button
                      onClick={() => navigate('/admin/exams')}
                      className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
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
                        className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-800/50"
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
                      <Bell className="h-4 w-4 text-orange-500" />
                      <span>Notice Bulletin</span>
                    </CardTitle>
                    <button
                      onClick={() => navigate('/admin/notices')}
                      className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
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
                        className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-zinc-800 dark:bg-zinc-800/50"
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
                    <Bell className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
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
