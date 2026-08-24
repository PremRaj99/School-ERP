import { Router } from 'express';
import {
  createTeacherSalary,
  deleteTeacherSalary,
  getTeacherSalaries,
  getTeacherSalaryDetail,
  updateTeacherSalaryStatus,
} from '../controllers/teacherSalary.controller';

export const financeTeacherSalaryRouter = Router();

financeTeacherSalaryRouter.get('/', getTeacherSalaries);
financeTeacherSalaryRouter.get('/:salaryId', getTeacherSalaryDetail);
financeTeacherSalaryRouter.post('/', createTeacherSalary);
financeTeacherSalaryRouter.put('/:salaryId/status', updateTeacherSalaryStatus);
financeTeacherSalaryRouter.delete('/:salaryId', deleteTeacherSalary);
