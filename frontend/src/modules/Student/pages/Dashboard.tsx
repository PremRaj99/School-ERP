import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import {
  PiGraduationCap,
  PiMedal,
  PiCalendar,
  PiCreditCard,
  PiBell,
  PiArrowRight,
  PiCheckCircle,
} from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.student.dashboard(),
    queryFn: () => studentService.getDashboard(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full rounded-md" />
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

  const { profile, attendanceThisMonth, upcomingExams, recentNotices, pendingFees } = data;
  const attendancePct =
    attendanceThisMonth.total > 0
      ? Math.round((attendanceThisMonth.present / attendanceThisMonth.total) * 100)
      : null;
  const nextExam = [...upcomingExams].sort((a, b) => a.dateFrom.localeCompare(b.dateFrom))[0];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="border-primary/20 bg-primary flex flex-col items-start justify-between gap-4 rounded-md border p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-2">
          <Badge variant="outline" className="border-white/30 text-xs text-white/90">
            Gyandeep Bal Vikas Vidyamandir
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, {profile.firstName} {profile.lastName || ''}!
          </h1>
          <p className="max-w-xl text-xs text-white/80">
            Stay on top of your learning, attendance, exams, and school updates.
          </p>
          <p className="max-w-xl text-xs text-white/80">
            Class {profile.className}-{profile.section} • Roll No #{profile.rollNo} • Student ID:{' '}
            {profile.studentId} • Session {profile.session}
          </p>
        </div>

        <Button
          onClick={() => navigate('/student/profile')}
          className="text-primary h-10 shrink-0 bg-white px-5 text-xs font-bold shadow-md hover:bg-white/90"
        >
          <PiGraduationCap className="text-primary mr-1.5 h-4 w-4" />
          <span>View Digital ID Card</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">
                Attendance (This Month)
              </span>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {attendancePct !== null ? `${attendancePct}%` : '—'}
              </p>
              <span className="text-[10px] font-semibold text-emerald-600">
                {attendanceThisMonth.present}P / {attendanceThisMonth.absent}A /{' '}
                {attendanceThisMonth.leave}L
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
              <PiCheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Upcoming Exams</span>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {upcomingExams.length}
              </p>
              <span className="text-muted-foreground text-[10px]">
                {nextExam ? nextExam.title : 'None scheduled'}
              </span>
            </div>
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md">
              <PiCalendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Fee Account</span>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {pendingFees.count === 0
                  ? 'All Clear'
                  : `₹${pendingFees.totalAmount.toLocaleString()}`}
              </p>
              <span className="text-[10px] font-semibold text-emerald-600">
                {pendingFees.count === 0
                  ? '✓ No pending balance'
                  : `${pendingFees.count} invoice${pendingFees.count === 1 ? '' : 's'} pending`}
              </span>
            </div>
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md">
              <PiCreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Notices</span>
              <p className="text-primary mt-1 text-2xl font-bold">{recentNotices.length}</p>
              <span className="text-muted-foreground text-[10px]">Recent announcements</span>
            </div>
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-md">
              <PiBell className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Upcoming Exams & Quick Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-8 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="border-b border-slate-100 pb-3 dark:border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <PiMedal className="text-primary h-4 w-4" />
              <span>Upcoming Examinations</span>
            </CardTitle>
            <CardDescription className="text-xs">Your next scheduled assessments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {upcomingExams.length === 0 ? (
              <Empty className="rounded-md border-0">
                <EmptyMedia variant="icon">
                  <PiMedal className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No upcoming exams</EmptyTitle>
                <EmptyDescription>You have no examinations scheduled right now.</EmptyDescription>
              </Empty>
            ) : (
              upcomingExams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => navigate('/student/exams')}
                  className="flex w-full flex-col justify-between gap-2 rounded-md border border-slate-200/80 bg-slate-50/50 p-3.5 text-left sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-800/40"
                >
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {exam.title}
                  </span>
                  <span className="text-primary font-semibold">
                    {isoToDisplayDate(exam.dateFrom)}
                    {exam.dateTo && ` – ${isoToDisplayDate(exam.dateTo)}`}
                  </span>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-4">
          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Student Quick Access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="h-10 w-full justify-between border-slate-200 text-xs dark:border-zinc-700"
                onClick={() => navigate('/student/exams')}
              >
                <div className="flex items-center gap-2">
                  <PiMedal className="text-primary h-4 w-4" />
                  <span>Term Marksheet & Report Card</span>
                </div>
                <PiArrowRight className="text-muted-foreground h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                className="h-10 w-full justify-between border-slate-200 text-xs dark:border-zinc-700"
                onClick={() => navigate('/student/attendance')}
              >
                <div className="flex items-center gap-2">
                  <PiCheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Monthly Attendance Calendar</span>
                </div>
                <PiArrowRight className="text-muted-foreground h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                className="h-10 w-full justify-between border-slate-200 text-xs dark:border-zinc-700"
                onClick={() => navigate('/student/fees')}
              >
                <div className="flex items-center gap-2">
                  <PiCreditCard className="text-primary h-4 w-4" />
                  <span>Fee Receipts & Payment</span>
                </div>
                <PiArrowRight className="text-muted-foreground h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <PiBell className="text-primary h-4 w-4" />
                <span>School Notices</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1 text-xs">
              {recentNotices.length === 0 ? (
                <p className="text-muted-foreground text-xs">No notices yet.</p>
              ) : (
                recentNotices.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => navigate('/student/notices')}
                    className="block w-full rounded-md border bg-slate-50 p-2.5 text-left dark:bg-zinc-800/50"
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

export default StudentDashboard;
