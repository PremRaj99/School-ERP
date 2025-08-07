import z, { email } from "zod";

export const LoginSchema = z.object({
    username: z.string().min(6, { message: "Username must be atleast 6 character" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters long" })
        .max(15, { message: "Password must be at most 15 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" })
})

const phoneRegex = new RegExp(
    /^(\+\d{1,3}[ -]?)?\d{9,14}$/
);

export const ContactUsSchema = z.object({
    name: z.string().min(3, { message: "Name Should have atleast 3 character" }),
    email: z.string().email({
        message: "Invalid Email"
    }),
    mobile: z.string().regex(phoneRegex, "Invalid phone number"),
    message: z.string().min(15, {message: "Message should have atleast 15 character"})
})