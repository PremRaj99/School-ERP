import { z } from "zod"
import { classNameSchema, sectionSchema } from "./classSchema"
import { subjectCodeSchema } from "./subjectSchema"
import { teacherIdSchema } from "./teacherAttendanceSchema"

export const weekDaySchema = z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT"], { message: "invalid Weekday" })
export const periodSchema = z.number().int().min(1, "invalid period").max(8, "invalid period")

export const UpdateTimeTableSchema = z.object({
    className: classNameSchema,
    section: sectionSchema,
    weekday: weekDaySchema,
    period: periodSchema,
    subjectCode: subjectCodeSchema.optional(),
    teacherId: teacherIdSchema.optional()
})