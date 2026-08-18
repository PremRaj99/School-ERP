import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/services/admin.service';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboard,
  });

  const dashboardData = data?.data;

  if (error) {
    toast.error('Failed to load dashboard metrics');
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-xs">
            Real-time school metrics, attendance, exams, and finances.
          </p>
        </div>
        <Button onClick={() => refetch()} disabled={isLoading || isRefetching} type="button">
          {isLoading || isRefetching ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${dashboardData?.counts?.students ?? 0} Enrolled`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/admin/students')}
            >
              Manage Students
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Teachers</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${dashboardData?.counts?.teachers ?? 0} Active Staff`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/admin/teachers')}
            >
              Manage Teachers
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Classes</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading...' : `${dashboardData?.counts?.classes ?? 0} Sections`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/admin/classes')}>
              Manage Classes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Dues</CardTitle>
            <CardDescription>
              {isLoading
                ? 'Loading...'
                : `Fees: ₹${dashboardData?.finance?.pendingStudentFees?.totalAmount ?? 0} | Sal: ₹${dashboardData?.finance?.pendingTeacherSalaries?.totalAmount ?? 0}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => navigate('/admin/finance')}>
              View Finance Ledger
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
