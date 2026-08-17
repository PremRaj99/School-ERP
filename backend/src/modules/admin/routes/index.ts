import express from 'express';
import { verifyJWT, AdminOnly } from '@/core/middlewares/auth.middleware';
import { getDashboard } from '../controllers/dashboard.controller';
import { teacherRouter } from './teacher.route';
import { studentRouter } from './student.route';
import { classRouter } from './class.route';
import { subjectRouter } from './subject.route';
import { examRouter } from './exam.route';
import { noticeRouter } from './notice.route';
import { academicRouter } from './academic.route';
import { attendanceRouter } from './attendance.route';
import { financeRouter } from './finance.route';
import { contactRouter } from './contact.route';

const adminRouter = express.Router();

adminRouter.use(verifyJWT);
adminRouter.use(AdminOnly);

adminRouter.get('/dashboard', getDashboard);

adminRouter.use('/teacher', teacherRouter);
adminRouter.use('/student', studentRouter);
adminRouter.use('/class', classRouter);
adminRouter.use('/subject', subjectRouter);
adminRouter.use('/exam', examRouter);
adminRouter.use('/notice', noticeRouter);
adminRouter.use('/academic', academicRouter);
adminRouter.use('/attendance', attendanceRouter);
adminRouter.use('/finance', financeRouter);
adminRouter.use('/contact', contactRouter);

export { adminRouter };
