import { adminStudentFeeContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminStudentFeeService } from '../services/studentFee.service';

export const getStudentFees = defineRoute(adminStudentFeeContract.list, async ({ query }) => {
  return AdminStudentFeeService.getStudentFees(query);
});

export const getStudentFeeDetail = defineRoute(
  adminStudentFeeContract.detail,
  async ({ params }) => {
    return AdminStudentFeeService.getStudentFeeById(params.feeId);
  },
);

export const createStudentFee = defineRoute(adminStudentFeeContract.create, async ({ body }) => {
  return AdminStudentFeeService.createStudentFee(body);
});

export const updateStudentFeeStatus = defineRoute(
  adminStudentFeeContract.updateStatus,
  async ({ params, body }) => {
    return AdminStudentFeeService.updateStudentFeeStatus(params.feeId, body.status);
  },
);

export const deleteStudentFee = defineRoute(adminStudentFeeContract.remove, async ({ params }) => {
  return AdminStudentFeeService.deleteStudentFee(params.feeId);
});
