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

export const StudentSubjects: React.FC = () => {
  const [search, setSearch] = useState('');

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Enrolled Subjects</h1>
        <p className="text-muted-foreground text-xs">
          View all curriculum subjects and codes for your class.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Subject Search</CardTitle>
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
          <Button type="button" className="w-full">
            Search Subjects
          </Button>
          <Button type="button" variant="outline" className="w-full">
            Refresh
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default StudentSubjects;
