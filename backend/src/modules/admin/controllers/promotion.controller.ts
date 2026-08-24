import { adminPromotionContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminPromotionService } from '../services/promotion.service';

export const promoteClass = defineRoute(adminPromotionContract.promote, async ({ body }) => {
  return AdminPromotionService.promote(body);
});
