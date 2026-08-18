import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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

interface SalarySlip {
  month: string;
  basic: number;
  hra: number;
  da: number;
  deductions: number;
  net: number;
  status: 'Paid' | 'Processing';
  paidAt?: string;
  txnId?: string;
}

const sampleSlips: SalarySlip[] = [
  {
    month: 'March 2025',
    basic: 45000,
    hra: 12000,
    da: 10000,
    deductions: 2000,
    net: 65000,
    status: 'Paid',
    paidAt: '31-03-2025',
    txnId: 'SAL-MAR-01',
  },
  {
    month: 'February 2025',
    basic: 45000,
    hra: 12000,
    da: 10000,
    deductions: 2000,
    net: 65000,
    status: 'Paid',
    paidAt: '28-02-2025',
    txnId: 'SAL-FEB-01',
  },
  {
    month: 'January 2025',
    basic: 45000,
    hra: 12000,
    da: 10000,
    deductions: 2000,
    net: 65000,
    status: 'Paid',
    paidAt: '31-01-2025',
    txnId: 'SAL-JAN-01',
  },
  {
    month: 'December 2024',
    basic: 45000,
    hra: 12000,
    da: 10000,
    deductions: 2000,
    net: 65000,
    status: 'Paid',
    paidAt: '31-12-2024',
    txnId: 'SAL-DEC-01',
  },
];

export const TeacherSalary: React.FC = () => {
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Faculty Compensation & Payslips
            </h1>
            <Badge variant="outline" className="border-teal-500/30 text-xs text-teal-600">
              Salary History
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Review monthly salary statements, allowances breakdown, tax deductions, and download
            formal payslips.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Gross Monthly CTC</span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">₹67,000</p>
            <span className="text-muted-foreground text-[11px]">Basic + HRA + DA</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Net Take-Home Pay</span>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹65,000
            </p>
            <span className="text-[11px] font-semibold text-emerald-600">✓ Disbursed monthly</span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">Total YTD Earnings</span>
            <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ₹7,80,000
            </p>
            <span className="text-muted-foreground text-[11px]">FY 2024-2025</span>
          </CardContent>
        </Card>
      </div>

      {/* Payslip History Table */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
              <TableHead className="text-xs font-bold">Month</TableHead>
              <TableHead className="text-xs font-bold">Basic Pay</TableHead>
              <TableHead className="text-xs font-bold">Allowances</TableHead>
              <TableHead className="text-xs font-bold">Deductions</TableHead>
              <TableHead className="text-xs font-bold">Net Credited</TableHead>
              <TableHead className="text-xs font-bold">Payment Status</TableHead>
              <TableHead className="text-right text-xs font-bold">Statement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleSlips.map((slip, idx) => (
              <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                  {slip.month}
                </TableCell>
                <TableCell className="text-xs">₹{slip.basic.toLocaleString()}</TableCell>
                <TableCell className="text-xs">₹{(slip.hra + slip.da).toLocaleString()}</TableCell>
                <TableCell className="text-xs text-rose-600">
                  -₹{slip.deductions.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{slip.net.toLocaleString()}
                </TableCell>
                <TableCell className="text-xs">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  >
                    {slip.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                    onClick={() => setSelectedSlip(slip)}
                  >
                    <Printer className="mr-1 h-3.5 w-3.5" />
                    <span>View Payslip</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Payslip View Modal */}
      <Dialog open={!!selectedSlip} onOpenChange={() => setSelectedSlip(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedSlip && (
            <div className="space-y-4 pt-2">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs dark:border-zinc-700 dark:bg-zinc-800/60">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      AURA INTERNATIONAL ACADEMY
                    </h3>
                    <p className="text-muted-foreground text-[10px]">
                      Monthly Salary Slip • {selectedSlip.month}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 text-[9px] text-emerald-600"
                  >
                    DISBURSED
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground text-[10px]">Faculty ID:</span>
                    <p className="font-mono font-bold">TCH-001</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Reference Txn:</span>
                    <p className="font-mono font-bold">{selectedSlip.txnId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Disbursed Date:</span>
                    <p className="font-semibold">{selectedSlip.paidAt}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Designation:</span>
                    <p className="font-semibold">Head of Mathematics</p>
                  </div>
                </div>

                <div className="space-y-1 border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic Pay:</span>
                    <span className="font-semibold">₹{selectedSlip.basic.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">House Rent Allowance (HRA):</span>
                    <span className="font-semibold">₹{selectedSlip.hra.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dearness Allowance (DA):</span>
                    <span className="font-semibold">₹{selectedSlip.da.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>Provident Fund & Tax Deductions:</span>
                    <span>-₹{selectedSlip.deductions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span>Net Amount Credited:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ₹{selectedSlip.net.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="w-full bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                  onClick={() => toast.success('Sending payslip to printer...')}
                >
                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                  <span>Print Formal Payslip</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherSalary;
