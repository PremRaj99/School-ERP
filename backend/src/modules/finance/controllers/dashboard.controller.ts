import { financeDashboardContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { FinanceDashboardService } from '../services/dashboard.service';

export const getFinanceDashboard = defineRoute(financeDashboardContract.get, async () => {
  return FinanceDashboardService.getDashboard();
});
