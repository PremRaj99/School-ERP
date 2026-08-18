import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { teacherService } from '@/lib/services/teacher.service';
import type { TeacherSalary as ITeacherSalary } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const TeacherSalary: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [salaries, setSalaries] = useState<ITeacherSalary[] | null>(null);

  const handleFetchSalaries = async () => {
    setLoading(true);
    try {
      const res = await teacherService.getSalaryTransactions();
      setSalaries(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Salary slips loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Salary & Payroll History</h1>
        <p className="text-muted-foreground text-xs">
          View monthly salary disbursement slips, payment dates, and transaction status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Salary Statements</CardTitle>
            <CardDescription>Fetch your monthly payroll disbursement statements</CardDescription>
          </CardHeader>
          <CardFooter className="pt-4">
            <Button onClick={handleFetchSalaries} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Fetch Salary Slips'}
            </Button>
          </CardFooter>
        </Card>

        {salaries && (
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>{salaries.length} statement(s) found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {salaries.length > 0 ? (
                  salaries.map((sal, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded border p-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold">
                          {sal.month} — ₹{sal.amount}
                        </p>
                        <p className={sal.isPaid ? 'text-green-600' : 'text-amber-600'}>
                          {sal.isPaid ? `Paid on ${sal.paidAt || 'N/A'}` : 'Pending Disbursement'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">
                    No salary disbursement records found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TeacherSalary;
