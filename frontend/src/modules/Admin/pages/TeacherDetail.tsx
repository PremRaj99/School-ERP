import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ErrorState } from '@/components/data-table';
import { adminService } from '@/lib/services/admin.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { MAX_PAGE_SIZE } from '@schoolerp/contracts';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Phone,
  Calendar,
  BookOpen,
  Wallet,
  CalendarCheck,
  UserRoundX,
  KeyRound,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResetPasswordDialog } from './ResetPasswordDialog';

const STATUS_STYLES: Record<string, string> = {
  Paid: 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Pending:
    'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Failed: 'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

const ATTENDANCE_STYLES: Record<string, string> = {
  Present:
    'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Absent: 'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  Leave: 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
};

const currentMonthString = () => new Date().toISOString().slice(0, 7);

export const AdminTeacherDetail: React.FC = () => {
  const { teacherId = '' } = useParams<{ teacherId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [month, setMonth] = useState(currentMonthString);
  const [resetResult, setResetResult] = useState<{
    username: string;
    temporaryPassword: string;
  } | null>(null);

  const {
    data: teacher,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.teacher(teacherId),
    queryFn: () => adminService.getTeacherById(teacherId),
    enabled: !!teacherId,
  });

  // pageSize: MAX_PAGE_SIZE — one teacher's full salary history comfortably fits in one page
  // (ALIGNMENT_PLAN.md 2C/P1).
  const {
    data: salariesResponse,
    isLoading: salariesLoading,
    isError: salariesErrored,
  } = useQuery({
    queryKey: qk.admin.teacherSalaries({ teacherId, pageSize: MAX_PAGE_SIZE }),
    queryFn: () => adminService.getTeacherSalaries({ teacherId, pageSize: MAX_PAGE_SIZE }),
    enabled: !!teacherId,
  });
  const salaries = salariesResponse?.data;

  const {
    data: attendanceMonth,
    isLoading: attendanceLoading,
    isError: attendanceErrored,
  } = useQuery({
    queryKey: qk.admin.teacherAttendanceByMonth(teacherId, month),
    queryFn: () => adminService.getTeacherAttendanceMonth(teacherId, month),
    enabled: !!teacherId,
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminService.deleteTeacher(teacherId),
    onSuccess: () => {
      toast.success('Teacher record removed successfully');
      queryClient.invalidateQueries({ queryKey: qk.admin.teachers() });
      navigate('/admin/teachers');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => adminService.resetTeacherPassword(teacherId),
    onSuccess: (data) => setResetResult(data),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const attendanceSummary = useMemo(() => {
    const rows = attendanceMonth?.attendance ?? [];
    return {
      present: rows.filter((r) => r.status === 'Present').length,
      absent: rows.filter((r) => r.status === 'Absent').length,
      leave: rows.filter((r) => r.status === 'Leave').length,
      total: rows.length,
    };
  }, [attendanceMonth]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 w-full lg:col-span-1" />
          <Skeleton className="h-64 w-full lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (isError || !teacher) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => navigate('/admin/teachers')}
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Faculty List
        </Button>
        <ErrorState
          title={isError ? undefined : 'Teacher not found'}
          description={isError ? getErrorMessage(error) : `No faculty record matches ${teacherId}.`}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const sortedSalaries = [...(salaries ?? [])].sort((a, b) => b.month.localeCompare(a.month));
  const sortedAttendance = [...(attendanceMonth?.attendance ?? [])].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 -ml-2 text-xs"
            onClick={() => navigate('/admin/teachers')}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Faculty List
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {teacher.firstName} {teacher.lastName || ''}
            </h1>
            <Badge variant="outline" className="text-xs">
              {teacher.teacherId}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">{teacher.qualifications}</p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={() => navigate(`/admin/teachers?edit=${teacher.teacherId}`)}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit Record
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            disabled={resetPasswordMutation.isPending}
            onClick={() => resetPasswordMutation.mutate()}
          >
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-9 text-xs"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-1 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-tr from-emerald-600 to-teal-500 text-lg font-bold text-white">
                {teacher.firstName.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Faculty Profile</CardTitle>
                <CardDescription className="text-xs">{teacher.teacherId}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
              <span className="text-muted-foreground mb-1 block text-[10px]">Subjects Handled</span>
              <div className="flex flex-wrap gap-1">
                {teacher.subjectHandled.length === 0 ? (
                  <span className="text-muted-foreground">None assigned</span>
                ) : (
                  teacher.subjectHandled.map((sub) => (
                    <Badge key={sub} variant="outline" className="text-[10px] font-medium">
                      <BookOpen className="mr-1 h-2.5 w-2.5 text-indigo-500" />
                      {sub}
                    </Badge>
                  ))
                )}
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
              <span className="text-muted-foreground text-[10px]">Monthly Salary</span>
              <p className="font-semibold">₹{teacher.salaryPerMonth.toLocaleString()}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
              <span className="text-muted-foreground text-[10px]">Gender</span>
              <p className="font-semibold">{teacher.gender ?? 'N/A'}</p>
            </div>
            <div className="text-muted-foreground flex items-center justify-between rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-500" />
                <span>{teacher.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-indigo-500" />
                <span>Joined {isoToDisplayDate(teacher.dateOfJoining)}</span>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
              <span className="text-muted-foreground text-[10px]">Address</span>
              <p className="mt-0.5 font-semibold">{teacher.address || 'N/A'}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
              <span className="text-muted-foreground text-[10px]">Aadhar Number</span>
              <p className="mt-0.5 font-mono font-semibold">{teacher.teacherAadhar || '—'}</p>
            </div>
            {teacher.about && (
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">Bio</span>
                <p className="mt-0.5 leading-relaxed font-medium">{teacher.about}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance */}
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs lg:col-span-2 dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
                <CalendarCheck className="h-4 w-4 text-indigo-500" />
                Monthly Attendance
              </CardTitle>
              <CardDescription className="text-xs">
                {attendanceSummary.present} present · {attendanceSummary.absent} absent ·{' '}
                {attendanceSummary.leave} leave (of {attendanceSummary.total} marked days)
              </CardDescription>
            </div>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="border-input h-8 rounded-none border bg-transparent px-2 text-xs font-semibold"
            />
          </CardHeader>
          {attendanceLoading ? (
            <div className="space-y-1.5 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : attendanceErrored ? (
            <div className="text-muted-foreground p-4 text-xs">
              Couldn't load attendance for this month.
            </div>
          ) : sortedAttendance.length === 0 ? (
            <Empty className="rounded-none border-0 border-t">
              <EmptyMedia variant="icon">
                <CalendarCheck className="size-5" />
              </EmptyMedia>
              <EmptyTitle>No attendance marked</EmptyTitle>
              <EmptyDescription>No attendance was recorded for {month}.</EmptyDescription>
            </Empty>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                    <TableHead className="text-xs font-bold">Date</TableHead>
                    <TableHead className="text-right text-xs font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAttendance.map((a) => (
                    <TableRow
                      key={a.date}
                      className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <TableCell className="text-xs font-semibold">
                        {isoToDisplayDate(a.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${ATTENDANCE_STYLES[a.status] ?? ''}`}
                        >
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>

      {/* Salary History */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
            <Wallet className="h-4 w-4 text-indigo-500" />
            Salary Disbursement History
          </CardTitle>
          <CardDescription className="text-xs">
            Every salary transaction raised for this teacher, most recent first.
          </CardDescription>
        </CardHeader>
        {salariesLoading ? (
          <div className="space-y-1.5 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : salariesErrored ? (
          <div className="text-muted-foreground p-4 text-xs">Couldn't load salary history.</div>
        ) : sortedSalaries.length === 0 ? (
          <Empty className="rounded-none border-0 border-t">
            <EmptyMedia variant="icon">
              <Wallet className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No salary records yet</EmptyTitle>
            <EmptyDescription>No salary has been raised for this teacher.</EmptyDescription>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                <TableHead className="text-xs font-bold">Month</TableHead>
                <TableHead className="text-xs font-bold">Title</TableHead>
                <TableHead className="text-xs font-bold">Amount</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSalaries.map((sal) => (
                <TableRow key={sal.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                  <TableCell className="text-xs font-semibold">{sal.month}</TableCell>
                  <TableCell className="text-xs">{sal.title}</TableCell>
                  <TableCell className="text-xs font-bold">
                    ₹{sal.finalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${STATUS_STYLES[sal.status] ?? ''}`}
                    >
                      {sal.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <UserRoundX className="h-4 w-4" />
              <span>Confirm Faculty Removal</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to remove teacher record <strong>{teacher.teacherId}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ResetPasswordDialog result={resetResult} onClose={() => setResetResult(null)} />
    </div>
  );
};

export default AdminTeacherDetail;
