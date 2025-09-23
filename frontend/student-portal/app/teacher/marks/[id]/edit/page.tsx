"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Users, Save, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { useState } from "react"

export default function MarksEditPage() {
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
      label: "edit",
    },
  ]

  // Filter states
  const [selectedClass, setSelectedClass] = useState("04")
  const [selectedSection, setSelectedSection] = useState("A")
  const [selectedExam, setSelectedExam] = useState("Mid Sem")
  const [selectedSubject, setSelectedSubject] = useState("English")

  // Mock exam and subject data
  const examData = {
    id: "jfhgsdj45",
    dateFrom: "02-04-2024",
    dateTo: "01-04-2024",
    title: "Mid Sem",
    className: "04",
    section: "A",
    subjectCode: "ENG01",
    subjectName: "English",
    fullMarks: 60,
    isMarked: false, // false for new entry, true for editing
  }

  // Student marks state - can be empty for new entry or populated for editing
  const [studentMarks, setStudentMarks] = useState([
    {
      id: "sjdhegfsdj435", // empty for new entry
      studentId: "dfhgd4543",
      firstName: "Prem",
      lastName: "Raj",
      rollNo: 1,
      marksObtained: 58,
      remark: "Excellent performance",
    },
    {
      id: "fsfew4323",
      studentId: "dfhgd4544",
      firstName: "Anita",
      lastName: "Sharma",
      rollNo: 2,
      marksObtained: 52,
      remark: "Good work",
    },
    {
      id: "fsfew4324",
      studentId: "dfhgd4545",
      firstName: "Rahul",
      lastName: "Kumar",
      rollNo: 3,
      marksObtained: 45,
      remark: "Satisfactory",
    },
    {
      id: "fsfew4325",
      studentId: "dfhgd4546",
      firstName: "Priya",
      lastName: "Singh",
      rollNo: 4,
      marksObtained: 55,
      remark: "Very good",
    },
    {
      id: "fsfew4326",
      studentId: "dfhgd4547",
      firstName: "Amit",
      lastName: "Patel",
      rollNo: 5,
      marksObtained: 38,
      remark: "Needs improvement",
    },
    {
      id: "fsfew4327",
      studentId: "dfhgd4548",
      firstName: "Sneha",
      lastName: "Gupta",
      rollNo: 6,
      marksObtained: 60,
      remark: "Outstanding",
    },
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate grade based on marks
  const calculateGrade = (marks: number, fullMarks: number) => {
    const percentage = (marks / fullMarks) * 100
    if (percentage >= 90) return "A+"
    if (percentage >= 80) return "A"
    if (percentage >= 70) return "B+"
    if (percentage >= 60) return "B"
    if (percentage >= 50) return "C+"
    if (percentage >= 40) return "C"
    return "F"
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
      case "C+":
        return "bg-purple-100 text-purple-800"
      case "C":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-red-100 text-red-800"
    }
  }

  // Update marks for a specific student
  const updateStudentMarks = (index: number, field: string, value: string | number) => {
    const updatedMarks = [...studentMarks]
    updatedMarks[index] = {
      ...updatedMarks[index],
      [field]: field === "marksObtained" ? Number(value) : value,
    }
    setStudentMarks(updatedMarks)
  }

  // Calculate statistics
  const totalStudents = studentMarks.length
  const totalMarksEntered = studentMarks.filter(
    (mark) => mark.marksObtained !== null && mark.marksObtained !== undefined,
  ).length
  const averageMarks =
    totalMarksEntered > 0
      ? Math.round(studentMarks.reduce((sum, mark) => sum + (mark.marksObtained || 0), 0) / totalMarksEntered)
      : 0
  const highestMarks = studentMarks.length > 0 ? Math.max(...studentMarks.map((mark) => mark.marksObtained || 0)) : 0

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const [day, month, year] = dateString.split("-")
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // Prepare data for API
    const marksData = studentMarks.map((mark) => ({
      ...(mark.id && { id: mark.id }), // Include id for update, exclude for create
      studentId: mark.studentId,
      marksObtained: mark.marksObtained,
      remark: mark.remark,
    }))

    console.log("[v0] Submitting marks data:", marksData)

    // Mock API call
    setTimeout(() => {
      console.log("[v0] Marks saved successfully")
      setIsSubmitting(false)
      // In real app, redirect to view page or show success message
    }, 2000)
  }

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              {examData.isMarked ? "Edit Marks Entry" : "Add Marks Entry"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {examData.isMarked
                ? "Update marks for students in the selected exam and subject"
                : "Enter marks for students in the selected exam and subject"}
            </p>
          </div>
          <Badge variant={examData.isMarked ? "secondary" : "default"}>
            {examData.isMarked ? "Edit Mode" : "Create Mode"}
          </Badge>
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
              <p className="text-xs text-muted-foreground">Students in class</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marks Entered</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalMarksEntered}</div>
              <p className="text-xs text-muted-foreground">Out of {totalStudents}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Marks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{averageMarks}</div>
              <p className="text-xs text-muted-foreground">Out of {examData.fullMarks}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{highestMarks}</div>
              <p className="text-xs text-muted-foreground">Best performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Form Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Exam Selection
            </CardTitle>
            <CardDescription>Select class, section, exam name, and subject to enter marks</CardDescription>
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
                <p className="text-lg font-semibold">{examData.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Subject</p>
                <p className="text-lg font-semibold">
                  {examData.subjectName} ({examData.subjectCode})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Full Marks</p>
                <p className="text-lg font-semibold">{examData.fullMarks}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Exam Period</p>
                <p className="text-lg font-semibold">
                  {formatDate(examData.dateFrom)} - {formatDate(examData.dateTo)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Marks Entry Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Student Marks Entry ({studentMarks.length})
            </CardTitle>
            <CardDescription>
              Enter marks for all students in Class {examData.className} - Section {examData.section}
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
                {studentMarks.map((mark, index) => {
                  const grade = calculateGrade(mark.marksObtained || 0, examData.fullMarks)
                  const percentage = Math.round(((mark.marksObtained || 0) / examData.fullMarks) * 100)

                  return (
                    <TableRow key={mark.studentId}>
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
                          <Input
                            type="number"
                            min="0"
                            max={examData.fullMarks}
                            value={mark.marksObtained || ""}
                            onChange={(e) => updateStudentMarks(index, "marksObtained", e.target.value)}
                            className="w-20"
                            placeholder="0"
                          />
                          <div className="text-xs text-muted-foreground">out of {examData.fullMarks}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getGradeColor(grade)}>{grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{percentage}%</span>
                      </TableCell>
                      <TableCell>
                        <Textarea
                          value={mark.remark || ""}
                          onChange={(e) => updateStudentMarks(index, "remark", e.target.value)}
                          placeholder="Enter remarks..."
                          className="min-h-[60px] resize-none"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isSubmitting ? "Saving..." : examData.isMarked ? "Update Marks" : "Save Marks"}
          </Button>
        </div>
      </div>
    </div>
  )
}
