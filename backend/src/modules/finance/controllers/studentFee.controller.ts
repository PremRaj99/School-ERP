import { financeStudentFeeContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
// Reuses the exact same service `/admin/finance/student-fee` uses — this module is a second
// mount point (Finance-role-guarded instead of Admin-role-guarded), not a parallel
// implementation (ALIGNMENT_PLAN.md P4).
import { AdminStudentFeeService } from '@/modules/admin/services/studentFee.service';

export const getStudentFees = defineRoute(financeStudentFeeContract.list, async ({ query }) => {
  return AdminStudentFeeService.getStudentFees(query);
});

export const getStudentFeeDetail = defineRoute(
  financeStudentFeeContract.detail,
  async ({ params }) => {
    return AdminStudentFeeService.getStudentFeeById(params.feeId);
  },
);

export const createStudentFee = defineRoute(financeStudentFeeContract.create, async ({ body }) => {
  return AdminStudentFeeService.createStudentFee(body);
});

export const updateStudentFeeStatus = defineRoute(
  financeStudentFeeContract.updateStatus,
  async ({ params, body }) => {
    return AdminStudentFeeService.updateStudentFeeStatus(params.feeId, body.status);
  },
);

export const deleteStudentFee = defineRoute(
  financeStudentFeeContract.remove,
  async ({ params }) => {
    return AdminStudentFeeService.deleteStudentFee(params.feeId);
  },
);
