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
import { fromISODate } from '@/shared/helpers/isoDate';
import { NOTICE_SUMMARY_SELECT, toNoticeRecord, toNoticeSummaries } from '@/shared/helpers/notice';

interface PaginatedNotices {
  data: NoticeSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** A Teacher-only notice has no class audience — drop any classes sent with one. */
const classIdsFor = (targetRole: string, classIds: string[] | undefined) =>
  targetRole === 'Teacher' ? [] : [...new Set(classIds ?? [])];

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
        select: NOTICE_SUMMARY_SELECT,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.notice.count({ where }),
    ]);

    return {
      data: await toNoticeSummaries(notices),
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
        classIds: classIdsFor(data.targetRole, data.classIds),
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
    const existing = await prisma.notice.findUnique({
      where: { id: noticeId },
      select: { targetRole: true, classIds: true },
    });
    if (!existing) {
      throw new NotFoundError();
    }
    const targetRole = data.targetRole ?? existing.targetRole;
    try {
      const notice = await prisma.notice.update({
        where: { id: noticeId },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.fileUrl !== undefined ? { fileUrl: data.fileUrl } : {}),
          ...(data.targetRole !== undefined ? { targetRole: data.targetRole } : {}),
          ...(data.classIds !== undefined || targetRole === 'Teacher'
            ? { classIds: classIdsFor(targetRole, data.classIds ?? existing.classIds) }
            : {}),
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
