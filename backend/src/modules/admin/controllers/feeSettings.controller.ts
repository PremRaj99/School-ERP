import { adminFeeSettingsContract, financeFeeSettingsContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import {
  getClassFees,
  getFeeSettings,
  saveClassFee,
  saveFeeSettings,
} from '@/shared/helpers/feeSettings';

export const getAdminFeeSettings = defineRoute(adminFeeSettingsContract.get, async () =>
  getFeeSettings(),
);

export const updateFeeSettings = defineRoute(adminFeeSettingsContract.update, async ({ body }) =>
  saveFeeSettings(body),
);

export const getAdminClassFees = defineRoute(adminFeeSettingsContract.listClassFees, async () =>
  getClassFees(),
);

export const updateClassFee = defineRoute(
  adminFeeSettingsContract.updateClassFee,
  async ({ params, body }) => saveClassFee(params.classId, body.monthlyFee),
);

export const getFinanceFeeSettings = defineRoute(financeFeeSettingsContract.get, async () =>
  getFeeSettings(),
);

export const getFinanceClassFees = defineRoute(financeFeeSettingsContract.listClassFees, async () =>
  getClassFees(),
);
