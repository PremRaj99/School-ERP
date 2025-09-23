"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Users, CheckCircle, XCircle, Calendar, Edit, Eye, GraduationCap } from "lucide-react"
import { useState, useMemo, useEffect } from "react"

export default function MarksEntryPage() {
  const items = [
    {
      label: "Teacher",
      href: "/teacher",
    },
    {
      label: "marks",
    },
  ]

  // Filter states
  const [selectedExam, setSelectedExam] = useState("All exams")
  const [selectedClass, setSelectedClass] = useState("All classes")
  const [selectedSection, setSelectedSection] = useState("All sections")
  const [selectedSubject, setSelectedSubject] = useState("All subjects")

  // Mock exam data based on the provided structure
  const examData = [
    {
      id: "jfhgsdj45",
      className: "04",
      section: "A",
      dateFrom: "02-04-2024",
      dateTo: "01-04-2024",
      title: "Mid Sem",
      isResultDecleared: false,
      subjects: [
        {
          id: "dsfjhds543",
          subjectName: "English",
          subjectCode: "ENG01",
          date: "01-04-2024",
          fullMarks: 60,
          isMarked: false,
        },
        {
          id: "dsfjhds544",
          subjectName: "Mathematics",
          subjectCode: "MATH01",
          date: "02-04-2024",
          fullMarks: 80,
          isMarked: true,
        },
        {
          id: "dsfjhds545",
          subjectName: "Science",
          subjectCode: "SCI01",
          date: "03-04-2024",
          fullMarks: 70,
          isMarked: false,
        },
      ],
    },
    {
      id: "dfjg4586",
      className: "04",
      section: "A",
      dateFrom: "02-05-2024",
      dateTo: "01-05-2024",
      title: "End Sem",
      isResultDecleared: true,
      subjects: [
        {
          id: "dsfjhds546",
          subjectName: "English",
          subjectCode: "ENG01",
          date: "01-05-2024",
          fullMarks: 60,
          isMarked: true,
        },
        {
          id: "dsfjhds547",
          subjectName: "Mathematics",
          subjectCode: "MATH01",
          date: "02-05-2024",
          fullMarks: 80,
          isMarked: true,
        },
      ],
    },
    {
      id: "exam003",
      className: "05",
      section: "B",
      dateFrom: "15-04-2024",
      dateTo: "20-04-2024",
      title: "Unit Test",
      isResultDecleared: false,
      subjects: [
        {
          id: "dsfjhds548",
          subjectName: "Hindi",
          subjectCode: "HIN01",
          date: "15-04-2024",
          fullMarks: 50,
          isMarked: false,
        },
        {
          id: "dsfjhds549",
          subjectName: "Social Studies",
          subjectCode: "SS01",
          date: "16-04-2024",
          fullMarks: 60,
          isMarked: true,
        },
      ],
    },
  ]

  // Get unique values for filters
  const examNames = [...new Set(examData.map((exam) => exam.title))]
  const classNames = [...new Set(examData.map((exam) => exam.className))]
  const sections = [...new Set(examData.map((exam) => exam.section))]

  // Filter exam data based on selected filters
  const filteredExams = useMemo(() => {
    return examData.filter((exam) => {
      const matchesExam = selectedExam === "All exams" || exam.title === selectedExam
      const matchesClass = selectedClass === "All classes" || exam.className === selectedClass
      const matchesSection = selectedSection === "All sections" || exam.section === selectedSection

      if (selectedSubject === "All subjects") {
        return matchesExam && matchesClass && matchesSection
      }

      const hasSubject = exam.subjects.some((subject) => subject.subjectName === selectedSubject)
      return matchesExam && matchesClass && matchesSection && hasSubject
    })
  }, [selectedExam, selectedClass, selectedSection, selectedSubject, examData])

  // Get all subjects from filtered exams
  const availableSubjects = useMemo(() => {
    const subjects = new Set<string>()
    filteredExams.forEach((exam) => {
      exam.subjects.forEach((subject) => {
        subjects.add(subject.subjectName)
      })
    })
    return Array.from(subjects)
  }, [filteredExams])

  // Flatten exam subjects for table display
  const examSubjects = useMemo(() => {
    const subjects: Array<{
      examId: string
      examTitle: string
      className: string
      section: string
      dateFrom: string
      dateTo: string
      isResultDecleared: boolean
      subject: {
        id: string
        subjectName: string
        subjectCode: string
        date: string
        fullMarks: number
        isMarked: boolean
      }
    }> = []

    filteredExams.forEach((exam) => {
      exam.subjects.forEach((subject) => {
        if (selectedSubject === "All subjects" || subject.subjectName === selectedSubject) {
          subjects.push({
            examId: exam.id,
            examTitle: exam.title,
            className: exam.className,
            section: exam.section,
            dateFrom: exam.dateFrom,
            dateTo: exam.dateTo,
            isResultDecleared: exam.isResultDecleared,
            subject,
          })
        }
      })
    })

    return subjects
  }, [filteredExams, selectedSubject])

  // Calculate statistics
  const totalExamSubjects = examSubjects.length
  const markedSubjects = examSubjects.filter((item) => item.subject.isMarked).length
  const pendingSubjects = totalExamSubjects - markedSubjects
  const completionRate = totalExamSubjects > 0 ? Math.round((markedSubjects / totalExamSubjects) * 100) : 0

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
          <h1 className="text-3xl font-bold text-balance">Marks Entry View</h1>
          <p className="text-muted-foreground mt-2">View and manage exam marks for completed assessments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Marks entered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Marked Subjects</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{markedSubjects}</div>
              <p className="text-xs text-muted-foreground">Completed assessments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Subjects</CardTitle>
              <XCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingSubjects}</div>
              <p className="text-xs text-muted-foreground">Awaiting marks entry</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExamSubjects}</div>
              <p className="text-xs text-muted-foreground">Exam subjects</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Filter Exams
            </CardTitle>
            <CardDescription>Filter exams by name, class, section, and subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Exam Name</label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="All exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All exams">All exams</SelectItem>
                    {examNames.map((exam) => (
                      <SelectItem key={exam} value={exam}>
                        {exam}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="All classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All classes">All classes</SelectItem>
                    {classNames.map((className) => (
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
                  <SelectTrigger>
                    <SelectValue placeholder="All sections" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All sections">All sections</SelectItem>
                    {sections.map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All subjects">All subjects</SelectItem>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exam Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Exam Subjects ({examSubjects.length})
            </CardTitle>
            <CardDescription>View and manage marks for completed exam subjects</CardDescription>
          </CardHeader>
          <CardContent>
            {examSubjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No exam subjects found matching your filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Details</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam Date</TableHead>
                    <TableHead>Full Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examSubjects.map((item, index) => (
                    <TableRow key={`${item.examId}-${item.subject.id}-${index}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.examTitle}</div>
                          <div className="text-sm text-muted-foreground">
                            Class {item.className} - Section {item.section}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(item.dateFrom)} to {formatDate(item.dateTo)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{item.subject.subjectName}</div>
                          <div className="text-sm text-muted-foreground">{item.subject.subjectCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {formatDate(item.subject.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{item.subject.fullMarks}</span>
                      </TableCell>
                      <TableCell>
                        {item.subject.isMarked ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Marked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.subject.isMarked ? (
                            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          ) : (
                            <Button variant="default" size="sm" className="flex items-center gap-1">
                              <Edit className="w-3 h-3" />
                              Mark
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
