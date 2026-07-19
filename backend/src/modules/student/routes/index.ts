import express from 'express';
import { verifyJWT, StudentOnly } from '@/core/middlewares/auth.middleware';
import { getStudent } from '../controllers/student.controller';
import { attendanceRouter } from './attendance.route';
import { subjectRouter } from './subject.route';
import { examRouter } from './exam.route';
import { academicRouter } from './academic.route';
import { noticeRouter } from './notice.route';
import { resultRouter } from './result.route';
import { transactionRouter } from './transaction.route';

const studentRouter = express.Router();

studentRouter.use(verifyJWT);
studentRouter.use(StudentOnly);

studentRouter.get('/', getStudent);
studentRouter.use('/attendance', attendanceRouter);
studentRouter.use('/subject', subjectRouter);
studentRouter.use('/exam', examRouter);
studentRouter.use('/academic', academicRouter);
studentRouter.use('/notice', noticeRouter);
studentRouter.use('/result', resultRouter);
studentRouter.use('/transaction', transactionRouter);

export { studentRouter };
