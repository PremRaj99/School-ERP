import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { dateToIsoDate } from '@/lib/date';
import { MAX_PAGE_SIZE, type AttendanceStatus } from '@schoolerp/contracts';
import { toast } from 'sonner';
import { PiCalendarCheck, PiUsers, PiUserCheck, PiUserMinus } from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Admin's teacher-attendance manager (PAGES_PLAN.md §2.11) — class-wise *student* attendance is
 * marked by teachers themselves (see `Teacher/pages/Attendance.tsx`), not here. This page was
 * previously a fully static mock showing the wrong data model entirely (per-class student roll
 * call numbers); rebuilt against `adminTeacherAttendanceContract` (ALIGNMENT_PLAN.md Phase 4).
 */

type Row = { teacherId: string; firstName: string; lastName: string | null };

export const AdminAttendance: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => dateToIsoDate(new Date()));
  const [draft, setDraft] = useState<Record<string, 'Present' | 'Absent'>>({});

  // pageSize: MAX_PAGE_SIZE — the roll-call needs every teacher, not one page of the (now
  // server-paginated, ALIGNMENT_PLAN.md 2C/P1) list endpoint.
  const {
    data: rosterResponse,
    isLoading: rosterLoading,
    isError: rosterErrored,
    error: rosterError,
    refetch: refetchRoster,
  } = useQuery({
    queryKey: qk.admin.teachers({ pageSize: MAX_PAGE_SIZE }),
    queryFn: () => adminService.getTeachers({ pageSize: MAX_PAGE_SIZE }),
  });
  const rosterData = rosterResponse?.data;

  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    isError: attendanceErrored,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useQuery({
    queryKey: qk.admin.teacherAttendanceByDate(selectedDate),
    queryFn: () => adminService.getTeacherAttendanceDate(selectedDate),
  });

  const markMutation = useMutation({
    mutationFn: () =>
      adminService.markTeacherAttendance(
        selectedDate,
        rows.map((r) => ({ teacherId: r.teacherId, status: draft[r.teacherId] ?? statusFor(r) })),
      ),
    onSuccess: () => {
      toast.success(`Attendance saved for ${selectedDate}`);
      queryClient.invalidateQueries({ queryKey: qk.admin.teacherAttendanceByDate(selectedDate) });
      setDraft({});
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const markedByTeacherId = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    for (const t of attendanceData?.teachers ?? []) map.set(t.teacherId, t.status);
    return map;
  }, [attendanceData]);

  const statusFor = (r: { teacherId: string }): 'Present' | 'Absent' =>
    markedByTeacherId.get(r.teacherId) === 'Absent' ? 'Absent' : 'Present';

  const rows: Row[] = (rosterData ?? []).map((t) => ({
    teacherId: t.teacherId,
    firstName: t.firstName,
    lastName: t.lastName,
  }));

  const isLoading = rosterLoading || attendanceLoading;
  const isError = rosterErrored || attendanceErrored;
  const presentCount = rows.filter(
    (r) => (draft[r.teacherId] ?? statusFor(r)) === 'Present',
  ).length;
  const hasUnsavedChanges = Object.keys(draft).length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Faculty Attendance</h1>
            <Badge variant="outline" className="text-xs">
              Daily Roll Call
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Mark and review daily attendance for teaching staff.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setDraft({});
            }}
            className="border-input h-9 rounded-md border bg-transparent px-2.5 text-xs font-semibold"
          />
          <Button
            size="sm"
            onClick={() => markMutation.mutate()}
            disabled={markMutation.isPending || rows.length === 0}
            className="bg-primary hover:bg-primary/90 h-9 text-xs text-white"
          >
            <PiCalendarCheck className="mr-1.5 h-3.5 w-3.5" />
            {markMutation.isPending ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      </div>

      {/* Aggregate Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center gap-3 p-4">
            <PiUsers className="text-primary h-5 w-5" />
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Total Faculty</span>
              <p className="text-xl font-bold">{rows.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center gap-3 p-4">
            <PiUserCheck className="h-5 w-5 text-emerald-500" />
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Present</span>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {presentCount}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="flex items-center gap-3 p-4">
            <PiUserMinus className="h-5 w-5 text-rose-500" />
            <div>
              <span className="text-muted-foreground text-xs font-semibold">Absent</span>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {rows.length - presentCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Roster */}
      {isLoading ? (
        <div className="space-y-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          description={getErrorMessage(rosterError ?? attendanceError)}
          onRetry={() => {
            refetchRoster();
            refetchAttendance();
          }}
        />
      ) : rows.length === 0 ? (
        <Empty className="rounded-md border p-8">
          <EmptyMedia illustration="attendance" illustrationSize={120} />
          <EmptyTitle>No faculty registered yet</EmptyTitle>
          <EmptyDescription>Add teachers before marking attendance.</EmptyDescription>
        </Empty>
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold">Roll Call — {selectedDate}</CardTitle>
            <CardDescription className="text-xs">
              {hasUnsavedChanges
                ? 'You have unsaved changes — click Save Attendance to submit.'
                : 'Toggle a teacher’s status and save.'}
            </CardDescription>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                <TableHead className="text-xs font-bold">Teacher ID</TableHead>
                <TableHead className="text-xs font-bold">Name</TableHead>
                <TableHead className="text-right text-xs font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const current = draft[r.teacherId] ?? statusFor(r);
                return (
                  <TableRow
                    key={r.teacherId}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                  >
                    <TableCell className="text-primary font-mono text-xs font-semibold">
                      {r.teacherId}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {r.firstName} {r.lastName ?? ''}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center overflow-hidden rounded-md border border-slate-200 dark:border-zinc-700">
                        <button
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, [r.teacherId]: 'Present' }))}
                          className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                            current === 'Present'
                              ? 'bg-emerald-600 text-white'
                              : 'text-muted-foreground bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => setDraft((d) => ({ ...d, [r.teacherId]: 'Absent' }))}
                          className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                            current === 'Absent'
                              ? 'bg-rose-600 text-white'
                              : 'text-muted-foreground bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800'
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
      )}
    </div>
  );
};

export default AdminAttendance;
