import express from 'express';
import { verifyJWT, AdminOnly } from '@/core/middlewares/auth.middleware';
import { teacherRouter } from './teacher.route';
import { studentRouter } from './student.route';
import { classRouter } from './class.route';
import { subjectRouter } from './subject.route';
import { examRouter } from './exam.route';
import { noticeRouter } from './notice.route';
import { academicRouter } from './academic.route';
import { attendanceRouter } from './attendance.route';

const adminRouter = express.Router();

adminRouter.use(verifyJWT);
adminRouter.use(AdminOnly);

adminRouter.use('/teacher', teacherRouter);
adminRouter.use('/student', studentRouter);
adminRouter.use('/class', classRouter);
adminRouter.use('/subject', subjectRouter);
adminRouter.use('/exam', examRouter);
adminRouter.use('/notice', noticeRouter);
adminRouter.use('/academic', academicRouter);
adminRouter.use('/attendance', attendanceRouter);

export { adminRouter };
