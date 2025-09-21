import z from "zod";

export const ChangePasswordSchema = z.object({
    oldPassword: z.string({ message: "password is required" }).min(8, { message: "Password must be at least 8 characters long" }),
    newPassword: z.string({ message: "password is required" }).min(8, { message: "Password must be at least 8 characters long" })
        .max(15, { message: "Password must be at most 15 characters long" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" })
        .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" })
})