import { Router } from 'express';
import { getTeacher } from '../controllers/teacher.controller';

export const teacherProfileRouter = Router();

teacherProfileRouter.get("/", getTeacher);
