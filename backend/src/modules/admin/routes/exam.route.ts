import { Router } from 'express';
import {
  createExam,
  deleteExam,
  getExamDetail,
  getExams,
  updateExam,
  updateExamResultStatus,
} from '../controllers/exam.controller';

export const examRouter = Router();

examRouter.get('/', getExams);
examRouter.get('/:examId', getExamDetail);
examRouter.post('/', createExam);
examRouter.put('/:examId', updateExam);
examRouter.delete('/:examId', deleteExam);
examRouter.put('/:examId/declare-result', updateExamResultStatus);
