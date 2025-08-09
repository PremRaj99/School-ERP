import { z } from 'zod'
import { classNameSchema, sectionSchema, sessionSchema } from './classSchema';
import { dateSchema } from './teacherSchema';


// Main schema for student creation
export const CreateStudentSchema = z.object({
    firstName: z.string({
        message: "First name is required.",
    }).min(2, "First name must be at least 2 characters long."),

    lastName: z.string().min(2, "Last name must be at least 2 characters long.").optional(),

    dob: dateSchema,

    address: z.string().min(10, "Address must be at least 10 characters long.").optional(),

    phone: z.string().regex(/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian phone number."),
    fatherName: z.string().min(2, "Last name must be at least 2 characters long.").optional(),
    motherName: z.string().min(2, "Last name must be at least 2 characters long.").optional(),

    fatherOccupation: z.string().min(2, "Last name must be at least 2 characters long.").optional(),
    motherOccupation: z.string().min(2, "Last name must be at least 2 characters long.").optional(),

    studentAadhar: z.string().regex(/^\d{12}$/, { message: "invalid aadhar" }).optional(),
    fatherAadhar: z.string().regex(/^\d{12}$/, { message: "invalid aadhar" }).optional(),
    motherAadhar: z.string().regex(/^\d{12}$/, { message: "invalid aadhar" }).optional(),
    className: classNameSchema,
    section: sectionSchema,
    session: sessionSchema,
    dateOfAdmission: dateSchema,

    rollNo: z.number({
        message: "Roll No is required.",
    }).positive("Roll No must be a positive number."),

    appId: z.string().min(5, "ApparId must be at least 5 characters long.").optional(),

    profilePhoto: z.string().url("Please provide a valid URL for the profile photo.").optional(),
});

export const UpdateStudentSchema = CreateStudentSchema.partial();
