import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/lib/services/teacher.service';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['teacherDashboard'],
    queryFn: teacherService.getDashboard,
  });

  const dashboard = data?.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground text-xs">
            {dashboard?.profile?.firstName
              ? `Welcome, ${dashboard.profile.firstName}!`
              : 'Welcome to your teacher portal.'}{' '}
            View schedule, mark class attendance, and grade exams.
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading || isRefetching} type="button">
          {isLoading || isRefetching ? 'Refreshing...' : 'Refresh Dashboard'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>My Attendance</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading...'
                : `Present: ${dashboard?.attendanceThisMonth?.present ?? 0} / ${dashboard?.attendanceThisMonth?.total ?? 0}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/teacher/attendance')}
            >
              Mark / View Attendance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grading & Results</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading...'
                : `${dashboard?.pendingResultEntries?.length ?? 0} subject(s) pending grading`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/teacher/results')}
            >
              Enter Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading...'
                : `${dashboard?.todaySchedule?.length ?? 0} periods scheduled`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/teacher/exams')}>
              View Assigned Exams
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary Disbursals</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading...'
                : dashboard?.pendingSalary?.count
                  ? `Pending: ₹${dashboard.pendingSalary.totalAmount}`
                  : 'All salaries cleared'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/teacher/salary')}
            >
              View Salary Slips
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
