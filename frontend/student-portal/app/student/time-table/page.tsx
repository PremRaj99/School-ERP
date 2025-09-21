"use client";
import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import WeeklyTimetable from "@/components/custom/Student/TimeTable/WeeklyTimeTable";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import StudentAcademicService from "@/services/student/academic"

export default function page() {
  const items = [
    {
      href: "/student",
      label: "Student",
    },
    {
      label: "Time Table",
    },
  ];

  const {
    data: timeTableData,
    error,
    isPending,
  } = useQuery({
    queryKey: ["time-table"],
    queryFn: () => StudentAcademicService.timeTable(),
  });


  if (isPending) {
    return <>Loading...</>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-red-500">
          Failed to load time table. Please try again later.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
      <div>
        <div className="text-3xl font-bold text-center tracking-wide text-black dark:text-white">
          Weekly Schedule
        </div>
      </div>
      <div className="max-w-full overflow-x-auto p-4 ">
        <WeeklyTimetable data={timeTableData?.data[0]?.timetable} />
      </div>
    </div>
  );
}
