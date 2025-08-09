import z from "zod";

export const classNameSchema =
    z.string({
        message: "Class name is required.",
    })
        .trim().min(1, { message: "Class name cannot be empty." })
        .max(3, { message: "Class name must be 15 characters or less." });

export const sectionSchema =
    z.string({
        message: "Section is required.",
    })
        .trim()
        .length(1, { message: "Section must be a single character." })
        .regex(/^[A-Z]$/, { message: "Section must be a single uppercase letter (e.g., 'A', 'B')." })

export const sessionSchema =
    z.string({
        message: "Session is required.",
    })
        .trim()
        .regex(/^\d{4}-\d{4}$/, {
            message: "Session must be in the format YYYY-YYYY (e.g., '2022-2023')."
        })
        .refine((data) => {
            const years = data.split('-').map(Number);
            return years[1] === years[0] + 1;
        }, {
            message: "The end year must be one year after the start year."
        })


export const CreateClassSchema = z.object({
    className: classNameSchema,

    section: sectionSchema,

    session: sessionSchema,
})