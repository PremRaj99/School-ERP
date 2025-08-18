import { Router } from 'express';
import { getExam } from '../../controllers/exam.controller';
export const examRouter = Router()

examRouter.get("/", getExam)