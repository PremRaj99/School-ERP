import { Router } from 'express';
import { getAllSubjects } from '../../controllers/subject.controller';
export const subjectRouter = Router()

subjectRouter.get("/get-all-subject", getAllSubjects)