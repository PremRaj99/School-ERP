import { z } from 'zod'
import { dateSchema } from './teacherSchema'

export const targetRoleSchema = z.enum(["Student", "Teacher", "All"])

export const CreateNoticeSchema = z.object({
    description: z.string().min(50, "Description has to be atleast 50 character long.").optional(),
    fileUrl: z.string().url("Please provide a valid URL for the file URL.").optional(),
    date: dateSchema,
    title: z.string({ message: "Title is required." }).min(2, "Title must be atleast 2 character long."),
    targetRole: targetRoleSchema,
    expiryDate: dateSchema.optional()
})