import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export const StudentAttendance: React.FC = () => {
  const [month, setMonth] = useState('');

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Fetch student attendance for month:', month);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground text-xs">
          View your monthly attendance records and presence percentage.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Filter Attendance Month</CardTitle>
          <CardDescription>Select a month to load your daily attendance</CardDescription>
        </CardHeader>
        <form onSubmit={handleFetch}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month (MM-YYYY)</Label>
              <Input
                id="month"
                placeholder="e.g. 08-2026"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="submit" className="w-full">
              View Attendance
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default StudentAttendance;
