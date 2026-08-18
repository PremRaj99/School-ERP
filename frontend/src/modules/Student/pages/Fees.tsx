import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Printer } from 'lucide-react';
import { toast } from 'sonner';

interface StudentFeeRecord {
  month: string;
  amount: number;
  status: 'Paid' | 'Due';
  paidAt?: string;
  receiptId?: string;
}

const feeHistory: StudentFeeRecord[] = [
  {
    month: 'April 2025',
    amount: 6500,
    status: 'Paid',
    paidAt: '05-04-2025',
    receiptId: 'REC-2025-04-101',
  },
  {
    month: 'March 2025',
    amount: 6500,
    status: 'Paid',
    paidAt: '02-03-2025',
    receiptId: 'REC-2025-03-101',
  },
  {
    month: 'February 2025',
    amount: 6500,
    status: 'Paid',
    paidAt: '04-02-2025',
    receiptId: 'REC-2025-02-101',
  },
  {
    month: 'January 2025',
    amount: 6500,
    status: 'Paid',
    paidAt: '03-01-2025',
    receiptId: 'REC-2025-01-101',
  },
];

export const StudentFees: React.FC = () => {
  const [selectedReceipt, setSelectedReceipt] = useState<StudentFeeRecord | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Tuition Invoices & Payment Portal
            </h1>
            <Badge variant="outline" className="border-emerald-500/30 text-xs text-emerald-600">
              Account Clear
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Review term fee breakdown, complete online digital payments, and download payment
            receipts.
          </p>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Current Balance Due</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">₹0.00</p>
            <span className="text-[11px] font-semibold text-emerald-600">✓ No overdue charges</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Monthly Tuition Fee</span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">₹6,500</p>
            <span className="text-muted-foreground text-[11px]">Class 10-A Composite Fee</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Total YTD Paid</span>
            <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹26,000</p>
            <span className="text-muted-foreground text-[11px]">4 Invoices Cleared</span>
          </CardContent>
        </Card>
      </div>

      {/* Payment History Table */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <CardHeader className="border-b border-slate-100 pb-3 dark:border-zinc-800">
          <CardTitle className="text-base font-bold">Past Payment Receipts</CardTitle>
          <CardDescription className="text-xs">
            Complete transaction ledger for academic session 2025-2026.
          </CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
              <TableHead className="text-xs font-bold">Billing Month</TableHead>
              <TableHead className="text-xs font-bold">Receipt Number</TableHead>
              <TableHead className="text-xs font-bold">Amount Paid</TableHead>
              <TableHead className="text-xs font-bold">Status</TableHead>
              <TableHead className="text-xs font-bold">Payment Date</TableHead>
              <TableHead className="text-right text-xs font-bold">Receipt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeHistory.map((fee, idx) => (
              <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                  {fee.month}
                </TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">
                  {fee.receiptId}
                </TableCell>
                <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                  ₹{fee.amount.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  >
                    {fee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{fee.paidAt}</TableCell>
                <TableCell className="text-right text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                    onClick={() => setSelectedReceipt(fee)}
                  >
                    <Printer className="mr-1 h-3.5 w-3.5" />
                    <span>View Receipt</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Receipt View Modal */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedReceipt && (
            <div className="space-y-4 pt-2">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs dark:border-zinc-700 dark:bg-zinc-800/60">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      AURA INTERNATIONAL ACADEMY
                    </h3>
                    <p className="text-muted-foreground text-[10px]">
                      Fee Receipt • {selectedReceipt.month}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-[9px] text-emerald-600"
                  >
                    PAID
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground text-[10px]">Student Name:</span>
                    <p className="font-bold">Aryan Sharma</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Student ID:</span>
                    <p className="font-mono font-bold">STU-2025-001</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Receipt #:</span>
                    <p className="font-mono font-semibold">{selectedReceipt.receiptId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Payment Date:</span>
                    <p className="font-semibold">{selectedReceipt.paidAt}</p>
                  </div>
                </div>

                <div className="space-y-1 border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tuition Fee:</span>
                    <span className="font-semibold">₹5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Examination Fee:</span>
                    <span className="font-semibold">₹1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lab & Activities:</span>
                    <span className="font-semibold">₹500</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span>Total Amount Paid:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ₹{selectedReceipt.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                onClick={() => toast.success('Sending fee receipt to printer...')}
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                <span>Print Official Receipt</span>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentFees;
