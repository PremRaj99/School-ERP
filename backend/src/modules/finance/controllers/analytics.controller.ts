import { financeAnalyticsContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminAnalyticsService } from '@/modules/admin/services/analytics.service';

export const getFinanceAnalytics = defineRoute(financeAnalyticsContract.get, async ({ query }) => {
  return AdminAnalyticsService.getFinance(query.session);
});
