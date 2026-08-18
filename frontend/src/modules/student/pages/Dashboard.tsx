import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '@/lib/services/student.service';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: studentService.getDashboard,
  });

  const dashboard = data?.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Dashboard</h1>
          <p className="text-muted-foreground text-xs">
            {dashboard?.profile?.firstName
              ? `Welcome back, ${dashboard.profile.firstName}!`
              : 'Welcome to your student portal.'}{' '}
            Track your academics, attendance, and fees.
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading || isRefetching} type="button">
          {isLoading || isRefetching ? 'Refreshing...' : 'Refresh Dashboard'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
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
              onClick={() => navigate('/student/attendance')}
            >
              View Attendance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Subjects</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading...'
                : `Class ${dashboard?.profile?.className || ''}-${dashboard?.profile?.section || ''}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/student/subjects')}
            >
              View Subjects
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Exams</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${dashboard?.upcomingExams?.length ?? 0} upcoming`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/student/exams')}>
              View Exams & Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Fees</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading...'
                : `₹${dashboard?.pendingFees?.totalAmount ?? 0} (${dashboard?.pendingFees?.count ?? 0} invoices)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/student/fees')}>
              View Fees Ledger
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
