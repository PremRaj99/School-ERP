import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { adminService } from '@/lib/services/admin.service';
import type { Student, StudentPayload } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Phone,
  School,
  IdCard,
  Sparkles,
  QrCode,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const sampleStudents: Student[] = [
  {
    studentId: 'STU-2025-001',
    firstName: 'Aryan',
    lastName: 'Sharma',
    dob: '12-05-2009',
    phone: '9876543210',
    className: '10',
    section: 'A',
    session: '2025-2026',
    rollNo: 101,
    fatherName: 'Rajesh Sharma',
    motherName: 'Sunita Sharma',
    address: 'B-14, Green Park, New Delhi',
    dateOfAdmission: '01-04-2021',
  },
  {
    studentId: 'STU-2025-002',
    firstName: 'Diya',
    lastName: 'Verma',
    dob: '24-08-2009',
    phone: '9812345678',
    className: '10',
    section: 'A',
    session: '2025-2026',
    rollNo: 102,
    fatherName: 'Vikram Verma',
    motherName: 'Anita Verma',
    address: 'Flat 402, Lotus Heights, New Delhi',
    dateOfAdmission: '01-04-2021',
  },
  {
    studentId: 'STU-2025-003',
    firstName: 'Kabir',
    lastName: 'Patel',
    dob: '15-11-2010',
    phone: '9765432109',
    className: '9',
    section: 'B',
    session: '2025-2026',
    rollNo: 204,
    fatherName: 'Manish Patel',
    motherName: 'Pooja Patel',
    address: 'C-89, Preet Vihar, New Delhi',
    dateOfAdmission: '05-04-2022',
  },
  {
    studentId: 'STU-2025-004',
    firstName: 'Ananya',
    lastName: 'Deshmukh',
    dob: '03-02-2011',
    phone: '9654321098',
    className: '8',
    section: 'A',
    session: '2025-2026',
    rollNo: 301,
    fatherName: 'Sanjay Deshmukh',
    motherName: 'Kavita Deshmukh',
    address: 'A-12, Model Town, New Delhi',
    dateOfAdmission: '10-04-2023',
  },
  {
    studentId: 'STU-2025-005',
    firstName: 'Rohan',
    lastName: 'Mehta',
    dob: '19-09-2008',
    phone: '9543210987',
    className: '11',
    section: 'A',
    session: '2025-2026',
    rollNo: 112,
    fatherName: 'Alok Mehta',
    motherName: 'Ritu Mehta',
    address: 'D-56, Hauz Khas, New Delhi',
    dateOfAdmission: '01-04-2020',
  },
];

