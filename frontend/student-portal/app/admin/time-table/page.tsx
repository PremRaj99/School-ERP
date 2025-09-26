"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, GraduationCap, BookOpen, Users, Edit } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function TimeTableViewPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Time Table",
    },
  ]

  // State management
  const [selectedClass, setSelectedClass] = useState<string>("")

  // Mock data based on API structure
  const [classes] = useState([
    { id: "dfgtr45", className: "03", section: "A", session: "2022-23" },
    { id: "dfgd45", className: "04", section: "A", session: "2022-23" },
    { id: "dfgd46", className: "05", section: "A", session: "2022-23" },
    { id: "dfgd47", className: "06", section: "B", session: "2022-23" },
  ])

  const [timeTableData] = useState([
    {
      className: "03",
      section: "A",
      timetable: [
        {
          weekday: "Mon",
          subjects: [
            { period: 1, subject: "English", subjectCode: "ENG001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            { period: 2, subject: "Hindi", subjectCode: "HIN001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            {
              period: 3,
              subject: "Mathematics",
              subjectCode: "MAT001",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
            { period: 4, subject: "Science", subjectCode: "SCI001", teacherName: "Ram Kumar", teacherId: "HGVYH437" },
            {
              period: 5,
              subject: "Social Studies",
              subjectCode: "SST001",
              teacherName: "Gita Sharma",
              teacherId: "HGVYH438",
            },
          ],
        },
        {
          weekday: "Tue",
          subjects: [
            {
              period: 1,
              subject: "Mathematics",
              subjectCode: "MAT001",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
            { period: 2, subject: "English", subjectCode: "ENG001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            { period: 3, subject: "Science", subjectCode: "SCI001", teacherName: "Ram Kumar", teacherId: "HGVYH437" },
            { period: 4, subject: "Hindi", subjectCode: "HIN001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            {
              period: 5,
              subject: "Physical Education",
              subjectCode: "PE001",
              teacherName: "Mohan Singh",
              teacherId: "HGVYH439",
            },
          ],
        },
        {
          weekday: "Wed",
          subjects: [
            { period: 1, subject: "Science", subjectCode: "SCI001", teacherName: "Ram Kumar", teacherId: "HGVYH437" },
            {
              period: 2,
              subject: "Mathematics",
              subjectCode: "MAT001",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
            { period: 3, subject: "English", subjectCode: "ENG001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            {
              period: 4,
              subject: "Social Studies",
              subjectCode: "SST001",
              teacherName: "Gita Sharma",
              teacherId: "HGVYH438",
            },
            { period: 5, subject: "Hindi", subjectCode: "HIN001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
          ],
        },
        {
          weekday: "Thu",
          subjects: [
            { period: 1, subject: "Hindi", subjectCode: "HIN001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            { period: 2, subject: "Science", subjectCode: "SCI001", teacherName: "Ram Kumar", teacherId: "HGVYH437" },
            {
              period: 3,
              subject: "Social Studies",
              subjectCode: "SST001",
              teacherName: "Gita Sharma",
              teacherId: "HGVYH438",
            },
            {
              period: 4,
              subject: "Mathematics",
              subjectCode: "MAT001",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
            { period: 5, subject: "English", subjectCode: "ENG001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
          ],
        },
        {
          weekday: "Fri",
          subjects: [
            {
              period: 1,
              subject: "Social Studies",
              subjectCode: "SST001",
              teacherName: "Gita Sharma",
              teacherId: "HGVYH438",
            },
            {
              period: 2,
              subject: "Physical Education",
              subjectCode: "PE001",
              teacherName: "Mohan Singh",
              teacherId: "HGVYH439",
            },
            { period: 3, subject: "Hindi", subjectCode: "HIN001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            { period: 4, subject: "English", subjectCode: "ENG001", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            {
              period: 5,
              subject: "Mathematics",
              subjectCode: "MAT001",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
          ],
        },
      ],
    },
    {
      className: "04",
      section: "A",
      timetable: [
        {
          weekday: "Mon",
          subjects: [
            { period: 1, subject: "English", subjectCode: "ENG004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            {
              period: 2,
              subject: "Mathematics",
              subjectCode: "MAT004",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
            { period: 3, subject: "Science", subjectCode: "SCI004", teacherName: "Ram Kumar", teacherId: "HGVYH437" },
            {
              period: 4,
              subject: "Social Studies",
              subjectCode: "SST004",
              teacherName: "Gita Sharma",
              teacherId: "HGVYH438",
            },
            { period: 5, subject: "Hindi", subjectCode: "HIN004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
          ],
        },
        {
          weekday: "Tue",
          subjects: [
            {
              period: 1,
              subject: "Mathematics",
              subjectCode: "MAT004",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
            { period: 2, subject: "Science", subjectCode: "SCI004", teacherName: "Ram Kumar", teacherId: "HGVYH437" },
            { period: 3, subject: "English", subjectCode: "ENG004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            { period: 4, subject: "Hindi", subjectCode: "HIN004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            {
              period: 5,
              subject: "Computer Science",
              subjectCode: "CS004",
              teacherName: "Tech Teacher",
              teacherId: "HGVYH440",
            },
          ],
        },
        {
          weekday: "Wed",
          subjects: [
            { period: 1, subject: "Science", subjectCode: "SCI004", teacherName: "Ram Kumar", teacherId: "HGVYH437" },
            { period: 2, subject: "English", subjectCode: "ENG004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            {
              period: 3,
              subject: "Mathematics",
              subjectCode: "MAT004",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
            {
              period: 4,
              subject: "Social Studies",
              subjectCode: "SST004",
              teacherName: "Gita Sharma",
              teacherId: "HGVYH438",
            },
            { period: 5, subject: "Hindi", subjectCode: "HIN004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
          ],
        },
        {
          weekday: "Thu",
          subjects: [
            { period: 1, subject: "Hindi", subjectCode: "HIN004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            {
              period: 2,
              subject: "Mathematics",
              subjectCode: "MAT004",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
            {
              period: 3,
              subject: "Social Studies",
              subjectCode: "SST004",
              teacherName: "Gita Sharma",
              teacherId: "HGVYH438",
            },
            { period: 4, subject: "Science", subjectCode: "SCI004", teacherName: "Ram Kumar", teacherId: "HGVYH437" },
            { period: 5, subject: "English", subjectCode: "ENG004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
          ],
        },
        {
          weekday: "Fri",
          subjects: [
            {
              period: 1,
              subject: "Social Studies",
              subjectCode: "SST004",
              teacherName: "Gita Sharma",
              teacherId: "HGVYH438",
            },
            {
              period: 2,
              subject: "Computer Science",
              subjectCode: "CS004",
              teacherName: "Tech Teacher",
              teacherId: "HGVYH440",
            },
            { period: 3, subject: "Hindi", subjectCode: "HIN004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            { period: 4, subject: "English", subjectCode: "ENG004", teacherName: "Prem Raj", teacherId: "HGVYH435" },
            {
              period: 5,
              subject: "Mathematics",
              subjectCode: "MAT004",
              teacherName: "Sita Devi",
              teacherId: "HGVYH436",
            },
          ],
        },
      ],
    },
  ])

  // Get unique class-section combinations for dropdown
  const classOptions = classes.map((c) => ({
    value: `${c.className}-${c.section}`,
    label: `Class ${c.className} - Section ${c.section}`,
    className: c.className,
    section: c.section,
  }))

  // Get selected class data
  const selectedClassData = selectedClass
    ? timeTableData.find((data) => {
        const [className, section] = selectedClass.split("-")
        return data.className === className && data.section === section
      })
    : null

  // Get all periods (assuming max 5 periods)
  const periods = [1, 2, 3, 4, 5]
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"]

  // Calculate statistics
  const totalClasses = classOptions.length
  const totalSubjects = selectedClassData
    ? [...new Set(selectedClassData.timetable.flatMap((day) => day.subjects.map((s) => s.subject)))].length
    : 0
  const totalTeachers = selectedClassData
    ? [...new Set(selectedClassData.timetable.flatMap((day) => day.subjects.map((s) => s.teacherId)))].length
    : 0

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Weekly Time Table</h1>
            <p className="text-muted-foreground mt-2">View class schedules and weekly routines</p>
          </div>
          <Link href="/admin/time-table/edit">
            <Button>
              <Edit className="w-4 h-4 mr-2" />
              Edit Time Table
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalClasses}</div>
              <p className="text-xs text-muted-foreground">Available classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalSubjects}</div>
              <p className="text-xs text-muted-foreground">In selected class</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalTeachers}</div>
              <p className="text-xs text-muted-foreground">Teaching this class</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Periods per Day</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{periods.length}</div>
              <p className="text-xs text-muted-foreground">Daily schedule</p>
            </CardContent>
          </Card>
        </div>

        {/* Class Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Class Selection
            </CardTitle>
            <CardDescription>Select a class to view its weekly time table</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Select Class & Section</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class and section" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Table Grid */}
        {selectedClassData ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Time Table - {selectedClass?.replace("-", " Section ")}
              </CardTitle>
              <CardDescription>Complete weekly schedule with subjects and teachers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Day</TableHead>
                      {periods.map((period) => (
                        <TableHead key={period} className="text-center min-w-32">
                          Period {period}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weekdays.map((day) => {
                      const dayData = selectedClassData.timetable.find((d) => d.weekday === day)
                      return (
                        <TableRow key={day}>
                          <TableCell className="font-medium">
                            <Badge variant="outline" className="w-full justify-center">
                              {day}
                            </Badge>
                          </TableCell>
                          {periods.map((period) => {
                            const subject = dayData?.subjects.find((s) => s.period === period)
                            return (
                              <TableCell key={period} className="text-center p-2">
                                {subject ? (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">{subject.subject}</div>
                                    <div className="text-xs text-muted-foreground">{subject.teacherName}</div>
                                    <Badge variant="secondary" className="text-xs">
                                      {subject.subjectCode}
                                    </Badge>
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground text-sm">-</div>
                                )}
                              </TableCell>
                            )
                          })}
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Select a Class</h3>
              <p className="text-muted-foreground">
                Choose a class and section from the dropdown above to view its weekly time table.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
