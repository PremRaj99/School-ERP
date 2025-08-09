import { z } from 'zod'
import { classNameSchema } from './classSchema'

export const subjectNameSchema = z.string({ message: "Subject Name is required" }).min(2, "Subject must be atleast 2 digit long").trim()
export const subjectCodeSchema = z.string({ message: "Subject Code is required" }).length(6, { message: "Subject code must be exactly 6 characters long." })
    .regex(/^[A-Z]{3}[0-9]{3}$/, {
        message: "Invalid Subject Code.",
    })

export const CreateSubjectSchema = z.object({
    subjectName: subjectNameSchema,
    className: classNameSchema
})

export const UpdateSubjectSchema = z.object({
    subjectName: subjectNameSchema,
})