import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { studentService } from '@/lib/services/student.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { PiChalkboardTeacher, PiQrCode, PiKey } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

export const StudentProfile: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: student,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.student.profile(),
    queryFn: () => studentService.getProfile(),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <ErrorState description={getErrorMessage(error)} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Digital Student ID & Profile</h1>
            <Badge variant="outline" className="border-primary/30 text-primary text-xs">
              Verified Student
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Institutional credentials, guardian contacts, and digital identity card.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs"
          onClick={() => navigate('/auth/change-password')}
        >
          <PiKey className="mr-1.5 h-3.5 w-3.5" />
          Change Password
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
        {/* Left Column: Digital ID Card Preview */}
        <div className="space-y-4 md:col-span-6">
          <div className="border-primary/30 bg-primary relative space-y-5 overflow-hidden rounded-md border p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10">
                  <PiChalkboardTeacher className="h-4 w-4 text-white/80" />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-tight">
                    Gyandeep BAAL VIKAS VIDYA MANDIR
                  </h3>
                  <p className="text-[9px] text-white/80">Identity Pass {student.session}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-white/40 text-[9px] text-white/90">
                STUDENT
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border-2 border-white/30 bg-white/10 text-2xl font-black text-white shadow-xl">
                {student.firstName.charAt(0)}
                {(student.lastName ?? '').charAt(0)}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold">
                  {student.firstName} {student.lastName || ''}
                </h2>
                <p className="text-xs font-semibold text-white/90">
                  Class {student.className} - Section {student.section} (Roll #{student.rollNo})
                </p>
                <p className="font-mono text-[11px] text-white/80">ID: {student.studentId}</p>
                <p className="text-[10px] text-white/80">DOB: {isoToDisplayDate(student.dob)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-white/15 pt-3 text-xs">
              <div>
                <span className="block text-[10px] text-white/80">Father / Guardian:</span>
                <p className="text-[11px] font-semibold">{student.fatherName || 'N/A'}</p>
              </div>
              <div>
                <span className="block text-[10px] text-white/80">Emergency Contact:</span>
                <p className="text-[11px] font-semibold">{student.phone}</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/15 pt-1">
              <div className="space-y-0.5">
                <span className="block font-mono text-[9px] text-white/80">
                  AUTHORIZED CARDHOLDER
                </span>
                <span className="font-mono text-[10px] text-white">
                  VALID: {student.session} SESSION
                </span>
              </div>
              <PiQrCode className="h-8 w-8 text-white/90" />
            </div>
          </div>
        </div>

        {/* Right Column: Personal & Guardian Details */}
        <div className="space-y-6 md:col-span-6">
          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Student Personal Record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Date of Admission</span>
                  <p className="mt-0.5 font-semibold">
                    {isoToDisplayDate(student.dateOfAdmission)}
                  </p>
                </div>
                <div className="rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Gender</span>
                  <p className="mt-0.5 font-semibold">{student.gender ?? 'N/A'}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">APAAR Number (APAAR ID)</span>
                  <p className="mt-0.5 font-mono font-semibold">{student.appId || '—'}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">PEN Number (UDISE+ PEN)</span>
                  <p className="mt-0.5 font-mono font-semibold">{student.penNumber || '—'}</p>
                </div>
                <div className="rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Student Aadhar</span>
                  <p className="mt-0.5 font-mono font-semibold">{student.studentAadhar || '—'}</p>
                </div>
              </div>

              <div className="rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span className="text-muted-foreground text-[10px]">
                  Permanent Residential Address
                </span>
                <p className="mt-0.5 font-semibold">{student.address || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Parent & Guardian Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Father's Name</span>
                  <p className="mt-0.5 font-semibold">{student.fatherName || 'N/A'}</p>
                  <span className="text-muted-foreground text-[10px]">
                    {student.fatherOccupation ? `Occupation: ${student.fatherOccupation}` : ''}
                  </span>
                </div>
                <div className="rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Mother's Name</span>
                  <p className="mt-0.5 font-semibold">{student.motherName || 'N/A'}</p>
                  <span className="text-muted-foreground text-[10px]">
                    {student.motherOccupation ? `Occupation: ${student.motherOccupation}` : ''}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
