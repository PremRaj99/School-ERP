"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { CalendarDays, Download, Eye, Trophy, TrendingUp, FileText, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery } from "@tanstack/react-query"
import StudentExamService from "@/services/student/exam"
import StudentResultService from "@/services/student/result"

// Mock data for exams and results
// const examData = [
//   {
//     id: 1,
//     title: "Mid-Term Examination",
//     date: "2024-03-15",
//     isResultDeclared: true,
//     grade: "A+",
//     rank: 2,
//     totalMarks: 500,
//     obtainedMarks: 485,
//     percentage: 97,
//     subjects: [
//       { name: "Mathematics", marks: 98, totalMarks: 100, grade: "A+", remark: "Excellent problem-solving skills" },
//       { name: "Physics", marks: 95, totalMarks: 100, grade: "A+", remark: "Strong conceptual understanding" },
//       { name: "Chemistry", marks: 97, totalMarks: 100, grade: "A+", remark: "Outstanding practical work" },
//       { name: "English", marks: 92, totalMarks: 100, grade: "A", remark: "Good writing and comprehension" },
//       { name: "Computer Science", marks: 103, totalMarks: 100, grade: "A+", remark: "Exceptional programming skills" },
//     ],
//   },
//   {
//     id: 2,
//     title: "Unit Test - 1",
//     date: "2024-02-10",
//     isResultDeclared: true,
//     grade: "A",
//     rank: 5,
//     totalMarks: 300,
//     obtainedMarks: 275,
//     percentage: 91.7,
//     subjects: [
//       { name: "Mathematics", marks: 88, totalMarks: 100, grade: "A", remark: "Good analytical approach" },
//       { name: "Physics", marks: 92, totalMarks: 100, grade: "A+", remark: "Clear understanding of concepts" },
//       { name: "Chemistry", marks: 95, totalMarks: 100, grade: "A+", remark: "Excellent lab performance" },
//     ],
//   },
//   {
//     id: 3,
//     title: "Final Examination",
//     date: "2024-04-20",
//     isResultDeclared: false,
//     grade: null,
//     rank: null,
//     isUpcoming: true,
//   },
//   {
//     id: 4,
//     title: "Pre-Board Examination",
//     date: "2024-04-05",
//     isResultDeclared: false,
//     grade: null,
//     rank: null,
//     isUpcoming: true,
//   },
// ]

