import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { ErrorState } from '@/components/data-table';
import { teacherService } from '@/lib/services/teacher.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { dateToIsoDate } from '@/lib/date';
import type { ClassAttendanceStudentRow } from '@schoolerp/contracts';
import { toast } from 'sonner';
import { CheckCircle2, Save, CalendarClock, Users, School } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const currentMonthString = () => new Date().toISOString().slice(0, 7);

const ATTENDANCE_DAY_STYLES: Record<string, string> = {
  Present: 'bg-emerald-500 text-white',
  Absent: 'bg-rose-500 text-white',
  Leave: 'bg-amber-500 text-white',
};

// ---- Tab 1: My Attendance --------------------------------------------------

function MyAttendanceTab() {
  const [month, setMonth] = useState(currentMonthString);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: qk.teacher.myAttendance(month),
    queryFn: () => teacherService.getOwnAttendance(month),
  });

  const statusByDate = useMemo(() => {
    const map = new Map<string, string>();
    for (const d of data ?? []) map.set(d.date, d.status);
    return map;
  }, [data]);

  const [year, mon] = month.split('-').map(Number);
  const daysInMonth = new Date(year, mon, 0).getDate();
  const firstWeekday = new Date(year, mon - 1, 1).getDay(); // 0 = Sunday

  const present = (data ?? []).filter((d) => d.status === 'Present').length;
  const absent = (data ?? []).filter((d) => d.status === 'Absent').length;
  const leave = (data ?? []).filter((d) => d.status === 'Leave').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/70 px-3 py-1.5 font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
            Present: {present}
          </div>
          <div className="rounded-lg border border-rose-500/30 bg-rose-50/70 px-3 py-1.5 font-semibold text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">
            Absent: {absent}
          </div>
          <div className="rounded-lg border border-amber-500/30 bg-amber-50/70 px-3 py-1.5 font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            Leave: {leave}
          </div>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border-input h-9 rounded-none border bg-transparent px-2.5 text-xs font-semibold"
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : isError ? (
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : (
        <Card className="border border-slate-200/80 bg-white/90 p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-muted-foreground pb-1 text-[10px] font-bold">
                {d}
              </div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = `${month}-${String(day).padStart(2, '0')}`;
              const status = statusByDate.get(dateStr);
              return (
                <div
                  key={day}
                  className={`flex h-9 items-center justify-center rounded-md text-[11px] font-semibold ${
                    status
                      ? ATTENDANCE_DAY_STYLES[status]
                      : 'bg-slate-100 text-slate-400 dark:bg-zinc-800 dark:text-zinc-600'
                  }`}
                  title={status ?? 'No record'}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ---- Tab 2: Class Attendance -----------------------------------------------

interface ClassEditorProps {
  className: string;
  section: string;
  date: string;
  recordId: string | null;
  students: ClassAttendanceStudentRow[];
}

function ClassAttendanceEditor({ className, section, date, recordId, students }: ClassEditorProps) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Record<string, 'Present' | 'Absent'>>(() =>
    Object.fromEntries(
      students.map((s) => [s.studentId, s.status === 'Absent' ? 'Absent' : 'Present']),
    ),
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      recordId
        ? teacherService.updateClassAttendance(
            recordId,
            students.map((s) => ({
              id: s.id as string,
              studentId: s.studentId,
              status: draft[s.studentId] ?? 'Present',
            })),
          )
        : teacherService.createClassAttendance({
            className,
            section,
            date,
            attendance: students.map((s) => ({
              studentId: s.studentId,
              status: draft[s.studentId] ?? 'Present',
            })),
          }),
    onSuccess: () => {
      toast.success(`Attendance saved for ${date}`);
      queryClient.invalidateQueries({ queryKey: qk.teacher.classAttendanceList(date.slice(0, 7)) });
      if (recordId) {
        queryClient.invalidateQueries({ queryKey: qk.teacher.classAttendanceDetail(recordId) });
      }
      queryClient.invalidateQueries({ queryKey: qk.teacher.classRoster(className, section) });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const presentCount = students.filter(
    (s) => (draft[s.studentId] ?? 'Present') === 'Present',
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
          <span className="text-muted-foreground text-xs">Total Roster:</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {students.length}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-50/70 p-3 dark:bg-emerald-950/30">
          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
            Present:
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {presentCount}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-50/70 p-3 dark:bg-rose-950/30">
          <span className="text-xs font-medium text-rose-800 dark:text-rose-300">Absent:</span>
          <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
            {students.length - presentCount}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setDraft(Object.fromEntries(students.map((s) => [s.studentId, 'Present'])))
          }
          className="h-9 border-emerald-500/40 text-xs text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300"
        >
          <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-500" />
          <span>Mark All Present</span>
        </Button>
        <Button
          size="sm"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="h-9 gap-1.5 bg-emerald-600 text-xs text-white shadow-sm hover:bg-emerald-700"
        >
          <Save className="h-3.5 w-3.5" />
          <span>
            {saveMutation.isPending
              ? 'Saving...'
              : recordId
                ? 'Update Attendance'
                : 'Save Attendance'}
          </span>
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
              <TableHead className="w-20 text-xs font-bold">Roll #</TableHead>
              <TableHead className="text-xs font-bold">Student Name</TableHead>
              <TableHead className="text-right text-xs font-bold">Attendance Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const current = draft[student.studentId] ?? 'Present';
              return (
                <TableRow
                  key={student.studentId}
                  className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                >
                  <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                    #{student.rollNo}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {student.firstName} {student.lastName ?? ''}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
                      <button
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, [student.studentId]: 'Present' }))}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          current === 'Present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setDraft((d) => ({ ...d, [student.studentId]: 'Absent' }))}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${
                          current === 'Absent'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function ClassAttendanceTab() {
  const [searchParams] = useSearchParams();
  // Deep-link support: `/teacher/attendance?class=<className>|<section>` (used by the Timetable
  // page's "My Classes" cards) preselects a class. Read once at mount — no effect needed.
  const [classKey, setClassKey] = useState(() => searchParams.get('class') ?? ''); // "className|section"
  const [date, setDate] = useState(() => dateToIsoDate(new Date()));

  const { data: classSchedules, isLoading: schedulesLoading } = useQuery({
    queryKey: qk.teacher.timetable(),
    queryFn: () => teacherService.getTimetable(),
  });

  const classOptions = useMemo(
    () => (classSchedules ?? []).map((c) => ({ className: c.className, section: c.section })),
    [classSchedules],
  );

  const [className, section] = classKey ? classKey.split('|') : ['', ''];
  const month = date.slice(0, 7);

  const { data: monthList, isLoading: listLoading } = useQuery({
    queryKey: qk.teacher.classAttendanceList(month),
    queryFn: () => teacherService.getClassAttendanceList(month),
    enabled: !!className,
  });

  const existingRecord = monthList?.find(
    (r) => r.date === date && r.className === className && r.section === section,
  );

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: qk.teacher.classAttendanceDetail(existingRecord?.id ?? ''),
    queryFn: () => teacherService.getClassAttendanceDetail(existingRecord!.id),
    enabled: !!existingRecord,
  });

  const { data: roster, isLoading: rosterLoading } = useQuery({
    queryKey: qk.teacher.classRoster(className, section),
    queryFn: () => teacherService.getClassRoster(className, section),
    enabled: !!className && !existingRecord && !listLoading,
  });

  const isLoadingRoster = listLoading || (existingRecord ? detailLoading : rosterLoading);
  const students = existingRecord ? detail?.students : roster;

  return (
    <div className="space-y-4">
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="grid grid-cols-1 items-center gap-4 p-4 sm:grid-cols-2">
          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Class & Section
            </span>
            <select
              value={classKey}
              onChange={(e) => setClassKey(e.target.value)}
              disabled={schedulesLoading}
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">{schedulesLoading ? 'Loading…' : 'Select a class you teach'}</option>
              {classOptions.map((c) => (
                <option key={`${c.className}|${c.section}`} value={`${c.className}|${c.section}`}>
                  Class {c.className}-{c.section}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="text-muted-foreground mb-1 block text-[11px] font-semibold">
              Attendance Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-input h-9 w-full rounded-md border bg-transparent px-2.5 text-xs font-semibold"
            />
          </div>
        </CardContent>
      </Card>

      {!className ? (
        <Empty className="rounded-none border">
          <EmptyMedia variant="icon">
            <School className="size-5" />
          </EmptyMedia>
          <EmptyTitle>Pick a class</EmptyTitle>
          <EmptyDescription>
            Select one of your classes and a date to mark attendance.
          </EmptyDescription>
        </Empty>
      ) : isLoadingRoster ? (
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : !students || students.length === 0 ? (
        <Empty className="rounded-none border">
          <EmptyMedia variant="icon">
            <Users className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No students enrolled</EmptyTitle>
          <EmptyDescription>This class section has no enrolled students.</EmptyDescription>
        </Empty>
      ) : (
        <ClassAttendanceEditor
          key={`${className}-${section}-${date}`}
          className={className}
          section={section}
          date={date}
          recordId={existingRecord?.id ?? null}
          students={students}
        />
      )}
    </div>
  );
}

// ---- Page -------------------------------------------------------------------

export const TeacherAttendance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('class') ? 'class' : 'mine';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Attendance</h1>
            <Badge variant="outline" className="border-emerald-500/30 text-xs text-emerald-600">
              <CalendarClock className="mr-1 h-3 w-3" />
              Personal & Classroom
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Review your own attendance record, or mark daily roll call for a class you teach.
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="mine">My Attendance</TabsTrigger>
          <TabsTrigger value="class">Class Attendance</TabsTrigger>
        </TabsList>
        <TabsContent value="mine" className="pt-4">
          <MyAttendanceTab />
        </TabsContent>
        <TabsContent value="class" className="pt-4">
          <ClassAttendanceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherAttendance;
