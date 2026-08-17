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

export const TeacherSalary: React.FC = () => {
  const [month, setMonth] = useState('');

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Filter salary for month:', month);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Salary & Payroll History</h1>
        <p className="text-muted-foreground text-xs">
          View monthly salary disbursement slips, payment dates, and transaction status.
        </p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Filter Salary Slips</CardTitle>
          <CardDescription>Select a disbursement month to check payment status</CardDescription>
        </CardHeader>
        <form onSubmit={handleFilter}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month (MM-YYYY)</Label>
              <Input
                id="month"
                placeholder="e.g. 08-2026"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button type="submit" className="w-full">
              Filter Salary
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Refresh
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TeacherSalary;
