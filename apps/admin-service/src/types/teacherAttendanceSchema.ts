import { z } from 'zod';

export const teacherIdSchema = z.string({ message: "teacherId is required" }).regex(
    /^TCH\d{8}$/,
    'Invalid Teacher ID.'
)

export const studentIdSchema = z.string({ message: "teacherId is required" }).regex(
    /^STU\d{8}$/,
    'Invalid Student ID.'
)

export const CreateTeacherAttendanceSchema = z.array(
    z.object({
        teacherId: teacherIdSchema,
        status: z.enum(["Present", "Absent"])
    })
);

export const UpdateTeacherAttendanceSchema = z.array(
    z.object({
        id: z.string(),
        teacherId: teacherIdSchema,
        status: z.enum(["Present", "Absent"])
    })
)