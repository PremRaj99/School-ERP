import { adminFinanceAuditLogContract } from '@schoolerp/contracts';
import { defineRoute } from '@/core/http/defineRoute';
import { FinanceAuditLogService } from '../services/financeAuditLog.service';

export const getFinanceAuditLogs = defineRoute(
  adminFinanceAuditLogContract.list,
  async ({ query }) => {
    return FinanceAuditLogService.list(query);
  },
);
