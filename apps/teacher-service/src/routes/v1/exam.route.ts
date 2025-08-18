import { Router } from 'express';
import { getExam, getExamSubject } from '../../controllers/exam.controller';
export const examRouter = Router()

examRouter.get("/", getExam)
examRouter.post("/:examId", getExamSubject)