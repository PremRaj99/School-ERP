import { adminTeacherSalaryContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminTeacherSalaryService } from '../services/teacherSalary.service';

export const getTeacherSalaries = defineRoute(
  adminTeacherSalaryContract.list,
  async ({ query }) => {
    return AdminTeacherSalaryService.getTeacherSalaries(query);
  },
);

export const getTeacherSalaryDetail = defineRoute(
  adminTeacherSalaryContract.detail,
  async ({ params }) => {
    return AdminTeacherSalaryService.getTeacherSalaryById(params.salaryId);
  },
);

export const createTeacherSalary = defineRoute(
  adminTeacherSalaryContract.create,
  async ({ body }) => {
    return AdminTeacherSalaryService.createTeacherSalary(body);
  },
);

export const updateTeacherSalaryStatus = defineRoute(
  adminTeacherSalaryContract.updateStatus,
  async ({ params, body }) => {
    return AdminTeacherSalaryService.updateTeacherSalaryStatus(params.salaryId, body.status);
  },
);

export const deleteTeacherSalary = defineRoute(
  adminTeacherSalaryContract.remove,
  async ({ params }) => {
    return AdminTeacherSalaryService.deleteTeacherSalary(params.salaryId);
  },
);
