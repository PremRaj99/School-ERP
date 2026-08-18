import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const subjectAttendanceBreakdown = [
  {
    subject: 'Mathematics (MATH101)',
    teacher: 'Prof. Meenakshi S.',
    attended: 36,
    total: 38,
    pct: 94.7,
  },
  { subject: 'Physics (PHY201)', teacher: 'Prof. Vikram C.', attended: 34, total: 36, pct: 94.4 },
  {
    subject: 'Chemistry (CHEM301)',
    teacher: 'Prof. Rajesh N.',
    attended: 33,
    total: 35,
    pct: 94.2,
  },
  {
    subject: 'English Literature (ENG001)',
    teacher: 'Prof. Anjali K.',
    attended: 30,
    total: 32,
    pct: 93.7,
  },
  {
    subject: 'Computer Science (CS501)',
    teacher: 'Prof. Alok M.',
    attended: 28,
    total: 29,
    pct: 96.5,
  },
];

export const StudentAttendance: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Student Attendance & Biometrics
            </h1>
            <Badge variant="outline" className="border-emerald-500/30 text-xs text-emerald-600">
              94.2% Overall Rate
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Subject-wise attendance logs, monthly breakdown, and institutional minimum 75%
            compliance tracking.
          </p>
        </div>
      </div>

      {/* Aggregate Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Total Working Days</span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">170 Days</p>
            <span className="text-muted-foreground text-[11px]">Session 2025-2026</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Classes Attended</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              161 Days
            </p>
            <span className="text-[11px] font-semibold text-emerald-600">✓ 94.2% Attendance</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Unexcused Absences</span>
            <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">6 Days</p>
            <span className="text-muted-foreground text-[11px]">Recorded in register</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Approved Leave</span>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">3 Days</p>
            <span className="text-muted-foreground text-[11px]">Medical leave verified</span>
          </CardContent>
        </Card>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="border-b border-slate-100 pb-3 dark:border-zinc-800">
          <CardTitle className="text-base font-bold">Subject-Wise Attendance Breakdown</CardTitle>
          <CardDescription className="text-xs">
            Minimum 75% attendance in every individual subject is required to sit for final
            examinations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          {subjectAttendanceBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{item.subject}</span>
                  <span className="text-muted-foreground ml-2 text-[11px]">({item.teacher})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono">
                    {item.attended}/{item.total} lectures
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  >
                    {item.pct}%
                  </Badge>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400"
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAttendance;
