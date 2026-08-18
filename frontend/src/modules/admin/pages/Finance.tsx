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
import { adminService } from '@/lib/services/admin.service';
import { getErrorMessage } from '@/lib/api';
import { toast } from 'sonner';

export const AdminFinance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [feeId, setFeeId] = useState('');
  const [feeData, setFeeData] = useState({
    studentId: '',
    month: '',
    title: '',
    feeType: 'Tuition Fee',
    amount: '',
    status: 'Pending',
  });

  const [salaryId, setSalaryId] = useState('');
  const [salaryData, setSalaryData] = useState({
    teacherId: '',
    month: '',
    amount: '',
    status: 'Pending',
  });

  const [txId, setTxId] = useState('');
  const [transactionData, setTransactionData] = useState({
    title: '',
    finalAmount: '',
    category: 'Utility',
    status: 'Pending',
  });

  // Student Fee Handlers
  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        studentId: feeData.studentId,
        month: feeData.month,
        feeBreakdown: [
          {
            feeType: feeData.feeType,
            amount: Number(feeData.amount),
          },
        ],
      };
      if (feeData.title) payload.title = feeData.title;

      const res = await adminService.createStudentFee(payload);
      toast.success(res.message || 'Student fee record created!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeeStatus = async () => {
    if (!feeId) {
      toast.error('Enter Fee ID to update');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.updateStudentFeeStatus(feeId, feeData.status);
      toast.success(res.message || 'Fee status updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFee = async () => {
    if (!feeId) {
      toast.error('Enter Fee ID to delete');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.deleteStudentFee(feeId);
      toast.success(res.message || 'Fee record deleted successfully!');
      setFeeId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Teacher Salary Handlers
  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        teacherId: salaryData.teacherId,
        month: salaryData.month,
      };
      if (salaryData.amount) payload.amount = Number(salaryData.amount);

      const res = await adminService.createTeacherSalary(payload);
      toast.success(res.message || 'Teacher salary record created!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSalaryStatus = async () => {
    if (!salaryId) {
      toast.error('Enter Salary ID to update');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.updateTeacherSalaryStatus(salaryId, salaryData.status);
      toast.success(res.message || 'Salary status updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSalary = async () => {
    if (!salaryId) {
      toast.error('Enter Salary ID to delete');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.deleteTeacherSalary(salaryId);
      toast.success(res.message || 'Salary record deleted successfully!');
      setSalaryId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // General Transaction Handlers
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: transactionData.title,
        finalAmount: Number(transactionData.finalAmount),
        category: transactionData.category,
        status: transactionData.status,
      };
      const res = await adminService.createTransaction(payload);
      toast.success(res.message || 'Transaction recorded successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTx = async () => {
    if (!txId) {
      toast.error('Enter Transaction ID to delete');
      return;
    }
    setLoading(true);
    try {
      const res = await adminService.deleteTransaction(txId);
      toast.success(res.message || 'Transaction deleted successfully!');
      setTxId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Finance & Ledger Management</h1>
        <p className="text-muted-foreground text-xs">
          Manage student fees, teacher payroll salaries, and operational transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Tab A: Student Fees */}
        <Card>
          <CardHeader>
            <CardTitle>Student Fees</CardTitle>
            <CardDescription>Issue monthly fee records and update payment status.</CardDescription>
          </CardHeader>
          <form onSubmit={handleFeeSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  placeholder="STU12345678"
                  value={feeData.studentId}
                  onChange={(e) => setFeeData({ ...feeData, studentId: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeMonth">Month (MM-YYYY)</Label>
                <Input
                  id="feeMonth"
                  placeholder="08-2026"
                  value={feeData.month}
                  onChange={(e) => setFeeData({ ...feeData, month: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeTitle">Title (opt)</Label>
                <Input
                  id="feeTitle"
                  placeholder="Fee title"
                  value={feeData.title}
                  onChange={(e) => setFeeData({ ...feeData, title: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeType">Fee Breakdown Type</Label>
                <Input
                  id="feeType"
                  placeholder="Tuition Fee / Lab Fee"
                  value={feeData.feeType}
                  onChange={(e) => setFeeData({ ...feeData, feeType: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeAmount">Amount</Label>
                <Input
                  id="feeAmount"
                  type="number"
                  placeholder="e.g. 5000"
                  value={feeData.amount}
                  onChange={(e) => setFeeData({ ...feeData, amount: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="feeId">Fee Record ID (for update/delete)</Label>
                <Input
                  id="feeId"
                  placeholder="24-char ObjectId"
                  value={feeId}
                  onChange={(e) => setFeeId(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Create Student Fee'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleUpdateFeeStatus}
                disabled={loading}
                className="w-full"
              >
                Update Fee Status ({feeData.status})
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteFee}
                disabled={loading}
                className="w-full"
              >
                Delete Fee Record
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Tab B: Teacher Salaries */}
        <Card>
          <CardHeader>
            <CardTitle>Teacher Salary</CardTitle>
            <CardDescription>Issue monthly payroll salary disbursements.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSalarySubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teacherId">Teacher ID</Label>
                <Input
                  id="teacherId"
                  placeholder="TCH12345678"
                  value={salaryData.teacherId}
                  onChange={(e) => setSalaryData({ ...salaryData, teacherId: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salMonth">Month (MM-YYYY)</Label>
                <Input
                  id="salMonth"
                  placeholder="08-2026"
                  value={salaryData.month}
                  onChange={(e) => setSalaryData({ ...salaryData, month: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salAmount">Amount (opt)</Label>
                <Input
                  id="salAmount"
                  type="number"
                  placeholder="Defaults to salaryPerMonth"
                  value={salaryData.amount}
                  onChange={(e) => setSalaryData({ ...salaryData, amount: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salStatus">Status</Label>
                <Input
                  id="salStatus"
                  placeholder="Paid | Pending | Failed"
                  value={salaryData.status}
                  onChange={(e) => setSalaryData({ ...salaryData, status: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="salaryId">Salary Record ID (for update/delete)</Label>
                <Input
                  id="salaryId"
                  placeholder="24-char ObjectId"
                  value={salaryId}
                  onChange={(e) => setSalaryId(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : 'Create Teacher Salary'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleUpdateSalaryStatus}
                disabled={loading}
                className="w-full"
              >
                Update Salary Status ({salaryData.status})
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteSalary}
                disabled={loading}
                className="w-full"
              >
                Delete Salary Record
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Tab C: General Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>General Transactions</CardTitle>
            <CardDescription>
              Record utility, infrastructure, and operational expenses.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleTxSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="txTitle">Transaction Title</Label>
                <Input
                  id="txTitle"
                  placeholder="e.g. Electricity Bill August"
                  value={transactionData.title}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, title: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txAmount">Final Amount</Label>
                <Input
                  id="txAmount"
                  type="number"
                  placeholder="e.g. 12500"
                  value={transactionData.finalAmount}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, finalAmount: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txCategory">Category</Label>
                <Input
                  id="txCategory"
                  placeholder="Utility | Infrastructure | Other"
                  value={transactionData.category}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, category: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="txStatus">Status</Label>
                <Input
                  id="txStatus"
                  placeholder="Paid | Pending | Failed"
                  value={transactionData.status}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, status: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 pt-2">
                <Label htmlFor="txId">Transaction ID (for deletion)</Label>
                <Input
                  id="txId"
                  placeholder="24-char ObjectId"
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  disabled={loading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Recording...' : 'Record Transaction'}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteTx}
                disabled={loading}
                className="w-full"
              >
                Delete Transaction
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminFinance;
