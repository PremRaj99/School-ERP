"use client";
import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import Navigation from "@/components/custom/Student/Home/Navigation";
import Profile from "@/components/custom/Student/Home/Profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StudentService from "@/services/student";
import { useQuery } from "@tanstack/react-query";
import { Bell, Calendar, Clock, Eye, FileText } from "lucide-react";
import Link from "next/link";

export default function page() {
  const items = [
    {
      label: "Student Dashboard",
    },
  ];

  const {
    data: studentInfoData,
    error,
    isPending,
  } = useQuery({
    queryKey: ["studentInfo"],
    queryFn: StudentService.info,
  });

  if (isPending) {
    return <>Loading...</>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-500">
          Failed to load student info. Please try again later.
        </span>
      </div>
    );
  }

  // Mock data for notices
  // const notices = [
  //   {
  //     id: 1,
  //     title: "Annual Sports Day 2024",
  //     description:
  //       "Join us for the annual sports day celebration with various competitions and activities...",
  //     date: "2024-03-15",
  //     priority: "high",
  //   },
  //   {
  //     id: 2,
  //     title: "Parent-Teacher Meeting",
  //     description:
  //       "Scheduled meeting to discuss student progress and academic performance with parents...",
  //     date: "2024-03-20",
  //     priority: "medium",
  //   },
  //   {
  //     id: 3,
  //     title: "Library Book Return Reminder",
  //     description:
  //       "Please return all borrowed books by the due date to avoid late fees and penalties...",
  //     date: "2024-03-10",
  //     priority: "low",
  //   },
  // ];

  // Mock data for upcoming exams
  // const upcomingExams = [
  //   {
  //     id: 1,
  //     subject: "Mathematics",
  //     date: "2024-03-25",
  //     time: "10:00 AM",
  //     duration: "3 hours",
  //     type: "Final Exam",
  //   },
  //   {
  //     id: 2,
  //     subject: "Science",
  //     date: "2024-03-27",
  //     time: "2:00 PM",
  //     duration: "2 hours",
  //     type: "Unit Test",
  //   },
  //   {
  //     id: 3,
  //     subject: "English",
  //     date: "2024-03-30",
  //     time: "9:00 AM",
  //     duration: "2.5 hours",
  //     type: "Final Exam",
  //   },
  // ];

  // Mock data for today's timetable
  // const todayTimetable = [
  //   {
  //     period: "1st Period",
  //     time: "8:00 - 8:45 AM",
  //     subject: "Mathematics",
  //     teacher: "Mr. Smith",
  //   },
  //   {
  //     period: "2nd Period",
  //     time: "8:45 - 9:30 AM",
  //     subject: "English",
  //     teacher: "Ms. Johnson",
  //   },
  //   {
  //     period: "3rd Period",
  //     time: "9:30 - 10:15 AM",
  //     subject: "Science",
  //     teacher: "Dr. Brown",
  //   },
  //   {
  //     period: "Break",
  //     time: "10:15 - 10:30 AM",
  //     subject: "Break Time",
  //     teacher: "",
  //   },
  //   {
  //     period: "4th Period",
  //     time: "10:30 - 11:15 AM",
  //     subject: "History",
  //     teacher: "Mr. Davis",
  //   },
  // ];

  return (
    <div className="container mx-auto gap-6 my-6 px-4">
      <div className="flex flex-col gap-6">
        {/* Breadcrumb */}
        <BreadcrumbResponsive items={items} />

        {/* Profile Section */}
        <div className="flex justify-center">
          {studentInfoData.data.student && (
            <Profile data={studentInfoData.data.student} />
          )}
        </div>

        {/* Navigation Section */}
        <div className="w-full">
          <Navigation />
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notice Board */}
          <Card className="h-fit">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Notice Board
              </CardTitle>
              <Link href="/student/notice-and-calendar">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 bg-transparent"
                >
                  <Eye className="h-4 w-4" />
                  View More
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentInfoData.data.notice &&
                studentInfoData.data.notice
                  .slice(0, 3)
                  .map(
                    (notice: {
                      id: string;
                      title: string;
                      description: string;
                      date: string;
                    }) => (
                      <div
                        key={notice.id}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                              {notice.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                              {notice.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {new Date(notice.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                Upcoming Exams
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {studentInfoData.data.exam &&
                studentInfoData.data.exam
                  .slice(0, 3)
                  .map(
                    (exam: {
                      id: string;
                      title: string;
                      dateFrom: string;
                      dateTo: string;
                    }) => (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                            {exam.title}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(exam.dateFrom).toLocaleDateString()}{" - "}
                              {new Date(exam.dateTo).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  )}
              <Link href="/student/exam-results">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 bg-transparent"
                >
                  View All Exams
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Today's Timetable */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Today's Timetable
            </CardTitle>
            <Link href="/student/time-table">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <Eye className="h-4 w-4" />
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentInfoData.data.timeTable && studentInfoData.data.timeTable.map(
                (
                  period: {
                    period: string;
                    time: string;
                    subject: string;
                    teacher?: string;
                  },
                  index: number
                ) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    period.subject === "Break Time"
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
                      : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {period.period}
                    </h4>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {period.time}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {period.subject}
                  </p>
                  {period.teacher && (
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {period.teacher}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
