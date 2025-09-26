"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Users, CheckCircle, XCircle, UserCheck, Edit } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function TeacherAttendanceViewPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Teacher Attendance",
      href: "/admin/teacher-attendance",
    },
    {
      label: "View",
    },
  ]

  // Form state
  const [selectedDate, setSelectedDate] = useState("")
  const [showTeacherTable, setShowTeacherTable] = useState(false)

  // Mock teacher data
  const [teachers] = useState([
    {
      id: "dfgrdt5345",
      firstName: "Prem",
      lastName: "Raj",
      teacherId: "MAC002",
      status: "Present" as "Present" | "Absent",
    },
    {
      id: "dfgrdt5346",
      firstName: "Rahul",
      lastName: "Kumar",
      teacherId: "MAC003",
      status: "Present" as "Present" | "Absent",
    },
    {
      id: "dfgrdt5347",
      firstName: "Priya",
      lastName: "Singh",
      teacherId: "MAC004",
      status: "Absent" as "Present" | "Absent",
    },
    {
      id: "dfgrdt5348",
      firstName: "Amit",
      lastName: "Sharma",
      teacherId: "MAC005",
      status: "Present" as "Present" | "Absent",
    },
    {
      id: "dfgrdt5349",
      firstName: "Sneha",
      lastName: "Patel",
      teacherId: "MAC006",
      status: "Absent" as "Present" | "Absent",
    },
  ])

  const handleDateChange = (value: string) => {
    setSelectedDate(value)
    setShowTeacherTable(!!value)
  }

  // Calculate statistics
  const totalTeachers = teachers.length
  const presentTeachers = teachers.filter((teacher) => teacher.status === "Present").length
  const absentTeachers = totalTeachers - presentTeachers
  const attendancePercentage = totalTeachers > 0 ? Math.round((presentTeachers / totalTeachers) * 100) : 0

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const [day, month, year] = dateString.split("-")
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">View Teacher Attendance</h1>
            <p className="text-muted-foreground mt-2">View teacher attendance records for a specific date</p>
          </div>
          <Button asChild>
            <Link href="/admin/teacher-attendance/edit">
              <Edit className="w-4 h-4 mr-2" />
              Edit Attendance
            </Link>
          </Button>
        </div>

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Date
            </CardTitle>
            <CardDescription>Choose a date to view teacher attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 max-w-xs">
              <label className="text-sm font-medium">Date *</label>
              <Select value={selectedDate} onValueChange={handleDateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01-04-2024">{formatDate("01-04-2024") || "1 Apr 2024"}</SelectItem>
                  <SelectItem value="02-04-2024">{formatDate("02-04-2024") || "2 Apr 2024"}</SelectItem>
                  <SelectItem value="03-04-2024">{formatDate("03-04-2024") || "3 Apr 2024"}</SelectItem>
                  <SelectItem value="04-04-2024">{formatDate("04-04-2024") || "4 Apr 2024"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {showTeacherTable && (
          <>
            {/* Attendance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{attendancePercentage}%</div>
                  <p className="text-xs text-muted-foreground">Teachers present</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Teachers</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{presentTeachers}</div>
                  <p className="text-xs text-muted-foreground">Out of {totalTeachers} teachers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent Teachers</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{absentTeachers}</div>
                  <p className="text-xs text-muted-foreground">Teachers absent</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalTeachers}</div>
                  <p className="text-xs text-muted-foreground">In the school</p>
                </CardContent>
              </Card>
            </div>

            {/* Date Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Teacher Attendance - {formatDate(selectedDate) || selectedDate}
                </CardTitle>
                <CardDescription>
                  {totalTeachers} teachers • {presentTeachers} present • {absentTeachers} absent • Read-only view
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Teachers Attendance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Teacher Attendance Records
                </CardTitle>
                <CardDescription>View-only attendance status for all teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teacher Name</TableHead>
                      <TableHead>Teacher ID</TableHead>
                      <TableHead>Attendance Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <div className="font-medium">
                            {teacher.firstName} {teacher.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{teacher.teacherId}</span>
                        </TableCell>
                        <TableCell>
                          {teacher.status === "Present" ? (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Present
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              <XCircle className="w-3 h-3 mr-1" />
                              Absent
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
