import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { Calendar22 } from "@/components/custom/DatePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export default function page() {
  const items = [
    {
      href: "/student",
      label: "Student",
    },
    {
      label: "Profile",
    },
  ];

  const profileData = {
    firstName: "Prem",
    lastName: "Raj",
    dob: "01-04-2004",
    address: "xyz abc lmnop",
    phone: "6200103129",
    fatherName: "Abcdef ghi",
    motherName: "Abcdef ghi",
    fatherOccupation: "Teacher",
    motherOccupation: "House Wife",
    studentAadhar: "Student Aadhar",
    fatherAadhar: "Father Aadhar",
    dateOfAdmission: "01-07-2022",
    session: "2022-23",
    className: "4",
    section: "A",
    rollNo: 4,
    appId: "XJH84759384",
    profilePhoto:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
    studentId: "XYZ001",
  };

  // Helper to parse dd-mm-yyyy to Date
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
      <div className="grid md:grid-cols-2 w-xl max-w-full p-4 gap-2">
        <div className="flex items-center justify-center md:col-span-2 my-4">
          <Image
            className="w-40 h-40 rounded-full shadow-md"
            src={profileData.profilePhoto}
            width={160}
            height={160}
            alt={"profilePhoto"}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input placeholder="First Name" value={profileData.firstName} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input placeholder="Last Name" value={profileData.lastName} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dob">Date of Birth</Label>
          <Calendar22 disable value={parseDate(profileData.dob)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            type="tel"
            placeholder="+91-XXXXXXXXXX"
            pattern="[0-9]{10}"
            maxLength={10}
            value={profileData.phone}
            disabled
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="className">Class</Label>
          <Input placeholder="Class" value={profileData.className} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="section">Section</Label>
          <Input placeholder="Section" value={profileData.section} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="session">Session</Label>
          <Input placeholder="Session" value={profileData.session} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="rollNo">Roll No.</Label>
          <Input type="number" placeholder="Roll No." value={profileData.rollNo} disabled />
        </div>
        <div className="flex flex-col md:col-span-2 gap-2">
          <Label htmlFor="address">Address</Label>
          <Textarea name="address" placeholder="Address" value={profileData.address} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fatherName">Father Name</Label>
          <Input placeholder="Father Name" value={profileData.fatherName} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fatherOccupation">Father Occupation</Label>
          <Input placeholder="Father Occupation" value={profileData.fatherOccupation} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="motherName">Mother Name</Label>
          <Input placeholder="Mother Name" value={profileData.motherName} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="motherOccupation">Mother Occupation</Label>
          <Input placeholder="Mother Occupation" value={profileData.motherOccupation} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="studentAadhar">Student Aadhar</Label>
          <Input placeholder="Student Aadhar" value={profileData.studentAadhar} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fatherAadhar">Father Aadhar</Label>
          <Input placeholder="Father Aadhar" value={profileData.fatherAadhar} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dateOfAdmission">Date of Admission</Label>
          <Calendar22 disable value={parseDate(profileData.dateOfAdmission)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="appId">Appar Id</Label>
          <Input placeholder="Appar Id" value={profileData.appId} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="studentId">Student Id</Label>
          <Input placeholder="Student Id" value={profileData.studentId} disabled />
        </div>
      </div>
    </div>
  );
}
