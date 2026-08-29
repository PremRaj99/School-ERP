import prisma from '@/core/db';
import type { FinanceAuditLogQuery } from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';
import { toISODate } from '@/shared/helpers/isoDate';

interface AuditLogInput {
  action: string;
  entityType: string;
  entityId: string;
  actorId: string;
  actorUsername: string;
  before?: unknown;
  after?: unknown;
  note?: string;
}

export class FinanceAuditLogService {
  /**
   * Logs a finance audit event. Fire-and-forget — callers should not await this
   * in the critical path if they don't need to (but awaiting is fine for correctness).
   */
  static async log(input: AuditLogInput): Promise<void> {
    await prisma.financeAuditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        actorId: input.actorId,
        actorUsername: input.actorUsername,
        before: input.before ?? undefined,
        after: input.after ?? undefined,
        note: input.note,
      },
    });
  }

  static async list(filters: FinanceAuditLogQuery) {
    const page = filters.page ?? DEFAULT_PAGE;
    const pageSize = filters.pageSize ?? DEFAULT_PAGE_SIZE;

    const where = {
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.entityId ? { entityId: filters.entityId } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.financeAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.financeAuditLog.count({ where }),
    ]);

    return {
      data: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actorUsername: log.actorUsername,
        before: log.before ?? null,
        after: log.after ?? null,
        note: log.note ?? null,
        createdAt: toISODate(log.createdAt),
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }
}
