import React, { useState } from 'react';
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
  PiArrowLeft,
  PiPencilSimple,
  PiTrash,
  PiIdentificationCard,
  PiQrCode,
  PiReceipt,
  PiUserMinus,
  PiKeyhole,
} from 'react-icons/pi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ResetPasswordDialog } from './ResetPasswordDialog';

const STATUS_STYLES: Record<string, string> = {
  Paid: 'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Pending:
    'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Failed: 'border-rose-500/30 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

export const AdminStudentDetail: React.FC = () => {
  const { studentId = '' } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resetResult, setResetResult] = useState<{
    username: string;
    temporaryPassword: string;
  } | null>(null);

  const {
    data: student,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.admin.student(studentId),
    queryFn: () => adminService.getStudentById(studentId),
    enabled: !!studentId,
  });

  // pageSize: MAX_PAGE_SIZE — one student's full fee history (at most ~12 records/year) comfortably
  // fits in one page (ALIGNMENT_PLAN.md 2C/P1).
  const {
    data: feesResponse,
    isLoading: feesLoading,
    isError: feesErrored,
  } = useQuery({
    queryKey: qk.admin.studentFees({ studentId, pageSize: MAX_PAGE_SIZE }),
    queryFn: () => adminService.getStudentFees({ studentId, pageSize: MAX_PAGE_SIZE }),
    enabled: !!studentId,
  });
  const fees = feesResponse?.data;

  const deleteMutation = useMutation({
    mutationFn: () => adminService.deleteStudent(studentId),
    onSuccess: () => {
      toast.success('Student record deleted successfully');
      queryClient.invalidateQueries({ queryKey: qk.admin.students() });
      navigate('/admin/students');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => adminService.resetStudentPassword(studentId),
    onSuccess: (data) => setResetResult(data),
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-40" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => navigate('/admin/students')}
        >
          <PiArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Roster
        </Button>
        <ErrorState
          title={isError ? undefined : 'Student not found'}
          description={isError ? getErrorMessage(error) : `No student record matches ${studentId}.`}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const sortedFees = [...(fees ?? [])].sort((a, b) => b.month.localeCompare(a.month));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-1 -ml-2 text-xs"
            onClick={() => navigate('/admin/students')}
          >
            <PiArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Roster
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {student.firstName} {student.lastName || ''}
            </h1>
            <Badge variant="outline" className="text-xs">
              {student.studentId}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Class {student.className}-{student.section} · Roll #{student.rollNo} · Session{' '}
            {student.session}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={() => navigate(`/admin/students?edit=${student.studentId}`)}
          >
            <PiPencilSimple className="mr-1.5 h-3.5 w-3.5" />
            Edit Record
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            disabled={resetPasswordMutation.isPending}
            onClick={() => resetPasswordMutation.mutate()}
          >
            <PiKeyhole className="mr-1.5 h-3.5 w-3.5" />
            {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-9 text-xs"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <PiTrash className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Digital ID Card */}
        <div className="bg-primary space-y-4 rounded-md border border-white/20 p-5 text-white shadow-xl">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <div className="flex items-center gap-1.5">
              <img src="/logo.png" alt="Gyandip Logo" className="h-5 w-5 rounded object-contain" />
              <span className="text-xs font-bold tracking-tight">Gyandip</span>
            </div>
            <Badge variant="outline" className="border-white/40 text-[9px] text-white/80">
              STUDENT PASS
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border-2 border-white/30 bg-white/15 text-xl font-black text-white shadow-md">
              {student.firstName.charAt(0)}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold">
                {student.firstName} {student.lastName || ''}
              </p>
              <p className="text-xs text-white/80">
                Class {student.className}-{student.section} (Roll #{student.rollNo})
              </p>
              <p className="text-[11px] text-white/70">DOB: {isoToDisplayDate(student.dob)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-white/15 pt-2 text-[11px]">
            <div>
              <span className="text-[10px] text-white/70">Guardian:</span>
              <p className="font-semibold">{student.fatherName || 'Guardian Registered'}</p>
            </div>
            <div>
              <span className="text-[10px] text-white/70">Emergency Phone:</span>
              <p className="font-semibold">{student.phone}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="font-mono text-[10px] text-white/70">VALID: {student.session}</span>
            <PiQrCode className="h-6 w-6 text-white/80" />
          </div>
        </div>

        {/* Registration Info */}
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
              <PiIdentificationCard className="text-primary h-4 w-4" />
              Registration Information
            </CardTitle>
            <CardDescription className="text-xs">
              Admitted {isoToDisplayDate(student.dateOfAdmission)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">Gender</span>
                <p className="font-semibold">{student.gender ?? 'N/A'}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">Father's Name</span>
                <p className="font-semibold">{student.fatherName || 'N/A'}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">Mother's Name</span>
                <p className="font-semibold">{student.motherName || 'N/A'}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">Father's Occupation</span>
                <p className="font-semibold">{student.fatherOccupation || 'N/A'}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">Mother's Occupation</span>
                <p className="font-semibold">{student.motherOccupation || 'N/A'}</p>
              </div>
            </div>
            <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
              <span className="text-muted-foreground text-[10px]">Residential Address</span>
              <p className="mt-0.5 font-semibold">
                {student.address || 'Address provided during admission'}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">APAAR Number (APAAR ID)</span>
                <p className="font-mono font-semibold">{student.appId || '—'}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">PEN Number (UDISE+ PEN)</span>
                <p className="font-mono font-semibold">{student.penNumber || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">Student Aadhar</span>
                <p className="font-mono font-semibold">{student.studentAadhar || '—'}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">Father Aadhar</span>
                <p className="font-mono font-semibold">{student.fatherAadhar || '—'}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">Mother Aadhar</span>
                <p className="font-mono font-semibold">{student.motherAadhar || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Payment History */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-1.5 text-sm font-bold">
            <PiReceipt className="text-primary h-4 w-4" />
            Fee Payment History
          </CardTitle>
          <CardDescription className="text-xs">
            Every fee invoice raised for this student, most recent first.
          </CardDescription>
        </CardHeader>
        {feesLoading ? (
          <div className="space-y-1.5 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : feesErrored ? (
          <div className="text-muted-foreground p-4 text-xs">Couldn't load fee history.</div>
        ) : sortedFees.length === 0 ? (
          <Empty className="rounded-md border-0 border-t">
            <EmptyMedia variant="icon">
              <PiReceipt className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No fee invoices yet</EmptyTitle>
            <EmptyDescription>No fee has been raised for this student.</EmptyDescription>
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
              {sortedFees.map((fee) => (
                <TableRow key={fee.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                  <TableCell className="text-xs font-semibold">{fee.month}</TableCell>
                  <TableCell className="text-xs">{fee.title}</TableCell>
                  <TableCell className="text-xs font-bold">
                    ₹{fee.finalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${STATUS_STYLES[fee.status] ?? ''}`}
                    >
                      {fee.status}
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
              <PiUserMinus className="h-4 w-4" />
              <span>Confirm Student Record Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to delete student record <strong>{student.studentId}</strong>?
              This action will also revoke linked login credentials.
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

export default AdminStudentDetail;
