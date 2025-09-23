"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Trash2, Search, Users, GraduationCap, Phone, UserCheck } from "lucide-react"
import { useState } from "react"

export default function StudentManagementPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Student",
    },
  ]

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [studentIdFilter, setStudentIdFilter] = useState("")

  // Mock student data based on the provided API structure
  const [students] = useState([
    {
      firstName: "Prem",
      lastName: "Raj",
      dob: "01-04-2004",
      phone: "6200103129",
      session: "2022-23",
      className: "4",
      section: "A",
      rollNo: 4,
      profilePhoto:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
      studentId: "XYZ001",
    },
    {
      firstName: "Anita",
      lastName: "Sharma",
      dob: "15-06-2005",
      phone: "9876543210",
      session: "2022-23",
      className: "5",
      section: "B",
      rollNo: 12,
      profilePhoto:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tYW58ZW58MHx8MHx8fDA%3D",
      studentId: "XYZ002",
    },
    {
      firstName: "Rajesh",
      lastName: "Kumar",
      dob: "22-08-2004",
      phone: "8765432109",
      session: "2022-23",
      className: "4",
      section: "A",
      rollNo: 8,
      profilePhoto:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWFufGVufDB8fDB8fHww",
      studentId: "XYZ003",
    },
    {
      firstName: "Priya",
      lastName: "Singh",
      dob: "10-12-2005",
      phone: "7654321098",
      session: "2022-23",
      className: "5",
      section: "A",
      rollNo: 15,
      profilePhoto:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fHww",
      studentId: "XYZ004",
    },
    {
      firstName: "Amit",
      lastName: "Patel",
      dob: "05-03-2004",
      phone: "6543210987",
      session: "2022-23",
      className: "4",
      section: "B",
      rollNo: 20,
      profilePhoto:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bWFufGVufDB8fDB8fHww",
      studentId: "XYZ005",
    },
    {
      firstName: "Sneha",
      lastName: "Gupta",
      dob: "18-09-2005",
      phone: "5432109876",
      session: "2022-23",
      className: "5",
      section: "B",
      rollNo: 7,
      profilePhoto:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tYW58ZW58MHx8MHx8fDA%3D",
      studentId: "XYZ006",
    },
  ])

  // Filter students based on search term and student ID
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
    const matchesName = fullName.includes(searchTerm.toLowerCase())
    const matchesId = student.studentId.toLowerCase().includes(studentIdFilter.toLowerCase())
    return matchesName && matchesId
  })

  // Calculate statistics
  const totalStudents = students.length
  const activeStudents = students.length // Assuming all are active
  const totalClasses = [...new Set(students.map((s) => s.className))].length
  const currentSession = "2022-23"

  const handleViewStudent = (studentId: string) => {
    console.log("[v0] Viewing student:", studentId)
    // Navigate to student detail page
  }

  const handleDeleteStudent = (studentId: string) => {
    console.log("[v0] Deleting student:", studentId)
    // Show confirmation dialog and delete student
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`
  }

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Student Management</h1>
            <p className="text-muted-foreground mt-2">Manage and view all students in the system</p>
          </div>
          <Button>
            <GraduationCap className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeStudents}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalClasses}</div>
              <p className="text-xs text-muted-foreground">Different classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{filteredStudents.length}</div>
              <p className="text-xs text-muted-foreground">Matching criteria</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search & Filter
            </CardTitle>
            <CardDescription>Filter students by name and student ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Search by Name</label>
                <Input
                  placeholder="Enter student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Filter by Student ID</label>
                <Input
                  placeholder="Enter student ID..."
                  value={studentIdFilter}
                  onChange={(e) => setStudentIdFilter(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Students List ({filteredStudents.length})
            </CardTitle>
            <CardDescription>
              {filteredStudents.length === students.length
                ? "Showing all students"
                : `Showing ${filteredStudents.length} of ${students.length} students`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Student Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Class & Section</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.studentId}>
                    <TableCell>
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={student.profilePhoto || "/placeholder.svg"}
                          alt={`${student.firstName} ${student.lastName}`}
                        />
                        <AvatarFallback>{getInitials(student.firstName, student.lastName)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-lg">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">DOB: {student.dob}</div>
                        <Badge variant="secondary" className="text-xs">
                          {student.session}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{student.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-xs w-fit">
                          Class {student.className}
                        </Badge>
                        <Badge variant="outline" className="text-xs w-fit">
                          Section {student.section}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="font-mono">
                        {student.rollNo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="font-mono">
                        {student.studentId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewStudent(student.studentId)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStudent(student.studentId)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No students found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or add a new student.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
