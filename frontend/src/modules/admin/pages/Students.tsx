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

export const AdminStudents: React.FC = () => {
  const [searchId, setSearchId] = useState('');
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create Student:', formData);
  };

  const handleSearch = () => {
    console.log('Search Student ID:', searchId);
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
          <Button onClick={handleSearch} type="button">
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
            <Button type="submit">Create Student</Button>
            <Button type="button" variant="secondary">
              Update Student
            </Button>
            <Button type="button" variant="destructive">
              Delete Student
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminStudents;
