import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import type {
  CreateNoticeBody,
  NoticeListQuery,
  NoticeRecord,
  NoticeSummary,
  UpdateNoticeBody,
} from '@schoolerp/contracts';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@schoolerp/contracts';
import { fromISODate, toISODate } from '@/shared/helpers/isoDate';

interface PaginatedNotices {
  data: NoticeSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const toNoticeRecord = (notice: {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  targetRole: 'Student' | 'Teacher' | 'All';
  date: Date;
  expiryDate: Date | null;
}): NoticeRecord => ({
  id: notice.id,
  title: notice.title,
  description: notice.description,
  fileUrl: notice.fileUrl,
  targetRole: notice.targetRole,
  date: toISODate(notice.date),
  expiryDate: notice.expiryDate ? toISODate(notice.expiryDate) : null,
});

export class AdminNoticeService {
  static async getNotices(query: NoticeListQuery): Promise<PaginatedNotices> {
    const page = query.page ?? DEFAULT_PAGE;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;
    const sortDir = query.sortDir ?? 'desc';

    const where = {
      ...(query.targetRole ? { targetRole: query.targetRole } : {}),
      ...(query.q ? { title: { contains: query.q, mode: 'insensitive' as const } } : {}),
    };

    const orderBy =
      query.sortBy === 'expiryDate'
        ? { expiryDate: sortDir }
        : query.sortBy === 'title'
          ? { title: sortDir }
          : { date: sortDir };

    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        select: { id: true, title: true, date: true, targetRole: true, expiryDate: true },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notice.count({ where }),
    ]);

    return {
      data: notices.map((n) => ({
        id: n.id,
        title: n.title,
        date: toISODate(n.date),
        targetRole: n.targetRole,
        expiryDate: n.expiryDate ? toISODate(n.expiryDate) : null,
      })),
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  static async getNoticeDetail(noticeId: string): Promise<NoticeRecord> {
    const notice = await prisma.notice.findUnique({ where: { id: noticeId } });
    if (!notice) {
      throw new NotFoundError();
    }
    return toNoticeRecord(notice);
  }

  static async createNotice(data: CreateNoticeBody): Promise<NoticeRecord> {
    const notice = await prisma.notice.create({
      data: {
        targetRole: data.targetRole,
        date: fromISODate(data.date),
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        expiryDate: data.expiryDate ? fromISODate(data.expiryDate) : undefined,
      },
    });
    return toNoticeRecord(notice);
  }

  static async updateNotice(noticeId: string, data: UpdateNoticeBody): Promise<NoticeRecord> {
    try {
      const notice = await prisma.notice.update({
        where: { id: noticeId },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.fileUrl !== undefined ? { fileUrl: data.fileUrl } : {}),
          ...(data.targetRole !== undefined ? { targetRole: data.targetRole } : {}),
          ...(data.date !== undefined ? { date: fromISODate(data.date) } : {}),
          ...(data.expiryDate !== undefined ? { expiryDate: fromISODate(data.expiryDate) } : {}),
        },
      });
      return toNoticeRecord(notice);
    } catch (_e) {
      throw new NotFoundError();
    }
  }

  static async deleteNotice(noticeId: string): Promise<{ id: string }> {
    try {
      await prisma.notice.delete({ where: { id: noticeId } });
    } catch (_e) {
      throw new NotFoundError();
    }
    return { id: noticeId };
  }
}
