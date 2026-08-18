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
import { studentService } from '@/lib/services/student.service';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const StudentSubjects: React.FC = () => {
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Array<{
    subjectCode?: string;
    subjectName?: string;
  }> | null>(null);

  const handleFetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await studentService.getSubjects();
      setSubjects(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Subjects loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const filtered = subjects?.filter((s) => {
    const q = search.toLowerCase();
    return s.subjectName?.toLowerCase().includes(q) || s.subjectCode?.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enrolled Subjects</h1>
        <p className="text-muted-foreground text-xs">
          View all curriculum subjects and codes for your class.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Subject Search & Actions</CardTitle>
            <CardDescription>Filter your registered subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Subject Name or Code</Label>
              <Input
                id="search"
                placeholder="e.g. Science, MATH10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={handleFetchSubjects}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Fetch All Subjects'}
            </Button>
          </CardFooter>
        </Card>

        {subjects && (
          <Card>
            <CardHeader>
              <CardTitle>Subject Roster</CardTitle>
              <CardDescription>{filtered?.length ?? 0} subject(s) enrolled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {filtered && filtered.length > 0 ? (
                  filtered.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded border p-2 text-xs"
                    >
                      <span className="font-medium">{s.subjectName}</span>
                      <span className="text-muted-foreground font-mono">{s.subjectCode}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">No matching subjects found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentSubjects;
