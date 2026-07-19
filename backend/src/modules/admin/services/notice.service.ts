import prisma from '@/core/db';
import { NotFoundError } from '@/core/errors';
import { getDateString } from '../helpers';
import { CreateNoticeInput } from '../types';

export class AdminNoticeService {
  static async getNotices() {
    return await prisma.notice.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        targetRole: true,
      },
    });
  }

  static async getNoticeDetail(noticeId: string) {
    const notice = await prisma.notice.findUnique({
      where: { id: noticeId },
    });

    if (!notice) {
      throw new NotFoundError();
    }
    return notice;
  }

  static async createNotice(data: CreateNoticeInput) {
    return await prisma.notice.create({
      data: {
        targetRole: data.targetRole,
        date: getDateString(data.date),
        title: data.title,
        description: data.description,
        fileUrl: data.fileUrl,
        expiryDate: data.expiryDate ? getDateString(data.expiryDate) : undefined,
      },
    });
  }

  static async deleteNotice(noticeId: string) {
    try {
      await prisma.notice.delete({
        where: { id: noticeId },
      });
    } catch (_e) {
      throw new NotFoundError();
    }
  }
}
