import { Router } from 'express';
import { createExam, deleteExam, getExams } from '../controllers/exam.controller';

export const examRouter = Router();

examRouter.get('/', getExams);
examRouter.post('/', createExam);
examRouter.delete('/:examId', deleteExam);
