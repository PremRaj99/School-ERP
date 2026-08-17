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

export const TeacherResults: React.FC = () => {
  const [params, setParams] = useState({
    examId: '',
    subjectId: '',
  });

  const [marksRow, setMarksRow] = useState({
    studentId: '',
    marksObtained: '',
    remark: '',
  });

  const handleLoadRoster = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Load Roster for Exam & Subject:', params);
  };

  const handleSubmitMarks = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit marks:', { ...params, ...marksRow });
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grade Entry & Results</h1>
        <p className="text-muted-foreground text-xs">
          Enter and submit subject marks for student rosters.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Select Exam & Subject</CardTitle>
            <CardDescription>Specify the examination and subject to grade.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLoadRoster}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="examId">Exam ID</Label>
                <Input
                  id="examId"
                  placeholder="24-character Exam ObjectId"
                  value={params.examId}
                  onChange={(e) => setParams({ ...params, examId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjectId">Subject ID</Label>
                <Input
                  id="subjectId"
                  placeholder="24-character Subject/ExamSubject ObjectId"
                  value={params.subjectId}
                  onChange={(e) => setParams({ ...params, subjectId: e.target.value })}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Button type="submit" className="w-full">
                Load Student Roster
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit Student Marks</CardTitle>
            <CardDescription>Enter marks obtained and optional qualitative remark.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmitMarks}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="e.g. STU12345678"
                  value={marksRow.studentId}
                  onChange={(e) => setMarksRow({ ...marksRow, studentId: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marksObtained">Marks Obtained</Label>
                <Input
                  id="marksObtained"
                  type="number"
                  placeholder="e.g. 85"
                  value={marksRow.marksObtained}
                  onChange={(e) => setMarksRow({ ...marksRow, marksObtained: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remark">Remark (opt)</Label>
                <Input
                  id="remark"
                  placeholder="e.g. Excellent performance"
                  value={marksRow.remark}
                  onChange={(e) => setMarksRow({ ...marksRow, remark: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-4">
              <Button type="submit" className="w-full">
                Submit Marks
              </Button>
              <Button type="button" variant="secondary" className="w-full">
                Update Marks
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default TeacherResults;
