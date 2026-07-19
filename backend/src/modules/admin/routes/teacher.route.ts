import { Router } from 'express';
import { createTeacher, deleteTeacher, getTeacherDetail, getTeacher, updateTeacher } from '../controllers/teacher.controller';

export const teacherRouter = Router();

teacherRouter.get("/", getTeacher);
teacherRouter.get("/:teacherId", getTeacherDetail);
teacherRouter.post("/", createTeacher);
teacherRouter.put("/:teacherId", updateTeacher);
teacherRouter.delete("/:teacherId", deleteTeacher);
