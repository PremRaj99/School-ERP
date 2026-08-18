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
import { teacherService } from '@/lib/services/teacher.service';
import type { AttendanceRecord, ClassAttendanceDetail } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const TeacherAttendance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ownMonth, setOwnMonth] = useState('');
  const [ownRecords, setOwnRecords] = useState<AttendanceRecord[] | null>(null);

  const [classAttendanceData, setClassAttendanceData] = useState({
    date: '',
    className: '',
    section: '',
    studentId: '',
    status: 'Present',
  });
  const [classAttendanceId, setClassAttendanceId] = useState('');
  const [rosterDetail, setRosterDetail] = useState<ClassAttendanceDetail | null>(null);

  const handleOwnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await teacherService.getOwnAttendance(ownMonth || undefined);
      setOwnRecords(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Personal attendance loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        date: classAttendanceData.date,
        className: classAttendanceData.className,
        section: classAttendanceData.section,
        attendance: [
          {
            studentId: classAttendanceData.studentId,
            status: classAttendanceData.status,
          },
        ],
      };
      const res = await teacherService.createClassAttendance(payload);
      toast.success(res.message || 'Class attendance recorded successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchClassRoster = async () => {
    if (!classAttendanceId) {
      toast.error('Enter Class Attendance ID');
      return;
    }
    setLoading(true);
    try {
      const res = await teacherService.getClassAttendanceDetail(classAttendanceId);
      setRosterDetail(res.data);
      toast.success('Class attendance details loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
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
                  disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Submitting...' : 'Mark Class Attendance'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Personal Attendance History</CardTitle>
              <CardDescription>View your own monthly check-in records</CardDescription>
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
                    disabled={loading}
                  />
                </div>
                {ownRecords && (
                  <div className="max-h-36 space-y-2 overflow-y-auto">
                    {ownRecords.length > 0 ? (
                      ownRecords.map((r, i) => (
                        <div key={i} className="flex justify-between rounded border p-2 text-xs">
                          <span>{r.date}</span>
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
                      ))
                    ) : (
                      <p className="text-muted-foreground text-xs">No attendance records found.</p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Fetching...' : 'View My Attendance'}
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
                  disabled={loading}
                />
              </div>
              {rosterDetail && (
                <div className="bg-muted/40 space-y-1 rounded border p-3 text-xs">
                  <p>
                    <strong>Class:</strong> {rosterDetail.className}-{rosterDetail.section} (
                    {rosterDetail.date})
                  </p>
                  <p>
                    <strong>Total Marked:</strong> {rosterDetail.attendance?.length ?? 0} students
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                type="button"
                onClick={handleFetchClassRoster}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Fetching...' : 'Fetch Class Roster'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;
