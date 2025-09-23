import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as UiTable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, CheckCircle, DollarSign, Table as LucideTable, TrendingUp, XCircle } from "lucide-react";
import React from "react";

export default function page() {
  const items = [
    {
      label: "Teacher",
      href: "/teacher"
    },
    {
      label: "salary",
    },
  ];
  // Mock data based on the provided structure
  const salaryData = [
    { month: "04-2024", amount: 4000.0, isPaid: true, paidAt: "02-04-2024" },
    { month: "05-2024", amount: 4000.0, isPaid: true, paidAt: "02-05-2024" },
    { month: "06-2024", amount: 4000.0, isPaid: true, paidAt: "02-06-2024" },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split("-")
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const formatMonth = (monthString: string) => {
    const [month, year] = monthString.split("-")
    return new Date(`${year}-${month}-01`).toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    })
  }

  // Calculate totals
  const totalExpected = salaryData.reduce((sum, record) => sum + record.amount, 0)
  const totalPaid = salaryData.filter((record) => record.isPaid).reduce((sum, record) => sum + record.amount, 0)
  const totalUnpaid = totalExpected - totalPaid
  const paidCount = salaryData.filter((record) => record.isPaid).length
  const unpaidCount = salaryData.length - paidCount

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Salary Management</h1>
          <p className="text-muted-foreground mt-2">Track monthly salary payments and financial overview</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalExpected)}</div>
              <p className="text-xs text-muted-foreground">{salaryData.length} months total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
              <p className="text-xs text-muted-foreground">{paidCount} payments completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Unpaid</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalUnpaid)}</div>
              <p className="text-xs text-muted-foreground">{unpaidCount} payments pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round((paidCount / salaryData.length) * 100)}%</div>
              <p className="text-xs text-muted-foreground">On-time payment rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Salary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Monthly Salary Records
            </CardTitle>
            <CardDescription>Detailed breakdown of monthly salary payments and status</CardDescription>
          </CardHeader>
          <CardContent>
            <UiTable>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salaryData.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{formatMonth(record.month)}</TableCell>
                    <TableCell>
                      <span className="font-semibold">{formatCurrency(record.amount)}</span>
                    </TableCell>
                    <TableCell>
                      {record.isPaid ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Unpaid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.isPaid && record.paidAt ? (
                        <span className="text-sm text-muted-foreground">{formatDate(record.paidAt)}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </UiTable>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
