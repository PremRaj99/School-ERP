import { Router } from 'express';
import { createStudent, deleteStudent, getStudentDetail, getStudent, updateStudent } from '../controllers/student.controller';

export const studentRouter = Router();

studentRouter.get("/", getStudent);
studentRouter.get("/:studentId", getStudentDetail);
studentRouter.post("/", createStudent);
studentRouter.put("/:studentId", updateStudent);
studentRouter.delete("/:studentId", deleteStudent);
