import { z } from 'zod';
import { defineContract } from '../envelope';
import { ClassName, Section, SubjectCode, TeacherId } from '../primitives';
import { WeekDayEnum } from '../enums';

export const PeriodDetail = z.object({
  periodNumber: z.number().int(),
  subjectCode: SubjectCode,
  subjectName: z.string(),
  teacherId: TeacherId,
  teacherFullName: z.string(),
});
export type PeriodDetail = z.infer<typeof PeriodDetail>;

export const DaySchedule = z.object({
  weekday: WeekDayEnum,
  periods: z.array(PeriodDetail),
});
export type DaySchedule = z.infer<typeof DaySchedule>;

/** One entry per class-section that has at least one timetable slot filled in. */
export const ClassSchedule = z.object({
  className: ClassName,
  section: Section,
  schedule: z.array(DaySchedule),
});
export type ClassSchedule = z.infer<typeof ClassSchedule>;

export const UpdateTimeTableBody = z.object({
  className: ClassName,
  section: Section,
  weekday: WeekDayEnum,
  period: z.number().int().min(1, 'invalid period').max(8, 'invalid period'),
  subjectCode: SubjectCode.optional(),
  teacherId: TeacherId.optional(),
});
export type UpdateTimeTableBody = z.infer<typeof UpdateTimeTableBody>;

/**
 * The slot as it stands after the update. Both `subjectCode`/`teacherId` are required on the DB
 * row (`TimeTable.subjectId`/`teacherId` aren't nullable) — there's no "clear a slot" operation
 * today (`PAGES_PLAN.md` used to claim omitting them clears the slot; that was never true — omitting
 * them on an existing slot leaves it unchanged, and creating a new one requires both).
 */
export const TimeTableSlotRecord = z.object({
  className: ClassName,
  section: Section,
  weekday: WeekDayEnum,
  period: z.number().int(),
  subjectCode: SubjectCode,
  subjectName: z.string(),
  teacherId: TeacherId,
  teacherFullName: z.string(),
});
export type TimeTableSlotRecord = z.infer<typeof TimeTableSlotRecord>;

export const adminTimetableContract = defineContract({
  get: {
    method: 'GET',
    path: '/admin/academic/time-table',
    response: z.array(ClassSchedule),
  },
  update: {
    method: 'PUT',
    path: '/admin/academic/time-table',
    body: UpdateTimeTableBody,
    response: TimeTableSlotRecord,
    successStatus: 202,
  },
} as const);
