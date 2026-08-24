import { adminTeacherContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminTeacherService } from '../services/teacher.service';

export const getTeacher = defineRoute(adminTeacherContract.list, async ({ query }) => {
  return AdminTeacherService.getTeachers(query);
});

export const getTeacherDetail = defineRoute(adminTeacherContract.detail, async ({ params }) => {
  return AdminTeacherService.getTeacherById(params.teacherId);
});

export const createTeacher = defineRoute(adminTeacherContract.create, async ({ body }) => {
  return AdminTeacherService.createTeacher(body);
});

export const updateTeacher = defineRoute(adminTeacherContract.update, async ({ params, body }) => {
  return AdminTeacherService.updateTeacher(params.teacherId, body);
});

export const deleteTeacher = defineRoute(adminTeacherContract.remove, async ({ params }) => {
  return AdminTeacherService.deleteTeacher(params.teacherId);
});

export const resetTeacherPassword = defineRoute(
  adminTeacherContract.resetPassword,
  async ({ params }) => {
    return AdminTeacherService.resetPassword(params.teacherId);
  },
);
