"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Users, CheckCircle, XCircle, BookOpen, Save, Edit } from "lucide-react"
import { useState } from "react"

export default function ClassAttendanceEditPage() {
  const items = [
    {
      label: "Teacher",
      href: "/teacher",
    },
    {
      label: "Class Attendance",
      href: "/teacher/class-attendance",
    },
    {
      label: "Edit",
    },
  ]

  // Form state
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedSection, setSelectedSection] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [showStudentTable, setShowStudentTable] = useState(false)

  // Mock student data
  const [students, setStudents] = useState([
    {
      id: "dfgrdt5345",
      rollNo: 1,
      firstName: "Prem",
      lastName: "Raj",
      studentId: "MAC002",
      status: "Present" as "Present" | "Absent",
    },
    {
      id: "dfgrdt5346",
      rollNo: 2,
      firstName: "Rahul",
      lastName: "Kumar",
      studentId: "MAC003",
      status: "Present" as "Present" | "Absent",
    },
    {
      id: "dfgrdt5347",
      rollNo: 3,
      firstName: "Priya",
      lastName: "Singh",
      studentId: "MAC004",
      status: "Absent" as "Present" | "Absent",
    },
    {
      id: "dfgrdt5348",
      rollNo: 4,
      firstName: "Amit",
      lastName: "Sharma",
      studentId: "MAC005",
      status: "Present" as "Present" | "Absent",
    },
    {
      id: "dfgrdt5349",
      rollNo: 5,
      firstName: "Sneha",
      lastName: "Patel",
      studentId: "MAC006",
      status: "Absent" as "Present" | "Absent",
    },
  ])

  const handleFormChange = () => {
    if (selectedClass && selectedSection && selectedDate) {
      setShowStudentTable(true)
    } else {
      setShowStudentTable(false)
    }
  }

  const toggleAttendance = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId
          ? { ...student, status: student.status === "Present" ? "Absent" : "Present" }
          : student,
      ),
    )
  }

  const handleSubmit = () => {
    const attendanceData = {
      date: selectedDate,
      className: selectedClass,
      section: selectedSection,
      attendance: students.map((student) => ({
        studentId: student.studentId,
        status: student.status,
      })),
    }
    console.log("Submitting attendance:", attendanceData)
    // Here you would typically send the data to your API
  }

  // Calculate statistics
  const totalStudents = students.length
  const presentStudents = students.filter((student) => student.status === "Present").length
  const absentStudents = totalStudents - presentStudents
  const attendancePercentage = totalStudents > 0 ? Math.round((presentStudents / totalStudents) * 100) : 0

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
        <div>
          <h1 className="text-3xl font-bold text-balance">Mark Class Attendance</h1>
          <p className="text-muted-foreground mt-2">Create or edit attendance records for your classes</p>
        </div>

        {/* Form Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Attendance Details
            </CardTitle>
            <CardDescription>Select class, section, date, and period to mark attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Date *</label>
                <Select
                  value={selectedDate}
                  onValueChange={(value) => {
                    setSelectedDate(value)
                    handleFormChange()
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01-02-2024">{formatDate("01-02-2024") || "1 Feb 2024"}</SelectItem>
                    <SelectItem value="02-02-2024">{formatDate("02-02-2024") || "2 Feb 2024"}</SelectItem>
                    <SelectItem value="03-02-2024">{formatDate("03-02-2024") || "3 Feb 2024"}</SelectItem>
                    <SelectItem value="04-02-2024">{formatDate("04-02-2024") || "4 Feb 2024"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Class *</label>
                <Select
                  value={selectedClass}
                  onValueChange={(value) => {
                    setSelectedClass(value)
                    handleFormChange()
                  }}
                >
                  <SelectTrigger>
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
                <label className="text-sm font-medium">Section *</label>
                <Select
                  value={selectedSection}
                  onValueChange={(value) => {
                    setSelectedSection(value)
                    handleFormChange()
                  }}
                >
                  <SelectTrigger>
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

        {showStudentTable && (
          <>
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
                  <CheckCircle className="h-4 w-4 text-green-600" />
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

            {/* Class Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Class {selectedClass} - Section {selectedSection}
                </CardTitle>
                <CardDescription>
                  {formatDate(selectedDate) || selectedDate} •{" "}
                  {totalStudents} students
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Students Attendance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Mark Student Attendance
                </CardTitle>
                <CardDescription>Click on the status badges to toggle attendance for each student</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Attendance Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.rollNo}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">{student.studentId}</span>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAttendance(student.id)}
                            className="p-0 h-auto"
                          >
                            {student.status === "Present" ? (
                              <Badge
                                variant="default"
                                className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Present
                              </Badge>
                            ) : (
                              <Badge
                                variant="destructive"
                                className="bg-red-100 text-red-800 hover:bg-red-200 cursor-pointer"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Absent
                              </Badge>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSubmit} size="lg" className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Submit Attendance
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
