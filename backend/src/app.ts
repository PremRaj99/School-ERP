import { errorHandlerMiddleware } from '@/core/errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router } from 'express';
import morgan from 'morgan';
import { requestContextMiddleware } from './core/logger/requestContextMiddleware';
import { allowedDomains } from './core/security/allowed-domains';
import { adminRouter } from './modules/admin/admin.route';
import { authRouter } from './modules/auth/auth.route';
import { studentRouter } from './modules/student/student.route';
import { teacherRouter } from './modules/teacher/teacher.route';
import { userRouter } from './modules/user/user.route';
import { swaggerSpec } from './swagger';
import { limiter } from './core/security/rate-limiting';
import { logRouter } from './modules/log/log.route';

const app = express();

app.use(
  cors({
    origin: allowedDomains,
    credentials: true,
  }),
);

app.use(requestContextMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(morgan('dev'));
app.use(cookieParser());

app.set('trust-proxy', 1);

// Apply rate limiting to all requests
app.use(limiter);

app.get('/health-check', (req, res) => {
  req.logger.info('Api Gateway is perfectly working');
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
v1Router.use('/logs', logRouter);

app.use('/api/v1', v1Router);

app.use(errorHandlerMiddleware);

export { app };
