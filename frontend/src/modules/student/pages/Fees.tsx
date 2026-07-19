import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { studentService } from '../services/studentService';
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
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Loader2, Receipt } from 'lucide-react';

interface TransactionItem {
  id: string;
  month: string;
  transaction?: { title: string; finalAmount: number; status: string };
}

export default function Fees() {
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [selectedFeeId, setSelectedFeeId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch list of fee receipts / transactions
  const { data: transactions, isLoading: loadingTxns } = useQuery({
    queryKey: ['student', 'transactions', selectedYear],
    queryFn: () => studentService.getTransactions(selectedYear),
  });

  // Fetch breakdown details for selected transaction
  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['student', 'transaction-detail', selectedFeeId],
    queryFn: () => studentService.getTransactionDetail(selectedFeeId!),
    enabled: !!selectedFeeId,
  });

  const handleOpenDetail = (id: string) => {
    setSelectedFeeId(id);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fees & Payments</h2>
          <p className="text-muted-foreground">
            Monitor payment histories, pending fees, and transaction details.
          </p>
        </div>

        <div className="bg-background flex items-center gap-4 rounded-lg border p-3">
          <Label htmlFor="year-select" className="text-sm font-medium whitespace-nowrap">
            Filter Year:
          </Label>
          <Input
            id="year-select"
            type="number"
            className="w-28"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2">
          <Receipt className="h-5 w-5 text-blue-600" />
          <div>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View processed transaction details for {selectedYear}.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTxns ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              No payments registered for this year.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill Month</TableHead>
                    <TableHead>Receipt Title</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx: TransactionItem) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-semibold">
                        {tx.month?.split('T')[0]?.slice(0, 7)}
                      </TableCell>
                      <TableCell>{tx.transaction?.title || 'Monthly Fee'}</TableCell>
                      <TableCell>${tx.transaction?.finalAmount}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            tx.transaction?.status === 'Paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {tx.transaction?.status || 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDetail(tx.id)}>
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fee Breakdown dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Fee Receipt Breakdown</DialogTitle>
            <DialogDescription>
              Itemized billing information for this transaction.
            </DialogDescription>
          </DialogHeader>

          {loadingDetail ? (
            <div className="flex justify-center p-8">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : !detail ? (
            <div className="text-muted-foreground py-8 text-center">Error loading details.</div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Fee Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.feeBreakdown?.map(
                      (item: { id: string; feeType: string; amount: number }) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.feeType}</TableCell>
                          <TableCell className="text-right">${item.amount}</TableCell>
                        </TableRow>
                      ),
                    )}
                    <TableRow className="bg-muted/30 border-t font-bold">
                      <TableCell>Total Billing</TableCell>
                      <TableCell className="text-right">
                        ${detail.transaction?.finalAmount}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="text-muted-foreground flex items-center justify-between border-t pt-3 text-xs">
                <span>Receipt Ref: {detail.transaction?.id}</span>
                <span>Date: {detail.transaction?.createdAt?.split('T')[0]}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
