import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Loader2, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';

interface TeacherItem {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
}
interface AttendanceItem {
  id: string;
  teacherId: string;
  status: 'Present' | 'Absent' | 'Leave';
  date: string;
}
interface ApiError {
  response?: { data?: { message?: string } };
}

export default function Attendance() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // Extract YYYY-MM from selectedDate
  const currentMonth = selectedDate.slice(0, 7);

  // Fetch teachers
  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['admin', 'teachers'],
    queryFn: adminService.getTeachers,
  });

  // Fetch attendance items for the current month
  const { data: attendanceList, isLoading: loadingAttendance } = useQuery({
    queryKey: ['admin', 'attendance', currentMonth],
    queryFn: () => adminService.getTeacherAttendance(currentMonth),
    enabled: !!currentMonth,
  });

  const [localStatuses, setLocalStatuses] = useState<
    Record<string, 'Present' | 'Absent' | 'Leave'>
  >({});

  // Sync loaded attendance to local state for the selected date
  useEffect(() => {
    if (teachers && attendanceList) {
      const statuses: Record<string, 'Present' | 'Absent' | 'Leave'> = {};

      teachers.forEach((t: TeacherItem) => {
        // Find existing attendance entry for this teacher on selectedDate
        const entry = attendanceList.find(
          (a: AttendanceItem) => a.teacherId === t.id && a.date.startsWith(selectedDate),
        );
        statuses[t.id] = entry ? entry.status : 'Present'; // default to Present
      });

      requestAnimationFrame(() => setLocalStatuses(statuses));
    }
  }, [teachers, attendanceList, selectedDate]);

  // Mutations
  const markMutation = useMutation({
    mutationFn: adminService.markTeacherAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance', currentMonth] });
      toast.success('Attendance saved successfully!');
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to save attendance.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: adminService.updateTeacherAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'attendance', currentMonth] });
      toast.success('Attendance updated successfully!');
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to update attendance.');
    },
  });

  const handleStatusChange = (teacherId: string, status: 'Present' | 'Absent' | 'Leave') => {
    setLocalStatuses((prev) => ({ ...prev, [teacherId]: status }));
  };

  const handleSave = () => {
    if (!teachers || !attendanceList) return;

    const toCreate: Array<{ teacherId: string; status: string; date: string }> = [];
    const toUpdate: Array<{ id: string; teacherId: string; status: string }> = [];

    teachers.forEach((t: TeacherItem) => {
      const status = localStatuses[t.id] || 'Present';
      const existingEntry = attendanceList.find(
        (a: AttendanceItem) => a.teacherId === t.id && a.date.startsWith(selectedDate),
      );

      if (existingEntry) {
        // If status changed, update it
        if (existingEntry.status !== status) {
          toUpdate.push({
            id: existingEntry.id,
            teacherId: t.id,
            status,
          });
        }
      } else {
        // Create new entry
        toCreate.push({
          teacherId: t.id,
          status,
          date: selectedDate,
        });
      }
    });

    if (toCreate.length > 0) {
      markMutation.mutate(toCreate);
    }
    if (toUpdate.length > 0) {
      updateMutation.mutate(toUpdate);
    }
    if (toCreate.length === 0 && toUpdate.length === 0) {
      toast.info('No changes made to attendance.');
    }
  };

  const isLoading = loadingTeachers || loadingAttendance;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Teacher Attendance Registry</h2>
          <p className="text-muted-foreground">
            Mark daily present, absent, or leave status for teachers.
          </p>
        </div>

        <div className="bg-background flex items-center gap-4 rounded-lg border p-3">
          <Label htmlFor="date-select" className="text-sm font-medium whitespace-nowrap">
            Select Date:
          </Label>
          <Input
            id="date-select"
            type="date"
            className="w-40"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardCheck className="text-primary h-5 w-5" />
            Registry List
          </CardTitle>
          <Button
            onClick={handleSave}
            disabled={isLoading || markMutation.isPending || updateMutation.isPending}
          >
            {markMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Attendance'}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !teachers || teachers.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No teachers registered in system.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Phone Number</TableHead>
                    <TableHead className="w-[180px] text-right">Attendance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teachers.map((teach: TeacherItem) => (
                    <TableRow key={teach.id}>
                      <TableCell className="font-medium">
                        {teach.firstName} {teach.lastName}
                      </TableCell>
                      <TableCell>{teach.username}</TableCell>
                      <TableCell>{teach.phoneNumber}</TableCell>
                      <TableCell className="text-right">
                        <select
                          className="border-input focus-visible:ring-ring ml-auto flex h-9 w-36 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          value={localStatuses[teach.id] || 'Present'}
                          onChange={(e) =>
                            handleStatusChange(
                              teach.id,
                              e.target.value as 'Present' | 'Absent' | 'Leave',
                            )
                          }
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Leave">Leave</option>
                        </select>
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
