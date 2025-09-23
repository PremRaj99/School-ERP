"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Users, CheckCircle, XCircle, Filter, BookOpen } from "lucide-react"
import { useState } from "react"

export default function ClassAttendancePage() {
  const items = [
    {
      label: "Teacher",
      href: "/teacher",
    },
    {
      label: "Class Attendance",
    },
  ]

  // Mock data based on the provided structure
  const classAttendanceData = [
    {
      id: "5435dfgdsf",
      date: "01-02-2024",
      className: "05",
      section: "A",
      isMarked: false,
    },
    {
      id: "5435dfgdsf2",
      date: "01-02-2024",
      className: "06",
      section: "A",
      isMarked: false,
    },
    {
      id: "5435dfgdsf3",
      date: "01-02-2024",
      className: "07",
      section: "A",
      isMarked: false,
    },
    {
      id: "5435dfgdsf4",
      date: "02-02-2024",
      className: "05",
      section: "A",
      isMarked: true,
    },
    {
      id: "5435dfgdsf5",
      date: "02-02-2024",
      className: "06",
      section: "A",
      isMarked: true,
    },
    {
      id: "5435dfgdsf6",
      date: "02-02-2024",
      className: "07",
      section: "A",
      isMarked: false,
    },
  ]

  const [selectedClass, setSelectedClass] = useState("all")
  const [selectedSection, setSelectedSection] = useState("all")
  const [selectedDate, setSelectedDate] = useState("all")

  // Get unique values for filters
  const uniqueClasses = [...new Set(classAttendanceData.map((item) => item.className))].sort()
  const uniqueSections = [...new Set(classAttendanceData.map((item) => item.section))].sort()
  const uniqueDates = [...new Set(classAttendanceData.map((item) => item.date))].sort()

  // Filter data based on selected filters
  const filteredData = classAttendanceData.filter((item) => {
    return (
      (selectedClass === "all" || item.className === selectedClass) &&
      (selectedSection === "all" || item.section === selectedSection) &&
      (selectedDate === "all" || item.date === selectedDate)
    )
  })

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split("-")
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Calculate statistics
  const totalClasses = filteredData.length
  const markedClasses = filteredData.filter((item) => item.isMarked).length
  const unmarkedClasses = totalClasses - markedClasses
  const completionPercentage = totalClasses > 0 ? Math.round((markedClasses / totalClasses) * 100) : 0

  const handleMarkAttendance = (id: string) => {
    // This would typically make an API call to mark attendance
    console.log(`Marking attendance for class ID: ${id}`)
  }

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Class Attendance Management</h1>
          <p className="text-muted-foreground mt-2">Mark and track attendance for different classes and sections</p>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
              <p className="text-xs text-muted-foreground">Attendance marked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marked Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{markedClasses}</div>
              <p className="text-xs text-muted-foreground">Attendance completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Classes</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{unmarkedClasses}</div>
              <p className="text-xs text-muted-foreground">Attendance pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClasses}</div>
              <p className="text-xs text-muted-foreground">Classes assigned</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Classes
            </CardTitle>
            <CardDescription>Select class, section, and date to filter attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {uniqueClasses.map((className) => (
                      <SelectItem key={className} value={className}>
                        Class {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sections</SelectItem>
                    {uniqueSections.map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Date</label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    {uniqueDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {formatDate(date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Class Attendance Records
            </CardTitle>
            <CardDescription>
              {filteredData.length > 0
                ? `Showing ${filteredData.length} class${filteredData.length !== 1 ? "es" : ""}`
                : "No classes found with the selected filters"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{formatDate(record.date)}</TableCell>
                      <TableCell>
                        <span className="font-medium">Class {record.className}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">Section {record.section}</span>
                      </TableCell>
                      <TableCell>
                        {record.isMarked ? (
                          <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Marked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                            <XCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!record.isMarked && (
                          <Button size="sm" onClick={() => handleMarkAttendance(record.id)} className="h-8">
                            Mark Attendance
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No classes found with the selected filters.</p>
                <p className="text-sm">Try adjusting your filter criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
