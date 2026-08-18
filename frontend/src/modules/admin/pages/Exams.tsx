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

export const AdminExams: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    dateFrom: '',
    dateTo: '',
    className: '',
    section: '',
    subjectCode: '',
    examDate: '',
    fullMarks: '100',
  });

  const [declareExamId, setDeclareExamId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        dateFrom: formData.dateFrom,
        dateTo: formData.dateTo,
        exams: [
          {
            className: formData.className,
            section: formData.section,
            subjects: [
              {
                subjectCode: formData.subjectCode,
                date: formData.examDate,
                fullMarks: Number(formData.fullMarks),
              },
            ],
          },
        ],
      };
      const res = await adminService.createExam(payload);
      toast.success(res.message || 'Exam schedule created successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!declareExamId) {
      toast.error('Enter Exam ID to delete');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.deleteExam(declareExamId);
      toast.success(res.message || 'Exam deleted successfully!');
      setDeclareExamId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeclare = async (status: boolean) => {
    if (!declareExamId) {
      toast.error('Enter Exam ID to update result declaration');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.declareResult(declareExamId, status);
      toast.success(res.message || `Results ${status ? 'declared' : 'un-declared'} successfully!`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exam Management</h1>
        <p className="text-muted-foreground text-xs">
          Schedule examinations and declare official results.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Examination</CardTitle>
            <CardDescription>
              Configure exam series with class, subjects, dates, and full marks.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Mid-Term Examination 2025"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFrom">Date From (DD-MM-YYYY)</Label>
                  <Input
                    id="dateFrom"
                    name="dateFrom"
                    placeholder="DD-MM-YYYY"
                    value={formData.dateFrom}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateTo">Date To (DD-MM-YYYY)</Label>
                  <Input
                    id="dateTo"
                    name="dateTo"
                    placeholder="DD-MM-YYYY"
                    value={formData.dateTo}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Class</Label>
                  <Input
                    id="className"
                    name="className"
                    placeholder="e.g. 10"
                    value={formData.className}
                    onChange={handleChange}
                    required
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subjectCode">Subject Code</Label>
                  <Input
                    id="subjectCode"
                    name="subjectCode"
                    placeholder="e.g. MATH10"
                    value={formData.subjectCode}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="examDate">Exam Date</Label>
                  <Input
                    id="examDate"
                    name="examDate"
                    placeholder="DD-MM-YYYY"
                    value={formData.examDate}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullMarks">Full Marks</Label>
                  <Input
                    id="fullMarks"
                    name="fullMarks"
                    type="number"
                    placeholder="e.g. 100"
                    value={formData.fullMarks}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Scheduling...' : 'Create Exam'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Declare / Manage Exam Results</CardTitle>
            <CardDescription>
              Publish results once all teachers have completed marks entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="declareExamId">Exam ID</Label>
              <Input
                id="declareExamId"
                placeholder="24-character Exam Mongo ObjectId"
                value={declareExamId}
                onChange={(e) => setDeclareExamId(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-4">
            <Button
              onClick={() => handleDeclare(true)}
              disabled={loading}
              type="button"
              className="w-full"
            >
              Declare Results
            </Button>
            <Button
              onClick={() => handleDeclare(false)}
              disabled={loading}
              type="button"
              variant="outline"
              className="w-full"
            >
              Un-declare Results
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              type="button"
              variant="destructive"
              className="w-full"
            >
              Delete Exam
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminExams;
