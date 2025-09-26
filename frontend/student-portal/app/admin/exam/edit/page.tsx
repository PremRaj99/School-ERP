"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Save, BookOpen, GraduationCap } from "lucide-react"
import { useState } from "react"

export default function ExamEditPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Exam",
      href: "/admin/exam",
    },
    {
      label: "Edit",
    },
  ]

  // State management
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [selectedSection, setSelectedSection] = useState<string>("")
  const [examTitle, setExamTitle] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Mock data based on API structure
  const [classes] = useState([
    { id: "dfgtr45", className: "03", section: "A", session: "2022-23" },
    { id: "dfgd45", className: "04", section: "A", session: "2022-23" },
    { id: "dfgd46", className: "05", section: "A", session: "2022-23" },
    { id: "dfgd47", className: "06", section: "B", session: "2022-23" },
  ])

  const [teachers] = useState([
    { id: "t001", firstName: "John", lastName: "Smith", teacherId: "TCH001" },
    { id: "t002", firstName: "Sarah", lastName: "Johnson", teacherId: "TCH002" },
    { id: "t003", firstName: "Michael", lastName: "Brown", teacherId: "TCH003" },
    { id: "t004", firstName: "Emily", lastName: "Davis", teacherId: "TCH004" },
  ])

  const [subjectsData] = useState([
    {
      className: "04",
      subjects: [
        { subjectCode: "ENG004", subjectName: "English" },
        { subjectCode: "MAT004", subjectName: "Mathematics" },
        { subjectCode: "SCI004", subjectName: "Science" },
        { subjectCode: "SST004", subjectName: "Social Studies" },
        { subjectCode: "HIN004", subjectName: "Hindi" },
      ],
    },
    {
      className: "05",
      subjects: [
        { subjectCode: "ENG005", subjectName: "English" },
        { subjectCode: "MAT005", subjectName: "Mathematics" },
        { subjectCode: "PHY005", subjectName: "Physics" },
        { subjectCode: "CHE005", subjectName: "Chemistry" },
        { subjectCode: "BIO005", subjectName: "Biology" },
      ],
    },
    {
      className: "06",
      subjects: [
        { subjectCode: "ENG006", subjectName: "English" },
        { subjectCode: "MAT006", subjectName: "Mathematics" },
        { subjectCode: "PHY006", subjectName: "Physics" },
        { subjectCode: "CHE006", subjectName: "Chemistry" },
        { subjectCode: "COM006", subjectName: "Computer Science" },
      ],
    },
  ])

  // State for exam subjects configuration
  const [examSubjects, setExamSubjects] = useState<
    Array<{
      subjectCode: string
      subjectName: string
      date: string
      fullMarks: number
      teacherId: string
    }>
  >([])

  // Get unique class names and sections
  const uniqueClasses = [...new Set(classes.map((c) => c.className))].sort()
  const availableSections = classes
    .filter((c) => c.className === selectedClass)
    .map((c) => c.section)
    .filter((section, index, self) => self.indexOf(section) === index)

  // Get subjects for selected class
  const selectedClassSubjects = selectedClass
    ? subjectsData.find((data) => data.className === selectedClass)?.subjects || []
    : []

  // Initialize exam subjects when class changes
  const handleClassChange = (className: string) => {
    setSelectedClass(className)
    setSelectedSection("")
    const classSubjects = subjectsData.find((data) => data.className === className)?.subjects || []
    setExamSubjects(
      classSubjects.map((subject) => ({
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        date: "",
        fullMarks: 100,
        teacherId: "",
      })),
    )
  }

  const updateExamSubject = (subjectCode: string, field: string, value: string | number) => {
    setExamSubjects((prev) =>
      prev.map((subject) => (subject.subjectCode === subjectCode ? { ...subject, [field]: value } : subject)),
    )
  }

  const handleSaveExam = () => {
    if (!selectedClass || !selectedSection || !examTitle || !dateFrom || !dateTo) {
      alert("Please fill in all required fields")
      return
    }

    const examData = {
      dateFrom,
      dateTo,
      title: examTitle,
      exams: [
        {
          className: selectedClass,
          section: selectedSection,
          subjects: examSubjects.map((subject) => ({
            subjectCode: subject.subjectCode,
            date: subject.date,
            fullMarks: subject.fullMarks,
          })),
        },
      ],
      isResultDecleared: false,
    }

    console.log("[v0] Saving exam:", examData)
    // API call to create/update exam
  }

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Not Assigned"
  }

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Create/Edit Exam</h1>
            <p className="text-muted-foreground mt-2">Configure exam details and subject-wise full marks</p>
          </div>
          <Button onClick={handleSaveExam} disabled={!selectedClass || !selectedSection || !examTitle}>
            <Save className="w-4 h-4 mr-2" />
            Save Exam
          </Button>
        </div>

        {/* Exam Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Exam Information
            </CardTitle>
            <CardDescription>Set up basic exam details and class selection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="exam-title">Exam Title *</Label>
                <Input
                  id="exam-title"
                  placeholder="e.g., Mid Semester Examination"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="date-from">Start Date *</Label>
                <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="date-to">End Date *</Label>
                <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="class-select">Select Class *</Label>
                <Select value={selectedClass} onValueChange={handleClassChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueClasses.map((className) => (
                      <SelectItem key={className} value={className}>
                        Class {className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="section-select">Select Section *</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSections.map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subject Configuration */}
        {selectedClass && selectedSection && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Subject Configuration for Class {selectedClass} - {selectedSection}
              </CardTitle>
              <CardDescription>
                Set full marks, exam dates, and assign teachers for each subject ({examSubjects.length} subjects)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Exam Date</TableHead>
                    <TableHead>Full Marks</TableHead>
                    <TableHead>Assigned Teacher</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examSubjects.map((subject) => (
                    <TableRow key={subject.subjectCode}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {subject.subjectCode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{subject.subjectName}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="date"
                          value={subject.date}
                          onChange={(e) => updateExamSubject(subject.subjectCode, "date", e.target.value)}
                          className="w-40"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          max="200"
                          value={subject.fullMarks}
                          onChange={(e) =>
                            updateExamSubject(subject.subjectCode, "fullMarks", Number.parseInt(e.target.value) || 0)
                          }
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={subject.teacherId}
                          onValueChange={(value) => updateExamSubject(subject.subjectCode, "teacherId", value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Assign teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.firstName} {teacher.lastName} ({teacher.teacherId})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {examSubjects.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No subjects available</h3>
                  <p className="text-muted-foreground">Select a class and section to configure exam subjects.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {selectedClass && selectedSection && examSubjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Exam Summary
              </CardTitle>
              <CardDescription>Review exam configuration before saving</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Exam Title</label>
                  <p className="text-lg font-semibold">{examTitle || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Class & Section</label>
                  <p className="text-lg">
                    Class {selectedClass} - {selectedSection}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Subjects</label>
                  <p className="text-lg font-semibold text-blue-600">{examSubjects.length}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Marks</label>
                  <p className="text-lg font-semibold text-green-600">
                    {examSubjects.reduce((sum, subject) => sum + subject.fullMarks, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
