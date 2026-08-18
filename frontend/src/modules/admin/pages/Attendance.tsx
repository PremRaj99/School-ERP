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
import { adminService } from '@/lib/services/admin.service';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const AdminAttendance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterTeacherId, setFilterTeacherId] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [markData, setMarkData] = useState({
    teacherId: '',
    status: 'Present',
    date: '',
  });

  const handleMark = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = [
        {
          teacherId: markData.teacherId,
          status: markData.status,
        },
      ];
      const res = await adminService.markTeacherAttendance(markData.date, payload);
      toast.success(res.message || 'Teacher attendance marked successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDateRoster = async () => {
    if (!filterDate) {
      toast.error('Enter a date to fetch roster');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.getTeacherAttendanceDate(filterDate);
      toast.success(res.message || `Loaded attendance for ${filterDate}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMonthHistory = async () => {
    if (!filterTeacherId || !filterMonth) {
      toast.error('Enter both Teacher ID and Month (MM-YYYY)');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.getTeacherAttendanceMonth(filterTeacherId, filterMonth);
      toast.success(res.message || `Loaded monthly history for ${filterTeacherId}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Teacher Attendance Management</h1>
        <p className="text-muted-foreground text-xs">
          Record daily teacher attendance and view monthly staff history.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mark Teacher Attendance</CardTitle>
            <CardDescription>Submit attendance entry for a teacher.</CardDescription>
          </CardHeader>
          <form onSubmit={handleMark}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="markDate">Date (DD-MM-YYYY)</Label>
                <Input
                  id="markDate"
                  placeholder="DD-MM-YYYY"
                  value={markData.date}
                  onChange={(e) => setMarkData({ ...markData, date: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacherId">Teacher ID</Label>
                <Input
                  id="teacherId"
                  placeholder="e.g. TCH12345678"
                  value={markData.teacherId}
                  onChange={(e) => setMarkData({ ...markData, teacherId: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  placeholder="Present | Absent"
                  value={markData.status}
                  onChange={(e) => setMarkData({ ...markData, status: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Mark Attendance'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Query & History</CardTitle>
            <CardDescription>Filter daily rosters or monthly teacher history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="filterDate">Filter by Date (DD-MM-YYYY)</Label>
              <Input
                id="filterDate"
                placeholder="DD-MM-YYYY"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterTeacherId">Teacher ID (for monthly history)</Label>
              <Input
                id="filterTeacherId"
                placeholder="TCH12345678"
                value={filterTeacherId}
                onChange={(e) => setFilterTeacherId(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterMonth">Month (MM-YYYY)</Label>
              <Input
                id="filterMonth"
                placeholder="MM-YYYY"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-4 sm:flex-row">
            <Button
              type="button"
              onClick={handleFetchDateRoster}
              disabled={loading}
              className="w-full"
            >
              Fetch Day Roster
            </Button>
            <Button
              type="button"
              onClick={handleFetchMonthHistory}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              Fetch Monthly History
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminAttendance;
