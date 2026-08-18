import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  Award,
  Calendar,
  CreditCard,
  Bell,
  Clock,
  ArrowRight,
  Users,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();

  const todaySchedule = [
    {
      period: 1,
      time: '08:30 - 09:15 AM',
      class: 'Class 10-A',
      subject: 'Mathematics (MATH101)',
      room: 'Room 204',
      status: 'Completed',
    },
    {
      period: 2,
      time: '09:15 - 10:00 AM',
      class: 'Class 10-B',
      subject: 'Mathematics (MATH101)',
      room: 'Room 205',
      status: 'Completed',
    },
    {
      period: 3,
      time: '10:00 - 10:45 AM',
      class: 'Class 11-A',
      subject: 'Applied Calculus (CAL201)',
      room: 'Room 301',
      status: 'Next Class',
    },
    {
      period: 5,
      time: '12:00 - 12:45 PM',
      class: 'Class 9-A',
      subject: 'Mathematics (MATH101)',
      room: 'Room 102',
      status: 'Upcoming',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-emerald-500/20 bg-linear-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-2">
          <Badge variant="outline" className="border-emerald-400/30 text-xs text-emerald-300">
            Faculty Workspace
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, Prof. Meenakshi Sundaram!
          </h1>
          <p className="max-w-xl text-xs text-emerald-200/90">
            Head of Mathematics Department • 4 Scheduled periods today • Class 10-A attendance
            pending.
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
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">4 Periods</p>
              <span className="text-[10px] font-semibold text-emerald-600">2 Completed</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Assigned Students</span>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">162</p>
              <span className="text-[10px] font-semibold text-indigo-600">Across 4 Sections</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Users className="h-5 w-5" />
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
                1 Pending
              </p>
              <span className="text-muted-foreground text-[10px]">Class 10-A Math</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">March Salary</span>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹65,000
              </p>
              <span className="text-[10px] font-semibold text-emerald-600">✓ Disbursed</span>
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
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Calendar className="h-4 w-4 text-emerald-500" />
                <span>Today's Lecture Schedule</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Classroom assignments and period timings for today.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Tuesday Timetable
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {todaySchedule.map((item, idx) => (
              <div
                key={idx}
                className={`flex flex-col justify-between gap-3 rounded-xl border p-3.5 transition-all sm:flex-row sm:items-center ${
                  item.status === 'Next Class'
                    ? 'border-emerald-500/40 bg-emerald-50/70 shadow-xs dark:bg-emerald-950/30'
                    : 'border-slate-200/80 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-muted-foreground text-[10px] font-semibold">P</span>
                    <span className="text-sm leading-none font-bold text-slate-900 dark:text-white">
                      {item.period}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.class}
                      </span>
                      <span className="text-muted-foreground text-[11px]">• {item.room}</span>
                    </div>
                    <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {item.subject}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                      <Clock className="h-3 w-3" />
                      <span>{item.time}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] ${
                      item.status === 'Completed'
                        ? 'bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300'
                        : item.status === 'Next Class'
                          ? 'bg-emerald-600 font-bold text-white'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Classroom Actions & Staff Bulletins */}
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
                <span>Staff Notice</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1 text-xs">
              <div className="rounded-lg border bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span className="block font-semibold text-slate-800 dark:text-zinc-200">
                  Curriculum Review Meeting
                </span>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  Friday at 3:30 PM in Conference Room B.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
