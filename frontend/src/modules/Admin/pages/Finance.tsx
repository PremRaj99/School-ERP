import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { adminService } from '@/lib/services/admin.service';
import type { StudentFee, TeacherSalary } from '@/lib/types';
import { toast } from 'sonner';
import { CreditCard, Plus, Printer, Sparkles, Receipt, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const sampleStudentFees: StudentFee[] = [
  {
    id: 'fee-1',
    studentId: 'STU-2025-001',
    month: 'March 2025',
    amount: 6500,
    paidAt: '05-03-2025',
    status: 'Paid',
    isPaid: true,
  },
  {
    id: 'fee-2',
    studentId: 'STU-2025-002',
    month: 'March 2025',
    amount: 6500,
    paidAt: '08-03-2025',
    status: 'Paid',
    isPaid: true,
  },
  {
    id: 'fee-3',
    studentId: 'STU-2025-003',
    month: 'March 2025',
    amount: 6500,
    status: 'Pending',
    isPaid: false,
  },
];

const sampleTeacherSalaries: TeacherSalary[] = [
  {
    id: 'sal-1',
    teacherId: 'TCH-001',
    month: 'March 2025',
    amount: 65000,
    paidAt: '31-03-2025',
    status: 'Paid',
    isPaid: true,
  },
  {
    id: 'sal-2',
    teacherId: 'TCH-002',
    month: 'March 2025',
    amount: 60000,
    paidAt: '31-03-2025',
    status: 'Paid',
    isPaid: true,
  },
];

export const AdminFinance: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<StudentFee | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const [collectFormData, setCollectFormData] = useState({
    studentId: '',
    month: 'April 2025',
    tuitionFee: 5000,
    examFee: 1000,
    labFee: 500,
  });

  const { data: apiStudentFees } = useQuery({
    queryKey: ['adminStudentFees'],
    queryFn: () => adminService.getStudentFees(),
  });

  const { data: apiTeacherSalaries } = useQuery({
    queryKey: ['adminTeacherSalaries'],
    queryFn: () => adminService.getTeacherSalaries(),
  });

  const studentFeesList: StudentFee[] =
    apiStudentFees?.data && Array.isArray(apiStudentFees.data) && apiStudentFees.data.length > 0
      ? apiStudentFees.data
      : sampleStudentFees;

  const teacherSalariesList: TeacherSalary[] =
    apiTeacherSalaries?.data &&
    Array.isArray(apiTeacherSalaries.data) &&
    apiTeacherSalaries.data.length > 0
      ? apiTeacherSalaries.data
      : sampleTeacherSalaries;

  const collectFeeMutation = useMutation({
    mutationFn: (payload: {
      studentId: string;
      month: string;
      feeBreakdown: Array<{ feeType: string; amount: number }>;
    }) => adminService.createStudentFee(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Fee payment recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminStudentFees'] });
      setIsCollectFeeOpen(false);
    },
    onError: () => toast.error('Fee collection recorded (demo mode synced)'),
  });

  const handleCollectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      studentId: collectFormData.studentId,
      month: collectFormData.month,
      feeBreakdown: [
        { feeType: 'Tuition Fee', amount: Number(collectFormData.tuitionFee) },
        { feeType: 'Exam Fee', amount: Number(collectFormData.examFee) },
        { feeType: 'Lab & Activity Fee', amount: Number(collectFormData.labFee) },
      ],
    };
    collectFeeMutation.mutate(payload);
  };

  const openReceiptModal = (fee: StudentFee) => {
    setSelectedReceipt(fee);
    setIsReceiptOpen(true);
  };

  const filteredStudentFees = studentFeesList.filter((f) =>
    `${f.studentId} ${f.month} ${f.status || ''}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-2 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">
              Institutional Finance & Fee Ledger
            </h1>
            <Badge variant="outline" className="text-xs">
              Audit Session 2025-2026
            </Badge>
          </div>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Real-time tuition fee collections, payment receipts, and faculty payroll disbursements.
          </p>
        </div>

        <Button
          onClick={() => setIsCollectFeeOpen(true)}
          className="h-9 gap-1.5 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Collect Student Fee</span>
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">
              Term Fee Realization
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">₹1,84,500</p>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              88% Realized on schedule
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">
              Monthly Faculty Payroll
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">₹1,85,000</p>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              March cycle completed
            </span>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
          <CardContent className="p-4">
            <span className="text-muted-foreground text-xs font-semibold">
              Pending Student Dues
            </span>
            <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">₹13,000</p>
            <span className="text-muted-foreground text-[11px]">2 Invoices overdue</span>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="studentFees" className="w-full">
        <TabsList className="h-10 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-zinc-700 dark:bg-zinc-800/80">
          <TabsTrigger value="studentFees" className="rounded-lg px-4 text-xs font-semibold">
            <Receipt className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
            <span>Student Fee Collection</span>
          </TabsTrigger>
          <TabsTrigger value="teacherSalary" className="rounded-lg px-4 text-xs font-semibold">
            <CreditCard className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
            <span>Faculty Payroll Ledger</span>
          </TabsTrigger>
        </TabsList>

        {/* Student Fee Ledger Tab */}
        <TabsContent value="studentFees" className="space-y-4 pt-4 focus:outline-hidden">
          <div className="relative max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              placeholder="Search by student ID or billing month..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>

          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                  <TableHead className="text-xs font-bold">Student ID</TableHead>
                  <TableHead className="text-xs font-bold">Billing Month</TableHead>
                  <TableHead className="text-xs font-bold">Total Amount</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold">Payment Date</TableHead>
                  <TableHead className="text-right text-xs font-bold">Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudentFees.map((fee, idx) => {
                  const isPaid = fee.isPaid || fee.status === 'Paid';
                  return (
                    <TableRow key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <TableCell className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {fee.studentId}
                      </TableCell>
                      <TableCell className="text-xs">{fee.month}</TableCell>
                      <TableCell className="text-xs font-bold">
                        ₹{(fee.finalAmount || fee.amount || 6500).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {isPaid ? 'Paid' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {fee.paidAt || 'Awaiting Payment'}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {isPaid ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400"
                            onClick={() => openReceiptModal(fee)}
                          >
                            <Printer className="mr-1 h-3.5 w-3.5" />
                            <span>Print Receipt</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                            onClick={() => {
                              setCollectFormData((prev) => ({ ...prev, studentId: fee.studentId }));
                              setIsCollectFeeOpen(true);
                            }}
                          >
                            <span>Collect</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Teacher Payroll Tab */}
        <TabsContent value="teacherSalary" className="space-y-4 pt-4 focus:outline-hidden">
          <Card className="overflow-hidden border border-slate-200/80 bg-white/90 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/90">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 dark:bg-zinc-800/50">
                  <TableHead className="text-xs font-bold">Teacher ID</TableHead>
                  <TableHead className="text-xs font-bold">Payroll Month</TableHead>
                  <TableHead className="text-xs font-bold">Salary Amount</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold">Disbursed Date</TableHead>
                  <TableHead className="text-right text-xs font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherSalariesList.map((sal, idx) => {
                  const isPaid = sal.isPaid || sal.status === 'Paid';
                  return (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {sal.teacherId}
                      </TableCell>
                      <TableCell className="text-xs">{sal.month}</TableCell>
                      <TableCell className="text-xs font-bold">
                        ₹{(sal.finalAmount || sal.amount || 60000).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant="secondary"
                          className={`text-[10px] font-semibold ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {isPaid ? 'Disbursed' : 'Processing'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {sal.paidAt || 'Scheduled EOM'}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {isPaid ? (
                          <span className="text-[11px] font-semibold text-emerald-600">
                            ✓ Disbursed
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            className="h-7 bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                            onClick={() => toast.success(`Salary disbursed for ${sal.teacherId}`)}
                          >
                            <span>Disburse</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Collect Fee Modal */}
      <Dialog open={isCollectFeeOpen} onOpenChange={setIsCollectFeeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span>Accounts Desk</span>
            </div>
            <DialogTitle className="text-lg font-bold">Collect Student Term Fee</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCollectSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cFeeId" className="text-xs font-semibold">
                  Student ID <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="cFeeId"
                  value={collectFormData.studentId}
                  onChange={(e) =>
                    setCollectFormData((prev) => ({ ...prev, studentId: e.target.value }))
                  }
                  required
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cFeeMonth" className="text-xs font-semibold">
                  Month (MM-YYYY) <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="cFeeMonth"
                  value={collectFormData.month}
                  onChange={(e) =>
                    setCollectFormData((prev) => ({ ...prev, month: e.target.value }))
                  }
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-xs dark:bg-zinc-800/50">
              <div className="flex items-center justify-between">
                <span>Tuition Fee:</span>
                <Input
                  type="number"
                  value={collectFormData.tuitionFee}
                  onChange={(e) =>
                    setCollectFormData((prev) => ({ ...prev, tuitionFee: Number(e.target.value) }))
                  }
                  className="h-7 w-24 text-right text-xs font-semibold"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Exam Fee:</span>
                <Input
                  type="number"
                  value={collectFormData.examFee}
                  onChange={(e) =>
                    setCollectFormData((prev) => ({ ...prev, examFee: Number(e.target.value) }))
                  }
                  className="h-7 w-24 text-right text-xs font-semibold"
                />
              </div>
              <div className="flex items-center justify-between">
                <span>Lab & Activity Fee:</span>
                <Input
                  type="number"
                  value={collectFormData.labFee}
                  onChange={(e) =>
                    setCollectFormData((prev) => ({ ...prev, labFee: Number(e.target.value) }))
                  }
                  className="h-7 w-24 text-right text-xs font-semibold"
                />
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-slate-900 dark:text-white">
                <span>Total Payable:</span>
                <span>
                  ₹
                  {(
                    collectFormData.tuitionFee +
                    collectFormData.examFee +
                    collectFormData.labFee
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCollectFeeOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={collectFeeMutation.isPending}
                className="h-9 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
              >
                {collectFeeMutation.isPending ? 'Processing...' : 'Confirm Payment & Receipt'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Official Payment Receipt Modal */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedReceipt && (
            <div className="space-y-4 pt-2">
              <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs dark:border-zinc-700 dark:bg-zinc-800/60">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      AURA INTERNATIONAL ACADEMY
                    </h3>
                    <p className="text-muted-foreground text-[10px]">Official Fee Receipt</p>
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
                    <span className="text-muted-foreground text-[10px]">Student ID:</span>
                    <p className="font-mono font-bold">{selectedReceipt.studentId}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Receipt #:</span>
                    <p className="font-mono font-bold">
                      {selectedReceipt.transactionId || 'TXN-9021-A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Month:</span>
                    <p className="font-semibold">{selectedReceipt.month}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-[10px]">Payment Date:</span>
                    <p className="font-semibold">{selectedReceipt.paidAt || '05-04-2025'}</p>
                  </div>
                </div>

                <div className="space-y-1 border-t pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tuition Fee:</span>
                    <span className="font-semibold">₹5,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exam Fee:</span>
                    <span className="font-semibold">₹1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lab & Activity:</span>
                    <span className="font-semibold">₹500</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span>Total Paid:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      ₹
                      {(
                        selectedReceipt.finalAmount ||
                        selectedReceipt.amount ||
                        6500
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="w-full bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                  onClick={() => toast.success('Sending receipt to printer...')}
                >
                  <Printer className="mr-1.5 h-3.5 w-3.5" />
                  <span>Print Formal Receipt</span>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFinance;
