import express from 'express';
import { changePassword, getUser, logout, refresh } from '../user.controller';
import { verifyJWT } from '@/core/middlewares/auth.middleware';

const userRouter = express.Router();

// `refresh` and `logout` must stay in front of `verifyJWT`: their entire job is to work when the
// access token is already expired (that's when the frontend calls them). Gating them behind
// verifyJWT meant `POST /user/refresh` needed a valid access token to run — the one thing a
// refresh call can't guarantee. (ALIGNMENT_PLAN.md 2A/B10.) `/auth/refresh` and `/auth/logout` are
// unguarded aliases of these same two handlers and were never affected.
userRouter.post('/refresh', refresh);
userRouter.post('/logout', logout);

userRouter.use(verifyJWT);

userRouter.get('/', getUser);
userRouter.post('/change-password', changePassword);

export { userRouter };
