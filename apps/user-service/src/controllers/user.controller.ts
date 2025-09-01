import prisma from '@repo/db';
import { AcceptedResponse, asyncHandler, OkResponse } from '@repo/responsehandler';
import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, NotFoundError, validateSchema, ValidationError } from '@repo/errorhandler';
import { ChangePasswordSchema } from '../types';
import bcrypt from 'bcrypt';
import { setCookie } from '../utils/setCookie';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '../constant';

const getUserData = async (req: Request) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user?.id
        }
    })
    if (!user) {
        throw new NotFoundError()
    }
    return user;
}

export const getUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserData(req)

    res.status(200).json(new OkResponse({ username: user.username, role: user.role }))
})

export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const parseData = validateSchema(ChangePasswordSchema, req.body)

    const user = await getUserData(req)

    const vaildatePassword = await bcrypt.compare(parseData.oldPassword, user.password)

    if (!vaildatePassword) {
        throw new ValidationError("invalid creadential")
    }

    const hashPassword = await bcrypt.hash(parseData.newPassword, 10);


    await prisma.user.update({
        where: {
            id: req.user?.id
        },
        data: {
            password: hashPassword,
        }
    })

    res.status(202).json(new AcceptedResponse())
})

export const logout = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await getUserData(req)

    res.clearCookie("access_token")
    res.clearCookie("refresh_token")

    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: null
        }
    })

    res.status(202).json(new AcceptedResponse())

})


export const refresh = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const user = await getUserData(req)

    const incommingrefreshToken = req.cookies?.["refresh_token"] || req.body.refresh;

    if (!req.cookies || incommingrefreshToken) {
        throw new ForbiddenError()
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
    });

    const refreshToken = jwt.sign({ id: user.id, role: user.role }, REFRESH_TOKEN_SECRET, {
        expiresIn: "7d"
    });

    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken: refreshToken
        }
    })

    setCookie(res, "access_token", accessToken)
    setCookie(res, "refresh_token", refreshToken)

    res.status(202).json(new AcceptedResponse())
})