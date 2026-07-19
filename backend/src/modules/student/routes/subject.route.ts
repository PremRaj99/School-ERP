import { Router } from 'express';
import { getSubjects } from '../controllers/subject.controller';

export const subjectRouter = Router();

subjectRouter.get("/get-all-subject", getSubjects);
