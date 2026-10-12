import { adminTeacherSalaryContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { toActor } from '@/shared/helpers/financeActor';
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
  async ({ body, user }) => {
    return AdminTeacherSalaryService.createTeacherSalary(body, toActor(user));
  },
);

export const updateTeacherSalary = defineRoute(
  adminTeacherSalaryContract.update,
  async ({ params, body, user }) => {
    return AdminTeacherSalaryService.updateTeacherSalary(params.salaryId, body, toActor(user));
  },
);

export const updateTeacherSalaryStatus = defineRoute(
  adminTeacherSalaryContract.updateStatus,
  async ({ params, body, user }) => {
    return AdminTeacherSalaryService.updateTeacherSalaryStatus(
      params.salaryId,
      body.status,
      toActor(user),
    );
  },
);

export const deleteTeacherSalary = defineRoute(
  adminTeacherSalaryContract.remove,
  async ({ params, user }) => {
    return AdminTeacherSalaryService.deleteTeacherSalary(params.salaryId, toActor(user));
  },
);

export const getTeacherSalaryMonthlyStatus = defineRoute(
  adminTeacherSalaryContract.monthlyStatus,
  async ({ query }) => {
    return AdminTeacherSalaryService.getMonthlyStatus(query);
  },
);

export const getTeacherHonorariumSummary = defineRoute(
  adminTeacherSalaryContract.summary,
  async ({ params, query }) => {
    return AdminTeacherSalaryService.getTeacherSummary(params.teacherId, query.session);
  },
);
