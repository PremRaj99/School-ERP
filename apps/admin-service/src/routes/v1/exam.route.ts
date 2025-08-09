import { Router } from 'express';
import { createExam, deleteExam, getExam } from '../../controllers/exam.controller';
export const examRouter = Router()

examRouter.get("/", getExam)
examRouter.post("/", createExam)
examRouter.delete("/:examId", deleteExam)