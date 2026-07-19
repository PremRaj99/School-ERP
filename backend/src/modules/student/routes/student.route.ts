import { Router } from 'express';
import { getStudent } from '../controllers/student.controller';

export const studentProfileRouter = Router();

studentProfileRouter.get('/', getStudent);
