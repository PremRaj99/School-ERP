import { Router } from 'express';
import {
  bulkImportStudents,
  createStudent,
  deleteStudent,
  getStudentDetail,
  getStudent,
  resetStudentPassword,
  updateStudent,
} from '../controllers/student.controller';

export const studentRouter = Router();

studentRouter.get('/', getStudent);
studentRouter.post('/bulk', bulkImportStudents);
studentRouter.get('/:studentId', getStudentDetail);
studentRouter.post('/', createStudent);
studentRouter.put('/:studentId', updateStudent);
studentRouter.delete('/:studentId', deleteStudent);
studentRouter.post('/:studentId/reset-password', resetStudentPassword);
