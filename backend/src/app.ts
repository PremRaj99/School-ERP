import express, { Router } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { CORS_ORIGIN } from '@/core/config/constants';
import { errorHandlerMiddleware } from '@/core/errors';
import { authRouter } from './modules/auth/auth.route';
import { adminRouter } from './modules/admin/admin.route';
import { studentRouter } from './modules/student/student.route';
import { teacherRouter } from './modules/teacher/teacher.route';
import { userRouter } from './modules/user/user.route';
import { swaggerSpec } from './swagger';

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN || '*',
    credentials: true,
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(morgan('dev'));
app.use(cookieParser());

app.get('/health-check', (req, res) => {
  res.status(200).json({ success: true, message: 'SchoolERP Monolithic Backend is running!' });
});

app.get('/api/docs', (req, res) => {
  res.status(200).json(swaggerSpec);
});

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/admin', adminRouter);
v1Router.use('/student', studentRouter);
v1Router.use('/teacher', teacherRouter);
v1Router.use('/user', userRouter);

app.use('/api/v1', v1Router);

app.use(errorHandlerMiddleware);

export { app };
