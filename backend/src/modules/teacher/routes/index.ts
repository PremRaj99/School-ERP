import express from 'express';
import { verifyJWT, TeacherOnly } from '@/core/middlewares/auth.middleware';
import { getTeacher } from '../controllers/teacher.controller';
import { getAnalytics, getDashboard } from '../controllers/dashboard.controller';
import { academicRouter } from './academic.route';
import { attendanceRouter } from './attendance.route';
import { examRouter } from './exam.route';
import { noticeRouter } from './notice.route';
import { resultRouter } from './result.route';
import { transactionRouter } from './transaction.route';

const teacherRouter = express.Router();

teacherRouter.use(verifyJWT);
teacherRouter.use(TeacherOnly);

teacherRouter.get('/', getTeacher);
teacherRouter.get('/dashboard', getDashboard);
teacherRouter.get('/analytics', getAnalytics);
teacherRouter.use('/attendance', attendanceRouter);
// Was never mounted (ALIGNMENT_PLAN.md 2A/B7) — the controllers existed but teachers had no way to
// reach their own timetable or the academic calendar.
teacherRouter.use('/academic', academicRouter);
teacherRouter.use('/exam', examRouter);
teacherRouter.use('/notice', noticeRouter);
teacherRouter.use('/result', resultRouter);
teacherRouter.use('/transaction', transactionRouter);

export { teacherRouter };
