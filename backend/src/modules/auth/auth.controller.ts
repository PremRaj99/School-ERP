import { validateSchema } from '@/core/errors';
import { asyncHandler, CreatedResponse, OkResponse } from '@/core/responses';
import { setCookie } from '@/core/utils/setCookie';
import { NextFunction, Request, Response } from 'express';
import { LoginSchema } from './types';
import { AuthService } from './services/auth.service';

export const login = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const parseData = validateSchema(LoginSchema, req.body);
  const { accessToken, refreshToken } = await AuthService.login(parseData);

  setCookie(res, 'access_token', accessToken);
  setCookie(res, 'refresh_token', refreshToken);

  res.status(200).json(new OkResponse({ accessToken, refreshToken }));
});

export const signup = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
  const { username, password } = req.body;
  await AuthService.signup(username, password);
  res.status(201).json(new CreatedResponse());
});
