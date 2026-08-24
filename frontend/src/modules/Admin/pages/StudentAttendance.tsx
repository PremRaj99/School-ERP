import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { dateToIsoDate, isoToDisplayDate } from '@/lib/date';
import { ClipboardCheck, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

function monthAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return dateToIsoDate(d);
}

function percentBadgeClass(pct: number): string {
  if (pct >= 90)
    return 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (pct >= 75)
    return 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  return 'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
}

/**
 * Admin-side view of student attendance (ALIGNMENT_PLAN.md P3) — admins previously had no way to
 * see student attendance at all; only teachers could view/mark it. This is a per-class summary
 * report over a date range, not a day-by-day marking grid — marking stays the teacher's job
 * (`Teacher/pages/Attendance.tsx`); an admin needs "how is this class doing," not another marking
 * UI (see `adminStudentAttendanceContract` in `@schoolerp/contracts` for the same reasoning).
 */
export const AdminStudentAttendance: React.FC = () => {
  const [classId, setClassId] = useState('');
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(() => dateToIsoDate(new Date()));

  const { data: classesList, isLoading: classesLoading } = useQuery({
    queryKey: qk.admin.classes(),
    queryFn: () => adminService.getClasses(),
  });

  const {
    data: report,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.studentAttendanceReport(classId, from, to),
    queryFn: () => adminService.getStudentAttendanceReport({ classId, from, to }),
    enabled: !!classId,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Student Attendance</h1>
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Attendance summary for a class over a date range — pick a class to see it.
        </p>
      </div>

      {/* Filters */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Class
            </span>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={classesLoading}
              className="h-9 min-w-48 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">Select a class…</option>
              {(classesList ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  Class {c.className}-{c.section} ({c.session})
                </option>
              ))}
            </select>
          </div>
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
        </CardContent>
      </Card>

      {!classId ? (
        <Empty className="rounded-none border">
          <EmptyMedia variant="icon">
            <ClipboardCheck className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Pick a class to get started</EmptyTitle>
          <EmptyDescription>
            Select a class above to see its attendance summary for the chosen date range.
          </EmptyDescription>
        </Empty>
      ) : isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : isError || !report ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <Users className="h-4 w-4 text-indigo-500" />
                  Class {report.className}-{report.section}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isoToDisplayDate(report.from)} – {isoToDisplayDate(report.to)} ·{' '}
                  {report.totalMarkedDays} marked day{report.totalMarkedDays === 1 ? '' : 's'}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {report.students.length} student{report.students.length === 1 ? '' : 's'}
              </Badge>
            </div>
          </CardHeader>

          {report.totalMarkedDays === 0 ? (
            <Empty className="rounded-none border-0 border-t">
              <EmptyMedia variant="icon">
                <ClipboardCheck className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No attendance marked in this range</EmptyTitle>
              <EmptyDescription>
                The class teacher hasn't marked attendance for any day in this date range yet.
              </EmptyDescription>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                  <TableHead className="text-xs font-bold">Roll No</TableHead>
                  <TableHead className="text-xs font-bold">Name</TableHead>
                  <TableHead className="text-xs font-bold">Present</TableHead>
                  <TableHead className="text-xs font-bold">Absent</TableHead>
                  <TableHead className="text-xs font-bold">Leave</TableHead>
                  <TableHead className="text-xs font-bold">Attendance %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.students.map((s) => (
                  <TableRow
                    key={s.studentId}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                  >
                    <TableCell className="text-xs font-semibold">#{s.rollNo}</TableCell>
                    <TableCell className="text-xs font-medium">
                      {s.firstName} {s.lastName ?? ''}
                    </TableCell>
                    <TableCell className="text-xs text-emerald-700 dark:text-emerald-400">
                      {s.presentCount}
                    </TableCell>
                    <TableCell className="text-xs text-rose-700 dark:text-rose-400">
                      {s.absentCount}
                    </TableCell>
                    <TableCell className="text-xs text-amber-700 dark:text-amber-400">
                      {s.leaveCount}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${percentBadgeClass(s.attendancePercent)}`}
                      >
                        {s.attendancePercent}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminStudentAttendance;
