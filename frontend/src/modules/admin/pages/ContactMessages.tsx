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

export const AdminContactMessages: React.FC = () => {
  const [searchId, setSearchId] = useState('');

  const handleDelete = () => {
    console.log('Delete contact message:', searchId);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Contact Inquiries Inbox</h1>
        <p className="text-muted-foreground text-xs">
          Review and manage messages submitted via the public Contact Us page.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search & Manage Message</CardTitle>
            <CardDescription>Filter messages or manage by Contact ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchId">Contact Message ID</Label>
              <Input
                id="searchId"
                placeholder="24-character Contact ObjectId"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-4 sm:flex-row">
            <Button type="button" className="w-full">
              Fetch Message
            </Button>
            <Button onClick={handleDelete} type="button" variant="destructive" className="w-full">
              Delete Message
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inbox Actions</CardTitle>
            <CardDescription>Quick actions for public contact inquiries</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-xs">
              Fetch all incoming inquiries submitted by prospective parents, students, or visitors.
            </p>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="button" variant="outline" className="w-full">
              Refresh All Inquiries
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminContactMessages;
