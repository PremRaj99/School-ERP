import { Response } from 'express';
import { NODE_ENV } from '../constant';
const options = {
    httpOnly: true,
    secure: String(NODE_ENV) === "production",
    sameSite: "none" as "none",
    maxAge: 7 * 24 * 60 * 60 * 1000
};

export const setCookie = (res: Response, name: string, value: string) => {
    res.cookie(name, value, options)
    return;
}