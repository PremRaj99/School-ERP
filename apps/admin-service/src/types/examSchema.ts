import { z } from "zod"
import { classNameSchema, sectionSchema } from "./classSchema"
import { subjectCodeSchema } from "./subjectSchema"
import { dateSchema } from "./teacherSchema"

export const CreateExamSchema = z.object({
    dateFrom: dateSchema,
    dateTo: dateSchema,
    title: z.string({ message: "Exam Title is required" }).min(3, "Exam Title must be greater then 3 character."),
    exams: z.array(
        z.object({
            className: classNameSchema,
            section: sectionSchema,
            subjects: z.array(
                z.object({
                    subjectCode: subjectCodeSchema,
                    date: dateSchema,
                    fullMarks: z.number({ message: "Full Marks is Required" })
                        .nonnegative({ message: "Full Marks cannot be negative" })
                        .max(100, { message: "full Marks must be less then or 100" })
                })
            )
        })
    )
})