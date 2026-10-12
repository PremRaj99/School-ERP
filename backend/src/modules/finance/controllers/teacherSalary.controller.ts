import { financeTeacherSalaryContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { toActor } from '@/shared/helpers/financeActor';
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
  async ({ body, user }) => {
    return AdminTeacherSalaryService.createTeacherSalary(body, toActor(user));
  },
);

export const updateTeacherSalaryStatus = defineRoute(
  financeTeacherSalaryContract.updateStatus,
  async ({ params, body, user }) => {
    return AdminTeacherSalaryService.updateTeacherSalaryStatus(
      params.salaryId,
      body.status,
      toActor(user),
    );
  },
);

export const deleteTeacherSalary = defineRoute(
  financeTeacherSalaryContract.remove,
  async ({ params, user }) => {
    return AdminTeacherSalaryService.deleteTeacherSalary(params.salaryId, toActor(user));
  },
);
