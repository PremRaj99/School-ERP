"use client";

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  Save,
  Upload,
  User,
  Phone,
  MapPin,
  GraduationCap,
  FileText,
  Calendar,
  Users,
  Briefcase,
  Hash,
  Award as IdCard,
} from "lucide-react";
import { useState } from "react";

export default function StudentEditPage() {
  const items = [
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Student",
      href: "/admin/student",
    },
    {
      label: "edit",
    },
  ];

  // Form state - pre-populated with existing student data for edit mode
  const [formData, setFormData] = useState({
    firstName: "Prem",
    lastName: "Raj",
    dob: "2004-04-01",
    address: "xyz abc lmnop",
    phone: "6200103129",
    fatherName: "Abcdef ghi",
    motherName: "Abcdef ghi",
    fatherOccupation: "Teacher",
    motherOccupation: "House Wife",
    studentAadhar: "Student Aadhar",
    fatherAadhar: "Father Aadhar",
    dateOfAdmission: "2022-07-01",
    session: "2022-23",
    className: "4",
    section: "A",
    rollNo: "04",
    appId: "XJH84759384",
    profilePhoto:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
    studentId: "XYZ001",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    console.log("[v0] Updating student:", formData);
    // API call to update student
  };

  const handlePhotoUpload = () => {
    console.log("[v0] Uploading photo");
    // Handle photo upload
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Page Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-balance">Edit Student</h1>
            <p className="text-muted-foreground mt-2">
              Update student information and details
            </p>
          </div>
          <Button onClick={handleSubmit} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Update Student
          </Button>
        </div>

        {/* Student Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Photo Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Photo
              </CardTitle>
              <CardDescription>Update student profile picture</CardDescription>
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
              <Button
                variant="outline"
                onClick={handlePhotoUpload}
                className="flex items-center gap-2 bg-transparent"
              >
                <Upload className="w-4 h-4" />
                Upload Photo
              </Button>
              <div className="text-center">
                <p className="font-medium">
                  {formData.firstName} {formData.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Student ID: {formData.studentId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Roll No: {formData.rollNo}
                </p>
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
                <CardDescription>
                  Basic personal details of the student
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
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
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
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
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="studentAadhar"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Student Aadhar Number
                  </Label>
                  <Input
                    id="studentAadhar"
                    value={formData.studentAadhar}
                    onChange={(e) =>
                      handleInputChange("studentAadhar", e.target.value)
                    }
                    placeholder="Enter student Aadhar number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Parent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Parent Information
                </CardTitle>
                <CardDescription>Father and mother details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input
                      id="fatherName"
                      value={formData.fatherName}
                      onChange={(e) =>
                        handleInputChange("fatherName", e.target.value)
                      }
                      placeholder="Enter father's name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motherName">Mother's Name</Label>
                    <Input
                      id="motherName"
                      value={formData.motherName}
                      onChange={(e) =>
                        handleInputChange("motherName", e.target.value)
                      }
                      placeholder="Enter mother's name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="fatherOccupation"
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Father's Occupation
                    </Label>
                    <Input
                      id="fatherOccupation"
                      value={formData.fatherOccupation}
                      onChange={(e) =>
                        handleInputChange("fatherOccupation", e.target.value)
                      }
                      placeholder="Enter father's occupation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="motherOccupation"
                      className="flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      Mother's Occupation
                    </Label>
                    <Input
                      id="motherOccupation"
                      value={formData.motherOccupation}
                      onChange={(e) =>
                        handleInputChange("motherOccupation", e.target.value)
                      }
                      placeholder="Enter mother's occupation"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="fatherAadhar"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Father's Aadhar Number
                  </Label>
                  <Input
                    id="fatherAadhar"
                    value={formData.fatherAadhar}
                    onChange={(e) =>
                      handleInputChange("fatherAadhar", e.target.value)
                    }
                    placeholder="Enter father's Aadhar number"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Academic Information
                </CardTitle>
                <CardDescription>
                  Class, admission and academic details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="dateOfAdmission"
                      className="flex items-center gap-2"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Date of Admission
                    </Label>
                    <Input
                      id="dateOfAdmission"
                      type="date"
                      value={formData.dateOfAdmission}
                      onChange={(e) =>
                        handleInputChange("dateOfAdmission", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session">Academic Session</Label>
                    <Input
                      id="session"
                      value={formData.session}
                      onChange={(e) =>
                        handleInputChange("session", e.target.value)
                      }
                      placeholder="Enter academic session (e.g., 2022-23)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="className">Class</Label>
                    <Input
                      id="className"
                      value={formData.className}
                      onChange={(e) =>
                        handleInputChange("className", e.target.value)
                      }
                      placeholder="Enter class"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) =>
                        handleInputChange("section", e.target.value)
                      }
                      placeholder="Enter section"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rollNo" className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Roll Number
                    </Label>
                    <Input
                      id="rollNo"
                      value={formData.rollNo}
                      onChange={(e) =>
                        handleInputChange("rollNo", e.target.value)
                      }
                      placeholder="Enter roll number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appId" className="flex items-center gap-2">
                    <IdCard className="w-4 h-4" />
                    Application ID
                  </Label>
                  <Input
                    id="appId"
                    value={formData.appId}
                    onChange={(e) => handleInputChange("appId", e.target.value)}
                    placeholder="Enter application ID"
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
            Update Student
          </Button>
        </div>
      </div>
    </div>
  );
}
