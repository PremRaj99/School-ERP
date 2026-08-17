import { Router } from 'express';
import {
  createExam,
  deleteExam,
  getExams,
  updateExamResultStatus,
} from '../controllers/exam.controller';

export const examRouter = Router();

examRouter.get('/', getExams);
examRouter.post('/', createExam);
examRouter.delete('/:examId', deleteExam);
examRouter.put('/:examId/declare-result', updateExamResultStatus);
