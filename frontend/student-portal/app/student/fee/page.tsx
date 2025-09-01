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
  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
      <div>
        <div className="text-3xl font-bold text-center tracking-wide text-black dark:text-white">
          School Fee
        </div>
      </div>
      <div className="max-w-full w-xl overflow-x-auto p-4 ">
        <TableDemo />
        {/* <DialogDemo /> */}
      </div>
    </div>
  );
}

const invoices = [
  {
    id: "sdfhsd4357-1",
    month: "02-2024",
    finalAmount: "200.00",
    isPaid: false,
  },
  {
    id: "sdfhsd4357-2",
    month: "03-2024",
    finalAmount: "200.00",
    isPaid: true,
  },
  {
    id: "sdfhsd4357-3",
    month: "04-2024",
    finalAmount: "200.00",
    isPaid: true,
  },
];

// ✅ Reusable Dialog for showing invoice details
function FeeDetailDialog({ invoiceId }: { invoiceId: string }) {
  // Example data (you can later fetch this by invoiceId)
  const invoice = {
    id: "sdfhsd4357",
    firstName: "Prem",
    lastName: "Raj",
    className: "02",
    section: "A",
    rollNo: 3,
    month: "04-2024",
    session: "2024-25",
    breakDown: [
      { feeType: "Tuition", amount: 180.0 },
      { feeType: "Admission", amount: 20.0 },
    ],
    finalAmount: "200.00",
    isPaid: true,
  };

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
              ][parseInt(invoice.month.split("-")[0], 10) - 1]
            }
            , {invoice.month.split("-")[1]}</span> ({invoice.session})
          </DialogDescription>
        </DialogHeader>

        {/* Student Details */}
        <div className="grid gap-2 text-sm border-b pb-2">
          <div className="flex justify-between">
            <span>Student:</span>
            <span>
              {invoice.firstName} {invoice.lastName}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Class / Section:</span>
            <span>
              {invoice.className}-{invoice.section}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Roll No:</span>
            <span>{invoice.rollNo}</span>
          </div>
          <div className="flex justify-between">
            <span>Invoice ID:</span>
            <span>{invoice.id}</span>
          </div>
        </div>

        {/* Fee Breakdown */}
        <div className="mt-3">
          <h4 className="font-medium mb-2">Fee Breakdown</h4>
          <div className="space-y-1">
            {invoice.breakDown.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.feeType}</span>
                <span>₹{item.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Final Status */}
        <div className="grid gap-3 text-sm mt-3">
          <div className="flex justify-between">
            <span>Status:</span>
            <span
              className={invoice.isPaid ? "text-green-600" : "text-red-600"}
            >
              {invoice.isPaid ? "Paid" : "Not Paid"}
            </span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Final Amount:</span>
            <span>₹{invoice.finalAmount}</span>
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
export function TableDemo() {
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
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell>
              {`${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(invoice.month.split("-")[0], 10) - 1]}, ${invoice.month.split("-")[1]}`}
            </TableCell>
            <TableCell className="text-center">
              {invoice.isPaid ? (
                <span className="font-semibold text-xs px-4 py-1 border rounded-full bg-green-300/20">
                  Paid
                </span>
              ) : (
                <span className="font-semibold text-xs px-4 py-1 border rounded-full bg-red-300/40">
                  Not Paid
                </span>
              )}
            </TableCell>
            <TableCell className="text-right">₹{invoice.finalAmount}</TableCell>
            <TableCell className="flex items-center justify-end cursor-pointer">
              {/* 🔗 Hook Dialog with this invoice */}
              <FeeDetailDialog invoiceId={invoice.id} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">₹600.00</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
