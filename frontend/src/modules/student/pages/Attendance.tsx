import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Loader2, ClipboardCheck } from 'lucide-react';

interface AttendanceLogItem { id: string; date: string; status: 'Present' | 'Absent' | 'Leave'; }


export default function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['student', 'attendance', selectedMonth],
    queryFn: () => studentService.getAttendance(selectedMonth),
  });

  const getStats = () => {
    if (!attendance) return { present: 0, absent: 0, leave: 0, total: 0, rate: 0 };
    const stats = { present: 0, absent: 0, leave: 0, total: attendance.length, rate: 0 };
    attendance.forEach((log: AttendanceLogItem) => {
      if (log.status === 'Present') stats.present++;
      else if (log.status === 'Absent') stats.absent++;
      else if (log.status === 'Leave') stats.leave++;
    });
    stats.rate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 100;
    return stats;
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Attendance</h2>
          <p className="text-muted-foreground">
            Monitor your presence, leaves, and overall attendance rate.
          </p>
        </div>

        <div className="bg-background flex items-center gap-4 rounded-lg border p-3">
          <Label htmlFor="month-select" className="text-sm font-medium whitespace-nowrap">
            Filter Month:
          </Label>
          <Input
            id="month-select"
            type="month"
            className="w-40"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold uppercase">
              Present Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold uppercase">
              Absent Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">{stats.absent}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold uppercase">
              Leave Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.leave}</div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-semibold uppercase">
              Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.rate}%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle>Attendance Log</CardTitle>
            <CardDescription>Daily registry details for {selectedMonth}.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !attendance || attendance.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No records logged for this month.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Attendance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((log: AttendanceLogItem) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-semibold">{log.date.split('T')[0]}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            log.status === 'Present'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : log.status === 'Absent'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
