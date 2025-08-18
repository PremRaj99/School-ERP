import { Router } from 'express';
import { createResult, getResult, updateResult } from '../../controllers/result.controller';
export const resultRouter = Router()

resultRouter.get("/:examId/:subjectId", getResult)
resultRouter.post("/:examId/:subjectId", createResult)
resultRouter.put("/:examId/:subjectId", updateResult)