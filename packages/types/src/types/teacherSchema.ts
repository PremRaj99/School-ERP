import { z } from 'zod';

// Reusable custom schema for validating strings in "DD-MM-YYYY" format
export const dateSchema = z.string().refine((date) => {
    // Regex to check the format DD-MM-YYYY
    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) return false;

    // Check if the date is valid
    const [day, month, year] = date.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);
    return (
        parsedDate.getFullYear() === year &&
        parsedDate.getMonth() === month - 1 &&
        parsedDate.getDate() === day
    );
}, {
    message: "Invalid date. Please use DD-MM-YYYY format.",
});
// Reusable custom schema for validating strings in "MM-YYYY" format
export const monthSchema = z.string().refine((date) => {
    // Regex to check the format MM-YYYY
    const dateRegex = /^\d{2}-\d{4}$/;
    if (!dateRegex.test(date)) return false;

    // Check if the date is valid
    const [month, year] = date.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, 1);
    return (
        parsedDate.getFullYear() === year &&
        parsedDate.getMonth() === month - 1 &&
        parsedDate.getDate() === 1
    );
}, {
    message: "Invalid month. Please use MM-YYYY format.",
});

export const aboutSchema = z.string().min(20, "About section must be at least 20 characters long.")


// Main schema for teacher creation
export const CreateTeacherSchema = z.object({
    firstName: z.string({
        message: "First name is required.",
    }).min(2, "First name must be at least 2 characters long."),
    
    lastName: z.string().min(2, "Last name must be at least 2 characters long.").optional(),
    
    dob: dateSchema,
    
    address: z.string().min(10, "Address must be at least 10 characters long.").optional(),
    
    phone: z.string().regex(/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian phone number."),
    
    teacherAadhar: z.string().regex(/^\d{12}$/, {message: "invalid aadhar"}).optional(),
    
    dateOfJoining: dateSchema,
    
    about: aboutSchema.optional(),
    
    salaryPerMonth: z.number({
        message: "Salary is required.",
    }).positive("Salary must be a positive number."),
    
    qualifications: z.string({
        message: "Qualifications are required.",
    }).min(2, "Qualifications must be at least 2 characters long."),
    
    subjectsHandled: z.array(z.string().min(2, "Each subject must be at least 2 characters long."), {
        message: "Subjects handled are required.",
    }).min(1, "At least one subject must be provided."),
    
    profilePhoto: z.string().url("Please provide a valid URL for the profile photo.").optional(),
});

export const UpdateTeacherSchema = CreateTeacherSchema.partial();