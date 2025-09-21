"use client";

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StudentTransactionService from "@/services/student/transaction";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";

export default function page() {
  const items = [
    {
      href: "/student",
      label: "Student",
    },
    {
      label: "Fee",
    },
  ];
   const {
    data: feesData,
    error,
    isPending,
  } = useQuery({
    queryKey: ["fee"],
    queryFn: () => StudentTransactionService.studentFee("2025-2026"),
  })

  if (isPending) {
    return <>Loading...</>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-500">
          Failed to load fee. Please try again later.
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
      <div>
        <div className="text-3xl font-bold text-center tracking-wide text-black dark:text-white">
          School Fee
        </div>
      </div>
      <div className="max-w-full w-xl overflow-x-auto p-4 ">
        <TableDemo feesData={feesData} />
        {/* <DialogDemo /> */}
      </div>
    </div>
  );
}

// const invoices = [
//   {
//     id: "sdfhsd4357-1",
//     month: "02-2024",
//     finalAmount: "200.00",
//     isPaid: false,
//   },
//   {
//     id: "sdfhsd4357-2",
//     month: "03-2024",
//     finalAmount: "200.00",
//     isPaid: true,
//   },
//   {
//     id: "sdfhsd4357-3",
//     month: "04-2024",
//     finalAmount: "200.00",
//     isPaid: true,
//   },
// ];

// ✅ Reusable Dialog for showing invoice details

function FeeDetailDialog({ feeId }: { feeId: string }) {

  const {
    data: feeData,
    error,
    isPending,
  } = useQuery({
    queryKey: ["fee", feeId],
    queryFn: () => StudentTransactionService.studentFeeDetail(feeId),
  })

  if (isPending) {
    return <>Loading...</>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-500">
          Failed to load fee detail. Please try again later.
        </span>
      </div>
    );
  }
  // Example data (you can later fetch this by invoiceId)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Eye className="h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            Breakdown of fee for{" "}
            <span className="font-semibold">{
              [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ][parseInt(feeData.data.month.split("-")[0], 10) - 1]
            }
            , {feeData.data.month.split("-")[1]}</span> ({feeData.data.session})
          </DialogDescription>
        </DialogHeader>

        {/* Student Details */}
        <div className="grid gap-2 text-sm border-b pb-2">
          <div className="flex justify-between">
            <span>Student:</span>
            <span>
              {feeData.data.firstName} {feeData.data.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Class / Section:</span>
            <span>
              {feeData.data.className}-{feeData.data.section}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Roll No:</span>
            <span>{feeData.data.rollNo}</span>
          </div>
          <div className="flex justify-between">
            <span>Invoice ID:</span>
            <span>{feeData.data.id}</span>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="mt-3">
          <h4 className="font-medium mb-2">Fee Breakdown</h4>
          <div className="space-y-1">
            {feeData.data.breakDown.map(
              (item: { feeType: string; amount: number }, idx: number) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.feeType}</span>
                  <span>₹{item.amount.toFixed(2)}</span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Final Status */}
        <div className="grid gap-3 text-sm mt-3">
          <div className="flex justify-between">
            <span>Status:</span>
            <span
              className={feeData.data.isPaid ? "text-green-600" : "text-red-600"}
            >
              {feeData.data.isPaid ? "Paid" : "Not Paid"}
            </span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Final Amount:</span>
            <span>₹{feeData.data.finalAmount}</span>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ✅ Table Component
type Fee = {
  id: string;
  month: string;
  finalAmount: string;
  isPaid: boolean;
};

export function TableDemo({ feesData }: { feesData: any }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {(feesData as {data: Fee[]} && feesData.data.length > 0) ? feesData.data.map((fee: Fee) => (
          <TableRow key={fee.id}>
            <TableCell>
              {`${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(fee.month.split("-")[0], 10) - 1]}, ${fee.month.split("-")[1]}`}
            </TableCell>
            <TableCell className="text-center">
              {fee.isPaid ? (
                <span className="font-semibold text-xs px-4 py-1 border rounded-full bg-green-300/20">
                  Paid
                </span>
              ) : (
                <span className="font-semibold text-xs px-4 py-1 border rounded-full bg-red-300/40">
                  Not Paid
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">₹{fee.finalAmount}</TableCell>
            <TableCell className="flex items-center justify-end cursor-pointer">
              {/* 🔗 Hook Dialog with this invoice */}
              <FeeDetailDialog feeId={fee.id} />
            </TableCell>
          </TableRow>
        )) : (
          <TableRow>
            <TableCell colSpan={4} className="text-center py-6">
              No Data Found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">
            ₹{feesData && feesData.data
              ? feesData.data.reduce(
                  (sum: number, fee: Fee) => sum + parseFloat(fee.finalAmount),
                  0
                ).toFixed(2)
              : "0.00"}
          </TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
