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

export const AdminFinance: React.FC = () => {
  const [feeData, setFeeData] = useState({
    studentId: '',
    month: '',
    title: '',
    feeType: 'Tuition Fee',
    amount: '',
    status: 'Pending',
  });

  const [salaryData, setSalaryData] = useState({
    teacherId: '',
    month: '',
    amount: '',
    status: 'Pending',
  });

  const [transactionData, setTransactionData] = useState({
    title: '',
    finalAmount: '',
    category: 'Utility',
    status: 'Pending',
  });

  const handleFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create Student Fee:', feeData);
  };

  const handleSalarySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create Teacher Salary:', salaryData);
  };

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create General Transaction:', transactionData);
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeTitle">Title (opt)</Label>
                <Input
                  id="feeTitle"
                  placeholder="Fee title"
                  value={feeData.title}
                  onChange={(e) => setFeeData({ ...feeData, title: e.target.value })}
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
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <Button type="submit" className="w-full">
                Create Student Fee
              </Button>
              <Button type="button" variant="outline" className="w-full">
                Update Fee Status
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salStatus">Status</Label>
                <Input
                  id="salStatus"
                  placeholder="Paid | Pending | Failed"
                  value={salaryData.status}
                  onChange={(e) => setSalaryData({ ...salaryData, status: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <Button type="submit" className="w-full">
                Create Teacher Salary
              </Button>
              <Button type="button" variant="outline" className="w-full">
                Update Salary Status
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Tab C: General Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>General Transactions</CardTitle>
            <CardDescription>
              Record utility, infrastructure, and other operational expenses.
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
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 pt-4">
              <Button type="submit" className="w-full">
                Record Transaction
              </Button>
              <Button type="button" variant="destructive" className="w-full">
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
