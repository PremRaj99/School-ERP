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

export const TeacherExams: React.FC = () => {
  const [examId, setExamId] = useState('');
  const [search, setSearch] = useState('');

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assigned Examinations</h1>
        <p className="text-muted-foreground text-xs">
          View assigned exam schedules and grading deadlines.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Filter Exams</CardTitle>
            <CardDescription>Search exams by title or class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Exams</Label>
              <Input
                id="search"
                placeholder="e.g. Mid-Term, Class 10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button type="button" className="w-full">
              Filter Exams
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Refresh All
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Detail & Marking Status</CardTitle>
            <CardDescription>Check subject marking status for a specific Exam ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="examId">Exam ID</Label>
              <Input
                id="examId"
                placeholder="24-character Exam ObjectId"
                value={examId}
                onChange={(e) => setExamId(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="button" variant="secondary" className="w-full">
              View Exam Subjects
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default TeacherExams;
