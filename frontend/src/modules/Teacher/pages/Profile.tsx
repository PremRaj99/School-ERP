import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/data-table';
import { teacherService } from '@/lib/services/teacher.service';
import { qk } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/api';
import { isoToDisplayDate } from '@/lib/date';
import { PiEnvelope, PiPhone, PiCalendar, PiBookOpen, PiMedal, PiKey } from 'react-icons/pi';
import { useQuery } from '@tanstack/react-query';

export const TeacherProfile: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: teacher,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: qk.teacher.profile(),
    queryFn: () => teacherService.getProfile(),
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (isError || !teacher) {
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
          <h1 className="text-2xl font-extrabold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Your details and teaching assignment at Gyandeep Bal Vikas Vidyamandir.
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
        {/* Left Column: ID & Quick Info */}
        <div className="space-y-4 md:col-span-5">
          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <div className="bg-primary h-20" />
            <CardContent className="-mt-10 space-y-4 p-5 pt-0">
              <div className="flex items-end justify-between">
                <div className="bg-primary flex h-20 w-20 items-center justify-center rounded-md border-4 border-white text-2xl font-black text-white shadow-xl dark:border-zinc-900">
                  {teacher.firstName.charAt(0)}
                  {(teacher.lastName ?? '').charAt(0)}
                </div>
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground text-[10px] font-semibold"
                >
                  Active Teacher
                </Badge>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {teacher.firstName} {teacher.lastName || ''}
                </h2>
                <p className="text-primary text-xs font-semibold">{teacher.qualifications}</p>
                <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                  Teacher ID: {teacher.teacherId}
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-2 text-xs dark:border-zinc-800">
                <div className="text-muted-foreground flex items-center gap-2">
                  <PiEnvelope className="text-primary h-3.5 w-3.5" />
                  <span>{teacher.username}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <PiPhone className="text-primary h-3.5 w-3.5" />
                  <span>{teacher.phone}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <PiCalendar className="text-primary h-3.5 w-3.5" />
                  <span>Joined Institution: {isoToDisplayDate(teacher.dateOfJoining)}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <PiMedal className="text-primary h-3.5 w-3.5" />
                  <span>Honorarium: ₹{teacher.salaryPerMonth.toLocaleString()}/month</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Subjects & Bio */}
        <div className="space-y-6 md:col-span-7">
          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">About</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3 text-xs leading-relaxed">
              <p>{teacher.about || 'No bio has been added yet.'}</p>

              <div className="border-t border-slate-100 pt-2 dark:border-zinc-800">
                <span className="mb-2 block text-[11px] font-semibold text-slate-800 dark:text-zinc-200">
                  Subjects Taught
                </span>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjectHandled.length === 0 ? (
                    <span className="text-xs">No subjects assigned yet.</span>
                  ) : (
                    teacher.subjectHandled.map((sub) => (
                      <Badge
                        key={sub}
                        variant="outline"
                        className="bg-muted text-muted-foreground text-xs font-semibold"
                      >
                        <PiBookOpen className="mr-1 h-3 w-3" />
                        {sub}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span>Date of Birth</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {isoToDisplayDate(teacher.dob)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span>Gender</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {teacher.gender ?? 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span>Address</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {teacher.address || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-slate-50 p-2.5 dark:bg-zinc-800/50">
                <span>Aadhar</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {teacher.teacherAadhar || '—'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
