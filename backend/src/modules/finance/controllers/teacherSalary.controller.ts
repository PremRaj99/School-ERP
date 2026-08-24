import { financeTeacherSalaryContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminTeacherSalaryService } from '@/modules/admin/services/teacherSalary.service';

export const getTeacherSalaries = defineRoute(
  financeTeacherSalaryContract.list,
  async ({ query }) => {
    return AdminTeacherSalaryService.getTeacherSalaries(query);
  },
);

export const getTeacherSalaryDetail = defineRoute(
  financeTeacherSalaryContract.detail,
  async ({ params }) => {
    return AdminTeacherSalaryService.getTeacherSalaryById(params.salaryId);
  },
);

export const createTeacherSalary = defineRoute(
  financeTeacherSalaryContract.create,
  async ({ body }) => {
    return AdminTeacherSalaryService.createTeacherSalary(body);
  },
);

export const updateTeacherSalaryStatus = defineRoute(
  financeTeacherSalaryContract.updateStatus,
  async ({ params, body }) => {
    return AdminTeacherSalaryService.updateTeacherSalaryStatus(params.salaryId, body.status);
  },
);

export const deleteTeacherSalary = defineRoute(
  financeTeacherSalaryContract.remove,
  async ({ params }) => {
    return AdminTeacherSalaryService.deleteTeacherSalary(params.salaryId);
  },
);
