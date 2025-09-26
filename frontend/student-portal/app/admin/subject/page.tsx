"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { BookOpen, Plus, Edit, Trash2, Search, GraduationCap, Users, School } from "lucide-react"
import { useState } from "react"

export default function SubjectManagementPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Subject",
    },
  ]

  // State management
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddClassDialogOpen, setIsAddClassDialogOpen] = useState(false)
  const [isAddSectionDialogOpen, setIsAddSectionDialogOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any>(null)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newClassName, setNewClassName] = useState("")
  const [newSection, setNewSection] = useState("")
  const [newSession, setNewSession] = useState("")
  const [selectedClassForSection, setSelectedClassForSection] = useState("")

  // Mock data based on API structure
  const [classes] = useState([
    { id: "dfgtr45", className: "03", section: "A", session: "2022-23" },
    { id: "dfgd45", className: "04", section: "A", session: "2022-23" },
    { id: "dfgd46", className: "05", section: "A", session: "2022-23" },
    { id: "dfgd47", className: "06", section: "B", session: "2022-23" },
  ])

  const [subjectsData] = useState([
    {
      className: "03",
      subjects: [
        { subjectCode: "ENG003", subjectName: "English" },
        { subjectCode: "MAT003", subjectName: "Mathematics" },
        { subjectCode: "SCI003", subjectName: "Science" },
        { subjectCode: "HIN003", subjectName: "Hindi" },
      ],
    },
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

  // Get unique class names for dropdown
  const uniqueClasses = [...new Set(classes.map((c) => c.className))].sort()

  // Get subjects for selected class
  const selectedClassSubjects = selectedClass
    ? subjectsData.find((data) => data.className === selectedClass)?.subjects || []
    : []

  // Filter subjects based on search term
  const filteredSubjects = selectedClassSubjects.filter(
    (subject) =>
      subject.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate statistics
  const totalSubjects = subjectsData.reduce((acc, classData) => acc + classData.subjects.length, 0)
  const totalClasses = uniqueClasses.length
  const currentClassSubjects = selectedClassSubjects.length

  const handleAddSubject = () => {
    if (!selectedClass || !newSubjectName.trim()) return

    console.log("[v0] Adding subject:", { className: selectedClass, subjectName: newSubjectName })
    // API call to create subject
    setNewSubjectName("")
    setIsAddDialogOpen(false)
  }

  const handleEditSubject = (subject: any) => {
    setEditingSubject(subject)
    setNewSubjectName(subject.subjectName)
    setIsEditDialogOpen(true)
  }

  const handleUpdateSubject = () => {
    if (!editingSubject || !newSubjectName.trim()) return

    console.log("[v0] Updating subject:", { subjectCode: editingSubject.subjectCode, subjectName: newSubjectName })
    // API call to update subject
    setEditingSubject(null)
    setNewSubjectName("")
    setIsEditDialogOpen(false)
  }

  const handleDeleteSubject = (subjectCode: string) => {
    console.log("[v0] Deleting subject:", subjectCode)
    // API call to delete subject
  }

  const handleAddClass = () => {
    if (!newClassName.trim() || !newSection.trim() || !newSession.trim()) return

    console.log("[v0] Adding class:", { className: newClassName, section: newSection, session: newSession })
    // API call to create class
    setNewClassName("")
    setNewSection("")
    setNewSession("")
    setIsAddClassDialogOpen(false)
  }

  const handleAddSection = () => {
    if (!selectedClassForSection || !newSection.trim()) return

    console.log("[v0] Adding section:", { className: selectedClassForSection, section: newSection })
    // API call to create section for existing class
    setSelectedClassForSection("")
    setNewSection("")
    setIsAddSectionDialogOpen(false)
  }

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Subject Management</h1>
            <p className="text-muted-foreground mt-2">Manage subjects for different classes</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedClass}>
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subject</DialogTitle>
                <DialogDescription>Add a new subject for Class {selectedClass}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subject-name" className="text-right">
                    Subject Name
                  </Label>
                  <Input
                    id="subject-name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    className="col-span-3"
                    placeholder="Enter subject name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSubject}>Add Subject</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSubjects}</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{totalClasses}</div>
              <p className="text-xs text-muted-foreground">Available classes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Class</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {selectedClass ? `Class ${selectedClass}` : "None"}
              </div>
              <p className="text-xs text-muted-foreground">{currentClassSubjects} subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filtered Results</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{filteredSubjects.length}</div>
              <p className="text-xs text-muted-foreground">Matching criteria</p>
            </CardContent>
          </Card>
        </div>

        {/* Class Selection and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Class Selection & Search
            </CardTitle>
            <CardDescription>Select a class to view and manage its subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Select Class</label>
                  <div className="flex gap-2">
                    <Dialog open={isAddClassDialogOpen} onOpenChange={setIsAddClassDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="w-3 h-3 mr-1" />
                          Add Class
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Class</DialogTitle>
                          <DialogDescription>Create a new class with section and session</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="class-name" className="text-right">
                              Class Name
                            </Label>
                            <Input
                              id="class-name"
                              value={newClassName}
                              onChange={(e) => setNewClassName(e.target.value)}
                              className="col-span-3"
                              placeholder="e.g., 07, 08, 09"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="section" className="text-right">
                              Section
                            </Label>
                            <Input
                              id="section"
                              value={newSection}
                              onChange={(e) => setNewSection(e.target.value)}
                              className="col-span-3"
                              placeholder="e.g., A, B, C"
                            />
                          </div>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="session" className="text-right">
                              Session
                            </Label>
                            <Input
                              id="session"
                              value={newSession}
                              onChange={(e) => setNewSession(e.target.value)}
                              className="col-span-3"
                              placeholder="e.g., 2024-25"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddClassDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddClass}>Add Class</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isAddSectionDialogOpen} onOpenChange={setIsAddSectionDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <School className="w-3 h-3 mr-1" />
                          Add Section
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Section</DialogTitle>
                          <DialogDescription>Add a new section to an existing class</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="select-class" className="text-right">
                              Select Class
                            </Label>
                            <Select value={selectedClassForSection} onValueChange={setSelectedClassForSection}>
                              <SelectTrigger className="col-span-3">
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
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-section" className="text-right">
                              Section
                            </Label>
                            <Input
                              id="new-section"
                              value={newSection}
                              onChange={(e) => setNewSection(e.target.value)}
                              className="col-span-3"
                              placeholder="e.g., A, B, C"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddSectionDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddSection}>Add Section</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
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
                <label className="text-sm font-medium">Search Subjects</label>
                <Input
                  placeholder="Search by subject name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!selectedClass}
                  className="w-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects Table */}
        {selectedClass ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Subjects for Class {selectedClass} ({filteredSubjects.length})
              </CardTitle>
              <CardDescription>
                {filteredSubjects.length === selectedClassSubjects.length
                  ? `Showing all ${selectedClassSubjects.length} subjects`
                  : `Showing ${filteredSubjects.length} of ${selectedClassSubjects.length} subjects`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.subjectCode}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {subject.subjectCode}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-lg">{subject.subjectName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">Class {selectedClass}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSubject(subject)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSubject(subject.subjectCode)}
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

              {filteredSubjects.length === 0 && selectedClass && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No subjects found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "Try adjusting your search criteria or add a new subject."
                      : "No subjects available for this class. Add a new subject to get started."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Select a Class</h3>
              <p className="text-muted-foreground">
                Choose a class from the dropdown above to view and manage its subjects.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Subject Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subject</DialogTitle>
              <DialogDescription>Update the subject name for {editingSubject?.subjectCode}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-subject-name" className="text-right">
                  Subject Name
                </Label>
                <Input
                  id="edit-subject-name"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter subject name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSubject}>Update Subject</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
