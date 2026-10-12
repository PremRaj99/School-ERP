import { adminFeeSettingsContract, financeFeeSettingsContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { getFeeSettings, saveFeeSettings } from '@/shared/helpers/feeSettings';

export const getAdminFeeSettings = defineRoute(adminFeeSettingsContract.get, async () =>
  getFeeSettings(),
);

export const updateFeeSettings = defineRoute(adminFeeSettingsContract.update, async ({ body }) =>
  saveFeeSettings(body),
);

export const getFinanceFeeSettings = defineRoute(financeFeeSettingsContract.get, async () =>
  getFeeSettings(),
);
