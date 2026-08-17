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

export const AdminClasses: React.FC = () => {
  const [formData, setFormData] = useState({
    className: '',
    section: '',
    session: '',
  });
  const [deleteClassId, setDeleteClassId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create Class:', formData);
  };

  const handleDelete = () => {
    console.log('Delete Class ID:', deleteClassId);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Class Management</h1>
        <p className="text-muted-foreground text-xs">Create and manage class-section offerings.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Class Section</CardTitle>
            <CardDescription>Add a new class, section, and academic session.</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreate}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="className">Class Name / Grade</Label>
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
            </CardContent>
            <CardFooter className="pt-4">
              <Button type="submit" className="w-full">
                Create Class
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete Class</CardTitle>
            <CardDescription>Remove an existing class section by ObjectId.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deleteClassId">Class ID</Label>
              <Input
                id="deleteClassId"
                placeholder="24-character Mongo ObjectId"
                value={deleteClassId}
                onChange={(e) => setDeleteClassId(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button onClick={handleDelete} variant="destructive" className="w-full">
              Delete Class
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminClasses;
