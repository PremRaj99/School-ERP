import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { teacherService } from '../services/teacherService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Loader2, Plus, Trash2, CalendarRange } from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceLogItem {
  id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Leave';
}
interface ClassLogItem {
  id: string;
  date: string;
  class: { className: string; section: string; session: string };
}
interface ApiError {
  response?: { data?: { message?: string } };
}

const markAttendanceSchema = z.object({
  className: z.string().min(1, 'Class name is required'),
  section: z.string().min(1, 'Section is required'),
  date: z.string().min(1, 'Date is required'),
  attendance: z.array(
    z.object({
      studentId: z.string().min(1, 'Student ID or Object ID is required'),
      status: z.enum(['Present', 'Absent', 'Leave']),
    }),
  ),
});

type AttendanceFormValues = z.infer<typeof markAttendanceSchema>;

export default function Attendance() {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [open, setOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  // Queries
  const { data: ownAttendance, isLoading: loadingOwn } = useQuery({
    queryKey: ['teacher', 'own-attendance', selectedMonth],
    queryFn: () => teacherService.getOwnAttendance(selectedMonth),
  });

  const { data: classLogs, isLoading: loadingClassLogs } = useQuery({
    queryKey: ['teacher', 'class-logs', selectedMonth],
    queryFn: () => teacherService.getClassAttendanceLogs(selectedMonth),
  });

  const { data: classDetails } = useQuery({
    queryKey: ['teacher', 'class-details', selectedLogId],
    queryFn: () => teacherService.getClassAttendanceDetails(selectedLogId!),
    enabled: !!selectedLogId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: teacherService.createClassAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher', 'class-logs', selectedMonth] });
      toast.success('Class attendance logged successfully!');
      setOpen(false);
      reset();
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to log class attendance.');
    },
  });

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
    reset,
  } = useForm<AttendanceFormValues>({
    resolver: zodResolver(markAttendanceSchema),
    defaultValues: {
      className: '',
      section: '',
      date: new Date().toISOString().split('T')[0],
      attendance: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'attendance',
  });

  // Helper to load students from class log
  const handlePrepopulateFromLog = (log: ClassLogItem) => {
    // Set selected log ID to trigger loading its details
    setSelectedLogId(log.id);
    setValue('className', log.class.className);
    setValue('section', log.class.section);
  };

  // Sync loaded details to field array for pre-population
  useEffect(() => {
    if (classDetails && classDetails.class?.students) {
      const formatted = classDetails.class.students.map((student: { id: string }) => ({
        studentId: student.id,
        status: 'Present' as const,
      }));
      setValue('attendance', formatted);
      toast.info(`Pre-populated ${formatted.length} students from class log.`);
      requestAnimationFrame(() => setSelectedLogId(null)); // reset so details query is ready for next trigger
    }
  }, [classDetails, setValue]);

  const onSubmit = (data: AttendanceFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance Registry</h2>
          <p className="text-muted-foreground">
            Log daily student presence or view your monthly attendance record.
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

      <Tabs defaultValue="class" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="class">Class Attendance</TabsTrigger>
          <TabsTrigger value="personal">My Attendance Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="class" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Student Logs ({selectedMonth})</h3>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700">
                  <Plus className="h-4 w-4" />
                  Mark Daily Attendance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Mark Daily Attendance</DialogTitle>
                  <DialogDescription>
                    Select class, section, date, and input student statuses.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                  {/* Shortcut helper */}
                  {classLogs && classLogs.length > 0 && (
                    <div className="space-y-1.5 border-b pb-4">
                      <Label className="text-muted-foreground text-xs font-semibold">
                        Pre-populate Student List from Recent Logs:
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {classLogs.slice(0, 3).map((log: ClassLogItem) => (
                          <Button
                            key={log.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrepopulateFromLog(log)}
                          >
                            {log.class.className}-{log.class.section} ({log.date.split('T')[0]})
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Class Name</Label>
                        <Input placeholder="Class 10" {...register('className')} />
                        {errors.className && (
                          <p className="text-destructive text-xs">{errors.className.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Section</Label>
                        <Input placeholder="A" {...register('section')} />
                        {errors.section && (
                          <p className="text-destructive text-xs">{errors.section.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" {...register('date')} />
                      {errors.date && (
                        <p className="text-destructive text-xs">{errors.date.message}</p>
                      )}
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Student List</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => append({ studentId: '', status: 'Present' })}
                          className="text-violet-600 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Add Student Row
                        </Button>
                      </div>

                      {fields.map((field, idx) => (
                        <div key={field.id} className="flex items-center gap-2">
                          <Input
                            placeholder="Student ID / Object ID"
                            className="flex-1"
                            {...register(`attendance.${idx}.studentId` as const)}
                          />
                          <select
                            className="border-input focus-visible:ring-ring h-9 rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none"
                            {...register(`attendance.${idx}.status` as const)}
                          >
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Leave">Leave</option>
                          </select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => remove(idx)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <DialogFooter className="border-t pt-4">
                      <Button
                        type="submit"
                        className="bg-violet-600 hover:bg-violet-700"
                        disabled={createMutation.isPending}
                      >
                        {createMutation.isPending ? 'Saving...' : 'Save Attendance'}
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-border">
            <CardContent className="pt-6">
              {loadingClassLogs ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : !classLogs || classLogs.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  No class logs recorded for this month.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Session</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classLogs.map((log: ClassLogItem) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-semibold">{log.class.className}</TableCell>
                          <TableCell>{log.class.section}</TableCell>
                          <TableCell>{log.class.session}</TableCell>
                          <TableCell>{log.date.split('T')[0]}</TableCell>
                          <TableCell className="text-right">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Marked
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
        </TabsContent>

        <TabsContent value="personal">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2">
              <CalendarRange className="h-5 w-5 text-violet-600" />
              <div>
                <CardTitle>My Attendance Summary</CardTitle>
                <CardDescription>View your own attendance logs submitted by admin.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {loadingOwn ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : !ownAttendance || ownAttendance.length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  No personal attendance records found.
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
                      {ownAttendance.map((log: AttendanceLogItem) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
