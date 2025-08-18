import { Router } from 'express';
import { getStudent } from '../../controllers/student.controller';
export const studentRouter = Router()

studentRouter.get("/", getStudent)