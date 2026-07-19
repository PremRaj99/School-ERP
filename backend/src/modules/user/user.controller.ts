import { validateSchema } from '@/core/errors';
import { AcceptedResponse, asyncHandler, OkResponse } from '@/core/responses';
import { NextFunction, Request, Response } from 'express';
import { ChangePasswordSchema } from './types';
import { UserService } from './services/user.service';

export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await UserService.getUserById(req.user!.id);
  res.status(200).json(new OkResponse({ username: user.username, role: user.role }));
});

export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(ChangePasswordSchema, req.body);
    await UserService.changePassword(req.user!.id, parseData);
    res.status(202).json(new AcceptedResponse());
  },
);

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  await UserService.logout(req.user!.id);
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.status(202).json(new AcceptedResponse());
});

export const refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.refresh;
  const { accessToken, refreshToken } = await UserService.refresh(token);
  res.status(202).json(new OkResponse({ accessToken, refreshToken }));
});
