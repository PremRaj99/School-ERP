import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { compareClassSection, monthDays, monthLabel, monthRange } from '@/lib/session';
import { ExportButton } from '@/components/filters';
import { ClassFilterBar } from '@/components/filters';
import { useClassFilter } from '@/hooks/useClassFilter';
import type { AdminStudentAttendanceReport, AttendanceStatus } from '@schoolerp/contracts';
import { PiCalendarBlank, PiChalkboard, PiUsers } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

function percentBadgeClass(pct: number): string {
  if (pct >= 90)
    return 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (pct >= 75)
    return 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
  return 'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300';
}

const STATUS_CELL: Record<AttendanceStatus, { label: string; className: string }> = {
  Present: {
    label: 'P',
    className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  Absent: {
    label: 'A',
    className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  },
  Leave: {
    label: 'L',
    className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  },
};

const CARD_CLASS =
  'overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90';

type View = 'all' | 'daily' | 'class';

/**
 * Admin-side view of student attendance (ALIGNMENT_PLAN.md P3) — read-only; marking stays the
 * teacher's job (`Teacher/pages/Attendance.tsx`). Three views over one month:
 *  - All Classes: one aggregate row per class in the session (`classesSummary`).
 *  - Daily Register: every student × every day of the month for one class section.
 *  - Class Summary: per-student monthly totals for one class section.
 * The last two share one request — `report` returns both totals and day-by-day statuses.
 */
export const AdminStudentAttendance: React.FC = () => {
  const [view, setView] = useState<View>('all');
  const filter = useClassFilter();
  const { session, month, classId } = filter;
  const { from, to } = monthRange(month);

  const reportQuery = useQuery({
    queryKey: qk.admin.studentAttendanceReport(classId, from, to),
    queryFn: () => adminService.getStudentAttendanceReport({ classId, from, to }),
    enabled: view !== 'all' && !!classId,
  });

  const summaryQuery = useQuery({
    queryKey: qk.admin.classesAttendanceSummary(session, from, to),
    queryFn: () => adminService.getClassesAttendanceSummary({ session, from, to }),
    enabled: view === 'all',
  });

  const openClass = (name: string, sec: string) => {
    filter.selectClass(name, sec);
    setView('class');
  };

  const report = reportQuery.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-2 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight">Student Attendance</h1>
        </div>
        <p className="text-muted-foreground mt-0.5 text-xs">
          Monthly attendance across every class, per student day by day, or per class section.
        </p>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as View)} className="w-full">
        <TabsList className="h-10 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="all" className="rounded-md px-4 text-xs font-semibold">
            <PiChalkboard className="mr-1.5 h-3.5 w-3.5" />
            All Classes
          </TabsTrigger>
          <TabsTrigger value="daily" className="rounded-md px-4 text-xs font-semibold">
            <PiCalendarBlank className="mr-1.5 h-3.5 w-3.5" />
            Daily Register
          </TabsTrigger>
          <TabsTrigger value="class" className="rounded-md px-4 text-xs font-semibold">
            <PiUsers className="mr-1.5 h-3.5 w-3.5" />
            Class Summary
          </TabsTrigger>
        </TabsList>

        <ClassFilterBar filter={filter} showClass={view !== 'all'} showMonth className="pt-4" />

        {/* View 1 — every class in the session */}
        <TabsContent value="all" className="pt-4 focus:outline-hidden">
          {summaryQuery.isLoading ? (
            <Skeleton className="h-96 w-full" />
          ) : summaryQuery.isError || !summaryQuery.data ? (
            <ErrorState
              description={getErrorMessage(summaryQuery.error)}
              onRetry={() => summaryQuery.refetch()}
            />
          ) : summaryQuery.data.classes.length === 0 ? (
            <Empty className="rounded-md border p-8">
              <EmptyMedia illustration="studentAttendance" illustrationSize={120} />
              <EmptyTitle>No classes in {session}</EmptyTitle>
              <EmptyDescription>Create a class section for this session first.</EmptyDescription>
            </Empty>
          ) : (
            <Card className={CARD_CLASS}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                  <PiChalkboard className="text-primary h-4 w-4" />
                  All Classes · {monthLabel(month)}
                </CardTitle>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardDescription className="text-xs">
                    Session {session} · click a class to see its students.
                  </CardDescription>
                  <ExportButton
                    filename={`attendance-all-classes-${month}`}
                    headers={[
                      'Class',
                      'Section',
                      'Students',
                      'Marked Days',
                      'Present',
                      'Absent',
                      'Leave',
                      'Attendance %',
                    ]}
                    rows={[...summaryQuery.data.classes]
                      .sort(compareClassSection)
                      .map((c) => [
                        c.className,
                        c.section,
                        c.studentCount,
                        c.totalMarkedDays,
                        c.presentCount,
                        c.absentCount,
                        c.leaveCount,
                        c.totalMarkedDays === 0 ? '' : c.attendancePercent,
                      ])}
                  />
                </div>
              </CardHeader>
              <Table containerClassName="max-h-[32rem]">
                <TableHeader sticky>
                  <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                    <TableHead className="text-xs font-bold">Class</TableHead>
                    <TableHead className="text-xs font-bold">Students</TableHead>
                    <TableHead className="text-xs font-bold">Marked Days</TableHead>
                    <TableHead className="text-xs font-bold">Present</TableHead>
                    <TableHead className="text-xs font-bold">Absent</TableHead>
                    <TableHead className="text-xs font-bold">Leave</TableHead>
                    <TableHead className="text-xs font-bold">Attendance %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...summaryQuery.data.classes].sort(compareClassSection).map((c) => (
                    <TableRow
                      key={c.classId}
                      onClick={() => openClass(c.className, c.section)}
                      className="cursor-pointer hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <TableCell className="text-primary text-xs font-semibold">
                        Class {c.className}-{c.section}
                      </TableCell>
                      <TableCell className="text-xs">{c.studentCount}</TableCell>
                      <TableCell className="text-xs">{c.totalMarkedDays}</TableCell>
                      <TableCell className="text-xs text-emerald-700 dark:text-emerald-400">
                        {c.presentCount}
                      </TableCell>
                      <TableCell className="text-xs text-rose-700 dark:text-rose-400">
                        {c.absentCount}
                      </TableCell>
                      <TableCell className="text-xs text-amber-700 dark:text-amber-400">
                        {c.leaveCount}
                      </TableCell>
                      <TableCell>
                        {c.totalMarkedDays === 0 ? (
                          <span className="text-muted-foreground text-[10px]">Not marked</span>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${percentBadgeClass(c.attendancePercent)}`}
                          >
                            {c.attendancePercent}%
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        {/* Views 2 & 3 — one class section, sharing the same report */}
        {(['daily', 'class'] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="pt-4 focus:outline-hidden">
            {!classId ? (
              <Empty className="rounded-md border p-8">
                <EmptyMedia illustration="studentAttendance" illustrationSize={120} />
                <EmptyTitle>Pick a class and section to get started</EmptyTitle>
                <EmptyDescription>
                  Select a class and section above to see its attendance for the chosen month.
                </EmptyDescription>
              </Empty>
            ) : reportQuery.isLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : reportQuery.isError || !report ? (
              <ErrorState
                description={getErrorMessage(reportQuery.error)}
                onRetry={() => reportQuery.refetch()}
              />
            ) : (
              <Card className={CARD_CLASS}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                        <PiUsers className="text-primary h-4 w-4" />
                        Class {report.className}-{report.section} · {monthLabel(month)}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {isoToDisplayDate(report.from)} – {isoToDisplayDate(report.to)} ·{' '}
                        {report.totalMarkedDays} marked day
                        {report.totalMarkedDays === 1 ? '' : 's'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {report.students.length} student{report.students.length === 1 ? '' : 's'}
                      </Badge>
                      {report.totalMarkedDays > 0 && (
                        <ExportButton
                          filename={`attendance-${report.className}-${report.section}-${month}-${tab === 'daily' ? 'register' : 'summary'}`}
                          {...(tab === 'daily'
                            ? registerExport(report, month)
                            : summaryExport(report))}
                        />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {report.totalMarkedDays === 0 ? (
                  <Empty className="rounded-md border-0 border-t p-8">
                    <EmptyMedia illustration="studentAttendance" illustrationSize={120} />
                    <EmptyTitle>No attendance marked this month</EmptyTitle>
                    <EmptyDescription>
                      The class teacher hasn&apos;t marked attendance for any day in{' '}
                      {monthLabel(month)} yet.
                    </EmptyDescription>
                  </Empty>
                ) : tab === 'daily' ? (
                  <DailyRegister report={report} month={month} />
                ) : (
                  <ClassSummaryTable report={report} />
                )}
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

/** CSV for the Class Summary view — one row per student. */
function summaryExport(report: AdminStudentAttendanceReport) {
  return {
    headers: ['Roll No', 'Student ID', 'Name', 'Present', 'Absent', 'Leave', 'Attendance %'],
    rows: report.students.map((s) => [
      s.rollNo,
      s.studentId,
      `${s.firstName} ${s.lastName ?? ''}`.trim(),
      s.presentCount,
      s.absentCount,
      s.leaveCount,
      s.attendancePercent,
    ]),
  };
}

/** CSV for the Daily Register — the same grid as on screen: P/A/L, H for holidays, blank. */
function registerExport(report: AdminStudentAttendanceReport, month: string) {
  const days = monthDays(month);
  const holidays = new Set(report.holidays.map((h) => h.date));
  return {
    headers: ['Roll No', 'Name', ...days.map((d) => d.slice(8)), 'P', 'A', 'L'],
    rows: report.students.map((s) => {
      const statusByDate = new Map(s.daily.map((d) => [d.date, d.status]));
      return [
        s.rollNo,
        `${s.firstName} ${s.lastName ?? ''}`.trim(),
        ...days.map((d) => {
          if (holidays.has(d)) return 'H';
          const status = statusByDate.get(d);
          return status ? STATUS_CELL[status].label : '';
        }),
        s.presentCount,
        s.absentCount,
        s.leaveCount,
      ];
    }),
  };
}

const ClassSummaryTable: React.FC<{ report: AdminStudentAttendanceReport }> = ({ report }) => (
  <Table containerClassName="max-h-[32rem]">
    <TableHeader sticky>
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
        <TableRow key={s.studentId} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
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
);

/** Students down the side, every day of the month across the top. */
const DailyRegister: React.FC<{ report: AdminStudentAttendanceReport; month: string }> = ({
  report,
  month,
}) => {
  const days = monthDays(month);
  const marked = new Set(report.markedDates);
  const holidays = new Map(report.holidays.map((h) => [h.date, h.title]));

  return (
    <div className="space-y-2 pb-3">
      <div className="max-h-[32rem] overflow-auto" data-slot="table-container">
        <table className="w-full border-collapse text-[11px]">
          <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-zinc-800">
            <tr className="border-y border-slate-200 bg-slate-50/70 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="sticky left-0 z-30 min-w-40 bg-slate-50 px-3 py-2 text-left font-bold dark:bg-zinc-800">
                Student
              </th>
              {days.map((d) => {
                const holiday = holidays.get(d);
                return (
                  <th
                    key={d}
                    title={holiday}
                    className={`w-7 min-w-7 px-0.5 py-2 text-center font-semibold ${
                      holiday
                        ? 'bg-rose-50/70 text-rose-500 dark:bg-rose-950/20'
                        : 'text-slate-600 dark:text-zinc-400'
                    }`}
                  >
                    {Number(d.slice(8))}
                  </th>
                );
              })}
              <th className="px-2 py-2 text-center font-bold">P</th>
              <th className="px-2 py-2 text-center font-bold">A</th>
              <th className="px-2 py-2 text-center font-bold">L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {report.students.map((s) => {
              const statusByDate = new Map(s.daily.map((d) => [d.date, d.status]));
              return (
                <tr key={s.studentId} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                  <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium whitespace-nowrap dark:bg-zinc-900">
                    <span className="text-muted-foreground mr-1.5">#{s.rollNo}</span>
                    {s.firstName} {s.lastName ?? ''}
                  </td>
                  {days.map((d) => {
                    const holiday = holidays.get(d);
                    if (holiday) {
                      return (
                        <td
                          key={d}
                          title={holiday}
                          className="bg-rose-50/70 p-0.5 text-center font-bold text-rose-400 dark:bg-rose-950/20"
                        >
                          H
                        </td>
                      );
                    }
                    const status = statusByDate.get(d);
                    if (status) {
                      const cell = STATUS_CELL[status];
                      return (
                        <td key={d} className="p-0.5 text-center">
                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded font-bold ${cell.className}`}
                          >
                            {cell.label}
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={d}
                        className={`p-0.5 text-center ${
                          marked.has(d)
                            ? 'text-muted-foreground'
                            : 'text-slate-300 dark:text-zinc-700'
                        }`}
                      >
                        {marked.has(d) ? '–' : '·'}
                      </td>
                    );
                  })}
                  <td className="px-2 text-center font-semibold text-emerald-700 dark:text-emerald-400">
                    {s.presentCount}
                  </td>
                  <td className="px-2 text-center font-semibold text-rose-700 dark:text-rose-400">
                    {s.absentCount}
                  </td>
                  <td className="px-2 text-center font-semibold text-amber-700 dark:text-amber-400">
                    {s.leaveCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground px-3 text-[10px]">
        P Present · A Absent · L Leave · H Holiday or Sunday (hover for the reason; not counted) · –
        marked, no status recorded · · not marked
      </p>
    </div>
  );
};

export default AdminStudentAttendance;
