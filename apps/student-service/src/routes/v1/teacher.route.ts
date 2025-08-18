import { Router } from 'express';
import { createTeacher, deleteTeacher, getTeacherDetail, getTeachers, updateTeacher } from '../../controllers/teacher.controller';
export const teacherRouter = Router()

teacherRouter.get("/", getTeachers)
teacherRouter.get("/:teacherId", getTeacherDetail)
teacherRouter.post("/", createTeacher)
teacherRouter.put("/:teacherId", updateTeacher)
teacherRouter.put("/:teacherId", deleteTeacher)