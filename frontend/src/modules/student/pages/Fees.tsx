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

export const StudentFees: React.FC = () => {
  const [year, setYear] = useState('');
  const [feeId, setFeeId] = useState('');

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fee Ledger & Receipts</h1>
        <p className="text-muted-foreground text-xs">
          Review monthly fee invoices, payment receipts, and dues breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Filter Fee Statements</CardTitle>
            <CardDescription>Filter statements by academic session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year">Academic Session (YYYY-YYYY)</Label>
              <Input
                id="year"
                placeholder="e.g. 2025-2026"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 pt-4">
            <Button type="button" className="w-full">
              Filter Fees
            </Button>
            <Button type="button" variant="outline" className="w-full">
              Refresh
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Item Detail</CardTitle>
            <CardDescription>Look up a specific fee receipt by Fee ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feeId">Fee ID</Label>
              <Input
                id="feeId"
                placeholder="24-character ObjectId"
                value={feeId}
                onChange={(e) => setFeeId(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="pt-4">
            <Button type="button" variant="secondary" className="w-full">
              View Breakdown
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StudentFees;
