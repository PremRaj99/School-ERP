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

interface SubjectData {
  period: number;
  subject: string;
  subjectCode?: string;
  teacherName?: string;
  teacherId?: string;
}

interface DayData {
  weekday: string;
  subjects: SubjectData[];
}

type Props = {
  data: DayData[];
};

const dayMap: Record<string, Day> = {
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
  SUN: "Sunday",
};

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

// Map period number to time slot index (assuming period 1 = first slot)
const periodToTimeSlot = (period: number) => timeSlots[period - 1];

const WeeklyTimetable: React.FC<Props> = ({ data }) => {
  // Convert incoming data to Schedule format
  const schedule: Schedule = {};

  data.forEach((dayItem) => {
    const dayName = dayMap[dayItem.weekday];
    if (!dayName) return;
    schedule[dayName] = {};
    dayItem.subjects.forEach((subj) => {
      const slot = periodToTimeSlot(subj.period);
      if (!slot) return;
      schedule[dayName]![slot] = {
        subject: subj.subject,
        firstName: subj.teacherName?.split(" ")[0],
        lastName: subj.teacherName?.split(" ").slice(1).join(" "),
        teacherId: subj.teacherId,
      };
    });
  });

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
