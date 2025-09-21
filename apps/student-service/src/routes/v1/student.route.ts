import { Router } from 'express';
import { getDashboard, getStudent } from '../../controllers/student.controller';
export const studentRouter = Router()

studentRouter.get("/", getStudent)
studentRouter.get("/info", getDashboard)