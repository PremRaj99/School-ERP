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
import { teacherService } from '@/lib/services/teacher.service';
import type { Notice } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const TeacherNotices: React.FC = () => {
  const [noticeId, setNoticeId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  const handleFetchNotices = async () => {
    setLoading(true);
    try {
      const res = await teacherService.getNotices();
      setNotices(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Staff notices retrieved');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDetail = async () => {
    if (!noticeId) {
      toast.error('Enter Notice ID');
      return;
    }
    setLoading(true);
    try {
      const res = await teacherService.getNoticeById(noticeId);
      setActiveNotice(res.data);
      toast.success('Notice loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filtered = notices?.filter((n) => {
    const q = search.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.description?.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Notice Board</h1>
        <p className="text-muted-foreground text-xs">
          Official communications, administrative announcements, and guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search & Load Notices</CardTitle>
            <CardDescription>Filter notices targeted to Teachers and Staff</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Keywords</Label>
              <Input
                id="search"
                placeholder="e.g. Meeting, Schedule, Holiday"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleFetchNotices} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Fetch Staff Notices'}
            </Button>
            {notices && (
              <div className="max-h-48 space-y-2 overflow-y-auto pt-2">
                {filtered && filtered.length > 0 ? (
                  filtered.map((n, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded border p-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-muted-foreground">{n.date}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setNoticeId(n.id || n._id || '')}
                      >
                        Select
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">No matching circulars.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>View Notice Detail</CardTitle>
            <CardDescription>
              Open notice by ID to read circular description and download attachments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="noticeId">Notice ID</Label>
              <Input
                id="noticeId"
                placeholder="24-character ObjectId"
                value={noticeId}
                onChange={(e) => setNoticeId(e.target.value)}
                disabled={loading}
              />
            </div>
            {activeNotice && (
              <div className="bg-muted/40 space-y-2 rounded border p-3 text-xs">
                <h4 className="text-sm font-bold">{activeNotice.title}</h4>
                <p className="text-muted-foreground">Published: {activeNotice.date}</p>
                <p>{activeNotice.description || 'No description provided.'}</p>
                {activeNotice.fileUrl && (
                  <a
                    href={activeNotice.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline"
                  >
                    Download Attachment
                  </a>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              onClick={handleFetchDetail}
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? 'Loading...' : 'View Notice'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TeacherNotices;
