import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const TeacherDashboard: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground text-xs">
            Welcome to your teacher portal. View schedule, mark class attendance, and grade exams.
          </p>
        </div>
        <Button type="button">Refresh Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Class Attendance</CardTitle>
            <CardDescription>Mark daily student attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Mark Attendance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grading & Results</CardTitle>
            <CardDescription>Enter exam marks for subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Enter Results
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Exams</CardTitle>
            <CardDescription>View upcoming test dates</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Exams
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Salary & Payroll</CardTitle>
            <CardDescription>Disbursed salary history</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              View Salary
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeacherDashboard;
