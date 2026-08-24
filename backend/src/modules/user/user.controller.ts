import jwt from 'jsonwebtoken';
import { setCookie } from '@/core/utils/setCookie';
import { userContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { UserService } from './services/user.service';

export const getUser = defineRoute(userContract.profile, async ({ user }) => {
  const record = await UserService.getUserById(user!.id);
  return { username: record.username, role: record.role };
});

export const changePassword = defineRoute(userContract.changePassword, async ({ user, body }) => {
  await UserService.changePassword(user!.id, body);
  return null;
});

export const logout = defineRoute(userContract.logout, async ({ user, req, res }) => {
  let userId: string | undefined = user?.id;

  if (!userId) {
    const token = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.decode(token) as { id: string } | null;
        if (decoded?.id) {
          userId = decoded.id;
        }
      } catch (_error) {
        // token unreadable — fall through, logout still clears cookies below
      }
    }
  }

  if (userId) {
    try {
      await UserService.logout(userId);
    } catch (_error) {
      // best-effort — cookies get cleared regardless
    }
  }

  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  return null;
});

export const refresh = defineRoute(userContract.refresh, async ({ req, res }) => {
  const token = req.body?.refresh || req.cookies?.refresh_token;
  const { accessToken, refreshToken } = await UserService.refresh(token);
  setCookie(res, 'access_token', accessToken);
  setCookie(res, 'refresh_token', refreshToken);
  return { accessToken, refreshToken };
});
