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

export const AdminNotices: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    date: '',
    expiryDate: '',
    targetRole: 'All',
  });
  const [noticeId, setNoticeId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title: formData.title,
        date: formData.date,
        targetRole: formData.targetRole,
      };
      if (formData.description) payload.description = formData.description;
      if (formData.fileUrl) payload.fileUrl = formData.fileUrl;
      if (formData.expiryDate) payload.expiryDate = formData.expiryDate;

      const res = await adminService.createNotice(payload);
      toast.success(res.message || 'Notice published successfully!');
      setFormData({
        title: '',
        description: '',
        fileUrl: '',
        date: '',
        expiryDate: '',
        targetRole: 'All',
      });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!noticeId) {
      toast.error('Enter Notice ID to delete');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.deleteNotice(noticeId);
      toast.success(res.message || 'Notice deleted successfully!');
      setNoticeId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!noticeId) {
      toast.error('Enter Notice ID to search');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.getNoticeById(noticeId);
      const notice = res.data;
      if (notice) {
        setFormData({
          title: notice.title || '',
          description: notice.description || '',
          fileUrl: notice.fileUrl || '',
          date: notice.date || '',
          expiryDate: notice.expiryDate || '',
          targetRole: notice.targetRole || 'All',
        });
        toast.success('Notice details loaded');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notice Board Management</h1>
        <p className="text-muted-foreground text-xs">
          Publish circulars and announcements targeted to students, teachers, or all.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Publish New Notice</CardTitle>
            <CardDescription>
              Compose a notice and broadcast to selected recipients.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Notice Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Annual Sports Day Announcement"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Publish Date (DD-MM-YYYY)</Label>
                  <Input
                    id="date"
                    name="date"
                    placeholder="DD-MM-YYYY"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (opt)</Label>
                  <Input
                    id="expiryDate"
                    name="expiryDate"
                    placeholder="DD-MM-YYYY"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role</Label>
                <Input
                  id="targetRole"
                  name="targetRole"
                  placeholder="Student | Teacher | All"
                  value={formData.targetRole}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUrl">Attachment File URL (opt)</Label>
                <Input
                  id="fileUrl"
                  name="fileUrl"
                  placeholder="https://example.com/circular.pdf"
                  value={formData.fileUrl}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Notice Description (opt)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Full text of the notice / announcement (min 50 characters)"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Publishing...' : 'Publish Notice'}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Existing Notices</CardTitle>
            <CardDescription>Search or delete published notices by Notice ID.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="noticeId">Notice ID</Label>
              <Input
                id="noticeId"
                placeholder="24-character Notice ObjectId"
                value={noticeId}
                onChange={(e) => setNoticeId(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button onClick={handleSearch} disabled={loading} type="button" className="w-full">
              Search Notice
            </Button>
            <Button
              onClick={handleDelete}
              disabled={loading}
              type="button"
              variant="destructive"
              className="w-full"
            >
              Delete Notice
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminNotices;