export default function ExamResultsPage() {
  const [selectedYear, setSelectedYear] = useState("2024")
  const [selectedExam, setSelectedExam] = useState<(typeof examData)[0] | null>(null)

  const items = [
    {
      href: "/student",
      label: "Student",
    },
    {
      label: "Exam and Results",
    },
  ]

  const {
    data: examData,
    error,
    isPending,
  } = useQuery({
    queryKey: ["exam"],
    queryFn: () => StudentExamService.exam(),
  });

  if (isPending) {
    return <>Loading...</>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-500">
          Failed to load time table. Please try again later.
        </span>
      </div>
    );
  }

  const handleDownloadResult = (exam: (typeof examData.data)[0]) => {
    // Placeholder for PDF download functionality
    console.log("Downloading result for:", exam.title)
    // In real implementation, you would generate and download PDF here
  }

  const getStatusBadge = (exam: (typeof examData.data)[0]) => {
    if (exam.isUpcoming) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
          Upcoming
        </Badge>
      )
    }
    if (exam.isResultDeclared) {
      return (
        <Badge variant="default" className="bg-blue-500">
          Result Declared
        </Badge>
      )
    }
    return <Badge variant="secondary">Pending</Badge>
  }

  const getGradeBadge = (grade: string) => {
    const gradeColors: { [key: string]: string } = {
      "A+": "bg-green-500",
      A: "bg-blue-500",
      "B+": "bg-yellow-500",
      B: "bg-orange-500",
      C: "bg-red-500",
    }
    return <Badge className={`${gradeColors[grade] || "bg-gray-500"} text-white`}>{grade}</Badge>
  }

  const declaredResults = examData.data.filter((exam: {isResultDeclared: boolean}) => exam.isResultDeclared)
  const averagePercentage =
    declaredResults.length > 0
      ? declaredResults.reduce((sum: number, exam: {percentage: number}) => sum + (exam.percentage || 0), 0) / declaredResults.length
      : 0

  return (
    <div className="container mx-auto p-6 space-y-6">
      <BreadcrumbResponsive items={items} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exam & Results</h1>
          <p className="text-muted-foreground">Track your academic performance and exam schedules</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2023">2023</SelectItem>
            <SelectItem value="2022">2022</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examData.data.length}</div>
            <p className="text-xs text-muted-foreground">This academic year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Results Declared</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{declaredResults.length}</div>
            <p className="text-xs text-muted-foreground">Out of {examData.data.length} exams</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all declared results</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Rank</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.min(...declaredResults.filter((e: {rank: number}) => e.rank).map((e: {rank: number}) => e.rank!))}
            </div>
            <p className="text-xs text-muted-foreground">Highest achievement</p>
          </CardContent>
        </Card>
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Examinations</h2>
        <div className="grid gap-4">
          {examData.data.map((exam: {
            id: string,
            title: string,
            date: string,
            isResultDeclared: boolean,
            obtainedMarks: number,
            totalMarks: number,
            grade: string,
            rank?: number,
            percentage?: number,
            isUpcoming?: boolean,
            subjects?: {
              subjectName: string,
              marks: number,
              totalMarks: number,
              grade: string,
              remark: string
            }[]
          }) => (
            <Card key={exam.id} className={`${exam.isUpcoming ? "border-l-4 border-l-green-500" : ""}`}>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{exam.title}</CardTitle>
                      {getStatusBadge(exam)}
                      {exam.isUpcoming && (
                        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
                          <Clock className="w-3 h-3 mr-1" />
                          Upcoming
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" />
                        {new Date(exam.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      {exam.isResultDeclared && (
                        <>
                          <div className="flex items-center gap-1">Grade: {getGradeBadge(exam.grade!)}</div>
                          {exam.rank && (
                            <div className="flex items-center gap-1">
                              <Trophy className="w-4 h-4" />
                              Rank: {exam.rank}
                            </div>
                          )}
                          <div>Score: {exam.percentage}%</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {exam.isResultDeclared && (
                      <>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedExam(exam)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                {exam.title} - Detailed Results
                              </DialogTitle>
                              <DialogDescription>Comprehensive analysis of your performance</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 md:w-[27rem] w-[calc(100vw-60px)]">
                              {/* Overall Performance */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Total Score</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">
                                      {exam.obtainedMarks}/{exam.totalMarks}
                                    </div>
                                    <Progress value={exam.percentage} className="mt-2" />
                                    <p className="text-sm text-muted-foreground mt-1">{exam.percentage}%</p>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Grade</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">{exam.grade}</div>
                                    <p className="text-sm text-muted-foreground">Overall Grade</p>
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">Class Rank</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="text-2xl font-bold">#{exam.rank}</div>
                                    <p className="text-sm text-muted-foreground">Out of 45 students</p>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Subject-wise Performance */}
                              <div>
                                <h3 className="text-lg font-semibold mb-3">Subject-wise Performance</h3>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Subject</TableHead>
                                      <TableHead>Marks Obtained</TableHead>
                                      <TableHead>Total Marks</TableHead>
                                      <TableHead>Percentage</TableHead>
                                      <TableHead>Grade</TableHead>
                                      <TableHead>Teacher's Remark</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {exam.subjects?.map((subject: {subjectName: string, marks: number, totalMarks: number, grade: string, remark: string}, index: number) => (
                                      <TableRow key={index}>
                                        <TableCell className="font-medium">{subject.subjectName}</TableCell>
                                        <TableCell>{subject.marks}</TableCell>
                                        <TableCell>{subject.totalMarks}</TableCell>
                                        <TableCell>
                                          {((subject.marks / subject.totalMarks) * 100).toFixed(1)}%
                                        </TableCell>
                                        <TableCell>{getGradeBadge(subject.grade)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                          {subject.remark}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button variant="default" size="sm" onClick={() => handleDownloadResult(exam)}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              {exam.isResultDeclared && (
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Performance: {exam.obtainedMarks}/{exam.totalMarks} marks
                    </div>
                    <Progress value={exam.percentage} className="w-32" />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
