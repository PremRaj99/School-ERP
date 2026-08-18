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
import type { StudentFee, FeeBreakdownItem } from '@/lib/types';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const StudentFees: React.FC = () => {
  const [year, setYear] = useState('');
  const [feeId, setFeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<StudentFee[] | null>(null);
  const [feeDetail, setFeeDetail] = useState<StudentFee | null>(null);

  const handleFilterTransactions = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await studentService.getTransactions(year || undefined);
      setTransactions(Array.isArray(res.data) ? res.data : []);
      toast.success(res.message || 'Fee records loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDetail = async () => {
    if (!feeId) {
      toast.error('Enter Fee ID to inspect breakdown');
      return;
    }
    setLoading(true);
    try {
      const res = await studentService.getTransactionById(feeId);
      setFeeDetail(res.data);
      toast.success('Fee receipt details loaded');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

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
          <form onSubmit={handleFilterTransactions}>
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
            <CardFooter className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Filtering...' : 'Filter Fees'}
              </Button>
            </CardFooter>
          </form>
          {transactions && (
            <CardContent className="pt-2">
              <div className="max-h-48 space-y-2 overflow-y-auto">
                {transactions.length > 0 ? (
                  transactions.map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded border p-2 text-xs"
                    >
                      <div>
                        <p className="font-semibold">
                          {tx.month || 'Monthly Fee'} — ₹{tx.finalAmount}
                        </p>
                        <p className={tx.isPaid ? 'text-green-600' : 'text-amber-600'}>
                          {tx.isPaid ? `Paid on ${tx.paidAt || 'N/A'}` : 'Payment Pending'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setFeeId(tx.id || tx._id || '')}
                      >
                        Select
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-xs">No fee invoices found.</p>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Item Detail & Breakdown</CardTitle>
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
                disabled={loading}
              />
            </div>
            {feeDetail && (
              <div className="bg-muted/40 space-y-2 rounded border p-3 text-xs">
                <p>
                  <strong>Month:</strong> {feeDetail.month}
                </p>
                <p>
                  <strong>Final Amount:</strong> ₹{feeDetail.finalAmount}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  {feeDetail.status || (feeDetail.isPaid ? 'Paid' : 'Pending')}
                </p>
                {feeDetail.feeBreakdown && (
                  <div className="space-y-1 border-t pt-1">
                    <p className="font-semibold">Breakdown Items:</p>
                    {feeDetail.feeBreakdown.map((item: FeeBreakdownItem, idx: number) => (
                      <p key={idx} className="flex justify-between">
                        <span>{item.feeType}</span>
                        <span>₹{item.amount}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-4">
            <Button
              onClick={handleFetchDetail}
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              {loading ? 'Loading...' : 'View Breakdown'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default StudentFees;
