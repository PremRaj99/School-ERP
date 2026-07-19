import { Response } from 'express';
import { NODE_ENV } from '../config/constants';

const isProd = String(NODE_ENV) === 'production';

const options = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setCookie = (res: Response, name: string, value: string) => {
  res.cookie(name, value, options);
  return;
};
