"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Users, Download, GraduationCap, Trophy, Target, Calendar } from "lucide-react"
import { useState } from "react"

export default function MarksViewPage() {
  const items = [
    {
      label: "Teacher",
      href: "/teacher",
    },
    {
      label: "marks",
      href: "/teacher/marks",
    },
    {
      label: "view",
    },
  ]

  // Filter states
  const [selectedClass, setSelectedClass] = useState("04")
  const [selectedSection, setSelectedSection] = useState("A")
  const [selectedExam, setSelectedExam] = useState("Mid Sem")
  const [selectedSubject, setSelectedSubject] = useState("English")

  // Mock result data based on the provided structure
  const resultData = {
    id: "jfhgsdj45",
    dateFrom: "02-04-2024",
    dateTo: "01-04-2024",
    title: "Mid Sem",
    className: "4",
    section: "A",
    subjectCode: "ENG01",
    subjectName: "English",
    fullMarks: 60,
    isMarked: true,
    marks: [
      {
        id: "sjdhegfsdj435",
        studentId: "dfhgd4543",
        firstName: "Prem",
        lastName: "Raj",
        date: "01-04-2024",
        rollNo: 1,
        marksObtained: 58,
        grade: "A+",
        remark: "Excellent performance",
      },
      {
        id: "fsfew4323",
        studentId: "dfhgd4544",
        firstName: "Anita",
        lastName: "Sharma",
        date: "01-04-2024",
        rollNo: 2,
        marksObtained: 52,
        grade: "A",
        remark: "Good work",
      },
      {
        id: "fsfew4324",
        studentId: "dfhgd4545",
        firstName: "Rahul",
        lastName: "Kumar",
        date: "01-04-2024",
        rollNo: 3,
        marksObtained: 45,
        grade: "B+",
        remark: "Satisfactory",
      },
      {
        id: "fsfew4325",
        studentId: "dfhgd4546",
        firstName: "Priya",
        lastName: "Singh",
        date: "01-04-2024",
        rollNo: 4,
        marksObtained: 55,
        grade: "A",
        remark: "Very good",
      },
      {
        id: "fsfew4326",
        studentId: "dfhgd4547",
        firstName: "Amit",
        lastName: "Patel",
        date: "01-04-2024",
        rollNo: 5,
        marksObtained: 38,
        grade: "B",
        remark: "Needs improvement",
      },
      {
        id: "fsfew4327",
        studentId: "dfhgd4548",
        firstName: "Sneha",
        lastName: "Gupta",
        date: "01-04-2024",
        rollNo: 6,
        marksObtained: 60,
        grade: "A+",
        remark: "Outstanding",
      },
    ],
  }

  // Calculate statistics
  const totalStudents = resultData.marks.length
  const averageMarks = Math.round(resultData.marks.reduce((sum, mark) => sum + mark.marksObtained, 0) / totalStudents)
  const highestMarks = Math.max(...resultData.marks.map((mark) => mark.marksObtained))
  const passedStudents = resultData.marks.filter((mark) => mark.marksObtained >= resultData.fullMarks * 0.4).length

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const [day, month, year] = dateString.split("-")
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
        return "bg-green-100 text-green-800"
      case "A":
        return "bg-blue-100 text-blue-800"
      case "B+":
        return "bg-yellow-100 text-yellow-800"
      case "B":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownload = () => {
    // Mock download functionality
    console.log("Downloading marks report...")
    // In a real application, this would generate and download a PDF or Excel file
  }

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Marks Entry List View</h1>
            <p className="text-muted-foreground mt-2">View detailed marks for students in selected exam and subject</p>
          </div>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Students evaluated</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{averageMarks}</div>
              <p className="text-xs text-muted-foreground">Out of {resultData.fullMarks}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
              <Trophy className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{highestMarks}</div>
              <p className="text-xs text-muted-foreground">Best performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.round((passedStudents / totalStudents) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">{passedStudents} students passed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Filter Selection
            </CardTitle>
            <CardDescription>Select class, section, exam name, and subject to view marks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="04">Class 04</SelectItem>
                    <SelectItem value="05">Class 05</SelectItem>
                    <SelectItem value="06">Class 06</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Section</label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
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

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Exam Name</label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mid Sem">Mid Sem</SelectItem>
                    <SelectItem value="End Sem">End Sem</SelectItem>
                    <SelectItem value="Unit Test">Unit Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Exam Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exam Title</p>
                <p className="text-lg font-semibold">{resultData.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <p className="text-lg font-semibold">
                  {resultData.subjectName} ({resultData.subjectCode})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Marks</p>
                <p className="text-lg font-semibold">{resultData.fullMarks}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exam Period</p>
                <p className="text-lg font-semibold">
                  {formatDate(resultData.dateFrom)} - {formatDate(resultData.dateTo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Marks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Student Marks ({resultData.marks.length})
            </CardTitle>
            <CardDescription>
              Detailed marks for all students in Class {resultData.className} - Section {resultData.section}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Marks Obtained</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultData.marks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell>
                      <span className="font-medium">{mark.rollNo}</span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {mark.firstName} {mark.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">ID: {mark.studentId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-semibold text-lg">{mark.marksObtained}</div>
                        <div className="text-sm text-muted-foreground">out of {resultData.fullMarks}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getGradeColor(mark.grade)}>{mark.grade}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {Math.round((mark.marksObtained / resultData.fullMarks) * 100)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{mark.remark}</span>
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
