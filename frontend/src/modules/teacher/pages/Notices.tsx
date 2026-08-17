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

export const TeacherNotices: React.FC = () => {
  const [noticeId, setNoticeId] = useState('');
  const [search, setSearch] = useState('');

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
            <CardTitle>Search Notices</CardTitle>
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
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button type="button" className="w-full">
              Filter Notices
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Refresh All
            </Button>
          </CardFooter>
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
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="button" variant="secondary" className="w-full">
              View Notice
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TeacherNotices;
