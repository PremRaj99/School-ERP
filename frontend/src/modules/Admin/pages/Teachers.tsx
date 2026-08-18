import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminService } from '@/lib/services/admin.service';
import type { Teacher, TeacherPayload } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import {
  UserPlus,
  Search,
  Phone,
  Calendar,
  BookOpen,
  Trash2,
  Eye,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const sampleTeachers: Teacher[] = [
  {
    teacherId: 'TCH-001',
    firstName: 'Meenakshi',
    lastName: 'Sundaram',
    dob: '14-07-1985',
    phone: '9876501234',
    dateOfJoining: '15-06-2018',
    qualifications: 'M.Sc. Mathematics, B.Ed.',
    salaryPerMonth: 65000,
    subjectsHandled: ['Mathematics', 'Advanced Calculus'],
    about: 'Head of Mathematics Department with 12+ years of senior secondary coaching experience.',
  },
  {
    teacherId: 'TCH-002',
    firstName: 'Vikram',
    lastName: 'Choudhary',
    dob: '22-11-1988',
    phone: '9876505678',
    dateOfJoining: '10-07-2019',
    qualifications: 'M.Sc. Physics, NET Qualified',
    salaryPerMonth: 62000,
    subjectsHandled: ['Physics', 'Applied Science'],
    about: 'Physics faculty specializing in laboratory experiments and Olympiad preparation.',
  },
  {
    teacherId: 'TCH-003',
    firstName: 'Anjali',
    lastName: 'Kapoor',
    dob: '05-03-1990',
    phone: '9876509012',
    dateOfJoining: '01-08-2020',
    qualifications: 'M.A. English Literature, B.Ed.',
    salaryPerMonth: 58000,
    subjectsHandled: ['English', 'Creative Writing'],
    about: 'Debate coordinator and senior English literature instructor.',
  },
  {
    teacherId: 'TCH-004',
    firstName: 'Rajesh',
    lastName: 'Nair',
    dob: '18-09-1986',
    phone: '9876503456',
    dateOfJoining: '05-04-2017',
    qualifications: 'M.Sc. Chemistry, M.Phil.',
    salaryPerMonth: 64000,
    subjectsHandled: ['Chemistry', 'Environmental Studies'],
    about: 'Senior Chemistry instructor with focus on practical organic chemistry labs.',
  },
];

export const AdminTeachers: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<TeacherPayload>({
    firstName: '',
    lastName: '',
    dob: '01-01-1990',
    phone: '9876543210',
    dateOfJoining: '01-04-2025',
    qualifications: 'M.Sc., B.Ed.',
    salaryPerMonth: 60000,
    subjectsHandled: ['Mathematics'],
    about: 'Faculty member at Aura International Academy.',
  });

  const { data: apiTeachers } = useQuery({
    queryKey: ['adminTeachers'],
    queryFn: () => adminService.getTeachers(),
  });

  const teachersList: Teacher[] = useMemo(() => {
    if (apiTeachers?.data && Array.isArray(apiTeachers.data) && apiTeachers.data.length > 0) {
      return apiTeachers.data;
    }
    return sampleTeachers;
  }, [apiTeachers]);

  const createMutation = useMutation({
    mutationFn: (payload: TeacherPayload) => adminService.createTeacher(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Teacher registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminTeachers'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (teacherId: string) => adminService.deleteTeacher(teacherId),
    onSuccess: () => {
      toast.success('Teacher record removed successfully');
      queryClient.invalidateQueries({ queryKey: ['adminTeachers'] });
      setDeleteConfirmId(null);
      if (selectedTeacher?.teacherId === deleteConfirmId) {
        setSelectedTeacher(null);
      }
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dob: '01-01-1990',
      phone: '9876543210',
      dateOfJoining: '01-04-2025',
      qualifications: 'M.Sc., B.Ed.',
      salaryPerMonth: 60000,
      subjectsHandled: ['Mathematics'],
      about: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'salaryPerMonth' ? Number(value) : value,
    }));
  };

  const handleSubjectsChange = (val: string) => {
    const arr = val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, subjectsHandled: arr }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredTeachers = teachersList.filter((t) => {
    const matches =
      `${t.firstName} ${t.lastName || ''} ${t.teacherId} ${(t.subjectsHandled || t.subjectHandled || []).join(' ')}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matches;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Faculty & Instructors</h1>
            <Badge variant="outline" className="text-xs">
              {filteredTeachers.length} Active Staff
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Manage teaching faculty, assigned subjects, salary structures, and credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-md p-1.5 ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-zinc-900 dark:text-indigo-400'
                  : 'text-muted-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-md p-1.5 ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-zinc-900 dark:text-indigo-400'
                  : 'text-muted-foreground'
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <Button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Faculty</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="p-4">
          <div className="relative w-full">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search by instructor name, teacher ID TCH-..., or subject handled..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Faculty Grid or Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => {
            const subjects = teacher.subjectsHandled || teacher.subjectHandled || ['General'];
            return (
              <Card
                key={teacher.teacherId}
                className="flex flex-col justify-between border border-slate-200/80 bg-white/90 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/90"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-sm font-bold text-white shadow-md">
                        {teacher.firstName.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold">
                          {teacher.firstName} {teacher.lastName || ''}
                        </CardTitle>
                        <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                          {teacher.teacherId}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-[10px] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    >
                      ₹{(teacher.salaryPerMonth / 1000).toFixed(0)}k/mo
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pt-0 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] font-semibold uppercase">
                      Qualifications
                    </span>
                    <p className="font-medium text-slate-800 dark:text-zinc-200">
                      {teacher.qualifications}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground mb-1 block text-[10px] font-semibold uppercase">
                      Curriculum Handled
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {subjects.map((sub, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="bg-slate-50 text-[10px] font-medium dark:bg-zinc-800"
                        >
                          <BookOpen className="mr-1 h-2.5 w-2.5 text-indigo-500" />
                          {sub}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="text-muted-foreground flex items-center justify-between border-t border-slate-100 pt-1 text-[11px] dark:border-zinc-800">
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-emerald-500" />
                      <span>{teacher.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-indigo-500" />
                      <span>Joined {teacher.dateOfJoining || '2020'}</span>
                    </div>
                  </div>
                </CardContent>

                <div className="flex items-center justify-between border-t border-slate-100 p-3 dark:border-zinc-800">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-indigo-600 dark:text-indigo-400"
                    onClick={() => setSelectedTeacher(teacher)}
                  >
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    <span>View Profile</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
                    onClick={() => setDeleteConfirmId(teacher.teacherId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                <TableHead className="text-xs font-bold">Teacher ID</TableHead>
                <TableHead className="text-xs font-bold">Faculty Name</TableHead>
                <TableHead className="text-xs font-bold">Qualifications</TableHead>
                <TableHead className="text-xs font-bold">Subjects</TableHead>
                <TableHead className="text-xs font-bold">Phone</TableHead>
                <TableHead className="text-xs font-bold">Monthly Salary</TableHead>
                <TableHead className="text-right text-xs font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.teacherId}>
                  <TableCell className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {teacher.teacherId}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {teacher.firstName} {teacher.lastName || ''}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {teacher.qualifications}
                  </TableCell>
                  <TableCell className="text-xs">
                    {(teacher.subjectsHandled || teacher.subjectHandled || []).join(', ')}
                  </TableCell>
                  <TableCell className="text-xs">{teacher.phone}</TableCell>
                  <TableCell className="text-xs font-semibold">
                    ₹{teacher.salaryPerMonth.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-rose-600"
                      onClick={() => setDeleteConfirmId(teacher.teacherId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Teacher Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
              <span>Faculty Registry</span>
            </div>
            <DialogTitle className="text-lg font-bold">Register New Faculty Member</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in instructor details to create portal login and assign teaching subjects.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tFirstName" className="text-xs font-semibold">
                  First Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="tFirstName"
                  name="firstName"
                  placeholder="e.g. Meenakshi"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="tLastName" className="text-xs font-semibold">
                  Last Name
                </Label>
                <Input
                  id="tLastName"
                  name="lastName"
                  placeholder="e.g. Sundaram"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tPhone" className="text-xs font-semibold">
                  Mobile Number <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="tPhone"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="salaryPerMonth" className="text-xs font-semibold">
                  Monthly Salary (₹) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="salaryPerMonth"
                  name="salaryPerMonth"
                  type="number"
                  placeholder="65000"
                  value={formData.salaryPerMonth}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="qualifications" className="text-xs font-semibold">
                Educational Qualifications <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="qualifications"
                name="qualifications"
                placeholder="e.g. M.Sc. Mathematics, B.Ed."
                value={formData.qualifications}
                onChange={handleInputChange}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="subjectsHandled" className="text-xs font-semibold">
                Subjects Handled (comma separated) <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="subjectsHandled"
                placeholder="Mathematics, Calculus, Physics"
                value={(formData.subjectsHandled || []).join(', ')}
                onChange={(e) => handleSubjectsChange(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="about" className="text-xs font-semibold">
                Professional Summary / Bio
              </Label>
              <Input
                id="about"
                name="about"
                placeholder="Senior faculty with 10+ years experience"
                value={formData.about || ''}
                onChange={handleInputChange}
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="h-9 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              >
                {createMutation.isPending ? 'Registering...' : 'Confirm Faculty'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <Trash2 className="h-4 w-4" />
              <span>Confirm Faculty Removal</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to remove teacher record <strong>{deleteConfirmId}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteConfirmId(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
              disabled={deleteMutation.isPending}
              className="text-xs"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeachers;
