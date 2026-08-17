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

export const TeacherAttendance: React.FC = () => {
  const [ownMonth, setOwnMonth] = useState('');
  const [classAttendanceData, setClassAttendanceData] = useState({
    date: '',
    className: '',
    section: '',
    studentId: '',
    status: 'Present',
  });
  const [classAttendanceId, setClassAttendanceId] = useState('');

  const handleOwnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Fetch own attendance for month:', ownMonth);
  };

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Mark Class Attendance:', classAttendanceData);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance Portal</h1>
        <p className="text-muted-foreground text-xs">
          View personal monthly attendance and mark daily classroom rosters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mark Student Class Attendance</CardTitle>
            <CardDescription>Record attendance for your assigned class roster</CardDescription>
          </CardHeader>
          <form onSubmit={handleClassSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classDate">Date (DD-MM-YYYY)</Label>
                <Input
                  id="classDate"
                  placeholder="DD-MM-YYYY"
                  value={classAttendanceData.date}
                  onChange={(e) =>
                    setClassAttendanceData({ ...classAttendanceData, date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Class</Label>
                  <Input
                    id="className"
                    placeholder="e.g. 10"
                    value={classAttendanceData.className}
                    onChange={(e) =>
                      setClassAttendanceData({ ...classAttendanceData, className: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    placeholder="e.g. A"
                    value={classAttendanceData.section}
                    onChange={(e) =>
                      setClassAttendanceData({ ...classAttendanceData, section: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="STU12345678"
                    value={classAttendanceData.studentId}
                    onChange={(e) =>
                      setClassAttendanceData({ ...classAttendanceData, studentId: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    placeholder="Present | Absent"
                    value={classAttendanceData.status}
                    onChange={(e) =>
                      setClassAttendanceData({ ...classAttendanceData, status: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
              <Button type="submit" className="w-full">
                Mark Attendance
              </Button>
              <Button type="button" variant="secondary" className="w-full">
                Update Roster
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Attendance History</CardTitle>
              <CardDescription>View your own monthly check-in record</CardDescription>
            </CardHeader>
            <form onSubmit={handleOwnSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ownMonth">Month (MM-YYYY)</Label>
                  <Input
                    id="ownMonth"
                    placeholder="e.g. 08-2026"
                    value={ownMonth}
                    onChange={(e) => setOwnMonth(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button type="submit" className="w-full">
                  View My Attendance
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lookup Class Attendance Record</CardTitle>
              <CardDescription>
                Retrieve full roster for an existing class attendance ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="classAttendanceId">Class Attendance ID</Label>
                <Input
                  id="classAttendanceId"
                  placeholder="24-character ObjectId"
                  value={classAttendanceId}
                  onChange={(e) => setClassAttendanceId(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button type="button" variant="outline" className="w-full">
                Fetch Class Roster
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;
