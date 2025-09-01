import { BreadcrumbResponsive } from "@/components/custom/BreadCrum";
import WeeklyTimetable from "@/components/custom/Student/TimeTable/WeeklyTimeTable";
import React from "react";

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
  return (
    <div className="flex flex-col items-center justify-center container mx-auto gap-4 my-10">
      <BreadcrumbResponsive items={items} />
      <div>
        <div className="text-3xl font-bold text-center tracking-wide text-black dark:text-white">
          Weekly Schedule
        </div>
      </div>
      <div className="max-w-full overflow-x-auto p-4 ">
        <WeeklyTimetable />
      </div>
    </div>
  );
}
