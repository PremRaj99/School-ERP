"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Trash2, Search, Users, BookOpen, Phone, UserCheck } from "lucide-react"
import { useState } from "react"

export default function TeacherManagementPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Teacher",
    },
  ]

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [teacherIdFilter, setTeacherIdFilter] = useState("")

  // Mock teacher data
  const [teachers] = useState([
    {
      firstName: "Prem",
      lastName: "Raj",
      phone: "6200103129",
      subjectsHandled: "Math, Science",
      profilePhoto:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
      teacherId: "XYZ001",
    },
    {
      firstName: "Anita",
      lastName: "Sharma",
      phone: "9876543210",
      subjectsHandled: "English, Hindi",
      profilePhoto:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d29tYW58ZW58MHx8MHx8fDA%3D",
      teacherId: "XYZ002",
    },
    {
      firstName: "Rajesh",
      lastName: "Kumar",
      phone: "8765432109",
      subjectsHandled: "Physics, Chemistry",
      profilePhoto:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bWFufGVufDB8fDB8fHww",
      teacherId: "XYZ003",
    },
    {
      firstName: "Priya",
      lastName: "Singh",
      phone: "7654321098",
      subjectsHandled: "Biology, Geography",
      profilePhoto:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyc29ufGVufDB8fDB8fHww",
      teacherId: "XYZ004",
    },
    {
      firstName: "Amit",
      lastName: "Patel",
      phone: "6543210987",
      subjectsHandled: "History, Civics",
      profilePhoto:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bWFufGVufDB8fDB8fHww",
      teacherId: "XYZ005",
    },
    {
      firstName: "Sneha",
      lastName: "Gupta",
      phone: "5432109876",
      subjectsHandled: "Computer Science, IT",
      profilePhoto:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8d29tYW58ZW58MHx8MHx8fDA%3D",
      teacherId: "XYZ006",
    },
  ])

  // Filter teachers based on search term and teacher ID
  const filteredTeachers = teachers.filter((teacher) => {
    const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase()
    const matchesName = fullName.includes(searchTerm.toLowerCase())
    const matchesId = teacher.teacherId.toLowerCase().includes(teacherIdFilter.toLowerCase())
    return matchesName && matchesId
  })

  // Calculate statistics
  const totalTeachers = teachers.length
  const activeTeachers = teachers.length // Assuming all are active
  const totalSubjects = [...new Set(teachers.flatMap((t) => t.subjectsHandled.split(", ")))].length

  const handleViewTeacher = (teacherId: string) => {
    console.log("[v0] Viewing teacher:", teacherId)
    // Navigate to teacher detail page
  }

  const handleDeleteTeacher = (teacherId: string) => {
    console.log("[v0] Deleting teacher:", teacherId)
    // Show confirmation dialog and delete teacher
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
            <h1 className="text-3xl font-bold text-balance">Teacher Management</h1>
            <p className="text-muted-foreground mt-2">Manage and view all teachers in the system</p>
          </div>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Add Teacher
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeachers}</div>
              <p className="text-xs text-muted-foreground">Registered teachers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeTeachers}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subjects Covered</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalSubjects}</div>
              <p className="text-xs text-muted-foreground">Different subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{filteredTeachers.length}</div>
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
            <CardDescription>Filter teachers by name and teacher ID</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Search by Name</label>
                <Input
                  placeholder="Enter teacher name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Filter by Teacher ID</label>
                <Input
                  placeholder="Enter teacher ID..."
                  value={teacherIdFilter}
                  onChange={(e) => setTeacherIdFilter(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Teachers List ({filteredTeachers.length})
            </CardTitle>
            <CardDescription>
              {filteredTeachers.length === teachers.length
                ? "Showing all teachers"
                : `Showing ${filteredTeachers.length} of ${teachers.length} teachers`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile</TableHead>
                  <TableHead>Teacher Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subjects Handled</TableHead>
                  <TableHead>Teacher ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.teacherId}>
                    <TableCell>
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={teacher.profilePhoto || "/placeholder.svg"}
                          alt={`${teacher.firstName} ${teacher.lastName}`}
                        />
                        <AvatarFallback>{getInitials(teacher.firstName, teacher.lastName)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium text-lg">
                          {teacher.firstName} {teacher.lastName}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono">{teacher.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjectsHandled.split(", ").map((subject, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default" className="font-mono">
                        {teacher.teacherId}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTeacher(teacher.teacherId)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher.teacherId)}
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

            {filteredTeachers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No teachers found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or add a new teacher.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
