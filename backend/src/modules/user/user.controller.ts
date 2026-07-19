import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { ChangePasswordSchema } from './types';
import { UserService } from './services/user.service';

export const getUser = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const user = await UserService.getUserById(req.user!.id);
  res.status(200).json(new OkResponse({ username: user.username, role: user.role }));
});

export const changePassword = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const parseData = validateSchema(ChangePasswordSchema, req.body);
    await UserService.changePassword(req.user!.id, parseData);
    res.status(202).json(new AcceptedResponse());
  },
);

import jwt from 'jsonwebtoken';
import { setCookie } from '@/core/utils/setCookie';

export const logout = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  let userId: string | undefined = req.user?.id;

  if (!userId) {
    const token = req.cookies?.access_token || req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.decode(token) as { id: string } | null;
        if (decoded?.id) {
          userId = decoded.id;
        }
      } catch (_) {}
    }
  }

  if (userId) {
    try {
      await UserService.logout(userId);
    } catch (_) {}
  }

  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.status(202).json(new AcceptedResponse());
});

export const refresh = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const token = req.body?.refresh || req.cookies?.refresh_token;
  const { accessToken, refreshToken } = await UserService.refresh(token);
  setCookie(res, 'access_token', accessToken);
  setCookie(res, 'refresh_token', refreshToken);
  res.status(202).json(new OkResponse({ accessToken, refreshToken }));
});
