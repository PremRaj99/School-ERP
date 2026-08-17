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

export const StudentExams: React.FC = () => {
  const [examId, setExamId] = useState('');

  const handleFetchResults = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Fetch result for Exam ID:', examId);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exams & Results</h1>
        <p className="text-muted-foreground text-xs">
          Check datesheets, examination schedules, and published report cards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>View Exam Schedule & Results</CardTitle>
            <CardDescription>
              Enter an Exam ID to view your marks breakdown and grade.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleFetchResults}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examId">Exam ID</Label>
                <Input
                  id="examId"
                  placeholder="24-character Exam ObjectId"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4 sm:flex-row">
              <Button type="submit" className="w-full">
                View Results
              </Button>
              <Button type="button" variant="outline" className="w-full">
                View Schedule
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Examinations</CardTitle>
            <CardDescription>
              Quickly refresh the list of upcoming exams for your class.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-xs">
              Exams scheduled by your school administration will appear here automatically.
            </p>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="button" variant="secondary" className="w-full">
              Refresh Exam List
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StudentExams;
