import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Award,
  Calendar,
  CreditCard,
  Bell,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  const studentSchedule = [
    {
      period: 1,
      time: '08:30 - 09:15 AM',
      subject: 'Mathematics (MATH101)',
      teacher: 'Prof. Meenakshi S.',
      room: 'Room 204',
    },
    {
      period: 2,
      time: '09:15 - 10:00 AM',
      subject: 'English Literature (ENG001)',
      teacher: 'Prof. Anjali K.',
      room: 'Room 204',
    },
    {
      period: 3,
      time: '10:00 - 10:45 AM',
      subject: 'Physics Lab (PHY201)',
      teacher: 'Prof. Vikram C.',
      room: 'Science Lab 2',
    },
    {
      period: 4,
      time: '11:15 - 12:00 PM',
      subject: 'Chemistry (CHEM301)',
      teacher: 'Prof. Rajesh N.',
      room: 'Room 204',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-sky-500/20 bg-linear-to-r from-indigo-900 via-sky-950 to-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-2">
          <Badge variant="outline" className="border-sky-400/30 text-xs text-sky-300">
            Student Academic Hub
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            Welcome back, Aryan Sharma!
          </h1>
          <p className="max-w-xl text-xs text-sky-200/90">
            Class 10 - Section A • Roll No #101 • Student ID: STU-2025-001 • Term 1
          </p>
        </div>

        <Button
          onClick={() => navigate('/student/profile')}
          className="h-10 shrink-0 bg-white px-5 text-xs font-bold text-indigo-950 shadow-md hover:bg-sky-50"
        >
          <GraduationCap className="mr-1.5 h-4 w-4 text-indigo-600" />
          <span>View Digital ID Card</span>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Attendance Rate */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Attendance Record</span>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                94.2%
              </p>
              <span className="text-[10px] font-semibold text-emerald-600">
                Above 75% threshold
              </span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Academic GPA / Percentage */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Latest Term Grade</span>
              <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                Grade A+ (94%)
              </p>
              <span className="text-[10px] font-semibold text-indigo-600">Rank #2 in Class</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Exams */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Upcoming Exam</span>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">In 3 Days</p>
              <span className="text-muted-foreground text-[10px]">Pre-Board Mathematics</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Fee Dues */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Fee Account</span>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                All Clear
              </p>
              <span className="text-[10px] font-semibold text-emerald-600">₹0 Pending balance</span>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Today's Lectures & Quick Links */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Today's Timetable */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-8 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Clock className="h-4 w-4 text-indigo-500" />
                <span>Today's Class Schedule (Class 10-A)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Your daily lecture timeline and classroom locations.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Tuesday
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {studentSchedule.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-800/40"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
                    <span className="text-muted-foreground text-[10px] font-semibold">P</span>
                    <span className="text-sm leading-none font-bold text-slate-900 dark:text-white">
                      {item.period}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.subject}
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      {item.teacher} • {item.room}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                      <Clock className="h-3 w-3" />
                      <span>{item.time}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Tools & School Notices */}
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
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>Term Marksheet & Report Card</span>
                </div>
                <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                className="h-10 w-full justify-between border-slate-200 text-xs dark:border-zinc-700"
                onClick={() => navigate('/student/attendance')}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Monthly Attendance Calendar</span>
                </div>
                <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
              </Button>

              <Button
                variant="outline"
                className="h-10 w-full justify-between border-slate-200 text-xs dark:border-zinc-700"
                onClick={() => navigate('/student/fees')}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-teal-500" />
                  <span>Fee Receipts & Payment</span>
                </div>
                <ArrowRight className="text-muted-foreground h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <Bell className="h-4 w-4 text-orange-500" />
                <span>Notice Bulletin</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-1 text-xs">
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-2.5 dark:border-indigo-900/40 dark:bg-indigo-950/30">
                <span className="block font-semibold text-indigo-950 dark:text-indigo-200">
                  Annual Sports Meet Trials
                </span>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  Selection trials begin Monday morning at the track grounds.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
