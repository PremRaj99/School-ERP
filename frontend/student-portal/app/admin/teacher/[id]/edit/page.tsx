"use client"

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CalendarIcon,
  Save,
  Upload,
  User,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  DollarSign,
  FileText,
  Calendar,
} from "lucide-react"
import { useState } from "react"

export default function TeacherEditPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Teacher",
      href: "/admin/teacher",
    },
    {
      label: "edit",
    },
  ]

  // Form state - pre-populated with existing teacher data for edit mode
  const [formData, setFormData] = useState({
    firstName: "Prem",
    lastName: "Raj",
    dob: "2004-04-01",
    address: "xyz abc lmnop",
    phone: "6200103129",
    teacherAadhar: "Teacher Aadhar",
    dateOfJoining: "2022-07-01",
    about: "A professional teacher done...",
    salaryPerMonth: "20000.00",
    qualifications: "Ph.D , B.Tech",
    subjectsHandled: "Math, Science",
    profilePhoto:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
    teacherId: "XYZ001",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = () => {
    console.log("[v0] Updating teacher:", formData)
    // API call to update teacher
  }

  const handlePhotoUpload = () => {
    console.log("[v0] Uploading photo")
    // Handle photo upload
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
            <h1 className="text-3xl font-bold text-balance">Edit Teacher</h1>
            <p className="text-muted-foreground mt-2">Update teacher information and details</p>
          </div>
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Update Teacher
          </Button>
        </div>

        {/* Teacher Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Photo
              </CardTitle>
              <CardDescription>Update teacher profile picture</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={formData.profilePhoto || "/placeholder.svg"}
                  alt={`${formData.firstName} ${formData.lastName}`}
                />
                <AvatarFallback className="text-2xl">
                  {getInitials(formData.firstName, formData.lastName)}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handlePhotoUpload} className="flex items-center gap-2 bg-transparent">
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
              <div className="text-center">
                <p className="font-medium">
                  {formData.firstName} {formData.lastName}
                </p>
                <p className="text-sm text-muted-foreground">Teacher ID: {formData.teacherId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Basic personal details of the teacher</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dob" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date of Birth
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleInputChange("dob", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacherAadhar" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Aadhar Number
                  </Label>
                  <Input
                    id="teacherAadhar"
                    value={formData.teacherAadhar}
                    onChange={(e) => handleInputChange("teacherAadhar", e.target.value)}
                    placeholder="Enter Aadhar number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Professional Information
                </CardTitle>
                <CardDescription>Teaching qualifications and experience details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfJoining" className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Date of Joining
                    </Label>
                    <Input
                      id="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={(e) => handleInputChange("dateOfJoining", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salaryPerMonth" className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Monthly Salary (₹)
                    </Label>
                    <Input
                      id="salaryPerMonth"
                      type="number"
                      value={formData.salaryPerMonth}
                      onChange={(e) => handleInputChange("salaryPerMonth", e.target.value)}
                      placeholder="Enter monthly salary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualifications" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Qualifications
                  </Label>
                  <Input
                    id="qualifications"
                    value={formData.qualifications}
                    onChange={(e) => handleInputChange("qualifications", e.target.value)}
                    placeholder="Enter qualifications (e.g., Ph.D, B.Tech)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjectsHandled" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Subjects Handled
                  </Label>
                  <Input
                    id="subjectsHandled"
                    value={formData.subjectsHandled}
                    onChange={(e) => handleInputChange("subjectsHandled", e.target.value)}
                    placeholder="Enter subjects (e.g., Math, Science)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about">About Teacher</Label>
                  <Textarea
                    id="about"
                    value={formData.about}
                    onChange={(e) => handleInputChange("about", e.target.value)}
                    placeholder="Enter teacher description and experience"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Update Teacher
          </Button>
        </div>
      </div>
    </div>
  )
}
