import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const ContactUsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  message: z.string().min(1, 'Message is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type ContactUsInput = z.infer<typeof ContactUsSchema>;
