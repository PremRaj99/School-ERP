import { Router } from 'express';
import { getExams } from '../controllers/exam.controller';

export const examRouter = Router();

examRouter.get("/", getExams);
