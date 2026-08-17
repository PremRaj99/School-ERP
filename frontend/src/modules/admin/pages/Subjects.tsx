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

export const AdminSubjects: React.FC = () => {
  const [formData, setFormData] = useState({
    subjectName: '',
    subjectCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create Subject:', formData);
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
            <CardTitle>Add New Subject</CardTitle>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subjectCode">Subject Code (opt - auto-generated if omitted)</Label>
                <Input
                  id="subjectCode"
                  name="subjectCode"
                  placeholder="e.g. MATH10"
                  value={formData.subjectCode}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2 pt-4">
              <Button type="submit">Add Subject</Button>
              <Button type="button" variant="secondary">
                Update Subject
              </Button>
              <Button type="button" variant="destructive">
                Delete Subject
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Search Subjects</CardTitle>
            <CardDescription>Look up subjects by name or code</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchCode">Subject Code / Name</Label>
              <Input id="searchCode" placeholder="e.g. SCI10 or Science" />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button type="button" className="w-full">
              Search Subjects
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Get Class-wise Subjects
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AdminSubjects;
