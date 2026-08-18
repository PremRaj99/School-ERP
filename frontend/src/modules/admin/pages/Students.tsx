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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { adminService } from '@/lib/services/admin.service';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const AdminStudents: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    address: '',
    phone: '',
    fatherName: '',
    motherName: '',
    fatherOccupation: '',
    motherOccupation: '',
    studentAadhar: '',
    fatherAadhar: '',
    motherAadhar: '',
    className: '',
    section: '',
    session: '',
    dateOfAdmission: '',
    rollNo: '',
    appId: '',
    profilePhoto: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        rollNo: Number(formData.rollNo),
      };
      const res = await adminService.createStudent(payload);
      toast.success(res.message || 'Student created successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!searchId) {
      toast.error('Enter Student ID to update');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {};
      Object.entries(formData).forEach(([k, v]) => {
        if (v) payload[k] = k === 'rollNo' ? Number(v) : v;
      });
      const res = await adminService.updateStudent(searchId, payload);
      toast.success(res.message || 'Student updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!searchId) {
      toast.error('Enter Student ID to delete');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.deleteStudent(searchId);
      toast.success(res.message || 'Student deleted successfully!');
      setSearchId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchId) {
      toast.error('Enter a Student ID to search');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.getStudentById(searchId);
      const student = res.data;
      if (student) {
        setFormData({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          dob: student.dob || '',
          address: student.address || '',
          phone: student.phone || '',
          fatherName: student.fatherName || '',
          motherName: student.motherName || '',
          fatherOccupation: student.fatherOccupation || '',
          motherOccupation: student.motherOccupation || '',
          studentAadhar: student.studentAadhar || '',
          fatherAadhar: student.fatherAadhar || '',
          motherAadhar: student.motherAadhar || '',
          className: student.className || '',
          section: student.section || '',
          session: student.session || '',
          dateOfAdmission: student.dateOfAdmission || '',
          rollNo: student.rollNo ? String(student.rollNo) : '',
          appId: student.appId || '',
          profilePhoto: student.profilePhoto || '',
        });
        toast.success('Student record loaded');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
          <p className="text-muted-foreground text-xs">
            Create, edit, search, and delete student records.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            placeholder="Search Student ID (STU...)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={handleSearch} disabled={loading} type="button">
            Search
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create / Edit Student Form</CardTitle>
          <CardDescription>
            Enter student personal details, guardian details, and academic placement.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="e.g. Rahul"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name (opt)</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="e.g. Sharma"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth (DD-MM-YYYY)</Label>
                <Input
                  id="dob"
                  name="dob"
                  placeholder="DD-MM-YYYY"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentAadhar">Student Aadhar (opt)</Label>
                <Input
                  id="studentAadhar"
                  name="studentAadhar"
                  placeholder="12-digit Aadhar"
                  value={formData.studentAadhar}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profilePhoto">Profile Photo URL (opt)</Label>
                <Input
                  id="profilePhoto"
                  name="profilePhoto"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.profilePhoto}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class</Label>
                <Input
                  id="className"
                  name="className"
                  placeholder="e.g. 10"
                  value={formData.className}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  name="section"
                  placeholder="e.g. A"
                  value={formData.section}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session">Session</Label>
                <Input
                  id="session"
                  name="session"
                  placeholder="e.g. 2025-2026"
                  value={formData.session}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNo">Roll No</Label>
                <Input
                  id="rollNo"
                  name="rollNo"
                  type="number"
                  placeholder="e.g. 12"
                  value={formData.rollNo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfAdmission">Date of Admission (DD-MM-YYYY)</Label>
                <Input
                  id="dateOfAdmission"
                  name="dateOfAdmission"
                  placeholder="DD-MM-YYYY"
                  value={formData.dateOfAdmission}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appId">Application ID (opt)</Label>
                <Input
                  id="appId"
                  name="appId"
                  placeholder="Optional App ID"
                  value={formData.appId}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name (opt)</Label>
                <Input
                  id="fatherName"
                  name="fatherName"
                  placeholder="Father's full name"
                  value={formData.fatherName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherOccupation">Father's Occupation (opt)</Label>
                <Input
                  id="fatherOccupation"
                  name="fatherOccupation"
                  placeholder="Occupation"
                  value={formData.fatherOccupation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name (opt)</Label>
                <Input
                  id="motherName"
                  name="motherName"
                  placeholder="Mother's full name"
                  value={formData.motherName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherOccupation">Mother's Occupation (opt)</Label>
                <Input
                  id="motherOccupation"
                  name="motherOccupation"
                  placeholder="Occupation"
                  value={formData.motherOccupation}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fatherAadhar">Father's Aadhar (opt)</Label>
                <Input
                  id="fatherAadhar"
                  name="fatherAadhar"
                  placeholder="12-digit Aadhar"
                  value={formData.fatherAadhar}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherAadhar">Mother's Aadhar (opt)</Label>
                <Input
                  id="motherAadhar"
                  name="motherAadhar"
                  placeholder="12-digit Aadhar"
                  value={formData.motherAadhar}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address (opt)</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Residential address (min 10 characters)"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Create Student'}
            </Button>
            <Button type="button" variant="secondary" onClick={handleUpdate} disabled={loading}>
              Update Student
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
              Delete Student
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminStudents;
