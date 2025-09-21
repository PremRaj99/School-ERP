"use client";

import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Download, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import StudentAttendanceService from "@/services/student/attendance";

// Mock attendance data
const mockAttendanceData = [
  { date: "2024-01-01", status: "present" },
  { date: "2024-01-02", status: "absent" },
  { date: "2024-01-03", status: "present" },
  { date: "2024-01-04", status: "present" },
  { date: "2024-01-05", status: "absent" },
  { date: "2024-01-08", status: "present" },
  { date: "2024-01-09", status: "present" },
  { date: "2024-01-10", status: "present" },
  { date: "2024-01-11", status: "absent" },
  { date: "2024-01-12", status: "present" },
  { date: "2024-01-15", status: "present" },
  { date: "2024-01-16", status: "present" },
  { date: "2024-01-17", status: "absent" },
  { date: "2024-01-18", status: "present" },
  { date: "2024-01-19", status: "present" },
  { date: "2024-01-22", status: "present" },
  { date: "2024-01-23", status: "present" },
  { date: "2024-01-24", status: "present" },
  { date: "2024-01-25", status: "absent" },
  { date: "2024-01-26", status: "present" },
  { date: "2024-01-29", status: "present" },
  { date: "2024-01-30", status: "present" },
  { date: "2024-01-31", status: "present" },
];

const months = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const years = ["2024", "2023", "2022", "2021"];

export default function AttendancePage() {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedMonth, setSelectedMonth] = useState("01");

  const items = [
    {
      href: "/student",
      label: "Student",
    },
    {
      label: "Attendance",
    },
  ];

  const {
    data: attendanceData,
    error,
    isPending,
  } = useQuery({
    queryKey: ["attendance", selectedMonth.padStart(2, "0"), selectedYear],
    queryFn: () =>
      StudentAttendanceService.attendance(
        `${selectedMonth.padStart(2, "0")}-${selectedYear}`
      ),
  });

  let content: React.ReactNode | null = null;
  if (isPending) {
    content = <>Loading...</>;
  } else if (error) {
    content = (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-500">
          Failed to load student attendance. Please try again later.
        </span>
      </div>
    );
  }

  console.log(attendanceData)

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const filteredData = mockAttendanceData.filter((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getFullYear().toString() === selectedYear &&
        (recordDate.getMonth() + 1).toString().padStart(2, "0") ===
          selectedMonth
      );
    });

    const totalDays = filteredData.length;
    const presentDays = filteredData.filter(
      (record) => record.status === "present"
    ).length;
    const absentDays = totalDays - presentDays;
    const attendancePercentage =
      totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage,
      filteredData,
    };
  }, [selectedYear, selectedMonth]);

  // Generate calendar days for the selected month
  const calendarDays = useMemo(() => {
    const year = Number.parseInt(selectedYear);
    const month = Number.parseInt(selectedMonth);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${selectedMonth}-${day.toString().padStart(2, "0")}`;
      const attendanceRecord = mockAttendanceData.find(
        (record) => record.date === dateString
      );
      days.push({
        day,
        dateString,
        status: attendanceRecord?.status || null,
      });
    }

    return days;
  }, [selectedYear, selectedMonth]);

  const exportToPDF = () => {
    // Mock PDF export functionality
    alert(
      "PDF export functionality would be implemented here using libraries like jsPDF or react-pdf"
    );
  };

  if (content) {
    return content;
  }

  return (
    <div className="flex flex-col container mx-auto gap-6 my-10 px-4">
      <BreadcrumbResponsive items={items} />
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">
            Attendance Overview
          </h1>
          <p className="text-muted-foreground">
            Track your daily attendance and performance
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={exportToPDF}
            variant="outline"
            className="gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Attendance Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Attendance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceStats.attendancePercentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              For {months.find((m) => m.value === selectedMonth)?.label}{" "}
              {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceStats.totalDays}
            </div>
            <p className="text-xs text-muted-foreground">School days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {attendanceStats.presentDays}
            </div>
            <p className="text-xs text-muted-foreground">Days attended</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {attendanceStats.absentDays}
            </div>
            <p className="text-xs text-muted-foreground">Days missed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "aspect-square flex items-center justify-center text-sm rounded-md border",
                    day === null && "border-transparent",
                    day?.status === "present" &&
                      "bg-green-100/80 border-green-300 text-green-800",
                    day?.status === "absent" &&
                      "bg-red-100/80 border-red-300 text-red-800",
                    day?.status === null &&
                      day !== null &&
                      "bg-gray-50/10 border-gray-200/50"
                  )}
                >
                  {day?.day}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-green-500"></div>
                <span>Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-red-500"></div>
                <span>Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-gray-300/30"></div>
                <span>No School</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Attendance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceStats.filteredData.map((record) => {
                    const date = new Date(record.date);
                    const dayName = date.toLocaleDateString("en-US", {
                      weekday: "short",
                    });
                    const formattedDate = date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <TableRow key={record.date}>
                        <TableCell className="font-medium">
                          {formattedDate}
                        </TableCell>
                        <TableCell>{dayName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.status === "present"
                                ? "default"
                                : "destructive"
                            }
                            className={cn(
                              record.status === "present" &&
                                "bg-green-100 text-green-800 hover:bg-green-200",
                              record.status === "absent" &&
                                "bg-red-100 text-red-800 hover:bg-red-200"
                            )}
                          >
                            {record.status === "present" ? "Present" : "Absent"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {attendanceStats.filteredData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No attendance records found for the selected month.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
