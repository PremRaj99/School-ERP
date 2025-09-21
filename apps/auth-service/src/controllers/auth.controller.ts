import prisma from "@repo/db";
import { DatabaseError, NotFoundError, ValidationError } from "@repo/errorhandler";
import { asyncHandler, CreatedResponse, OkResponse } from "@repo/responsehandler";
import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../constant";
import { LoginSchema } from "@repo/types";
import { setCookie } from "../utils/setCookie";
import { validateSchema } from "@repo/errorhandler";

export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const parseData = validateSchema(LoginSchema, req.body);
    const user = await prisma.user.findUnique({
        where: { username: parseData.username }
    })

    if (!user) {
        throw new NotFoundError("User not found")
    }

    const vaildatePassword = await bcrypt.compare(parseData.password, user.password)

    if (!vaildatePassword) {
        throw new ValidationError("invalid creadential")
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, ACCESS_TOKEN_SECRET, {
        expiresIn: "15s"
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

    res.status(200).json(new OkResponse({ accessToken: accessToken, refreshToken: refreshToken }))
})

export const signup = asyncHandler(async (req, res, next) => {
    const { username, password } = req.body

    const hashPassword = await bcrypt.hash(password, 10);

    try {
        await prisma.user.create({
            data: {
                username: username,
                password: hashPassword,
                role: "Admin",
            }
        })
        
    } catch (error) {
       throw new ValidationError() 
    }
    res.status(201).json(new CreatedResponse())
})