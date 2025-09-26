"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, GraduationCap, BookOpen, Save, Eye } from "lucide-react"
import { useState } from "react"
import Link from "next/link"

export default function TimeTableEditPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Time Table",
      href: "/admin/time-table",
    },
    {
      label: "Edit",
    },
  ]

  // State management
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedDay, setSelectedDay] = useState<string>("")

  // Mock data based on API structure
  const [classes] = useState([
    { id: "dfgtr45", className: "03", section: "A", session: "2022-23" },
    { id: "dfgd45", className: "04", section: "A", session: "2022-23" },
    { id: "dfgd46", className: "05", section: "A", session: "2022-23" },
    { id: "dfgd47", className: "06", section: "B", session: "2022-23" },
  ])

  const [subjects] = useState([
    { subjectCode: "ENG001", subjectName: "English", teacherId: "HGVYH435", teacherName: "Prem Raj" },
    { subjectCode: "HIN001", subjectName: "Hindi", teacherId: "HGVYH435", teacherName: "Prem Raj" },
    { subjectCode: "MAT001", subjectName: "Mathematics", teacherId: "HGVYH436", teacherName: "Sita Devi" },
    { subjectCode: "SCI001", subjectName: "Science", teacherId: "HGVYH437", teacherName: "Ram Kumar" },
    { subjectCode: "SST001", subjectName: "Social Studies", teacherId: "HGVYH438", teacherName: "Gita Sharma" },
    { subjectCode: "PE001", subjectName: "Physical Education", teacherId: "HGVYH439", teacherName: "Mohan Singh" },
    { subjectCode: "CS001", subjectName: "Computer Science", teacherId: "HGVYH440", teacherName: "Tech Teacher" },
  ])

  const [timeTableData, setTimeTableData] = useState([
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
  ])

  // Get unique class-section combinations for dropdown
  const classOptions = classes.map((c) => ({
    value: `${c.className}-${c.section}`,
    label: `Class ${c.className} - Section ${c.section}`,
    className: c.className,
    section: c.section,
  }))

  const weekdays = [
    { value: "Mon", label: "Monday" },
    { value: "Tue", label: "Tuesday" },
    { value: "Wed", label: "Wednesday" },
    { value: "Thu", label: "Thursday" },
    { value: "Fri", label: "Friday" },
  ]

  // Get selected class data
  const selectedClassData = selectedClass
    ? timeTableData.find((data) => {
        const [className, section] = selectedClass.split("-")
        return data.className === className && data.section === section
      })
    : null

  // Get selected day data
  const selectedDayData =
    selectedClassData && selectedDay ? selectedClassData.timetable.find((d) => d.weekday === selectedDay) : null

  // Get all periods (assuming max 5 periods)
  const periods = [1, 2, 3, 4, 5]

  // Handle subject change for a specific period
  const handleSubjectChange = (period: number, subjectCode: string) => {
    if (!selectedClass || !selectedDay) return

    const subject = subjects.find((s) => s.subjectCode === subjectCode)
    if (!subject) return

    console.log("[v0] Updating time table:", {
      className: selectedClass.split("-")[0],
      section: selectedClass.split("-")[1],
      weekday: selectedDay,
      period,
      subjectCode,
      teacherId: subject.teacherId,
    })

    // Update local state
    setTimeTableData((prev) =>
      prev.map((classData) => {
        const [className, section] = selectedClass.split("-")
        if (classData.className === className && classData.section === section) {
          return {
            ...classData,
            timetable: classData.timetable.map((dayData) => {
              if (dayData.weekday === selectedDay) {
                const updatedSubjects = [...dayData.subjects]
                const existingIndex = updatedSubjects.findIndex((s) => s.period === period)

                const newSubject = {
                  period,
                  subject: subject.subjectName,
                  subjectCode: subject.subjectCode,
                  teacherName: subject.teacherName,
                  teacherId: subject.teacherId,
                }

                if (existingIndex >= 0) {
                  updatedSubjects[existingIndex] = newSubject
                } else {
                  updatedSubjects.push(newSubject)
                }

                return {
                  ...dayData,
                  subjects: updatedSubjects.sort((a, b) => a.period - b.period),
                }
              }
              return dayData
            }),
          }
        }
        return classData
      }),
    )
  }

  const handleSaveTimeTable = () => {
    if (!selectedClass || !selectedDay) return

    console.log("[v0] Saving time table for:", {
      class: selectedClass,
      day: selectedDay,
      periods: selectedDayData?.subjects.length || 0,
    })
    // API call to save time table
  }

  // Calculate statistics
  const totalClasses = classOptions.length
  const totalSubjects = subjects.length
  const periodsScheduled = selectedDayData?.subjects.length || 0

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Edit Time Table</h1>
            <p className="text-muted-foreground mt-2">Modify class schedules and assign subjects to periods</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/time-table">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Time Table
              </Button>
            </Link>
            <Button onClick={handleSaveTimeTable} disabled={!selectedClass || !selectedDay}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
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
              <CardTitle className="text-sm font-medium">Available Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalSubjects}</div>
              <p className="text-xs text-muted-foreground">To assign</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected Day</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{selectedDay || "None"}</div>
              <p className="text-xs text-muted-foreground">{periodsScheduled} periods scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Periods per Day</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{periods.length}</div>
              <p className="text-xs text-muted-foreground">Maximum periods</p>
            </CardContent>
          </Card>
        </div>

        {/* Selection Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Class & Day Selection
            </CardTitle>
            <CardDescription>Select class, section, and day to edit the time table</CardDescription>
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
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Select Day</label>
                <Select value={selectedDay} onValueChange={setSelectedDay} disabled={!selectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a day" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekdays.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period Assignment Table */}
        {selectedClass && selectedDay && selectedDayData ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Period Assignment - {selectedClass?.replace("-", " Section ")} (
                {weekdays.find((d) => d.value === selectedDay)?.label})
              </CardTitle>
              <CardDescription>Assign subjects to each period for the selected day</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Period</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject Code</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((period) => {
                    const currentSubject = selectedDayData.subjects.find((s) => s.period === period)
                    return (
                      <TableRow key={period}>
                        <TableCell>
                          <Badge variant="outline" className="w-full justify-center">
                            {period}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={currentSubject?.subjectCode || ""}
                            onValueChange={(value) => handleSubjectChange(period, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject.subjectCode} value={subject.subjectCode}>
                                  {subject.subjectName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {currentSubject ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{currentSubject.teacherName}</Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {currentSubject ? (
                            <Badge variant="outline">{currentSubject.subjectCode}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Select Class and Day</h3>
              <p className="text-muted-foreground">
                Choose a class, section, and day from the dropdowns above to start editing the time table.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
