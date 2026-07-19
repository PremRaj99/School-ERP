import { useQuery } from '@tanstack/react-query';
import { teacherService } from '../services/teacherService';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Loader2, DollarSign } from 'lucide-react';

interface SalarySlipItem { id: string; month: string; transaction?: { title: string; finalAmount: number; status: string; }; }


export default function Salary() {
  const { data: salaries, isLoading } = useQuery({
    queryKey: ['teacher', 'salaries'],
    queryFn: teacherService.getSalaryTransactions,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Salary & Payroll History</h2>
        <p className="text-muted-foreground">
          Check your monthly salary slips and payment transaction status.
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2">
          <DollarSign className="h-5 w-5 text-violet-600" />
          <div>
            <CardTitle>Payroll History</CardTitle>
            <CardDescription>Listing of processed monthly salaries.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !salaries || salaries.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No salary slips found in the registry.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pay Slip Month</TableHead>
                    <TableHead>Transaction Title</TableHead>
                    <TableHead>Amount Credited</TableHead>
                    <TableHead className="text-right">Payment Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaries.map((sal: SalarySlipItem) => (
                    <TableRow key={sal.id}>
                      <TableCell className="font-semibold">
                        {sal.month?.split('T')[0]?.slice(0, 7)}
                      </TableCell>
                      <TableCell>{sal.transaction?.title || 'Salary Slip'}</TableCell>
                      <TableCell>${sal.transaction?.finalAmount}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            sal.transaction?.status === 'Paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {sal.transaction?.status || 'Pending'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
