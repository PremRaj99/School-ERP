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
import { Calendar, Plus, Trash2, Search, CalendarDays, PartyPopper, Clock, Edit } from "lucide-react"
import { useState } from "react"

export default function AcademicCalendarEditPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Academic Calendar",
      href: "/admin/academic-calendar",
    },
    {
      label: "Edit",
    },
  ]

  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)
  const [newEvent, setNewEvent] = useState({
    date: "",
    title: "",
    category: "holiday",
  })

  // Mock data based on API structure
  const [events] = useState([
    {
      id: "gdg45",
      date: "02-04-2024",
      title: "Independence Day",
      category: "holiday",
    },
    {
      id: "gers545",
      date: "15-08-2024",
      title: "Independence Day Celebration",
      category: "event",
    },
    {
      id: "jdsfger4535",
      date: "02-10-2024",
      title: "Gandhi Jayanti",
      category: "holiday",
    },
    {
      id: "abc123",
      date: "05-09-2024",
      title: "Teachers Day",
      category: "event",
    },
    {
      id: "def456",
      date: "14-11-2024",
      title: "Children's Day",
      category: "event",
    },
    {
      id: "ghi789",
      date: "25-12-2024",
      title: "Christmas",
      category: "holiday",
    },
    {
      id: "jkl012",
      date: "01-01-2025",
      title: "New Year",
      category: "holiday",
    },
    {
      id: "mno345",
      date: "26-01-2025",
      title: "Republic Day",
      category: "holiday",
    },
    {
      id: "pqr678",
      date: "15-03-2025",
      title: "Annual Sports Day",
      category: "event",
    },
    {
      id: "stu901",
      date: "20-04-2025",
      title: "Parent-Teacher Meeting",
      category: "other",
    },
  ])

  // Filter events based on search term and category
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) || event.date.includes(searchTerm)
    const matchesCategory = filterCategory === "all" || event.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // Calculate statistics
  const totalEvents = events.length
  const holidays = events.filter((e) => e.category === "holiday").length
  const eventCount = events.filter((e) => e.category === "event").length
  const otherCount = events.filter((e) => e.category === "other").length

  const handleAddEvent = () => {
    if (!newEvent.date || !newEvent.title.trim()) return

    console.log("[v0] Adding calendar event:", newEvent)
    // API call to create calendar event
    setNewEvent({
      date: "",
      title: "",
      category: "holiday",
    })
    setIsAddDialogOpen(false)
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setNewEvent({
      date: event.date,
      title: event.title,
      category: event.category,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateEvent = () => {
    if (!newEvent.date || !newEvent.title.trim()) return

    console.log("[v0] Updating calendar event:", { id: editingEvent.id, ...newEvent })
    // API call to update calendar event
    setEditingEvent(null)
    setNewEvent({
      date: "",
      title: "",
      category: "holiday",
    })
    setIsEditDialogOpen(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    console.log("[v0] Deleting calendar event:", eventId)
    // API call to delete calendar event
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "holiday":
        return "bg-red-100 text-red-800"
      case "event":
        return "bg-blue-100 text-blue-800"
      case "other":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "holiday":
        return <CalendarDays className="h-4 w-4" />
      case "event":
        return <PartyPopper className="h-4 w-4" />
      case "other":
        return <Clock className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.date.split("-").reverse().join("-"))
    const dateB = new Date(b.date.split("-").reverse().join("-"))
    return dateA.getTime() - dateB.getTime()
  })

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Academic Calendar - Edit</h1>
            <p className="text-muted-foreground mt-2">
              Create, edit, and manage school holidays, events, and important dates
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
                <DialogDescription>Add a new event to the academic calendar</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-date" className="text-right">
                    Date *
                  </Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-title" className="text-right">
                    Title *
                  </Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                    className="col-span-3"
                    placeholder="Enter event title"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="event-category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={newEvent.category}
                    onValueChange={(value) => setNewEvent((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddEvent}>Add Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">All calendar events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Holidays</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{holidays}</div>
              <p className="text-xs text-muted-foreground">School holidays</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <PartyPopper className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{eventCount}</div>
              <p className="text-xs text-muted-foreground">School events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Other</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{otherCount}</div>
              <p className="text-xs text-muted-foreground">Other activities</p>
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
            <CardDescription>Find events by title, date, or category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Search Events</label>
                <Input
                  placeholder="Search by title or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Filter by Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="holiday">Holidays</SelectItem>
                    <SelectItem value="event">Events</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Academic Calendar ({sortedEvents.length})
            </CardTitle>
            <CardDescription>
              {sortedEvents.length === events.length
                ? `Showing all ${events.length} events`
                : `Showing ${sortedEvents.length} of ${events.length} events`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>
                      <div className="font-medium">{event.date}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-lg">{event.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadgeColor(event.category)}>
                        <div className="flex items-center gap-1">
                          {getCategoryIcon(event.category)}
                          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEvent(event)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
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

            {sortedEvents.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No events found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterCategory !== "all"
                    ? "Try adjusting your search criteria or add a new event."
                    : "No events available. Add a new event to get started."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>Update the event information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-event-date" className="text-right">
                  Date *
                </Label>
                <Input
                  id="edit-event-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-event-title" className="text-right">
                  Title *
                </Label>
                <Input
                  id="edit-event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, title: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter event title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-event-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newEvent.category}
                  onValueChange={(value) => setNewEvent((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateEvent}>Update Event</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
