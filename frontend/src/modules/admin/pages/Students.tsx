import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { adminService } from '../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface StudentItem {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  rollNo: number;
  class?: { className: string; section: string };
}
interface ApiError {
  response?: { data?: { message?: string } };
}

const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  rollNo: z.string().min(1, 'Roll number is required'),
  className: z.string().min(1, 'Class name is required'),
  section: z.string().min(1, 'Section is required'),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function Students() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: students, isLoading } = useQuery({
    queryKey: ['admin', 'students'],
    queryFn: adminService.getStudents,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
      toast.success('Student created successfully!');
      setOpen(false);
      reset();
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to create student.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
      toast.success('Student deleted successfully!');
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || 'Failed to delete student.');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
  });

  const onSubmit = (data: StudentFormValues) => {
    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students Manager</h2>
          <p className="text-muted-foreground">
            Manage school student rosters and class enrollments.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Register a student and enroll them in a class group.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-destructive text-xs">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Smith" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-destructive text-xs">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="johnsmith" {...register('username')} />
                {errors.username && (
                  <p className="text-destructive text-xs">{errors.username.message}</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="rollNo">Roll No</Label>
                  <Input id="rollNo" placeholder="12" {...register('rollNo')} />
                  {errors.rollNo && (
                    <p className="text-destructive text-xs">{errors.rollNo.message}</p>
                  )}
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="className">Class</Label>
                  <Input id="className" placeholder="Class 10" {...register('className')} />
                  {errors.className && (
                    <p className="text-destructive text-xs">{errors.className.message}</p>
                  )}
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input id="section" placeholder="A" {...register('section')} />
                  {errors.section && (
                    <p className="text-destructive text-xs">{errors.section.message}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Registering...' : 'Register Student'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !students || students.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No students registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((stud: StudentItem) => (
                    <TableRow key={stud.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {stud.firstName} {stud.lastName}
                      </TableCell>
                      <TableCell>{stud.username}</TableCell>
                      <TableCell>{stud.rollNo}</TableCell>
                      <TableCell>{stud.class?.className || 'N/A'}</TableCell>
                      <TableCell>{stud.class?.section || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(stud.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
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
