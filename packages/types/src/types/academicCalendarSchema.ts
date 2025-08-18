import { z } from "zod"
import { dateSchema } from "./teacherSchema"

export const academicCategory = z.enum(["HOLIDAY", "EVENT", "EXAM", "OTHER"])

export const CreatAacademicCalendarSchema = z.object({
    date: dateSchema,
    title: z.string({ message: "Title is required." }).min(2, "Title should be atleast 2 character long."),
    category: academicCategory
})