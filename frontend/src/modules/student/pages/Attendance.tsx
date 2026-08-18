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
import { studentService } from '@/lib/services/student.service';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const StudentAttendance: React.FC = () => {
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<Array<{
    date: string;
    status: string;
  }> | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await studentService.getAttendance(month || undefined);
      setAttendanceRecords(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Attendance records loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground text-xs">
          View your monthly attendance records and presence percentage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Fetching...' : 'View Attendance'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {attendanceRecords && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Log</CardTitle>
              <CardDescription>Records for {month || 'current session'}</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  No attendance records found for this period.
                </p>
              ) : (
                <div className="max-h-64 space-y-2 overflow-y-auto">
                  {attendanceRecords.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded border p-2 text-xs"
                    >
                      <span>Date: {r.date}</span>
                      <span
                        className={
                          r.status === 'Present'
                            ? 'font-semibold text-green-600'
                            : 'font-semibold text-red-600'
                        }
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
