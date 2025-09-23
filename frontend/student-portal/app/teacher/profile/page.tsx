import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, CalendarDays, DollarSign, Edit, FileText, GraduationCap, MapPin, Phone, User } from "lucide-react";
import React from "react";

export default function page() {
  const items = [
    {
      label: "Teacher",
      href: "/teacher",
    },
    {
      label: "profile",
    },
  ];
  const teacherData = {
    firstName: "Prem",
    lastName: "Raj",
    dob: "01-04-2004",
    address: "xyz abc lmnop",
    phone: "6200103129",
    teacherAadhar: "Teacher Aadhar",
    dateOfJoining: "01-07-2022",
    about: "A professional teacher done...",
    salaryPerMonth: 20000.0,
    qualifications: "Ph.D , B.Tech",
    subjectsHandled: "Math, Science",
    profilePhoto:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
    teacherId: "XYZ001",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const [day, month, year] = dateString.split("-");
    return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const calculateAge = (dob: string) => {
    const [day, month, year] = dob.split("-");
    const birthDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const calculateExperience = (joiningDate: string) => {
    const [day, month, year] = joiningDate.split("-");
    const joinDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    const years = today.getFullYear() - joinDate.getFullYear();
    const months = today.getMonth() - joinDate.getMonth();

    if (months < 0) {
      return `${years - 1} years, ${12 + months} months`;
    }
    return `${years} years, ${months} months`;
  };

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Header Section with Profile Photo and Basic Info */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="w-32 h-32">
                <AvatarImage
                  src={teacherData.profilePhoto || "/placeholder.svg"}
                  alt={`${teacherData.firstName} ${teacherData.lastName}`}
                />
                <AvatarFallback className="text-2xl">
                  {teacherData.firstName[0]}
                  {teacherData.lastName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <CardTitle className="text-3xl text-balance">
                    {teacherData.firstName} {teacherData.lastName}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    Teacher ID: {teacherData.teacherId}
                  </CardDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  {teacherData.subjectsHandled
                    .split(", ")
                    .map((subject, index) => (
                      <Badge key={index} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                </div>

                <div className="flex gap-3">
                  <Button>
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4" />
                    View Documents
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </p>
                  <p className="text-sm">
                    {formatDate(teacherData.dob)} (
                    {calculateAge(teacherData.dob)} years old)
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {teacherData.phone}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Address
                  </p>
                  <p className="text-sm flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5" />
                    {teacherData.address}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Aadhar Information
                  </p>
                  <p className="text-sm">{teacherData.teacherAadhar}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Professional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date of Joining
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    {formatDate(teacherData.dateOfJoining)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Experience
                  </p>
                  <p className="text-sm">
                    {calculateExperience(teacherData.dateOfJoining)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Qualifications
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {teacherData.qualifications
                      .split(" , ")
                      .map((qualification, index) => (
                        <Badge key={index} variant="outline">
                          {qualification}
                        </Badge>
                      ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Subjects Handled
                  </p>
                  <p className="text-sm flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {teacherData.subjectsHandled}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Compensation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly Salary
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(teacherData.salaryPerMonth)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Annual Salary
                  </p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(teacherData.salaryPerMonth * 12)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>
              Professional background and description
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{teacherData.about}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
