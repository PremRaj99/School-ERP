"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

type SlotEvent = {
  subject: string;
  firstName?: string;
  lastName?: string;
  teacherId?: string;
};

type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

type TimeSlot =
  | "08:00-09:00"
  | "09:00-10:00"
  | "10:00-11:00"
  | "11:00-12:00"
  | "12:00-01:00"
  | "01:00-02:00"
  | "02:00-03:00";

type Schedule = {
  [day in Day]?: {
    [time in TimeSlot]?: SlotEvent;
  };
};

const WeeklyTimetable = () => {
  const days: Day[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const timeSlots: TimeSlot[] = [
    "08:00-09:00",
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-01:00",
    "01:00-02:00",
    "02:00-03:00",
  ];

  // Updated schedule data with teacher information
  const schedule: Schedule = {
    Monday: {
      "09:00-10:00": {
        subject: "Mathematics",
        firstName: "Sarah",
        lastName: "Johnson",
        teacherId: "T001",
      },
      "02:00-03:00": {
        subject: "Physics",
        firstName: "Michael",
        lastName: "Chen",
        teacherId: "T002",
      },
      "10:00-11:00": {
        subject: "Chemistry Lab",
        firstName: "Emma",
        lastName: "Davis",
        teacherId: "T003",
      },
    },
    Tuesday: {
      "10:00-11:00": {
        subject: "English Literature",
        firstName: "James",
        lastName: "Wilson",
        teacherId: "T004",
      },
      "02:00-03:00": {
        subject: "History",
        firstName: "Lisa",
        lastName: "Anderson",
        teacherId: "T005",
      },
    },
    Wednesday: {
      "08:00-09:00": {
        subject: "Biology",
        firstName: "David",
        lastName: "Martinez",
        teacherId: "T006",
      },
      "11:00-12:00": {
        subject: "Computer Science",
        firstName: "Anna",
        lastName: "Thompson",
        teacherId: "T007",
      },
      "02:00-03:00": {
        subject: "Music Theory",
        firstName: "Robert",
        lastName: "Garcia",
        teacherId: "T008",
      },
    },
    Thursday: {
      "09:00-10:00": {
        subject: "Physical Education",
        firstName: "Mark",
        lastName: "Robinson",
        teacherId: "T009",
      },
      "01:00-02:00": {
        subject: "Art & Design",
        firstName: "Sophie",
        lastName: "Brown",
        teacherId: "T010",
      },
    },
    Friday: {
      "10:00-11:00": {
        subject: "Geography",
        firstName: "Alex",
        lastName: "Taylor",
        teacherId: "T011",
      },
      "02:00-03:00": {
        subject: "French Language",
        firstName: "Marie",
        lastName: "Dubois",
        teacherId: "T012",
      },
      "01:00-02:00": {
        subject: "Study Hall",
        firstName: "John",
        lastName: "Smith",
        teacherId: "T013",
      },
    },
    Saturday: {
      "09:00-10:00": {
        subject: "Drama Workshop",
        firstName: "Rachel",
        lastName: "White",
        teacherId: "T014",
      },
      "01:00-02:00": {
        subject: "Science Club",
        firstName: "Kevin",
        lastName: "Lee",
        teacherId: "T015",
      },
    },
  };

  return (
    <div className="w-6xl ">
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 min-w-full shadow-lg rounded-lg overflow-hidden">
          {/* Time column header */}
          <div className="bg-stone-100 text-center dark:bg-gray-900 border-r border-stone-300 dark:border-stone-700 p-4 font-semibold text-stone-800 dark:text-stone-200 sticky left-0 z-10">
            Time
          </div>

          {/* Day headers */}
          {days.map((day) => (
            <div
              key={day}
              className="bg-stone-200 dark:bg-gray-900 border-r border-stone-300 dark:border-stone-700 p-4 text-center font-semibold text-stone-800 dark:text-stone-200 min-w-[140px]"
            >
              {day}
            </div>
          ))}

          {/* Time slots and schedule items */}
          {timeSlots.map((time) => (
            <React.Fragment key={time}>
              {/* Time label */}
              <div className="bg-stone-200 text-center dark:bg-gray-900 border-r border-b border-stone-300 dark:border-stone-700 p-3 text-sm font-medium text-stone-700 dark:text-stone-300 sticky left-0 z-10 flex items-center">
                {time.split("-").join(" - ")}
              </div>

              {/* Day columns */}
              {days.map((day) => (
                <div
                  key={`${day}-${time}`}
                  className="border-r border-b border-stone-300 dark:border-stone-700 p-2 min-h-[60px] transition-colors duration-200"
                >
                  {schedule[day] && schedule[day][time] && (
                    <div>
                      <div className="text-sm font-semibold leading-tight mb-1">
                        {schedule[day][time]?.subject}
                      </div>
                      {schedule[day][time]?.firstName &&
                        schedule[day][time]?.lastName && (
                          <div className="text-xs opacity-80 font-medium">
                            {schedule[day][time]?.firstName}{" "}
                            {schedule[day][time]?.lastName}
                          </div>
                        )}
                    </div>
                  )}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyTimetable;
