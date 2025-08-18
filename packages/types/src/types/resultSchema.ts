import { z } from "zod"

export const CreateResultSchema = z.array(
    z.object({
        studentId: z.string({ message: "StudentId is required" }).min(3, "Student must be greater then 3 character."),
        marksObtained: z.number({ message: "Marks is required." }).nonnegative({ message: "Marks should be greater then 0." }),
        remark: z.string().optional()
    })
)

export const UpdateResultSchema = z.array(
    z.object({
        id: z.string({ message: "Id is required" }).min(3, "Id must be greater then 3 character."),
        studentId: z.string({ message: "StudentId is required" }).min(3, "Student must be greater then 3 character."),
        marksObtained: z.number({ message: "Marks is required." }).nonnegative({ message: "Marks should be greater then 0." }),
        remark: z.string().optional()
    })
)