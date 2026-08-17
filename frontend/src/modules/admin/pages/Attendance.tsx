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

export const AdminAttendance: React.FC = () => {
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [markData, setMarkData] = useState({
    teacherId: '',
    status: 'Present',
    date: '',
  });

  const handleMark = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Mark Teacher Attendance:', markData);
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
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
              <Button type="submit" className="w-full">
                Mark Attendance
              </Button>
              <Button type="button" variant="secondary" className="w-full">
                Bulk Update
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterMonth">Filter Teacher History by Month (MM-YYYY)</Label>
              <Input
                id="filterMonth"
                placeholder="MM-YYYY"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-4 sm:flex-row">
            <Button type="button" className="w-full">
              Fetch Day Roster
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Fetch Monthly History
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminAttendance;
