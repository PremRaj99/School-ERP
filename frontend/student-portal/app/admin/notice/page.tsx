"use client"

import type React from "react"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
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
import { Bell, Plus, Eye, Trash2, Search, Users, Calendar, FileText, Upload, Edit } from "lucide-react"
import { useState } from "react"

export default function NoticeEditPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Notice",
      href: "/admin/notice",
    },
    {
      label: "Edit",
    },
  ]

  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingNotice, setViewingNotice] = useState<any>(null)
  const [editingNotice, setEditingNotice] = useState<any>(null)
  const [newNotice, setNewNotice] = useState({
    title: "",
    description: "",
    targetRole: "all",
    expiry: "",
    file: null as File | null,
  })

  // Mock data based on API structure
  const [notices] = useState([
    {
      id: "djfskdf3943",
      date: "02-04-2024",
      title: "Holiday Announcement",
      targetRole: "all",
      description: "School will remain closed tomorrow due to festival celebration.",
      fileUrl: "holiday-notice.pdf",
    },
    {
      id: "djfskdf3944",
      date: "01-04-2024",
      title: "Parent-Teacher Meeting",
      targetRole: "student",
      description: "Parent-teacher meeting scheduled for next week. Please inform your parents.",
      fileUrl: null,
    },
    {
      id: "djfskdf3945",
      date: "31-03-2024",
      title: "Staff Meeting",
      targetRole: "teacher",
      description: "Monthly staff meeting will be held in the conference room.",
      fileUrl: "agenda.pdf",
    },
    {
      id: "djfskdf3946",
      date: "30-03-2024",
      title: "Exam Schedule",
      targetRole: "all",
      description: "Final examination schedule has been released. Check the attached document.",
      fileUrl: "exam-schedule.pdf",
    },
    {
      id: "djfskdf3947",
      date: "29-03-2024",
      title: "Sports Day",
      targetRole: "student",
      description: "Annual sports day will be conducted next month. Prepare for various events.",
      fileUrl: null,
    },
  ])

  // Filter notices based on search term and role
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || notice.targetRole === filterRole || notice.targetRole === "all"
    return matchesSearch && matchesRole
  })

  // Calculate statistics
  const totalNotices = notices.length
  const studentNotices = notices.filter((n) => n.targetRole === "student" || n.targetRole === "all").length
  const teacherNotices = notices.filter((n) => n.targetRole === "teacher" || n.targetRole === "all").length
  const recentNotices = notices.filter((n) => {
    const noticeDate = new Date(n.date.split("-").reverse().join("-"))
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return noticeDate >= weekAgo
  }).length

  const handleAddNotice = () => {
    if (!newNotice.title.trim() || !newNotice.description.trim()) return

    console.log("[v0] Adding notice:", newNotice)
    // API call to create notice
    setNewNotice({
      title: "",
      description: "",
      targetRole: "all",
      expiry: "",
      file: null,
    })
    setIsAddDialogOpen(false)
  }

  const handleEditNotice = (notice: any) => {
    setEditingNotice(notice)
    setNewNotice({
      title: notice.title,
      description: notice.description,
      targetRole: notice.targetRole,
      expiry: "",
      file: null,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateNotice = () => {
    if (!newNotice.title.trim() || !newNotice.description.trim()) return

    console.log("[v0] Updating notice:", { id: editingNotice.id, ...newNotice })
    // API call to update notice
    setEditingNotice(null)
    setNewNotice({
      title: "",
      description: "",
      targetRole: "all",
      expiry: "",
      file: null,
    })
    setIsEditDialogOpen(false)
  }

  const handleViewNotice = (notice: any) => {
    setViewingNotice(notice)
    setIsViewDialogOpen(true)
  }

  const handleDeleteNotice = (noticeId: string) => {
    console.log("[v0] Deleting notice:", noticeId)
    // API call to delete notice
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setNewNotice((prev) => ({ ...prev, file }))
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800"
      case "teacher":
        return "bg-green-100 text-green-800"
      case "all":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Notice Management - Edit</h1>
            <p className="text-muted-foreground mt-2">Create, edit, and manage school notices</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Notice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Notice</DialogTitle>
                <DialogDescription>Create a new notice for students, teachers, or everyone</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notice-title" className="text-right">
                    Title *
                  </Label>
                  <Input
                    id="notice-title"
                    value={newNotice.title}
                    onChange={(e) => setNewNotice((prev) => ({ ...prev, title: e.target.value }))}
                    className="col-span-3"
                    placeholder="Enter notice title"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="notice-description" className="text-right pt-2">
                    Description *
                  </Label>
                  <Textarea
                    id="notice-description"
                    value={newNotice.description}
                    onChange={(e) => setNewNotice((prev) => ({ ...prev, description: e.target.value }))}
                    className="col-span-3"
                    placeholder="Enter notice description"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target-role" className="text-right">
                    Target Audience
                  </Label>
                  <Select
                    value={newNotice.targetRole}
                    onValueChange={(value) => setNewNotice((prev) => ({ ...prev, targetRole: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Everyone</SelectItem>
                      <SelectItem value="student">Students Only</SelectItem>
                      <SelectItem value="teacher">Teachers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="expiry-date" className="text-right">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={newNotice.expiry}
                    onChange={(e) => setNewNotice((prev) => ({ ...prev, expiry: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notice-file" className="text-right">
                    Attachment
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="notice-file"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNotice}>Add Notice</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notices</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalNotices}</div>
              <p className="text-xs text-muted-foreground">All notices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Student Notices</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{studentNotices}</div>
              <p className="text-xs text-muted-foreground">For students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teacher Notices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{teacherNotices}</div>
              <p className="text-xs text-muted-foreground">For teachers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Notices</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{recentNotices}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
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
            <CardDescription>Find notices by title, content, or target audience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Search Notices</label>
                <Input
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Filter by Audience</label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notices</SelectItem>
                    <SelectItem value="student">Students Only</SelectItem>
                    <SelectItem value="teacher">Teachers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notices Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              All Notices ({filteredNotices.length})
            </CardTitle>
            <CardDescription>
              {filteredNotices.length === notices.length
                ? `Showing all ${notices.length} notices`
                : `Showing ${filteredNotices.length} of ${notices.length} notices`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Target Audience</TableHead>
                  <TableHead>Attachment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>
                      <div className="font-medium">{notice.date}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-lg">{notice.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{notice.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(notice.targetRole)}>
                        {notice.targetRole === "all"
                          ? "Everyone"
                          : notice.targetRole === "student"
                            ? "Students"
                            : "Teachers"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {notice.fileUrl ? (
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <Upload className="h-3 w-3" />
                          {notice.fileUrl}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No attachment</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewNotice(notice)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditNotice(notice)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteNotice(notice.id)}
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

            {filteredNotices.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No notices found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterRole !== "all"
                    ? "Try adjusting your search criteria or add a new notice."
                    : "No notices available. Add a new notice to get started."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* View Notice Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{viewingNotice?.title}</DialogTitle>
              <DialogDescription>
                Posted on {viewingNotice?.date} • Target:{" "}
                {viewingNotice?.targetRole === "all"
                  ? "Everyone"
                  : viewingNotice?.targetRole === "student"
                    ? "Students"
                    : "Teachers"}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{viewingNotice?.description}</p>
                </div>
                {viewingNotice?.fileUrl && (
                  <div>
                    <h4 className="font-medium mb-2">Attachment</h4>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Upload className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">{viewingNotice.fileUrl}</span>
                      <Button variant="outline" size="sm" className="ml-auto bg-transparent">
                        Download
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Notice Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Notice</DialogTitle>
              <DialogDescription>Update the notice information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notice-title" className="text-right">
                  Title *
                </Label>
                <Input
                  id="edit-notice-title"
                  value={newNotice.title}
                  onChange={(e) => setNewNotice((prev) => ({ ...prev, title: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter notice title"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-notice-description" className="text-right pt-2">
                  Description *
                </Label>
                <Textarea
                  id="edit-notice-description"
                  value={newNotice.description}
                  onChange={(e) => setNewNotice((prev) => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter notice description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-target-role" className="text-right">
                  Target Audience
                </Label>
                <Select
                  value={newNotice.targetRole}
                  onValueChange={(value) => setNewNotice((prev) => ({ ...prev, targetRole: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="student">Students Only</SelectItem>
                    <SelectItem value="teacher">Teachers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-expiry-date" className="text-right">
                  Expiry Date
                </Label>
                <Input
                  id="edit-expiry-date"
                  type="date"
                  value={newNotice.expiry}
                  onChange={(e) => setNewNotice((prev) => ({ ...prev, expiry: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notice-file" className="text-right">
                  Attachment
                </Label>
                <div className="col-span-3">
                  <Input
                    id="edit-notice-file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateNotice}>Update Notice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
