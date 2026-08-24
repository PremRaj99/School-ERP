import { adminStudentContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminStudentService } from '../services/student.service';

export const getStudent = defineRoute(adminStudentContract.list, async ({ query }) => {
  return AdminStudentService.getStudents(query);
});

export const getStudentDetail = defineRoute(adminStudentContract.detail, async ({ params }) => {
  return AdminStudentService.getStudentById(params.studentId);
});

export const createStudent = defineRoute(adminStudentContract.create, async ({ body }) => {
  return AdminStudentService.createStudent(body);
});

export const updateStudent = defineRoute(adminStudentContract.update, async ({ params, body }) => {
  return AdminStudentService.updateStudent(params.studentId, body);
});

export const deleteStudent = defineRoute(adminStudentContract.remove, async ({ params }) => {
  return AdminStudentService.deleteStudent(params.studentId);
});

export const resetStudentPassword = defineRoute(
  adminStudentContract.resetPassword,
  async ({ params }) => {
    return AdminStudentService.resetPassword(params.studentId);
  },
);

export const bulkImportStudents = defineRoute(adminStudentContract.bulkImport, async ({ body }) => {
  return AdminStudentService.bulkImportStudents(body);
});
