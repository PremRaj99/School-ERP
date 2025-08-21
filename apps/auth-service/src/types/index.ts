import z from "zod";

export const LoginSchema = z.object({
    username: z.string({ message: "username is required" }).min(6, { message: "Username must be atleast 6 character" }),
    password: z.string({ message: "password is required" })
})

const phoneRegex = new RegExp(
    /^(\+\d{1,3}[ -]?)?\d{9,14}$/
);

export const ContactUsSchema = z.object({
    name: z.string({ message: "Name is required" }).trim().min(3, { message: "Name Should have atleast 3 character" }),
    email: z.string({ message: "email is required" }).trim().email({
        message: "Invalid Email"
    }),
    mobile: z.string({ message: 'phone number is required' }).trim().regex(phoneRegex, "Invalid phone number"),
    message: z.string({ message: "message is required" }).trim().min(15, { message: "Message should have atleast 15 character" })
})