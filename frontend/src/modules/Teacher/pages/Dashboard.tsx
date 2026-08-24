import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { teacherService } from '@/lib/services/teacher.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import {
  UserCheck,
  Award,
  Calendar,
  CreditCard,
  Bell,
  Clock,
  ArrowRight,
  CalendarClock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.teacher.dashboard(),
    queryFn: () => teacherService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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

  const {
    profile,
    attendanceThisMonth,
    todaySchedule,
    pendingResultEntries,
    recentNotices,
    pendingSalary,
  } = data;
  const attendancePct =
    attendanceThisMonth.total > 0
      ? Math.round((attendanceThisMonth.present / attendanceThisMonth.total) * 100)
      : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-emerald-500/20 bg-linear-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-2">
          <Badge variant="outline" className="border-emerald-400/30 text-xs text-emerald-300">
            Faculty Workspace
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {profile.firstName} {profile.lastName || ''}!
          </h1>
          <p className="max-w-xl text-xs text-emerald-200/90">
            {profile.subjectHandled.length > 0
              ? profile.subjectHandled.join(', ')
              : 'No subjects assigned yet'}{' '}
            • {todaySchedule.length} scheduled period{todaySchedule.length === 1 ? '' : 's'} today
            {pendingResultEntries.length > 0 &&
              ` • ${pendingResultEntries.length} result entr${pendingResultEntries.length === 1 ? 'y' : 'ies'} pending`}
            .
          </p>
        </div>

        <Button
          onClick={() => navigate('/teacher/attendance')}
          className="h-10 shrink-0 bg-white px-5 text-xs font-bold text-emerald-950 shadow-md hover:bg-emerald-50"
        >
          <UserCheck className="mr-1.5 h-4 w-4 text-emerald-600" />
          <span>Mark Class Attendance</span>
        </Button>
      </div>

      {/* Quick Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Today's Lectures</span>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {todaySchedule.length} Period{todaySchedule.length === 1 ? '' : 's'}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">
                My Attendance (This Month)
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {attendancePct !== null ? `${attendancePct}%` : '—'}
              </p>
              <span className="text-[10px] font-semibold text-indigo-600">
                {attendanceThisMonth.present}P / {attendanceThisMonth.absent}A /{' '}
                {attendanceThisMonth.leave}L
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <CalendarClock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">
                Exam Papers to Mark
              </span>
              <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {pendingResultEntries.length} Pending
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Pending Salary</span>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {pendingSalary.count === 0
                  ? '✓ Clear'
                  : `₹${pendingSalary.totalAmount.toLocaleString()}`}
              </p>
              <span className="text-muted-foreground text-[10px]">
                {pendingSalary.count === 0
                  ? 'No pending payments'
                  : `${pendingSalary.count} month${pendingSalary.count === 1 ? '' : 's'} pending`}
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Today's Timeline & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Today's Schedule Timeline */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-8 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="border-b border-slate-100 pb-3 dark:border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span>Today's Lecture Schedule</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Classroom assignments for today, from your timetable.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {todaySchedule.length === 0 ? (
              <Empty className="rounded-none border-0">
                <EmptyMedia variant="icon">
                  <Calendar className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No periods today</EmptyTitle>
                <EmptyDescription>You have no scheduled periods today.</EmptyDescription>
              </Empty>
            ) : (
              [...todaySchedule]
                .sort((a, b) => a.periodNumber - b.periodNumber)
                .map((item) => (
                  <div
                    key={item.periodNumber}
                    className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition-all sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-800/40"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                        <span className="text-muted-foreground text-[10px] font-semibold">P</span>
                        <span className="text-sm leading-none font-bold text-slate-900 dark:text-white">
                          {item.periodNumber}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Class {item.className}-{item.section}
                        </span>
                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          {item.subjectName} ({item.subjectCode})
                        </p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Quick Classroom Actions & Notices */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Faculty Quick Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="h-10 w-full justify-between border-slate-200 text-xs dark:border-zinc-700"
                onClick={() => navigate('/teacher/attendance')}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-500" />
                  <span>Mark Student Attendance</span>
                </div>
                <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                className="h-10 w-full justify-between border-slate-200 text-xs dark:border-zinc-700"
                onClick={() => navigate('/teacher/results')}
              >
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-500" />
                  <span>Enter Exam Marksheet</span>
                </div>
                <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                className="h-10 w-full justify-between border-slate-200 text-xs dark:border-zinc-700"
                onClick={() => navigate('/teacher/salary')}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-teal-500" />
                  <span>View Monthly Payslips</span>
                </div>
                <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Bell className="h-4 w-4 text-orange-500" />
                <span>Recent Notices</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1 text-xs">
              {recentNotices.length === 0 ? (
                <p className="text-muted-foreground text-xs">No notices yet.</p>
              ) : (
                recentNotices.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => navigate('/teacher/notices')}
                    className="block w-full rounded-lg border bg-slate-50 p-2.5 text-left dark:bg-zinc-800/50"
                  >
                    <span className="block font-semibold text-slate-800 dark:text-zinc-200">
                      {n.title}
                    </span>
                    <p className="text-muted-foreground mt-0.5 text-[11px]">
                      {isoToDisplayDate(n.date)}
                    </p>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
