import { Router } from 'express';
import {
  createExam,
  deleteExam,
  getExamDetail,
  getExamReportCards,
  getExams,
  updateExam,
  updateExamResultStatus,
  updateExamSchedule,
} from '../controllers/exam.controller';

export const examRouter = Router();

examRouter.get('/', getExams);
examRouter.get('/:examId', getExamDetail);
examRouter.get('/:examId/report-cards', getExamReportCards);
examRouter.post('/', createExam);
examRouter.put('/:examId', updateExam);
examRouter.delete('/:examId', deleteExam);
examRouter.put('/:examId/declare-result', updateExamResultStatus);
examRouter.put('/:examId/schedule', updateExamSchedule);
