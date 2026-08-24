import { adminSubjectContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminSubjectService } from '../services/subject.service';

export const getSubjects = defineRoute(adminSubjectContract.list, async () => {
  return AdminSubjectService.getSubjects();
});

export const getAllClassSubjects = defineRoute(adminSubjectContract.groupedByClass, async () => {
  return AdminSubjectService.getAllClassSubjects();
});

export const createSubject = defineRoute(adminSubjectContract.create, async ({ body }) => {
  return AdminSubjectService.createSubject(body);
});

export const updateSubject = defineRoute(adminSubjectContract.update, async ({ params, body }) => {
  return AdminSubjectService.updateSubject(params.subjectCode, body);
});

export const deleteSubject = defineRoute(adminSubjectContract.remove, async ({ params }) => {
  return AdminSubjectService.deleteSubject(params.subjectCode);
});
