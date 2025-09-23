"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Users, CheckCircle, XCircle, Filter, Eye, UserCheck } from 'lucide-react'
import { useState } from "react"

export default function ClassAttendanceViewPage() {
  const items = [
    {
      label: "Teacher",
      href: "/teacher",
    },
    {
      label: "Class Attendance",
      href: "/teacher/class-attendance"
    },
    {
      label: "View"
    }
  ]

  // Mock data based on the provided structure
  const attendanceData = {
    id: "5435dfgdsf",
    date: "01-02-2024",
    className: "05",
    section: "A",
    students: [
      {
        id: "dfgrdt5345",
        rollNo: 1,
        firstName: "Prem",
        lastName: "Raj",
        studentId: "MAC002",
        status: "Present"
      },
      {
        id: "dfgrdt5346",
        rollNo: 2,
        firstName: "Rahul",
        lastName: "Kumar",
        studentId: "MAC003",
        status: "Present"
      },
      {
        id: "dfgrdt5347",
        rollNo: 3,
        firstName: "Priya",
        lastName: "Singh",
        studentId: "MAC004",
        status: "Absent"
      },
      {
        id: "dfgrdt5348",
        rollNo: 4,
        firstName: "Amit",
        lastName: "Sharma",
        studentId: "MAC005",
        status: "Present"
      },
      {
        id: "dfgrdt5349",
        rollNo: 5,
        firstName: "Sneha",
        lastName: "Patel",
        studentId: "MAC006",
        status: "Absent"
      }
    ],
    isMarked: false
  }

  const [selectedClass, setSelectedClass] = useState("05")
  const [selectedSection, setSelectedSection] = useState("A")
  const [selectedDate, setSelectedDate] = useState("01-02-2024")

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split("-")
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  // Calculate statistics
  const totalStudents = attendanceData.students.length
  const presentStudents = attendanceData.students.filter(student => student.status === "Present").length
  const absentStudents = totalStudents - presentStudents
  const attendancePercentage = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0

  const handleMarkAttendance = () => {
    // This would typically navigate to mark attendance page or open a modal
    console.log(`Marking attendance for class ${attendanceData.className}-${attendanceData.section} on ${attendanceData.date}`)
  }

  const handleViewAttendance = (studentId: string) => {
    // This would typically navigate to detailed student attendance view
    console.log(`Viewing attendance details for student ID: ${studentId}`)
  }

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Class Attendance View</h1>
          <p className="text-muted-foreground mt-2">View and manage student attendance for today's classes</p>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{attendancePercentage}%</div>
              <p className="text-xs text-muted-foreground">Students present</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present Students</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentStudents}</div>
              <p className="text-xs text-muted-foreground">Out of {totalStudents} students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent Students</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absentStudents}</div>
              <p className="text-xs text-muted-foreground">Students absent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">In this class</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Attendance
            </CardTitle>
            <CardDescription>Select date, class, and section to view attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Date</label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01-02-2024">{formatDate("01-02-2024")}</SelectItem>
                    <SelectItem value="02-02-2024">{formatDate("02-02-2024")}</SelectItem>
                    <SelectItem value="03-02-2024">{formatDate("03-02-2024")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="05">Class 05</SelectItem>
                    <SelectItem value="06">Class 06</SelectItem>
                    <SelectItem value="07">Class 07</SelectItem>
                    <SelectItem value="08">Class 08</SelectItem>
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
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Info and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Class {attendanceData.className} - Section {attendanceData.section}
                </CardTitle>
                <CardDescription>
                  Attendance for {formatDate(attendanceData.date)} • {attendanceData.students.length} students
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {!attendanceData.isMarked && (
                  <Button onClick={handleMarkAttendance} className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Mark Attendance
                  </Button>
                )}
                <Button variant="outline" className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Students Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Student Attendance
            </CardTitle>
            <CardDescription>
              Individual attendance status for all students in the class
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.rollNo}</TableCell>
                    <TableCell>
                      <div className="font-medium">{student.firstName} {student.lastName}</div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{student.studentId}</span>
                    </TableCell>
                    <TableCell>
                      {student.status === "Present" ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Present
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                          <XCircle className="w-3 h-3 mr-1" />
                          Absent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewAttendance(student.id)}
                          className="h-8"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {!attendanceData.isMarked && (
                          <Button 
                            size="sm" 
                            onClick={() => console.log(`Mark attendance for ${student.firstName}`)}
                            className="h-8"
                          >
                            <UserCheck className="w-3 h-3 mr-1" />
                            Mark
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
