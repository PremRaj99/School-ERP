import React, { useMemo, useState } from 'react';
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
import { dateToIsoDate, isoToDisplayDate } from '@/lib/date';
import type { AdminStudentAttendanceReport, AttendanceStatus } from '@schoolerp/contracts';
import { PiCalendarBlank, PiChalkboard, PiUsers } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Mirrors the backend's `getCurrentSessionYear()` — a session runs April to March. */
function getCurrentSessionYear(): string {
  const now = new Date();
  const start = now.getMonth() + 1 >= 4 ? now.getFullYear() : now.getFullYear() - 1;
  return `${start}-${start + 1}`;
}

/** The 12 months of a `YYYY-YYYY` session as `YYYY-MM`, April first. */
function sessionMonths(session: string): string[] {
  const start = Number(session.slice(0, 4));
  return Array.from({ length: 12 }, (_, i) => {
    const monthIndex = (3 + i) % 12;
    const year = i < 9 ? start : start + 1;
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  });
}

function monthLabel(ym: string): string {
  const [year, month] = ym.split('-').map(Number);
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

/** First and last day of a `YYYY-MM` month as ISO dates. */
function monthRange(ym: string): { from: string; to: string } {
  const [year, month] = ym.split('-').map(Number);
  return {
    from: dateToIsoDate(new Date(year, month - 1, 1)),
    to: dateToIsoDate(new Date(year, month, 0)),
  };
}

/** Every ISO date of a `YYYY-MM` month. */
function monthDays(ym: string): string[] {
  const [year, month] = ym.split('-').map(Number);
  const count = new Date(year, month, 0).getDate();
  return Array.from({ length: count }, (_, i) => dateToIsoDate(new Date(year, month - 1, i + 1)));
}

/** The current month if it falls inside `session`, otherwise the session's first month. */
function defaultMonth(session: string): string {
  const months = sessionMonths(session);
  const current = dateToIsoDate(new Date()).slice(0, 7);
  return months.includes(current) ? current : months[0];
}

const byNumeric = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true });

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

const SELECT_CLASS =
  'h-9 min-w-32 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900';
const LABEL_CLASS = 'text-muted-foreground mb-1 block text-[11px] font-semibold';
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
  const [session, setSession] = useState(getCurrentSessionYear);
  const [className, setClassName] = useState('');
  const [section, setSection] = useState('');
  const [month, setMonth] = useState(() => defaultMonth(getCurrentSessionYear()));

  const { data: classesList, isLoading: classesLoading } = useQuery({
    queryKey: qk.admin.classes(),
    queryFn: () => adminService.getClasses(),
  });

  const sessionOptions = useMemo(() => {
    const all = new Set((classesList ?? []).map((c) => c.session));
    all.add(getCurrentSessionYear());
    return Array.from(all).sort().reverse();
  }, [classesList]);

  const sessionClasses = (classesList ?? []).filter((c) => c.session === session);
  const classNameOptions = Array.from(new Set(sessionClasses.map((c) => c.className))).sort(
    byNumeric,
  );
  const sectionOptions = Array.from(
    new Set(sessionClasses.filter((c) => c.className === className).map((c) => c.section)),
  ).sort(byNumeric);

  const classId =
    sessionClasses.find((c) => c.className === className && c.section === section)?.id ?? '';
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
    setClassName(name);
    setSection(sec);
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

        {/* Filters — narrowed in order: session → class → section → month */}
        <div className="flex flex-wrap items-end gap-3 pt-4">
          <div>
            <span className={LABEL_CLASS}>Session</span>
            <select
              value={session}
              onChange={(e) => {
                setSession(e.target.value);
                setClassName('');
                setSection('');
                setMonth(defaultMonth(e.target.value));
              }}
              className={SELECT_CLASS}
            >
              {sessionOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                  {opt === getCurrentSessionYear() ? ' (Current)' : ''}
                </option>
              ))}
            </select>
          </div>
          {view !== 'all' && (
            <>
              <div>
                <span className={LABEL_CLASS}>Class</span>
                <select
                  value={className}
                  onChange={(e) => {
                    setClassName(e.target.value);
                    setSection('');
                  }}
                  disabled={classesLoading || classNameOptions.length === 0}
                  className={SELECT_CLASS}
                >
                  <option value="">
                    {classNameOptions.length === 0 && !classesLoading
                      ? 'No classes'
                      : 'Select class…'}
                  </option>
                  {classNameOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      Class {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <span className={LABEL_CLASS}>Section</span>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  disabled={!className}
                  className={SELECT_CLASS}
                >
                  <option value="">Select section…</option>
                  {sectionOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      Section {opt}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
          <div>
            <span className={LABEL_CLASS}>Month</span>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={SELECT_CLASS}
            >
              {sessionMonths(session).map((opt) => (
                <option key={opt} value={opt}>
                  {monthLabel(opt)}
                </option>
              ))}
            </select>
          </div>
        </div>

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
                <CardDescription className="text-xs">
                  Session {session} · click a class to see its students.
                </CardDescription>
              </CardHeader>
              <Table>
                <TableHeader>
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
                  {summaryQuery.data.classes.map((c) => (
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
                    <Badge variant="outline" className="text-xs">
                      {report.students.length} student{report.students.length === 1 ? '' : 's'}
                    </Badge>
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

const ClassSummaryTable: React.FC<{ report: AdminStudentAttendanceReport }> = ({ report }) => (
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

  return (
    <div className="space-y-2 pb-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50/70 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="sticky left-0 z-10 min-w-40 bg-slate-50 px-3 py-2 text-left font-bold dark:bg-zinc-800">
                Student
              </th>
              {days.map((d) => {
                const isSunday = new Date(`${d}T00:00:00`).getDay() === 0;
                return (
                  <th
                    key={d}
                    className={`w-7 min-w-7 px-0.5 py-2 text-center font-semibold ${
                      isSunday ? 'text-rose-500' : 'text-slate-600 dark:text-zinc-400'
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
        P Present · A Absent · L Leave · – marked, no status recorded · · not marked
      </p>
    </div>
  );
};

export default AdminStudentAttendance;
