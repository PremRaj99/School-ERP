import { adminStudentFeeContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminStudentFeeService } from '../services/studentFee.service';

const toActor = (user: { id: string; role: string } | undefined) =>
  user ? { id: user.id, username: `${user.role}:${user.id}` } : undefined;

export const getStudentFees = defineRoute(adminStudentFeeContract.list, async ({ query }) => {
  return AdminStudentFeeService.getStudentFees(query);
});

export const getStudentFeeDetail = defineRoute(
  adminStudentFeeContract.detail,
  async ({ params }) => {
    return AdminStudentFeeService.getStudentFeeById(params.feeId);
  },
);

export const createStudentFee = defineRoute(
  adminStudentFeeContract.create,
  async ({ body, user }) => {
    return AdminStudentFeeService.createStudentFee(body, toActor(user));
  },
);

export const updateStudentFee = defineRoute(
  adminStudentFeeContract.update,
  async ({ params, body, user }) => {
    return AdminStudentFeeService.updateStudentFee(params.feeId, body, toActor(user));
  },
);

export const updateStudentFeeStatus = defineRoute(
  adminStudentFeeContract.updateStatus,
  async ({ params, body, user }) => {
    return AdminStudentFeeService.updateStudentFeeStatus(params.feeId, body.status, toActor(user));
  },
);

export const deleteStudentFee = defineRoute(
  adminStudentFeeContract.remove,
  async ({ params, user }) => {
    return AdminStudentFeeService.deleteStudentFee(params.feeId, toActor(user));
  },
);
