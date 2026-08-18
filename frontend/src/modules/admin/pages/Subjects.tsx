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
import { adminService } from '@/lib/services/admin.service';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const AdminSubjects: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        subjectName: formData.subjectName,
        ...(formData.subjectCode ? { subjectCode: formData.subjectCode } : {}),
      };
      const res = await adminService.createSubject(payload);
      toast.success(res.message || 'Subject created successfully!');
      setFormData({ subjectName: '', subjectCode: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.subjectCode) {
      toast.error('Enter Subject Code to update');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.updateSubject(formData.subjectCode, {
        subjectName: formData.subjectName,
      });
      toast.success(res.message || 'Subject updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.subjectCode) {
      toast.error('Enter Subject Code to delete');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.deleteSubject(formData.subjectCode);
      toast.success(res.message || 'Subject deleted successfully!');
      setFormData({ subjectName: '', subjectCode: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAll = async () => {
    setLoading(true);
    try {
      const res = await adminService.getSubjects();
      toast.success(`Loaded ${res.data?.length ?? 0} subjects`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchClassSubjects = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllClassSubjects();
      toast.success(res.message || 'Class-wise subjects loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subject Management</h1>
        <p className="text-muted-foreground text-xs">Create, update, and manage subjects.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add / Update Subject</CardTitle>
            <CardDescription>Enter subject name and optional custom subject code.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subjectName">Subject Name</Label>
                <Input
                  id="subjectName"
                  name="subjectName"
                  placeholder="e.g. Mathematics"
                  value={formData.subjectName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCode">
                  Subject Code (opt on create, required for update/delete)
                </Label>
                <Input
                  id="subjectCode"
                  name="subjectCode"
                  placeholder="e.g. MATH10"
                  value={formData.subjectCode}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Add Subject'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleUpdate} disabled={loading}>
                Update Subject
              </Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                Delete Subject
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Inquiries</CardTitle>
            <CardDescription>Fetch registered curriculum subjects across classes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-xs">
              Retrieve all curriculum subject codes or class-grouped subjects.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-4 sm:flex-row">
            <Button type="button" onClick={handleFetchAll} disabled={loading} className="w-full">
              Get All Subjects
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleFetchClassSubjects}
              disabled={loading}
              className="w-full"
            >
              Get Class-wise Subjects
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminSubjects;
