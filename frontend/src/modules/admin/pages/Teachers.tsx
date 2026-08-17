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

export const AdminTeachers: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    address: '',
    phone: '',
    teacherAadhar: '',
    dateOfJoining: '',
    about: '',
    salaryPerMonth: '',
    qualifications: '',
    subjectsHandled: '',
    profilePhoto: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create Teacher:', formData);
  };

  const handleSearch = () => {
    console.log('Search Teacher ID:', searchId);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teacher Management</h1>
          <p className="text-muted-foreground text-xs">
            Create, edit, search, and delete teacher records.
          </p>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <Input
            placeholder="Search Teacher ID (TCH...)"
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
          <CardTitle>Create / Edit Teacher Form</CardTitle>
          <CardDescription>
            Enter teacher personal, professional, and subject details.
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
                  placeholder="e.g. Priya"
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
                  placeholder="e.g. Singh"
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
                <Label htmlFor="teacherAadhar">Teacher Aadhar (opt)</Label>
                <Input
                  id="teacherAadhar"
                  name="teacherAadhar"
                  placeholder="12-digit Aadhar"
                  value={formData.teacherAadhar}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining (DD-MM-YYYY)</Label>
                <Input
                  id="dateOfJoining"
                  name="dateOfJoining"
                  placeholder="DD-MM-YYYY"
                  value={formData.dateOfJoining}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="salaryPerMonth">Salary Per Month</Label>
                <Input
                  id="salaryPerMonth"
                  name="salaryPerMonth"
                  type="number"
                  placeholder="e.g. 45000"
                  value={formData.salaryPerMonth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qualifications">Qualifications</Label>
                <Input
                  id="qualifications"
                  name="qualifications"
                  placeholder="e.g. M.Sc. Mathematics, B.Ed"
                  value={formData.qualifications}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectsHandled">Subjects Handled (comma-separated)</Label>
                <Input
                  id="subjectsHandled"
                  name="subjectsHandled"
                  placeholder="e.g. MATH10, SCI10"
                  value={formData.subjectsHandled}
                  onChange={handleChange}
                  required
                />
              </div>
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

            <div className="space-y-2">
              <Label htmlFor="about">About (opt)</Label>
              <Textarea
                id="about"
                name="about"
                placeholder="Brief description about the teacher (min 20 characters)"
                value={formData.about}
                onChange={handleChange}
              />
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
            <Button type="submit">Create Teacher</Button>
            <Button type="button" variant="secondary">
              Update Teacher
            </Button>
            <Button type="button" variant="destructive">
              Delete Teacher
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminTeachers;
