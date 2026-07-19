import express from 'express';
import { changePassword, getUser, logout, refresh } from '../user.controller';
import { verifyJWT } from '@/core/middlewares/auth.middleware';

const userRouter = express.Router();

userRouter.use(verifyJWT);

userRouter.get('/', getUser);
userRouter.post('/change-password', changePassword);
userRouter.post('/logout', logout);
userRouter.post('/refresh', refresh);

export { userRouter };
