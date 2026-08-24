import { adminDashboardContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { AdminDashboardService } from '../services/dashboard.service';

export const getDashboard = defineRoute(adminDashboardContract.get, async () => {
  return AdminDashboardService.getDashboard();
});
