import { adminClassContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminClassService } from '../services/class.service';

export const getClasses = defineRoute(adminClassContract.list, async ({ query }) => {
  return AdminClassService.getClasses(query);
});

export const createClass = defineRoute(adminClassContract.create, async ({ body }) => {
  return AdminClassService.createClass(body);
});

export const updateClass = defineRoute(adminClassContract.update, async ({ params, body }) => {
  return AdminClassService.updateClass(params.classId, body);
});

export const deleteClass = defineRoute(adminClassContract.remove, async ({ params }) => {
  return AdminClassService.deleteClass(params.classId);
});

export const getClassSubjects = defineRoute(adminClassContract.listSubjects, async ({ params }) => {
  return AdminClassService.getClassSubjects(params.classId);
});

export const setClassSubjects = defineRoute(
  adminClassContract.setSubjects,
  async ({ params, body }) => {
    return AdminClassService.setClassSubjects(params.classId, body);
  },
);
