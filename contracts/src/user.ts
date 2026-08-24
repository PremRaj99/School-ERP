import { z } from 'zod';
import { defineContract } from './envelope';
import { RoleEnum } from './enums';

export const UserProfileResponse = z.object({
  username: z.string(),
  role: RoleEnum,
});
export type UserProfileResponse = z.infer<typeof UserProfileResponse>;

export const ChangePasswordBody = z.object({
  oldPassword: z.string({ message: 'Password is required' }).min(8, {
    message: 'Password must be at least 8 characters long',
  }),
  newPassword: z
    .string({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(15, { message: 'Password must be at most 15 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[^a-zA-Z0-9]/, { message: 'Password must contain at least one special character' }),
});
export type ChangePasswordBody = z.infer<typeof ChangePasswordBody>;

export const RefreshResponse = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type RefreshResponse = z.infer<typeof RefreshResponse>;

export const userContract = defineContract({
  profile: {
    method: 'GET',
    path: '/user',
    response: UserProfileResponse,
  },
  changePassword: {
    method: 'POST',
    path: '/user/change-password',
    body: ChangePasswordBody,
    response: z.null(),
    successStatus: 202,
  },
  logout: {
    method: 'POST',
    path: '/user/logout',
    response: z.null(),
    successStatus: 202,
  },
  refresh: {
    method: 'POST',
    path: '/user/refresh',
    response: RefreshResponse,
    successStatus: 200,
    summary: 'Unauthenticated — reads the refresh_token cookie, not the access token.',
  },
} as const);