export const AdminStudents: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<StudentPayload>({
    firstName: '',
    lastName: '',
    dob: '01-01-2010',
    address: '',
    phone: '9876543210',
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    studentAadhar: '',
    fatherAadhar: '',
    motherAadhar: '',
    className: '10',
    section: 'A',
    session: '2025-2026',
    dateOfAdmission: '01-04-2025',
    rollNo: 1,
    appId: '',
  });

  const { data: apiStudents } = useQuery({
    queryKey: ['adminStudents'],
    queryFn: () => adminService.getStudents(),
  });

  const studentsList: Student[] = useMemo(() => {
    if (apiStudents?.data && Array.isArray(apiStudents.data) && apiStudents.data.length > 0) {
      return apiStudents.data;
    }
    return sampleStudents;
  }, [apiStudents]);

  const createMutation = useMutation({
    mutationFn: (payload: StudentPayload) => adminService.createStudent(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Student enrolled successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (studentId: string) => adminService.deleteStudent(studentId),
    onSuccess: () => {
      toast.success('Student record deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      setDeleteConfirmId(null);
      if (selectedStudent?.studentId === deleteConfirmId) {
        setIsDetailOpen(false);
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
      dob: '01-01-2010',
      address: '',
      phone: '9876543210',
      fatherName: '',
      motherName: '',
      fatherOccupation: '',
      motherOccupation: '',
      studentAadhar: '',
      fatherAadhar: '',
      motherAadhar: '',
      className: '10',
      section: 'A',
      session: '2025-2026',
      dateOfAdmission: '01-04-2025',
      rollNo: 1,
      appId: '',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rollNo' ? Number(value) : value,
    }));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch = `${s.firstName} ${s.lastName || ''} ${s.studentId} ${s.phone}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || s.className === selectedClass;
    return matchesSearch && matchesClass;
  });

  const viewStudentDetails = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Student Enrollment Roster</h1>
            <Badge variant="outline" className="text-xs">
              {filteredStudents.length} Active Records
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Manage student registrations, personal profiles, parent records, and digital identity
            cards.
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Admit New Student</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardContent className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
          <div className="relative w-full flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search by student name, ID STU-..., or phone number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <Filter className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {['ALL', '8', '9', '10', '11', '12'].map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    selectedClass === cls
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                  }`}
                >
                  {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Data Table */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                <TableHead className="text-xs font-bold">Student ID</TableHead>
                <TableHead className="text-xs font-bold">Full Name</TableHead>
                <TableHead className="text-xs font-bold">Class & Sec</TableHead>
                <TableHead className="text-xs font-bold">Roll No</TableHead>
                <TableHead className="text-xs font-bold">Guardian Contact</TableHead>
                <TableHead className="text-xs font-bold">Session</TableHead>
                <TableHead className="text-right text-xs font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground py-8 text-center text-xs">
                    No student records matching your search query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow
                    key={student.studentId}
                    className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"
                  >
                    <TableCell className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {student.studentId}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-sky-500 text-[10px] font-bold text-white">
                          {student.firstName.charAt(0)}
                        </div>
                        <div>
                          <span>
                            {student.firstName} {student.lastName || ''}
                          </span>
                          <p className="text-muted-foreground text-[10px]">
                            Adm: {student.dateOfAdmission || '01-04-2025'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <Badge variant="secondary" className="text-[10px] font-semibold">
                        Class {student.className}-{student.section}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-semibold">#{student.rollNo}</TableCell>
                    <TableCell className="text-xs">
                      <div className="text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-emerald-500" />
                        <span>{student.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {student.session || '2025-2026'}
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                          onClick={() => viewStudentDetails(student)}
                          title="View Digital Profile & ID Card"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950"
                          onClick={() => setDeleteConfirmId(student.studentId)}
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Student Profile & Digital ID Card Slide-Over Sheet */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedStudent && (
            <div className="space-y-6 px-4 pt-4">
              <SheetHeader>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <IdCard className="h-4 w-4" />
                  <span>Student Profile & Digital ID</span>
                </div>
                <SheetTitle className="text-lg font-bold">
                  {selectedStudent.firstName} {selectedStudent.lastName || ''}
                </SheetTitle>
                <SheetDescription className="text-xs">
                  ID: {selectedStudent.studentId} • Roll #{selectedStudent.rollNo}
                </SheetDescription>
              </SheetHeader>

              {/* Digital ID Card Preview */}
              <div className="space-y-4 rounded-2xl border border-indigo-400/30 bg-linear-to-br from-indigo-900 via-indigo-950 to-slate-900 p-5 text-white shadow-xl">
                <div className="flex items-center justify-between border-b border-white/15 pb-2">
                  <div className="flex items-center gap-1.5">
                    <School className="h-4 w-4 text-indigo-300" />
                    <span className="text-xs font-bold tracking-tight">AURA ACADEMY</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-indigo-400/40 text-[9px] text-indigo-200"
                  >
                    STUDENT PASS
                  </Badge>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-white/30 bg-linear-to-tr from-indigo-500 to-sky-400 text-xl font-black text-white shadow-md">
                    {selectedStudent.firstName.charAt(0)}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold">
                      {selectedStudent.firstName} {selectedStudent.lastName || ''}
                    </p>
                    <p className="text-xs text-indigo-200">
                      Class {selectedStudent.className}-{selectedStudent.section} (Roll #
                      {selectedStudent.rollNo})
                    </p>
                    <p className="text-[11px] text-indigo-300">
                      DOB: {selectedStudent.dob || '12-05-2009'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-white/15 pt-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-indigo-300">Guardian:</span>
                    <p className="font-semibold">
                      {selectedStudent.fatherName || 'Guardian Registered'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-300">Emergency Phone:</span>
                    <p className="font-semibold">{selectedStudent.phone}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[10px] text-indigo-300">
                    VALID: {selectedStudent.session || '2025-2026'}
                  </span>
                  <QrCode className="h-6 w-6 text-white/80" />
                </div>
              </div>

              {/* Full Details List */}
              <div className="space-y-3 text-xs">
                <h4 className="border-b pb-1 font-bold text-slate-900 dark:text-zinc-100">
                  Registration Information
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
                    <span className="text-muted-foreground text-[10px]">Father's Name</span>
                    <p className="font-semibold">{selectedStudent.fatherName || 'N/A'}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
                    <span className="text-muted-foreground text-[10px]">Mother's Name</span>
                    <p className="font-semibold">{selectedStudent.motherName || 'N/A'}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-2 dark:bg-zinc-800/50">
                  <span className="text-muted-foreground text-[10px]">Residential Address</span>
                  <p className="mt-0.5 font-semibold">
                    {selectedStudent.address || 'Address provided during admission'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => toast.success('Digital ID ready for print')}
                >
                  <span>Print ID Card</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setDeleteConfirmId(selectedStudent.studentId);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Admit New Student Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>Admissions Office</span>
            </div>
            <DialogTitle className="text-lg font-bold">New Student Admission Form</DialogTitle>
            <DialogDescription className="text-xs">
              Complete the admission profile. Auto-creates student credentials for portal login.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="firstName" className="text-xs font-semibold">
                  First Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="e.g. Diya"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName" className="text-xs font-semibold">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="e.g. Verma"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="className" className="text-xs font-semibold">
                  Class <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="className"
                  name="className"
                  placeholder="e.g. 10"
                  value={formData.className}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="section" className="text-xs font-semibold">
                  Section <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="section"
                  name="section"
                  placeholder="e.g. A"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rollNo" className="text-xs font-semibold">
                  Roll No <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="rollNo"
                  name="rollNo"
                  type="number"
                  placeholder="101"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="dob" className="text-xs font-semibold">
                  Date of Birth (DD-MM-YYYY) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="dob"
                  name="dob"
                  placeholder="12-05-2010"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Primary Mobile <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="fatherName" className="text-xs font-semibold">
                  Father's Name
                </Label>
                <Input
                  id="fatherName"
                  name="fatherName"
                  placeholder="Father's full name"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="motherName" className="text-xs font-semibold">
                  Mother's Name
                </Label>
                <Input
                  id="motherName"
                  name="motherName"
                  placeholder="Mother's full name"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="address" className="text-xs font-semibold">
                Residential Address
              </Label>
              <Input
                id="address"
                name="address"
                placeholder="Full residential address"
                value={formData.address}
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
                className="h-9 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
              >
                {createMutation.isPending ? 'Enrolling...' : 'Confirm Admission'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-rose-600">
              <Trash2 className="h-4 w-4" />
              <span>Confirm Student Record Deletion</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs">
              Are you sure you want to delete student record <strong>{deleteConfirmId}</strong>?
              This action will also revoke linked login credentials.
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

export default AdminStudents;
