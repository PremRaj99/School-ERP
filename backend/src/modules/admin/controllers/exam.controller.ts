import { adminExamContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminExamService } from '../services/exam.service';

export const getExams = defineRoute(adminExamContract.list, async ({ query }) => {
  return AdminExamService.getExams(query);
});

export const getExamDetail = defineRoute(adminExamContract.detail, async ({ params }) => {
  return AdminExamService.getExamById(params.examId);
});

export const createExam = defineRoute(adminExamContract.create, async ({ body }) => {
  return AdminExamService.createExam(body);
});

export const updateExam = defineRoute(adminExamContract.update, async ({ params, body }) => {
  return AdminExamService.updateExam(params.examId, body);
});

export const deleteExam = defineRoute(adminExamContract.remove, async ({ params }) => {
  return AdminExamService.deleteExam(params.examId);
});

export const updateExamResultStatus = defineRoute(
  adminExamContract.declareResult,
  async ({ params, body }) => {
    return AdminExamService.setResultDeclaration(params.examId, body.isResultDecleared);
  },
);
