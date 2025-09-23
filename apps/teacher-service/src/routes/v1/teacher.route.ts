import { Router } from 'express';
import { getTeacherProfile, updateAbout } from '../../controllers/teacher.controller';

export const teacherRouter = Router()

teacherRouter.get("/", getTeacherProfile)
teacherRouter.put("/change-about", updateAbout)