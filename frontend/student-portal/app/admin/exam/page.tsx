"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Eye, Plus, Search, BookOpen, GraduationCap, FileText } from "lucide-react"
import { useState } from "react"

export default function ExamListPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Exam",
    },
  ]

  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedExam, setSelectedExam] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Mock data based on API structure
  const [exams] = useState([
    {
      id: "jfhgsdj45",
      className: "04",
      section: "A",
      dateFrom: "02-04-2024",
      dateTo: "15-04-2024",
      title: "Mid Semester Examination",
      isResultDecleared: false,
    },
    {
      id: "dfjg4586",
      className: "04",
      section: "A",
      dateFrom: "15-05-2024",
      dateTo: "30-05-2024",
      title: "End Semester Examination",
      isResultDecleared: true,
    },
    {
      id: "abc123",
      className: "05",
      section: "A",
      dateFrom: "01-04-2024",
      dateTo: "12-04-2024",
      title: "Unit Test 1",
      isResultDecleared: false,
    },
    {
      id: "def456",
      className: "05",
      section: "B",
      dateFrom: "20-04-2024",
      dateTo: "28-04-2024",
      title: "Mid Term Examination",
      isResultDecleared: true,
    },
    {
      id: "ghi789",
      className: "06",
      section: "A",
      dateFrom: "10-05-2024",
      dateTo: "25-05-2024",
      title: "Final Examination",
      isResultDecleared: false,
    },
  ])

  // Filter exams based on search term
  const filteredExams = exams.filter(
    (exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.className.includes(searchTerm) ||
      exam.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate statistics
  const totalExams = exams.length
  const completedExams = exams.filter((exam) => exam.isResultDecleared).length
  const pendingExams = exams.filter((exam) => !exam.isResultDecleared).length
  const uniqueClasses = [...new Set(exams.map((exam) => `${exam.className}-${exam.section}`))].length

  const handleViewExam = (exam: any) => {
    setSelectedExam(exam)
    setIsViewDialogOpen(true)
  }

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split("-")
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-US", {
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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Exam Management</h1>
            <p className="text-muted-foreground mt-2">View and manage all examinations for this academic year</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create New Exam
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExams}</div>
              <p className="text-xs text-muted-foreground">This academic year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedExams}</div>
              <p className="text-xs text-muted-foreground">Results declared</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Exams</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingExams}</div>
              <p className="text-xs text-muted-foreground">Results pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes Covered</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{uniqueClasses}</div>
              <p className="text-xs text-muted-foreground">Class-section combinations</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Exams
            </CardTitle>
            <CardDescription>Search by exam title, class, section, or exam ID</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search exams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Exams Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              All Exams ({filteredExams.length})
            </CardTitle>
            <CardDescription>
              {filteredExams.length === exams.length
                ? `Showing all ${exams.length} exams`
                : `Showing ${filteredExams.length} of ${exams.length} exams`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Class & Section</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div className="font-medium text-lg">{exam.title}</div>
                      <div className="text-sm text-muted-foreground">ID: {exam.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        Class {exam.className} - {exam.section}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm">
                          <span className="font-medium">From:</span> {formatDate(exam.dateFrom)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">To:</span> {formatDate(exam.dateTo)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={exam.isResultDecleared ? "default" : "secondary"}>
                        {exam.isResultDecleared ? "Results Declared" : "Results Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewExam(exam)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredExams.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No exams found</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Try adjusting your search criteria or create a new exam."
                    : "No exams available. Create a new exam to get started."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Exam Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Exam Details
              </DialogTitle>
              <DialogDescription>Complete information about the selected exam</DialogDescription>
            </DialogHeader>
            {selectedExam && (
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Exam Title</label>
                    <p className="text-lg font-semibold">{selectedExam.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Exam ID</label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">{selectedExam.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Class</label>
                    <p className="text-lg">Class {selectedExam.className}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Section</label>
                    <p className="text-lg">Section {selectedExam.section}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="text-lg">{formatDate(selectedExam.dateFrom)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">End Date</label>
                    <p className="text-lg">{formatDate(selectedExam.dateTo)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Result Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedExam.isResultDecleared ? "default" : "secondary"} className="text-sm">
                      {selectedExam.isResultDecleared ? "Results Declared" : "Results Pending"}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    View Results
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Calendar className="w-4 h-4 mr-2" />
                    Edit Exam
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
