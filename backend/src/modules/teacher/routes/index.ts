import express from 'express';
import { verifyJWT, TeacherOnly } from '@/core/middlewares/auth.middleware';
import { getTeacher } from '../controllers/teacher.controller';
import { attendanceRouter } from './attendance.route';
import { examRouter } from './exam.route';
import { noticeRouter } from './notice.route';

const teacherRouter = express.Router();

teacherRouter.use(verifyJWT);
teacherRouter.use(TeacherOnly);

teacherRouter.get('/', getTeacher);
teacherRouter.use('/attendance', attendanceRouter);
teacherRouter.use('/exam', examRouter);
teacherRouter.use('/notice', noticeRouter);

export { teacherRouter };
