import { asyncHandler, CreatedResponse } from '@/core/responses';
import { setCookie } from '@/core/utils/setCookie';
import { NextFunction, Request, Response } from 'express';
import { authContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AuthService } from './services/auth.service';

export const login = defineRoute(authContract.login, async ({ body, res }) => {
  const { accessToken, refreshToken, user } = await AuthService.login(body);

  setCookie(res, 'access_token', accessToken);
  setCookie(res, 'refresh_token', refreshToken);

  return {
    user: { username: user.username, role: user.role },
    accessToken,
    refreshToken,
  };
});

export const signup = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { username, password } = req.body;
  await AuthService.signup(username, password);
  res.status(201).json(new CreatedResponse());
});
