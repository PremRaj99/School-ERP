import { z } from 'zod';
import { defineContract } from './envelope';
import { RoleEnum } from './enums';

export const LoginBody = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginBody = z.infer<typeof LoginBody>;

export const LoginResponse = z.object({
  user: z.object({
    username: z.string(),
    role: RoleEnum,
  }),
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type LoginResponse = z.infer<typeof LoginResponse>;

export const ContactUsBody = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  message: z.string().min(1, 'Message is required'),
});
export type ContactUsBody = z.infer<typeof ContactUsBody>;

export const authContract = defineContract({
  login: {
    method: 'POST',
    path: '/auth/login',
    body: LoginBody,
    response: LoginResponse,
    successStatus: 200,
    summary: 'Log in and receive httpOnly access/refresh cookies plus the tokens in the body.',
  },
  contact: {
    method: 'POST',
    path: '/auth/contact',
    body: ContactUsBody,
    response: z.null(),
    successStatus: 201,
    summary: 'Public contact-us form submission.',
  },
} as const);
