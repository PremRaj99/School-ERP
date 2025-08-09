import { Router } from 'express';
import { createStudent, deleteStudent, getStudentDetail, getStudents, updateStudent } from '../../controllers/student.controller';
export const studentRouter = Router()

studentRouter.get("/", getStudents)
studentRouter.get("/:studentId", getStudentDetail)
studentRouter.post("/", createStudent)
studentRouter.put("/:studentId", updateStudent)
studentRouter.put("/:studentId", deleteStudent)